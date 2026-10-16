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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Encabezado */}
      <div className="border-b border-gray-200 pb-5">
        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
          Módulo de Transformaciones (RF02 / RF04 / RF05 / RF08)
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2">
          Control de Procesos y Mermas de Cacao
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Seguimiento post-cosecha: Fermentación, Secado, Trillado y Tostado con control de balance en tiempo real
        </p>
      </div>

      {/* Formulario de Nueva Transformación */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
            <span>⚙️</span> Registrar Nueva Etapa de Transformación
          </h2>
          <span className="text-[11px] font-mono text-gray-400">IDTX: {idempotencyKey.slice(0, 14)}...</span>
        </div>

        {errorForm && (
          <div className="p-4 bg-red-50 border border-red-300 text-red-700 text-xs rounded-2xl font-medium">
            ⚠️ {errorForm}
          </div>
        )}

        {mensajeExito && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-2xl font-semibold">
            ✅ {mensajeExito}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Selector de Lote */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Lote Origen a Consumir:</label>
            <select
              value={loteId}
              onChange={(e) => setLoteId(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {lotes.map((lote) => {
                const bloqueado = lote.estado === "bloqueado";
                return (
                  <option
                    key={lote.id}
                    value={lote.id}
                    disabled={bloqueado || lote.cantidad_disponible <= 0}
                  >
                    {lote.id} — {lote.origen} ({lote.cantidad_disponible} kg disp.)
                    {bloqueado ? " [BLOQUEADO]" : ""}
                  </option>
                );
              })}
            </select>
            {loteSeleccionadoInfo && (
              <p className="text-[11px] text-gray-500 mt-1">
                Saldo actual: <strong>{loteSeleccionadoInfo.cantidad_disponible} kg</strong> | Estado:{" "}
                <span className="font-semibold uppercase">{loteSeleccionadoInfo.estado}</span>
              </p>
            )}
          </div>

          {/* Tipo de Proceso */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Etapa del Proceso:</label>
            <select
              value={etapa}
              onChange={(e) => setEtapa(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
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
            <label className="block text-xs font-bold text-gray-700 mb-1">Costo de la Etapa ($ COP):</label>
            <input
              type="number"
              step="any"
              value={costoEtapa}
              onChange={(e) => setCostoEtapa(e.target.value)}
              placeholder="Ej. 1600000"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <p className="text-[11px] text-gray-500 mt-1">Para costeo unitario oficial (RF05)</p>
          </div>

          {/* Peso Entrada */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Peso Entrada (kg consumidos):</label>
            <input
              type="number"
              step="any"
              required
              value={pesoEntrada}
              onChange={(e) => setPesoEntrada(e.target.value)}
              placeholder="Ej. 100"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
            />
          </div>

          {/* Peso Salida */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Peso Resultante / Salida (kg):</label>
            <input
              type="number"
              step="any"
              required
              value={pesoSalida}
              onChange={(e) => setPesoSalida(e.target.value)}
              placeholder="Ej. 80"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
            />
          </div>

          {/* Monitor de Merma en Vivo (RF04) */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex flex-col justify-center">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
              Merma Calculada en Vivo (RF04):
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
                    🚨 ¡ALERTA: Supera el umbral del 15.0%!
                  </span>
                ) : (
                  <span className="block text-[11px] font-medium text-emerald-600 mt-0.5">
                    ✓ Merma en rango aceptable (≤ 15%)
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400 mt-1">Ingresa peso entrada y salida</p>
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
                className="w-full border border-red-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-red-500 outline-none bg-white"
              />
            </div>
          )}

          {/* Botón de Enviar */}
          <div className="md:col-span-3 flex justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition disabled:opacity-50 text-sm"
            >
              {isPending ? "Procesando..." : "Registrar y Descontar Inventario"}
            </button>
          </div>
        </form>
      </div>

      {/* Historial de Transformaciones */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Historial de Procesos Registrados</h2>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-emerald-950 text-white text-xs uppercase tracking-wider">
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
              <tbody className="divide-y divide-gray-100 text-sm">
                {cargando ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-500">
                      Cargando historial de transformaciones...
                    </td>
                  </tr>
                ) : transformaciones.length > 0 ? (
                  transformaciones.map((trf) => (
                    <tr key={trf.id} className="hover:bg-emerald-50/40 transition">
                      <td className="p-3.5 font-bold text-emerald-900">{trf.loteId}</td>
                      <td className="p-3.5 font-semibold text-gray-800">{trf.etapa}</td>
                      <td className="p-3.5 text-gray-600">{trf.pesoEntrada} kg</td>
                      <td className="p-3.5 text-gray-900 font-bold">{trf.pesoSalida} kg</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            trf.alertaMerma
                              ? "bg-red-100 text-red-800 border border-red-300"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {trf.mermaPct}% {trf.alertaMerma ? "⚠️ Alerta" : ""}
                        </span>
                        {trf.incidencia && (
                          <p className="text-[11px] text-gray-500 mt-1 max-w-xs truncate" title={trf.incidencia}>
                            Incidencia: {trf.incidencia}
                          </p>
                        )}
                      </td>
                      <td className="p-3.5 text-gray-600">
                        {trf.costoEtapa > 0 ? `$${trf.costoEtapa.toLocaleString("es-CO")}` : "N/D"}
                      </td>
                      <td className="p-3.5 font-bold text-emerald-700">
                        {trf.costoUnitario > 0 ? `$${trf.costoUnitario.toLocaleString("es-CO")}/kg` : "N/D"}
                      </td>
                      <td className="p-3.5 text-xs text-gray-500">{trf.responsable}</td>
                      <td className="p-3.5 text-xs text-gray-500">
                        {new Date(trf.fecha).toLocaleDateString("es-CO")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-500">
                      Aún no hay transformaciones registradas. ¡Sé el primero en procesar un lote!
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
