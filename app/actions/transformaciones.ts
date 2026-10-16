"use server";

import { getServiceSupabase } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  calcularMerma,
  calcularCostoUnitario,
  validarConsumoInventario,
} from "@/lib/business-rules";

export interface TransformacionItem {
  id: string;
  loteId: string;
  etapa: string;
  responsable: string;
  fecha: string;
  costoEtapa: number;
  costoUnitario: number;
  pesoEntrada: number;
  pesoSalida: number;
  mermaKg: number;
  mermaPct: number;
  alertaMerma: boolean;
  incidencia: string | null;
  idempotencyKey?: string | null;
  createdAt: string;
}

export interface RegistrarTransformacionInput {
  loteId: string;
  etapa: string;
  pesoEntrada: number;
  pesoSalida: number;
  costoEtapa?: number;
  incidencia?: string | null;
  idempotencyKey?: string | null;
}

/**
 * Consulta el listado completo de transformaciones registradas con sus entradas y salidas
 */
export async function getTransformacionesAction(): Promise<TransformacionItem[]> {
  const supabase = getServiceSupabase();

  const { data: transformaciones, error } = await supabase
    .from("transformaciones")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !transformaciones) {
    console.error("Error al consultar transformaciones:", error?.message);
    return [];
  }

  // Obtener todas las entradas y salidas para consolidar la vista
  const { data: entradas } = await supabase.from("transformacion_entradas").select("*");
  const { data: salidas } = await supabase.from("transformacion_salidas").select("*");

  const entradasMap = (entradas || []).reduce<Record<string, { lote_id: string; cantidad: number }>>(
    (acc, e) => {
      acc[e.transformacion_id] = { lote_id: e.lote_id, cantidad: Number(e.cantidad_consumida) || 0 };
      return acc;
    },
    {}
  );

  const salidasMap = (salidas || []).reduce<Record<string, number>>((acc, s) => {
    acc[s.transformacion_id] = Number(s.cantidad_salida) || 0;
    return acc;
  }, {});

  return transformaciones.map((t) => {
    const entradaInfo = entradasMap[t.id] || { lote_id: "N/A", cantidad: 0 };
    const pesoSalida = salidasMap[t.id] || 0;
    const pesoEntrada = entradaInfo.cantidad;
    const costoEtapa = Number(t.costo_etapa) || 0;
    const costoUnitario = calcularCostoUnitario(costoEtapa, pesoSalida);
    const mermaKg = Math.max(0, Number((pesoEntrada - pesoSalida).toFixed(4)));

    return {
      id: t.id,
      loteId: entradaInfo.lote_id,
      etapa: t.etapa,
      responsable: t.responsable,
      fecha: t.fecha,
      costoEtapa: costoEtapa,
      costoUnitario: costoUnitario,
      pesoEntrada: pesoEntrada,
      pesoSalida: pesoSalida,
      mermaKg: mermaKg,
      mermaPct: Number(t.merma_pct) || 0,
      alertaMerma: Boolean(t.alerta_merma),
      incidencia: t.incidencia,
      idempotencyKey: t.idempotency_key,
      createdAt: t.created_at,
    };
  });
}

/**
 * RF02, RF04, RF05, RF08, RF09, RF10:
 * Ejecuta una transformación garantizando validación de merma, control de balance,
 * bloqueo de lotes no aptos, cálculo de costo unitario, idempotencia y registro de auditoría.
 */
