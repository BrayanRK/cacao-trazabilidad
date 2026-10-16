"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getFichaPublicaAction, FichaPublicaDTO } from "@/app/actions/trazabilidad";

const initialFicha: FichaPublicaDTO = {
  lote_id: "CAC001",
  productor: "Carlos Dussán",
  origen: "Rivera",
  fecha_recepcion: "2026-10-15T12:00:00+00:00",
  cantidad_inicial: 500,
  unidad: "kg",
  estado: "liberado",
  etapas_proceso: [
    { etapa: "Fermentación", fecha: "2026-10-15T14:00:00+00:00", merma_pct: 10.0, alerta_merma: false },
    { etapa: "Secado", fecha: "2026-10-15T18:00:00+00:00", merma_pct: 12.5, alerta_merma: false },
  ],
};

export default function TrazabilidadPage() {
  const [codigoBusqueda, setCodigoBusqueda] = useState("CAC001");
  const [ficha, setFicha] = useState<FichaPublicaDTO | null>(initialFicha);
  const [buscado, setBuscado] = useState(true);
  const [isPending, startTransition] = useTransition();

  const consultarLote = (codigo: string) => {
    const cod = (codigo || "").trim().toUpperCase();
    if (!cod) return;
    setCodigoBusqueda(cod);
    startTransition(async () => {
      try {
        const data = await getFichaPublicaAction(cod);
        setFicha(data);
      } catch (err) {
        console.error("Error al consultar lote:", err);
      } finally {
        setBuscado(true);
      }
    });
  };

  useEffect(() => {
    consultarLote("CAC001");
  }, []);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    if (codigoBusqueda.trim()) {
      consultarLote(codigoBusqueda.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Encabezado */}
      <div className="border-b border-slate-200 pb-4">
        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
          Ficha Pública Segura (RF06 / QR)
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
          Consulta Pública de Trazabilidad
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Transparencia y origen del cacao del Huila (Rivera, Campoalegre y Algeciras) de la finca al consumidor.
        </p>
      </div>

      {/* Buscador de Lote */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
          Consultar por Código de Lote o Escaneo QR:
        </label>
        <form onSubmit={handleBuscar} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input
            type="text"
            value={codigoBusqueda}
            onChange={(e) => setCodigoBusqueda(e.target.value)}
            placeholder="Ej. CAC001, CAC002, CAC003..."
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold uppercase focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 bg-white"
          />
          <button
            type="submit"
            disabled={isPending}
            className="min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-sm transition disabled:opacity-50 text-sm flex items-center justify-center gap-2 active:scale-95"
          >
            <span>🔍</span> {isPending ? "Buscando..." : "Consultar"}
          </button>
        </form>

        <div className="flex flex-wrap gap-2 pt-1 items-center">
          <span className="text-xs text-slate-400 font-medium">Acceso rápido:</span>
          {["CAC001", "CAC002", "CAC003"].map((ej) => (
            <button
              key={ej}
              type="button"
              onClick={() => {
                setCodigoBusqueda(ej);
                consultarLote(ej);
              }}
              className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-bold px-3 py-1.5 rounded-xl transition border border-slate-200 min-h-[36px] active:scale-95"
            >
              {ej}
            </button>
          ))}
        </div>
      </div>

      {/* Ficha de Trazabilidad */}
      {ficha ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
          {/* Banner Superior Ficha */}
          <div
            className={`p-5 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
              ficha.estado === "bloqueado"
                ? "bg-gradient-to-r from-red-800 to-rose-900"
                : ficha.estado === "liberado"
                ? "bg-gradient-to-r from-emerald-800 to-green-900"
                : "bg-gradient-to-r from-amber-700 to-yellow-800"
            }`}
          >
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-200/90">
                Ficha Oficial de Cacao Huilense
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-0.5 tracking-tight">{ficha.lote_id}</h2>
              <p className="text-xs text-emerald-100/90 mt-1 font-medium">
                Municipio de Origen: 📍 {ficha.origen}, Huila
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-1">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                  ficha.estado === "liberado"
                    ? "bg-emerald-500/30 text-emerald-100 border-emerald-400"
                    : ficha.estado === "pendiente"
                    ? "bg-amber-500/30 text-amber-100 border-amber-400"
                    : "bg-red-500/40 text-red-100 border-red-300"
                }`}
              >
                {ficha.estado === "bloqueado"
                  ? "⛔ BLOQUEADO"
                  : ficha.estado === "liberado"
                  ? "✓ LIBERADO (Apto)"
                  : "⏳ PENDIENTE"}
              </span>

              {ficha.estado === "bloqueado" && ficha.motivo_estado && (
                <span className="text-[11px] text-red-200 max-w-xs text-left sm:text-right">
                  Causa: {ficha.motivo_estado}
                </span>
              )}
            </div>
          </div>

          {/* Alerta si está bloqueado (Hora 12 / RF09) */}
          {ficha.estado === "bloqueado" && (
            <div className="p-4 bg-red-50 border-b border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>
                Este lote ha sido <strong>BLOQUEADO PREVENTIVAMENTE</strong> por control de calidad. No se
                encuentra disponible para distribución comercial ni consumo (RF09).
              </span>
            </div>
          )}

          {/* Contenido Ficha */}
          <div className="p-5 sm:p-6 space-y-6">
            {/* Origen Agrícola */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Información de Origen Agrícola
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Productor</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5 truncate">{ficha.productor}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Ubicación</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">📍 {ficha.origen}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Volumen Recibido</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                    {ficha.cantidad_inicial} {ficha.unidad}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Fecha de Recepción</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                    {new Date(ficha.fecha_recepcion).toLocaleDateString("es-CO")}
                  </p>
                </div>
              </div>
            </div>

            {/* Línea de Transformación Post-Cosecha */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Línea de Tiempo del Proceso Post-Cosecha
              </h3>

              {ficha.etapas_proceso.length > 0 ? (
                <div className="space-y-2.5">
                  {ficha.etapas_proceso.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">{p.etapa}</h4>
                          <span className="text-[11px] text-slate-500">
                            Registrado el {new Date(p.fecha).toLocaleDateString("es-CO")}
                          </span>
                        </div>
                        {p.merma_pct !== undefined && (
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full self-start sm:self-auto border ${
                              p.alerta_merma
                                ? "bg-red-50 text-red-800 border-red-200"
                                : "bg-emerald-50 text-emerald-800 border-emerald-200"
                            }`}
                          >
                            Merma: {p.merma_pct}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500">
                  Este lote se encuentra en recepción inicial. Las etapas de fermentación y secado aún no han sido registradas.
                </div>
              )}
            </div>

            {/* Privacidad de Costos (RF06) */}
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
              <span className="text-base leading-none">🔒</span>
              <p>
                <strong>Privacidad Comercial (RF06):</strong> Esta ficha es pública para compradores y consumidores finales. Los costos unitarios internos y márgenes comerciales de la cooperativa se mantienen estrictamente confidenciales.
              </p>
            </div>
          </div>
        </div>
      ) : buscado ? (
        <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-sm">
          No se encontró ningún lote registrado con el código <strong>{codigoBusqueda}</strong>.
        </div>
      ) : null}
    </div>
  );
}
