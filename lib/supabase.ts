import { createClient } from "@supabase/supabase-js";

// Validar que las variables existan en el entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Advertencia: Las variables de entorno de Supabase no están completas.");
}

/**
 * Cliente público de Supabase para consultas estándar y lecturas públicas.
 */
export const supabase = createClient(
  supabaseUrl || "",
  supabaseAnonKey || ""
);

/**
 * Cliente seguro de administración (Service Role) para ejecutar Server Actions
 * protegidas desde el servidor de Next.js (bypassa RLS cuando el servidor lo autoriza).
 */
export function getServiceSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY no está configurada en .env.local.");
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Tipos TypeScript para el modelo de datos de Trazabilidad de Cacao
export interface Lote {
  id: string; // ej: 'CAC001'
  productor: string;
  origen: string; // Rivera, Campoalegre, Algeciras
  fecha_recepcion: string;
  cantidad_inicial: number;
  unidad: string; // 'kg'
  estado: "pendiente" | "liberado" | "bloqueado";
  motivo_estado: string | null;
  created_at: string;
}

export interface Transformacion {
  id: string;
  etapa: string;
  responsable: string;
  fecha: string;
  costo_etapa: number;
  merma_pct: number;
  alerta_merma: boolean;
  incidencia: string | null;
  idempotency_key: string | null;
  created_at: string;
}

export interface InventarioMovimiento {
  id: string;
  lote_id: string;
  tipo: "recepcion" | "consumo" | "ajuste";
  cantidad: number;
  ref_transf_id: string | null;
  created_at: string;
}

export interface AuditoriaLog {
  id: string;
  tabla: string;
  registro_id: string;
  accion: string;
  usuario_id: string | null;
  rol: string | null;
  datos_previos: Record<string, unknown> | null;
  datos_nuevos: Record<string, unknown> | null;
  created_at: string;
}
