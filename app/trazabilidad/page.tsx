"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getFichaPublicaAction, FichaPublicaDTO } from "@/app/actions/trazabilidad";

export default function TrazabilidadPage() {
  const [codigoBusqueda, setCodigoBusqueda] = useState("CAC001");
  const [ficha, setFicha] = useState<FichaPublicaDTO | null>(null);
  const [buscado, setBuscado] = useState(false);
  const [isPending, startTransition] = useTransition();

  const consultarLote = (codigo: string) => {
    startTransition(async () => {
      const data = await getFichaPublicaAction(codigo);
      setFicha(data);
      setBuscado(true);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Encabezado */}
      <div className="border-b border-gray-200 pb-5">
        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
          Ficha Pública Segura (RF06 / QR)
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2">
          Consulta Pública de Trazabilidad
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Transparencia y origen del cacao del Huila (Rivera, Campoalegre y Algeciras) de la finca al consumidor
        </p>
      </div>

      {/* Buscador de Lote */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-3">
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
          Consultar por Código de Lote o Escaneo QR:
        </label>
        <form onSubmit={handleBuscar} className="flex gap-3">
          <input
            type="text"
            value={codigoBusqueda}
            onChange={(e) => setCodigoBusqueda(e.target.value)}
            placeholder="Ej. CAC001, CAC002, CAC003..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-bold uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <button
            type="submit"
            disabled={isPending}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition disabled:opacity-50 text-sm flex items-center gap-2"
          >
            <span>🔍</span> {isPending ? "Buscando..." : "Consultar"}
          </button>
        </form>

        <div className="flex gap-2 pt-1 items-center">
          <span className="text-xs text-gray-400">Acceso rápido:</span>
          {["CAC001", "CAC002", "CAC003"].map((ej) => (
            <button
              key={ej}
              type="button"
              onClick={() => {
                setCodigoBusqueda(ej);
                consultarLote(ej);
              }}
              className="text-xs bg-gray-100 hover:bg-emerald-100 hover:text-emerald-800 text-gray-700 font-bold px-2.5 py-1 rounded-lg transition"
            >
              {ej}
            </button>
          ))}
        </div>
      </div>

      {/* Ficha de Trazabilidad */}
      {ficha ? (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
          {/* Banner Superior Ficha */}
          <div
            className={`p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
              ficha.estado === "bloqueado"
                ? "bg-gradient-to-r from-red-800 to-rose-900"
                : ficha.estado === "liberado"
                ? "bg-gradient-to-r from-emerald-800 to-green-900"
                : "bg-gradient-to-r from-amber-700 to-yellow-800"
            }`}
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-200/80">
                Ficha Oficial de Cacao Huilense
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mt-1 tracking-tight">{ficha.lote_id}</h2>
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

          {/* Alerta si está bloqueado (Hora 12) */}
          {ficha.estado === "bloqueado" && (
            <div className="p-4 bg-red-50 border-b border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>
                Este lote ha sido <strong>BLOQUEADO PREVENTIVAMENTE</strong> por control de calidad. No se
                encuentra disponible para distribución comercial ni consumo (RF09).
              </span>
            </div>
          )}

          {/* Contenido Ficha */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Origen Agrícola */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Información de Origen Agrícola
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-[11px] text-gray-500 font-medium">Productor</p>
                  <p className="text-sm font-extrabold text-gray-900 mt-0.5">{ficha.productor}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-medium">Ubicación</p>
                  <p className="text-sm font-extrabold text-gray-900 mt-0.5">{ficha.origen}, Huila</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-medium">Volumen Recibido</p>
                  <p className="text-sm font-extrabold text-gray-900 mt-0.5">
                    {ficha.cantidad_inicial} {ficha.unidad}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-medium">Fecha de Recepción</p>
                  <p className="text-sm font-extrabold text-gray-900 mt-0.5">
                    {new Date(ficha.fecha_recepcion).toLocaleDateString("es-CO")}
                  </p>
                </div>
              </div>
            </div>

            {/* Línea de Transformación */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Línea de Tiempo del Proceso Post-Cosecha
              </h3>

              {ficha.etapas_proceso.length > 0 ? (
                <div className="space-y-3">
                  {ficha.etapas_proceso.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100"
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div>
                          <h4 className="text-sm font-extrabold text-gray-900">{p.etapa}</h4>
                          <span className="text-xs text-gray-500">
                            Registrado el {new Date(p.fecha).toLocaleDateString("es-CO")}
                          </span>
                        </div>
                        {p.merma_pct !== undefined && (
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              p.alerta_merma
                                ? "bg-red-100 text-red-800"
                                : "bg-emerald-100 text-emerald-800"
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
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 text-center text-xs text-gray-500">
                  Este lote se encuentra en recepción inicial. Las etapas de fermentación y secado aún no han sido
                  registradas.
                </div>
              )}
            </div>

            {/* Privacidad de Costos (RF06) */}
            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/60 text-[11px] text-emerald-900 flex items-center gap-2">
              <span>🔒</span>
              <span>
                <strong>Privacidad de Datos (RF06):</strong> Esta ficha es de acceso público para consumidores y
                compradores. Por política de seguridad, los costos internos y márgenes comerciales no son
                expuestos públicamente.
              </span>
            </div>
          </div>
        </div>
      ) : buscado ? (
        <div className="p-8 text-center bg-white border border-gray-200 rounded-3xl text-gray-500">
          No se encontró ningún lote registrado con el código <strong>{codigoBusqueda}</strong>.
        </div>
      ) : null}
    </div>
  );
}
