"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  getTransformacionesAction,
  ejecutarTransformacionAction,
  TransformacionItem,
} from "@/app/actions/transformaciones";
import { getLotesAction, LoteConInventario } from "@/app/actions/lotes";

export default function TransformacionesPage() {
  const [transformaciones, setTransformaciones] = useState<TransformacionItem[]>([]);
  const [lotes, setLotes] = useState<LoteConInventario[]>([]);
  const [cargando, setCargando] = useState(true);

  // Formulario
  const [loteId, setLoteId] = useState("");
  const [etapa, setEtapa] = useState("Fermentación");
  const [pesoEntrada, setPesoEntrada] = useState("");
  const [pesoSalida, setPesoSalida] = useState("");
  const [costoEtapa, setCostoEtapa] = useState("");
  const [incidencia, setIncidencia] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [errorForm, setErrorForm] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [isPending, startTransition] = useTransition();

  // Generar clave de idempotencia al abrir el formulario (Corrección 7 de PLAN_IA.md)
  const regenerarIdempotencyKey = () => {
    setIdempotencyKey(`tx-trf-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`);
  };

  const cargarDatos = async () => {
    setCargando(true);
    const [lotesData, transfData] = await Promise.all([
      getLotesAction(),
      getTransformacionesAction(),
    ]);

    setLotes(lotesData);
    setTransformaciones(transfData);

    // Seleccionar por defecto el primer lote que no esté bloqueado y tenga saldo
    const loteDisponible = lotesData.find(
      (l) => l.estado !== "bloqueado" && l.cantidad_disponible > 0
    );
    if (loteDisponible && !loteId) {
      setLoteId(loteDisponible.id);
    }

    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
    regenerarIdempotencyKey();
  }, []);

  // Cálculo en vivo de merma (RF04)
  const entradaNum = parseFloat(pesoEntrada);
  const salidaNum = parseFloat(pesoSalida);
  let mermaEstimada: number | null = null;
  let alertaMermaEnVivo = false;

  if (!isNaN(entradaNum) && entradaNum > 0 && !isNaN(salidaNum) && salidaNum >= 0) {
    if (salidaNum <= entradaNum) {
      mermaEstimada = Number((((entradaNum - salidaNum) / entradaNum) * 100).toFixed(2));
      alertaMermaEnVivo = mermaEstimada > 15.0;
    }
  }

  const loteSeleccionadoInfo = lotes.find((l) => l.id === loteId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm("");
    setMensajeExito("");

    if (!loteId) {
      setErrorForm("Debes seleccionar un lote origen.");
      return;
    }

    if (loteSeleccionadoInfo?.estado === "bloqueado") {
      setErrorForm(
        `El lote ${loteId} está bloqueado por calidad (${loteSeleccionadoInfo.motivo_estado || "Control preventivo"}) y no puede transformarse (RF09).`
      );
      return;
    }

    if (loteSeleccionadoInfo && loteSeleccionadoInfo.cantidad_disponible <= 0) {
      setErrorForm(`El lote ${loteId} no tiene saldo disponible para procesar.`);
      return;
    }

    if (isNaN(entradaNum) || entradaNum <= 0) {
      setErrorForm("El peso de entrada debe ser mayor a 0 kg.");
      return;
    }

    if (isNaN(salidaNum) || salidaNum <= 0) {
      setErrorForm("El peso de salida debe ser mayor a 0 kg.");
      return;
    }

    if (salidaNum > entradaNum) {
      setErrorForm("Anomalía: El peso de salida no puede superar al peso de entrada.");
      return;
    }

    if (alertaMermaEnVivo && (!incidencia || incidencia.trim().length < 5)) {
      setErrorForm(
        `La merma es de ${mermaEstimada}% (> 15%). Es obligatorio registrar la justificación técnica de la incidencia (mínimo 5 caracteres) (RF04).`
      );
      return;
    }

    startTransition(async () => {
      const res = await ejecutarTransformacionAction({
        loteId,
        etapa,
        pesoEntrada: entradaNum,
        pesoSalida: salidaNum,
        costoEtapa: parseFloat(costoEtapa) || 0,
        incidencia: incidencia.trim() || null,
        idempotencyKey,
      });

      if (!res.success) {
        setErrorForm(res.error || "No se pudo registrar la transformación.");
        return;
      }

      setMensajeExito(
        `¡Transformación registrada con éxito! Descontados ${entradaNum} kg del inventario disponible.`
      );
      setPesoEntrada("");
      setPesoSalida("");
      setCostoEtapa("");
      setIncidencia("");
      regenerarIdempotencyKey();
      await cargarDatos();
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 sm:space-y-8">
      {/* Encabezado */}
      <div className="border-b border-slate-200 pb-5">
        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full uppercase tracking-wider">
          Módulo de Procesos (RF02 / RF04 / RF05 / RF08)
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
          Control de Procesos y Mermas
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Seguimiento post-cosecha: Fermentación, Secado, Trillado y Tostado con control de balance
        </p>
      </div>

      {/* Formulario de Nueva Transformación */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <span>⚙️</span> Registrar Nueva Etapa de Transformación
          </h2>
          <span className="text-[10px] font-mono text-slate-400">IDTX: {idempotencyKey.slice(0, 14)}...</span>
        </div>

        {errorForm && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl font-medium">
            ⚠️ {errorForm}
          </div>
        )}

        {mensajeExito && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl font-semibold">
            ✅ {mensajeExito}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Selector de Lote */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Lote Origen a Consumir:</label>
            <select
              value={loteId}
              onChange={(e) => setLoteId(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {lotes.map((lote) => {
                const bloqueado = lote.estado === "bloqueado";
                return (
                  <option key={lote.id} value={lote.id}>
                    {lote.id} — {lote.origen} ({lote.cantidad_disponible} kg disp.) {bloqueado ? "⛔ [BLOQUEADO]" : ""}
                  </option>
                );
              })}
            </select>

            {loteSeleccionadoInfo && (
              <div className="mt-1 space-y-1">
                <p className="text-[11px] text-slate-600">
                  Saldo disponible: <strong className="text-slate-900">{loteSeleccionadoInfo.cantidad_disponible} kg</strong> | Estado:{" "}
                  <span
                    className={`font-bold uppercase px-1.5 py-0.5 rounded text-[10px] ${
                      loteSeleccionadoInfo.estado === "liberado"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : loteSeleccionadoInfo.estado === "pendiente"
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {loteSeleccionadoInfo.estado}
                  </span>
                </p>

                {loteSeleccionadoInfo.estado === "bloqueado" && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold">
                    ⛔ <strong>Lote Bloqueado (RF09):</strong> No se puede procesar debido a:{" "}
                    <em>{loteSeleccionadoInfo.motivo_estado || "Control preventivo"}</em>.
                  </div>
                )}

                {loteSeleccionadoInfo.estado !== "bloqueado" && loteSeleccionadoInfo.cantidad_disponible <= 0 && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold">
                    ⚠️ <strong>Sin existencias (RF08):</strong> Este lote ya agotó su saldo disponible.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tipo de Proceso */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Etapa del Proceso:</label>
            <select
              value={etapa}
              onChange={(e) => setEtapa(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="Fermentación">Fermentación (Cajones de madera)</option>
              <option value="Secado">Secado (Marquesinas solares)</option>
              <option value="Trillado">Trillado (Descascarillado)</option>
              <option value="Tostado">Tostado (Curva térmica)</option>
              <option value="Molienda">Molienda / Pasta de Cacao</option>
              <option value="Empaque">Empaque y Sellado</option>
            </select>
          </div>

          {/* Costo de la Etapa (RF05) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Costo de la Etapa ($ COP):</label>
            <input
              type="number"
              step="any"
              value={costoEtapa}
              onChange={(e) => setCostoEtapa(e.target.value)}
              placeholder="Ej. 1600000"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 bg-white"
            />
            <p className="text-[10px] text-slate-500 mt-1">Para costeo unitario oficial (RF05)</p>
          </div>

          {/* Peso Entrada */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Peso Entrada (kg consumidos):</label>
            <input
              type="number"
              step="any"
              required
              value={pesoEntrada}
              onChange={(e) => setPesoEntrada(e.target.value)}
              placeholder="Ej. 100"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-900 bg-white"
            />
          </div>

          {/* Peso Salida */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Peso Resultante / Salida (kg):</label>
            <input
              type="number"
              step="any"
              required
              value={pesoSalida}
              onChange={(e) => setPesoSalida(e.target.value)}
              placeholder="Ej. 80"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-900 bg-white"
            />
          </div>

          {/* Monitor de Merma en Vivo (RF04) */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              Merma en Vivo (RF04):
            </span>
            {mermaEstimada !== null ? (
              <div className="mt-1">
                <span
                  className={`text-xl font-extrabold ${
                    alertaMermaEnVivo ? "text-red-600" : "text-emerald-700"
                  }`}
                >
                  {mermaEstimada}%
                </span>
                {alertaMermaEnVivo ? (
                  <span className="block text-[11px] font-bold text-red-600 mt-0.5">
                    🚨 ¡ALERTA: Supera el 15.0%!
                  </span>
                ) : (
                  <span className="block text-[11px] font-medium text-emerald-700 mt-0.5">
                    ✓ Merma normal (≤ 15%)
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-1">Ingresa peso entrada y salida</p>
            )}
          </div>

          {/* Campo de Justificación de Incidencia (Obligatorio si Merma > 15%) */}
          {alertaMermaEnVivo && (
            <div className="md:col-span-3 bg-red-50 p-4 rounded-2xl border border-red-200 space-y-2">
              <label className="block text-xs font-bold text-red-800">
                ⚠️ Justificación Técnica de Incidencia (Obligatorio por Merma &gt; 15% - RF04):
              </label>
              <textarea
                required
                rows={2}
                value={incidencia}
                onChange={(e) => setIncidencia(e.target.value)}
                placeholder="Explica la causa técnica (ej. Sobre-fermentación por choque térmico en cajones o deshidratación acelerada)."
                className="w-full border border-red-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-red-500 outline-none bg-white text-slate-900"
              />
            </div>
          )}

          {/* Botón de Enviar */}
          <div className="md:col-span-3 flex justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={
                isPending ||
                loteSeleccionadoInfo?.estado === "bloqueado" ||
                (loteSeleccionadoInfo ? loteSeleccionadoInfo.cantidad_disponible <= 0 : false)
              }
              className={`w-full sm:w-auto font-bold px-6 py-2.5 rounded-xl shadow-sm transition text-xs sm:text-sm min-h-[44px] ${
                loteSeleccionadoInfo?.estado === "bloqueado"
                  ? "bg-red-700 text-white cursor-not-allowed opacity-80"
                  : loteSeleccionadoInfo && loteSeleccionadoInfo.cantidad_disponible <= 0
                  ? "bg-amber-600 text-white cursor-not-allowed opacity-80"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
              }`}
            >
              {isPending
                ? "Procesando..."
                : loteSeleccionadoInfo?.estado === "bloqueado"
                ? "⛔ Lote Bloqueado (No Procesable)"
                : loteSeleccionadoInfo && loteSeleccionadoInfo.cantidad_disponible <= 0
                ? "⚠️ Saldo Insuficiente (0 kg)"
                : "Registrar y Descontar Inventario"}
            </button>
          </div>
        </form>
      </div>

      {/* Historial de Transformaciones */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">Historial de Procesos Registrados</h2>

        {/* VISTA 1: Tarjetas en Celular (< md) */}
        <div className="block md:hidden space-y-3">
          {cargando ? (
            <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 text-sm">
              Cargando historial de transformaciones...
            </div>
          ) : transformaciones.length > 0 ? (
            transformaciones.map((trf) => (
              <div
                key={trf.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3"
              >
                {/* Cabecera Tarjeta */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-base">{trf.loteId}</span>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                      {trf.etapa}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      trf.alertaMerma
                        ? "bg-red-50 text-red-800 border border-red-200"
                        : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {trf.mermaPct}% {trf.alertaMerma ? "⚠️ Alerta" : ""}
                  </span>
                </div>

                {/* Métricas de Masas y Costos */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Masas</span>
                    <span className="text-slate-700">
                      Entrada: <strong>{trf.pesoEntrada} kg</strong>
                    </span>
                    <span className="text-slate-900 font-bold block">
                      Salida: {trf.pesoSalida} kg
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Costeo (RF05)</span>
                    <span className="text-slate-600 block">
                      {trf.costoEtapa > 0 ? `$${trf.costoEtapa.toLocaleString("es-CO")}` : "N/D"}
                    </span>
                    <span className="font-extrabold text-emerald-700 text-xs block">
                      {trf.costoUnitario > 0 ? `$${trf.costoUnitario.toLocaleString("es-CO")}/kg` : "N/D"}
                    </span>
                  </div>
                </div>

                {trf.incidencia && (
                  <p className="text-[11px] text-slate-600 bg-red-50/50 p-2 rounded-lg border border-red-100 italic">
                    Incidencia: {trf.incidencia}
                  </p>
                )}

                {/* Footer Tarjeta */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                  <span className="truncate max-w-[180px]">{trf.responsable}</span>
                  <span>{new Date(trf.fecha).toLocaleDateString("es-CO")}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 text-sm">
              Aún no hay transformaciones registradas.
            </div>
          )}
        </div>

        {/* VISTA 2: Tabla en Computador (>= md) */}
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Lote Origen</th>
                  <th className="p-3.5">Etapa</th>
                  <th className="p-3.5">Entrada</th>
                  <th className="p-3.5">Salida</th>
                  <th className="p-3.5">Merma (%)</th>
                  <th className="p-3.5">Costo Etapa</th>
                  <th className="p-3.5">Costo Unitario (RF05)</th>
                  <th className="p-3.5">Responsable</th>
                  <th className="p-3.5">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {cargando ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500">
                      Cargando historial de transformaciones...
                    </td>
                  </tr>
                ) : transformaciones.length > 0 ? (
                  transformaciones.map((trf) => (
                    <tr key={trf.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3.5 font-bold text-slate-900">{trf.loteId}</td>
                      <td className="p-3.5 font-semibold text-slate-800">{trf.etapa}</td>
                      <td className="p-3.5 text-slate-600">{trf.pesoEntrada} kg</td>
                      <td className="p-3.5 text-slate-900 font-bold">{trf.pesoSalida} kg</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            trf.alertaMerma
                              ? "bg-red-50 text-red-800 border border-red-200"
                              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {trf.mermaPct}% {trf.alertaMerma ? "⚠️ Alerta" : ""}
                        </span>
                        {trf.incidencia && (
                          <p className="text-[11px] text-slate-500 mt-1 max-w-xs truncate" title={trf.incidencia}>
                            Incidencia: {trf.incidencia}
                          </p>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {trf.costoEtapa > 0 ? `$${trf.costoEtapa.toLocaleString("es-CO")}` : "N/D"}
                      </td>
                      <td className="p-3.5 font-extrabold text-emerald-700">
                        {trf.costoUnitario > 0 ? `$${trf.costoUnitario.toLocaleString("es-CO")}/kg` : "N/D"}
                      </td>
                      <td className="p-3.5 text-xs text-slate-500">{trf.responsable}</td>
                      <td className="p-3.5 text-xs text-slate-500">
                        {new Date(trf.fecha).toLocaleDateString("es-CO")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500">
                      Aún no hay transformaciones registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
