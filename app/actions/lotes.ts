"use server";

import { getServiceSupabase, Lote } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export interface LoteConInventario extends Lote {
  cantidad_disponible: number;
}

/**
 * Consulta todos los lotes con su inventario disponible calculado en tiempo real (RF08)
 */
export async function getLotesAction(): Promise<LoteConInventario[]> {
  const supabase = getServiceSupabase();

  const { data: lotes, error: errLotes } = await supabase
    .from("lotes")
    .select("*")
    .order("created_at", { ascending: false });

  if (errLotes || !lotes) {
    console.error("Error al consultar lotes:", errLotes?.message);
    return [];
  }

  // Consultar todos los movimientos para calcular existencia real por lote
  const { data: movimientos } = await supabase
    .from("inventario_movimientos")
    .select("lote_id, tipo, cantidad");

  const balancePorLote = (movimientos || []).reduce<Record<string, number>>((acc, mov) => {
    const cant = Number(mov.cantidad) || 0;
    if (!acc[mov.lote_id]) acc[mov.lote_id] = 0;
    if (mov.tipo === "recepcion") acc[mov.lote_id] += cant;
    if (mov.tipo === "consumo") acc[mov.lote_id] -= cant;
    return acc;
  }, {});

  return lotes.map((lote) => ({
    ...lote,
    cantidad_inicial: Number(lote.cantidad_inicial),
    cantidad_disponible: Math.max(0, balancePorLote[lote.id] ?? Number(lote.cantidad_inicial)),
  }));
}

/**
 * RF01: Recepción de lotes (Rechazar cantidades no positivas, ID único)
 */
export async function recibirLoteAction(data: {
  productor: string;
  origen: string;
  cantidad: number;
  unidad?: string;
}) {
  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress || "operador_anon";
  const userRole = (user?.publicMetadata?.role as string) || "operador";

  // Validación RF01: Rechazar cantidades no positivas
  const cantidad = Number(data.cantidad);
  if (!cantidad || cantidad <= 0) {
    return { success: false, error: "La cantidad recibida debe ser mayor a 0 kg (RF01)." };
  }

  if (!data.productor?.trim()) {
    return { success: false, error: "El nombre del productor es obligatorio." };
  }

  if (!data.origen?.trim()) {
    return { success: false, error: "El municipio de origen es obligatorio." };
  }

  const supabase = getServiceSupabase();

  // Generar ID único incremental (ej. CAC004)
  const { count } = await supabase
    .from("lotes")
    .select("*", { count: "exact", head: true });

  const nextNumber = (count || 0) + 1;
  const loteId = `CAC${String(nextNumber).padStart(3, "0")}`;

  // 1. Insertar lote
  const { error: errLote } = await supabase.from("lotes").insert({
    id: loteId,
    productor: data.productor.trim(),
    origen: data.origen.trim(),
    cantidad_inicial: cantidad,
    unidad: data.unidad || "kg",
    estado: "pendiente", // Nace en pendiente (RF09)
    motivo_estado: "Recepción inicial registrada",
  });

  if (errLote) {
    console.error("Error al registrar lote:", errLote.message);
    return { success: false, error: "No se pudo registrar el lote: " + errLote.message };
  }

  // 2. Registrar movimiento de inventario inicial (RF08)
  await supabase.from("inventario_movimientos").insert({
    lote_id: loteId,
    tipo: "recepcion",
    cantidad: cantidad,
  });

  // 3. Auditoría obligatoria (RF10)
  await supabase.from("auditoria_logs").insert({
    tabla: "lotes",
    registro_id: loteId,
    accion: "RECEPCION_LOTE",
    usuario_id: userEmail,
    rol: userRole,
    datos_previos: null,
    datos_nuevos: {
      id: loteId,
      productor: data.productor,
      origen: data.origen,
      cantidad: cantidad,
      estado: "pendiente",
    },
  });

  revalidatePath("/");
  revalidatePath("/lotes");

  return { success: true, loteId };
}

/**
 * RF09: Cambio de estado (pendiente, liberado, bloqueado).
 * Solo el Administrador puede cambiar el estado, con motivo obligatorio.
 */
export async function cambiarEstadoLoteAction(data: {
  loteId: string;
  nuevoEstado: "pendiente" | "liberado" | "bloqueado";
  motivo: string;
}) {
  const user = await currentUser();
  const userRole = (user?.publicMetadata?.role as string) || "operador";
  const userEmail = user?.emailAddresses[0]?.emailAddress || "desconocido";

  // Control estricto de permisos (RF09)
  if (userRole !== "admin") {
    return {
      success: false,
      error: "Acción denegada: Solo el Administrador tiene autorización para cambiar estados o bloquear lotes (RF09).",
    };
  }

  if (!data.motivo || data.motivo.trim().length < 5) {
    return {
      success: false,
      error: "Es obligatorio registrar un motivo detallado para cambiar el estado (mínimo 5 caracteres).",
    };
  }

  const supabase = getServiceSupabase();

  // Obtener estado anterior para auditoría
  const { data: loteAnterior } = await supabase
    .from("lotes")
    .select("estado, motivo_estado")
    .eq("id", data.loteId)
    .single();

  // Actualizar estado
  const { error: errUpdate } = await supabase
    .from("lotes")
    .update({
      estado: data.nuevoEstado,
      motivo_estado: data.motivo.trim(),
    })
    .eq("id", data.loteId);

  if (errUpdate) {
    return { success: false, error: errUpdate.message };
  }

  // Registrar en auditoría inmutable (RF10)
  await supabase.from("auditoria_logs").insert({
    tabla: "lotes",
    registro_id: data.loteId,
    accion: "CAMBIO_ESTADO",
    usuario_id: userEmail,
    rol: userRole,
    datos_previos: { estado: loteAnterior?.estado, motivo: loteAnterior?.motivo_estado },
    datos_nuevos: { estado: data.nuevoEstado, motivo: data.motivo.trim() },
  });

  revalidatePath("/");
  revalidatePath("/lotes");
  revalidatePath(`/trazabilidad/publica/${data.loteId}`);

  return { success: true };
}