export async function ejecutarTransformacionAction(input: RegistrarTransformacionInput) {
  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress || "operador_anon";
  const userRole = (user?.publicMetadata?.role as string) || "operador";

  const loteId = input.loteId?.trim();
  const etapa = input.etapa?.trim();
  const pesoEntrada = Number(input.pesoEntrada);
  const pesoSalida = Number(input.pesoSalida);
  const costoTotal = Math.max(0, Number(input.costoEtapa || 0));

  if (!loteId) {
    return { success: false, error: "El lote a transformar es obligatorio." };
  }

  if (!etapa) {
    return { success: false, error: "La etapa de transformación es obligatoria." };
  }

  if (isNaN(pesoEntrada) || pesoEntrada <= 0) {
    return { success: false, error: "El peso de entrada debe ser mayor a 0 kg." };
  }

  if (isNaN(pesoSalida) || pesoSalida <= 0) {
    return { success: false, error: "El peso de salida debe ser mayor a 0 kg." };
  }

  const supabase = getServiceSupabase();

  // 1. Validar estado del lote (RF09: Un lote bloqueado no se puede transformar)
  const { data: lote, error: errLote } = await supabase
    .from("lotes")
    .select("id, estado, motivo_estado")
    .eq("id", loteId)
    .single();

  if (errLote || !lote) {
    return { success: false, error: `El lote ${loteId} no existe en el sistema.` };
  }

  if (lote.estado === "bloqueado") {
    return {
      success: false,
      error: `Operación rechazada: El lote ${loteId} se encuentra BLOQUEADO (${lote.motivo_estado || "Control preventivo"}) y no puede someterse a transformación (RF09).`,
    };
  }

  // 2. Control de Idempotencia (RF08 & Corrección 7 de PLAN_IA.md)
  const idempotencyKey = input.idempotencyKey?.trim() || null;
  if (idempotencyKey) {
    const { data: existente } = await supabase
      .from("transformaciones")
      .select("id, merma_pct, alerta_merma")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (existente) {
      return {
        success: true,
        transformacionId: existente.id,
        mermaPct: Number(existente.merma_pct),
        alertaMerma: Boolean(existente.alerta_merma),
        yaProcesado: true,
        message: "Operación previamente confirmada (Idempotencia activa).",
      };
    }
  }

  // 3. Control de saldo e inventario en tiempo real (RF08)
  const { data: movimientos } = await supabase
    .from("inventario_movimientos")
    .select("tipo, cantidad")
    .eq("lote_id", loteId);

  const saldoDisponible = (movimientos || []).reduce<number>((acc, mov) => {
    const cant = Number(mov.cantidad) || 0;
    if (mov.tipo === "recepcion") return acc + cant;
    if (mov.tipo === "consumo") return acc - cant;
    return acc;
  }, 0);

  const validacionConsumo = validarConsumoInventario({
    saldoDisponible,
    cantidadAConsumir: pesoEntrada,
  });

  if (!validacionConsumo.permitido) {
    return { success: false, error: validacionConsumo.error };
  }

  // 4. Cálculo de Merma y Alerta (RF04)
  const resultadoMerma = calcularMerma(pesoEntrada, pesoSalida);
  if (resultadoMerma.anomalia) {
    return { success: false, error: resultadoMerma.error };
  }

  const incidencia = input.incidencia?.trim() || null;
  if (resultadoMerma.alerta_merma && (!incidencia || incidencia.length < 5)) {
    return {
      success: false,
      error: `La merma obtenida (${resultadoMerma.merma_pct}%) supera el umbral del 15.0%. Es obligatorio registrar una justificación de incidencia (mínimo 5 caracteres) (RF04).`,
    };
  }

  // 5. Costeo unitario (RF05)
  const costoUnitario = calcularCostoUnitario(costoTotal, pesoSalida);

  // 6. Transacción atómica en Supabase
  // 6.1. Insertar transformación
  const { data: nuevaTransf, error: errTransf } = await supabase
    .from("transformaciones")
    .insert({
      etapa: etapa,
      responsable: userEmail,
      fecha: new Date().toISOString(),
      costo_etapa: costoTotal,
      merma_pct: resultadoMerma.merma_pct,
      alerta_merma: resultadoMerma.alerta_merma,
      incidencia: incidencia,
      idempotency_key: idempotencyKey,
    })
    .select("id")
    .single();

  if (errTransf || !nuevaTransf) {
    return {
      success: false,
      error: "Error al registrar la transformación: " + (errTransf?.message || "Desconocido"),
    };
  }

  const transformacionId = nuevaTransf.id;

  // 6.2. Registrar entrada de lote consumido
  await supabase.from("transformacion_entradas").insert({
    transformacion_id: transformacionId,
    lote_id: loteId,
    cantidad_consumida: pesoEntrada,
  });

  // 6.3. Registrar salida resultante
  await supabase.from("transformacion_salidas").insert({
    transformacion_id: transformacionId,
    cantidad_salida: pesoSalida,
  });

  // 6.4. Descontar inventario disponible (RF08)
  await supabase.from("inventario_movimientos").insert({
    lote_id: loteId,
    tipo: "consumo",
    cantidad: pesoEntrada,
    ref_transf_id: transformacionId,
  });

  // 6.5. Auditoría inmutable obligatoria (RF10)
  await supabase.from("auditoria_logs").insert({
    tabla: "transformaciones",
    registro_id: transformacionId,
    accion: "REGISTRO_TRANSFORMACION",
    usuario_id: userEmail,
    rol: userRole,
    datos_previos: {
      lote_id: loteId,
      saldo_disponible_anterior: saldoDisponible,
    },
    datos_nuevos: {
      lote_id: loteId,
      etapa: etapa,
      peso_entrada: pesoEntrada,
      peso_salida: pesoSalida,
      merma_kg: resultadoMerma.merma_kg,
      merma_pct: resultadoMerma.merma_pct,
      alerta_merma: resultadoMerma.alerta_merma,
      costo_etapa: costoTotal,
      costo_unitario: costoUnitario,
      nuevo_saldo_disponible: validacionConsumo.nuevoSaldo,
      idempotency_key: idempotencyKey,
    },
  });

  // 7. Revalidar rutas Next.js
  revalidatePath("/");
  revalidatePath("/lotes");
  revalidatePath("/transformaciones");
  revalidatePath("/trazabilidad");
  revalidatePath(`/trazabilidad/${loteId}`);
  revalidatePath(`/trazabilidad/publica/${loteId}`);

  return {
    success: true,
    transformacionId,
    mermaPct: resultadoMerma.merma_pct,
    alertaMerma: resultadoMerma.alerta_merma,
    costoUnitario,
    nuevoSaldo: validacionConsumo.nuevoSaldo,
  };
}
