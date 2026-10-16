"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { getFichaPublicaAction, getLoteIdsPublicAction, FichaPublicaDTO } from "@/app/actions/trazabilidad";

export default function TrazabilidadClient() {
  const searchParams = useSearchParams();
  const paramLote = searchParams.get("lote")?.trim().toUpperCase();

  const [codigoBusqueda, setCodigoBusqueda] = useState(paramLote || "CAC004");
  const [ficha, setFicha] = useState<FichaPublicaDTO | null>(null);
  const [cargando, setCargando] = useState(true);
  const [buscado, setBuscado] = useState(false);
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [hostOrigin, setHostOrigin] = useState("http://192.168.1.229:3000");
  const [listaLotes, setListaLotes] = useState<string[]>(["CAC001", "CAC002", "CAC003", "CAC004"]);
  const [isPending, startTransition] = useTransition();

  const consultarLote = useCallback((codigo: string) => {
    const cod = (codigo || "").trim().toUpperCase();
    if (!cod) return;
    setCodigoBusqueda(cod);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("lote", cod);
      window.history.replaceState({}, "", url.toString());
    }
    startTransition(async () => {
      try {
        setCargando(true);
        const data = await getFichaPublicaAction(cod);
        setFicha(data);
      } catch (err) {
        console.error("Error al consultar lote:", err);
      } finally {
        setCargando(false);
        setBuscado(true);
      }
    });
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      setHostOrigin(isLocal ? "http://192.168.1.229:3000" : window.location.origin);
    }

    getLoteIdsPublicAction().then((ids) => {
      if (ids && ids.length > 0) {
        setListaLotes(ids);
        // Si hay lote en la URL, consultar ese; de lo contrario, consultar el último lote
        const target = paramLote || ids[ids.length - 1];
        consultarLote(target);
      } else {
        consultarLote(paramLote || "CAC004");
      }
    });
  }, [paramLote, consultarLote]);

  const activeLoteId = ficha?.lote_id || codigoBusqueda;

  // Enlace para código QR (acceso móvil por Wi-Fi)
  const qrMobileUrl = `${hostOrigin}/trazabilidad?lote=${activeLoteId}`;
  // Enlace directo en el navegador actual para "Probar Enlace"
  const testUrl = `/trazabilidad?lote=${activeLoteId}`;

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    if (codigoBusqueda.trim()) {
      consultarLote(codigoBusqueda.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Encabezado */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200 dark:border-emerald-700/60 shadow-sm">
          Ficha Pública Segura (RF06 / QR)
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
          Consulta Pública de Trazabilidad
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Transparencia y origen del cacao del Huila (Rivera, Campoalegre y Algeciras) de la finca al consumidor.
        </p>
      </div>

      {/* Buscador de Lote */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
          Consultar por Código de Lote o Escaneo QR:
        </label>
        <form onSubmit={handleBuscar} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input
            type="text"
            value={codigoBusqueda}
            onChange={(e) => setCodigoBusqueda(e.target.value)}
            placeholder="Ej. CAC001, CAC002, CAC003, CAC004..."
            className="flex-1 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold uppercase focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white bg-white dark:bg-slate-800"
          />
          <button
            type="submit"
            disabled={isPending || cargando}
            className="min-h-[44px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition disabled:opacity-50 text-sm flex items-center justify-center gap-2 active:scale-95"
          >
            <span>🔍</span> {isPending || cargando ? "Buscando..." : "Consultar"}
          </button>
        </form>

        <div className="flex flex-wrap gap-2 pt-1 items-center">
          <span className="text-xs text-slate-400 dark:text-slate-400 font-medium">Acceso rápido:</span>
          {listaLotes.map((ej) => (
            <button
              key={ej}
              type="button"
              onClick={() => {
                consultarLote(ej);
              }}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition border min-h-[36px] active:scale-95 ${
                activeLoteId === ej
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-sm ring-2 ring-emerald-500/30"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/80 hover:text-emerald-800 dark:hover:text-emerald-300 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
              }`}
            >
              {ej}
            </button>
          ))}
        </div>
      </div>

      {/* Ficha de Trazabilidad */}
      {cargando && !ficha ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400">
          <div className="animate-spin text-2xl mb-2">🌱</div>
          <p className="text-sm font-semibold">Cargando lote {activeLoteId}...</p>
        </div>
      ) : ficha ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-0">
          {/* Banner Superior Ficha */}
          <div
            className={`p-5 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
              ficha.estado === "bloqueado"
                ? "bg-gradient-to-r from-red-900 to-rose-950"
                : ficha.estado === "liberado"
                ? "bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-950"
                : "bg-gradient-to-r from-amber-800 to-yellow-950"
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

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border shadow-sm ${
                  ficha.estado === "bloqueado"
                    ? "bg-red-500/20 text-red-200 border-red-400/40"
                    : ficha.estado === "liberado"
                    ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/40"
                    : "bg-amber-500/20 text-amber-200 border-amber-400/40"
                }`}
              >
                {ficha.estado === "bloqueado"
                  ? "❌ Lote Bloqueado"
                  : ficha.estado === "liberado"
                  ? "✓ Sello Liberado (Apto)"
                  : "⏳ En Cuarentena"}
              </span>
            </div>
          </div>

          {/* Alerta de Bloqueo Preventivo si aplica (RF09) */}
          {ficha.estado === "bloqueado" && (
            <div className="bg-red-50 dark:bg-red-950/80 border-b border-red-200 dark:border-red-900/60 p-4 sm:p-5 flex items-start gap-3 text-red-900 dark:text-red-200 text-xs sm:text-sm">
              <span className="text-xl shrink-0">⚠️</span>
              <div>
                <strong className="font-bold">Lote Fuera de Estándar de Calidad:</strong>
                <p className="mt-0.5 text-xs text-red-700 dark:text-red-300">
                  {ficha.motivo_estado || "Bloqueo preventivo de seguridad alimentaria activado por administración."}
                </p>
              </div>
            </div>
          )}

          {/* Contenido Ficha */}
          <div className="p-5 sm:p-6 space-y-6">
            {/* Tarjeta de Código QR Digital Escaneable (RF06) */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-slate-50 dark:from-slate-800/80 dark:to-emerald-950/40 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col md:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-xl shadow-md border border-slate-200 shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=064e3b&data=${encodeURIComponent(
                      qrMobileUrl
                    )}`}
                    alt={`Código QR para lote ${activeLoteId}`}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-lg"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      QR Oficial en Vivo
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Escaneable por Wi-Fi</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Certificado Digital de Origen Huila
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm">
                    Apunta con la cámara de tu celular a la pantalla para abrir la ficha pública en vivo.
                  </p>
                  <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-slate-400 dark:text-slate-400">Destino:</span>
                    <a
                      href={testUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 hover:underline break-all"
                    >
                      {qrMobileUrl}
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto shrink-0">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard?.writeText(qrMobileUrl);
                      setLinkCopiado(true);
                      setTimeout(() => setLinkCopiado(false), 2500);
                    } catch (e) {
                      console.error("Error al copiar al portapapeles:", e);
                    }
                  }}
                  className="w-full text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95"
                >
                  <span>{linkCopiado ? "✓ ¡Enlace Copiado!" : "📋 Copiar Enlace QR"}</span>
                </button>

                <a
                  href={testUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-xs font-bold px-4 py-2 rounded-xl transition-all border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 text-center active:scale-95"
                >
                  <span>↗ Probar Enlace</span>
                </a>
              </div>
            </div>

            {/* Origen Agrícola */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Información de Origen Agrícola
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-semibold">Productor</p>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 truncate">{ficha.productor}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-semibold">Ubicación</p>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">📍 {ficha.origen}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-semibold">Volumen Recibido</p>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {ficha.cantidad_inicial} {ficha.unidad}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-semibold">Fecha de Recepción</p>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {new Date(ficha.fecha_recepcion).toLocaleDateString("es-CO")}
                  </p>
                </div>
              </div>
            </div>

            {/* Línea de Transformación Post-Cosecha */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Línea de Tiempo del Proceso Post-Cosecha
              </h3>

              {ficha.etapas_proceso.length > 0 ? (
                <div className="space-y-2.5">
                  {ficha.etapas_proceso.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{p.etapa}</h4>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Registrado el {new Date(p.fecha).toLocaleDateString("es-CO")}
                          </span>
                        </div>
                        {p.merma_pct !== undefined && (
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full self-start sm:self-auto border ${
                              p.alerta_merma
                                ? "bg-red-50 dark:bg-red-950/80 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800"
                                : "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
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
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                  Este lote se encuentra en recepción inicial. Las etapas de fermentación y secado aún no han sido registradas.
                </div>
              )}
            </div>

            {/* Privacidad de Costos (RF06) */}
            <div className="bg-emerald-50 dark:bg-emerald-950/80 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2.5">
              <span className="text-base leading-none">🔒</span>
              <p>
                <strong>Privacidad Comercial (RF06):</strong> Esta ficha es pública para compradores y consumidores finales. Los costos unitarios internos y márgenes comerciales de la cooperativa se mantienen estrictamente confidenciales.
              </p>
            </div>
          </div>
        </div>
      ) : buscado ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 dark:text-slate-400 text-sm">
          No se encontró ningún lote registrado con el código <strong>{codigoBusqueda}</strong>.
        </div>
      ) : null}
    </div>
  );
}
