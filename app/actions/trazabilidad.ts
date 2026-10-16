"use server";

import { getServiceSupabase } from "@/lib/supabase";

export interface FichaPublicaDTO {
  lote_id: string;
  productor: string;
  origen: string;
  fecha_recepcion: string;
  cantidad_inicial: number;
  unidad: string;
  estado: "pendiente" | "liberado" | "bloqueado";
  motivo_estado?: string | null;
  etapas_proceso: Array<{
    etapa: string;
    fecha: string;
    merma_pct?: number;
    alerta_merma?: boolean;
  }>;
}

/**
 * RF06: Ficha pública segura para consulta por código o código QR.
 * Expone la trazabilidad y el estado sin revelar costos internos ni datos sensibles.
 */
export async function getFichaPublicaAction(loteId: string): Promise<FichaPublicaDTO | null> {
  const cleanId = (loteId || "").trim().toUpperCase();
  if (!cleanId) return null;

  const supabase = getServiceSupabase();

  // 1. Consultar información pública del lote
  const { data: lote, error: errLote } = await supabase
    .from("lotes")
    .select("id, productor, origen, fecha_recepcion, cantidad_inicial, unidad, estado, motivo_estado")
    .eq("id", cleanId)
    .maybeSingle();

  if (errLote || !lote) {
    return null;
  }

  // 2. Consultar etapas asociadas a este lote a través de transformacion_entradas
  const { data: entradas } = await supabase
    .from("transformacion_entradas")
    .select("transformacion_id")
    .eq("lote_id", cleanId);

  const transfIds = (entradas || []).map((e) => e.transformacion_id);

  let etapas: Array<{ etapa: string; fecha: string; merma_pct?: number; alerta_merma?: boolean }> = [];

  if (transfIds.length > 0) {
    const { data: transformaciones } = await supabase
      .from("transformaciones")
      .select("etapa, fecha, merma_pct, alerta_merma")
      .in("id", transfIds)
      .order("fecha", { ascending: true });

    etapas = (transformaciones || []).map((t) => ({
      etapa: t.etapa,
      fecha: t.fecha,
      merma_pct: Number(t.merma_pct) || 0,
      alerta_merma: Boolean(t.alerta_merma),
    }));
  }

  return {
    lote_id: lote.id,
    productor: lote.productor,
    origen: lote.origen,
    fecha_recepcion: lote.fecha_recepcion,
    cantidad_inicial: Number(lote.cantidad_inicial),
    unidad: lote.unidad || "kg",
    estado: lote.estado as "pendiente" | "liberado" | "bloqueado",
    motivo_estado: lote.estado === "bloqueado" ? lote.motivo_estado : null,
    etapas_proceso: etapas,
  };
}

/**
 * Consulta la lista de todos los IDs de lotes para los botones de acceso rápido
 */
export async function getLoteIdsPublicAction(): Promise<string[]> {
  try {
    const supabase = getServiceSupabase();
    const { data } = await supabase.from("lotes").select("id").order("id", { ascending: true });
    if (!data || data.length === 0) {
      return ["CAC001", "CAC002", "CAC003", "CAC004"];
    }
    return data.map((l) => l.id);
  } catch (err) {
    console.error("Error al obtener IDs de lotes:", err);
    return ["CAC001", "CAC002", "CAC003", "CAC004"];
  }
}

