"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  getLotesAction,
  recibirLoteAction,
  cambiarEstadoLoteAction,
  LoteConInventario,
} from "@/app/actions/lotes";

export default function LotesPage() {
  const { user } = useUser();
  const userRole = (user?.publicMetadata?.role as string) || "operador";

  const [lotes, setLotes] = useState<LoteConInventario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [origenFiltro, setOrigenFiltro] = useState("Todos");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");

  // Modal Recepción (RF01)
  const [modalRecepcionAbierto, setModalRecepcionAbierto] = useState(false);
  const [productor, setProductor] = useState("");
  const [origen, setOrigen] = useState("Rivera");
  const [cantidad, setCantidad] = useState("");
  const [errorRecepcion, setErrorRecepcion] = useState("");
  const [isPendingRecepcion, startRecepcionTransition] = useTransition();

  // Modal Cambio de Estado (RF09 - Admin)
  const [modalEstadoAbierto, setModalEstadoAbierto] = useState(false);
  const [loteSeleccionado, setLoteSeleccionado] = useState<LoteConInventario | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState<"pendiente" | "liberado" | "bloqueado">("bloqueado");
  const [motivoEstado, setMotivoEstado] = useState("");
  const [errorEstado, setErrorEstado] = useState("");
  const [isPendingEstado, startEstadoTransition] = useTransition();

  const cargarLotes = async () => {
    setCargando(true);
    const data = await getLotesAction();
    setLotes(data);
    setCargando(false);
  };

  useEffect(() => {
    cargarLotes();
  }, []);

  const handleCrearLote = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorRecepcion("");

    const cantNum = parseFloat(cantidad);
    if (!productor.trim()) {
      setErrorRecepcion("El nombre del productor es obligatorio.");
      return;
    }

    if (isNaN(cantNum) || cantNum <= 0) {
      setErrorRecepcion("La cantidad inicial debe ser mayor a 0 kg (RF01).");
      return;
    }

    startRecepcionTransition(async () => {
      const res = await recibirLoteAction({
        productor: productor.trim(),
        origen: origen.trim(),
        cantidad: cantNum,
      });

      if (!res.success) {
        setErrorRecepcion(res.error || "No se pudo registrar el lote.");
        return;
      }

      setProductor("");
      setCantidad("");
      setOrigen("Rivera");
      setModalRecepcionAbierto(false);
      await cargarLotes();
    });
  };

  const handleCambiarEstado = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorEstado("");

    if (!loteSeleccionado) return;

    if (!motivoEstado.trim() || motivoEstado.trim().length < 5) {
      setErrorEstado("Es obligatorio registrar un motivo detallado (mínimo 5 caracteres) (RF09).");
      return;
    }

    startEstadoTransition(async () => {
      const res = await cambiarEstadoLoteAction({
        loteId: loteSeleccionado.id,
        nuevoEstado: nuevoEstado,
        motivo: motivoEstado.trim(),
      });

      if (!res.success) {
        setErrorEstado(res.error || "No se pudo cambiar el estado.");
        return;
      }

      setModalEstadoAbierto(false);
      setLoteSeleccionado(null);
      setMotivoEstado("");
      await cargarLotes();
    });
  };

  const lotesFiltrados = lotes.filter((lote) => {
    const coincideOrigen = origenFiltro === "Todos" || lote.origen === origenFiltro;
    const coincideEstado = estadoFiltro === "Todos" || lote.estado === estadoFiltro;
    return coincideOrigen && coincideEstado;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Módulo de Inventario (RF01 / RF08 / RF09)
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2">
            Gestión y Trazabilidad de Lotes de Cacao
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Asociación de Productores del Huila (Rivera, Campoalegre y Algeciras)
          </p>
        </div>

        <button
          onClick={() => setModalRecepcionAbierto(true)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 self-start md:self-auto text-sm"
        >
          <span>➕</span> Recibir Nuevo Lote
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
              Municipio de Origen:
            </label>
            <select
              value={origenFiltro}
              onChange={(e) => setOrigenFiltro(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-1.5 text-xs bg-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="Todos">Todos los orígenes</option>
              <option value="Rivera">Rivera</option>
              <option value="Campoalegre">Campoalegre</option>
              <option value="Algeciras">Algeciras</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
              Estado del Lote:
            </label>
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-1.5 text-xs bg-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="Todos">Todos los estados</option>
              <option value="liberado">Liberados (Aptos)</option>
              <option value="pendiente">Pendientes</option>
              <option value="bloqueado">Bloqueados (Alerta)</option>
            </select>
          </div>
        </div>

        <button
          onClick={cargarLotes}
          className="text-xs text-gray-500 hover:text-emerald-700 font-semibold flex items-center gap-1 transition"
        >
          <span>🔄</span> Actualizar Datos
        </button>
      </div>

      {/* Tabla de Lotes */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-emerald-950 text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3.5">ID Lote</th>
                <th className="p-3.5">Productor</th>
                <th className="p-3.5">Origen</th>
                <th className="p-3.5">Cantidad Inicial</th>
                <th className="p-3.5">Saldo Disponible (RF08)</th>
                <th className="p-3.5">Estado (RF09)</th>
                <th className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {cargando ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    Cargando inventario en tiempo real desde Supabase...
                  </td>
                </tr>
              ) : lotesFiltrados.length > 0 ? (
                lotesFiltrados.map((lote) => {
                  const estadoColor =
                    lote.estado === "liberado"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : lote.estado === "pendiente"
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-red-100 text-red-800 border-red-300";

                  return (
                    <tr key={lote.id} className="hover:bg-emerald-50/40 transition">
                      <td className="p-3.5 font-extrabold text-emerald-900">{lote.id}</td>
                      <td className="p-3.5 font-medium text-gray-800">{lote.productor}</td>
                      <td className="p-3.5 text-gray-600">
                        <span className="inline-flex items-center gap-1">
                          <span>📍</span> {lote.origen}
                        </span>
                      </td>
                      <td className="p-3.5 text-gray-600">{lote.cantidad_inicial} kg</td>
                      <td className="p-3.5">
                        <span className="font-bold text-gray-900">{lote.cantidad_disponible} kg</span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${estadoColor}`}
                        >
                          {lote.estado}
                        </span>
                        {lote.motivo_estado && (
                          <p className="text-[11px] text-gray-500 mt-1 max-w-xs truncate" title={lote.motivo_estado}>
                            {lote.motivo_estado}
                          </p>
                        )}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {userRole === "admin" && (
                          <button
                            onClick={() => {
                              setLoteSeleccionado(lote);
                              setNuevoEstado(lote.estado === "bloqueado" ? "liberado" : "bloqueado");
                              setMotivoEstado("");
                              setErrorEstado("");
                              setModalEstadoAbierto(true);
                            }}
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-3 py-1.5 rounded-lg transition"
                          >
                            🛡️ Cambiar Estado
                          </button>
                        )}
                        <Link
                          href={`/trazabilidad`}
                          className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-lg transition inline-block"
                        >
                          🔍 Ficha
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No se encontraron lotes con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Recepción de Nuevo Lote (RF01) */}
      {modalRecepcionAbierto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h2 className="text-lg font-extrabold text-gray-900">Recibir Nuevo Lote (RF01)</h2>
              <button
                onClick={() => setModalRecepcionAbierto(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            {errorRecepcion && (
              <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 text-xs rounded-xl font-medium">
                ⚠️ {errorRecepcion}
              </div>
            )}

            <form onSubmit={handleCrearLote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre del Productor:</label>
                <input
                  type="text"
                  required
                  value={productor}
                  onChange={(e) => setProductor(e.target.value)}
                  placeholder="Ej. Carlos Ortiz"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Municipio de Origen (Huila):</label>
                <select
                  value={origen}
                  onChange={(e) => setOrigen(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                >
                  <option value="Rivera">Rivera</option>
                  <option value="Campoalegre">Campoalegre</option>
                  <option value="Algeciras">Algeciras</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Cantidad Inicial Recibida (kg):</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder="Ej. 120 (estrictamente > 0)"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  El lote nace en estado <strong>Pendiente</strong> con trazabilidad y auditoría inmutable.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalRecepcionAbierto(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPendingRecepcion}
                  className="px-5 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {isPendingRecepcion ? "Registrando..." : "Guardar Lote"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Cambio de Estado y Bloqueo (RF09 - Solo Admin / Incidente Hora 12) */}
      {modalEstadoAbierto && loteSeleccionado && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h2 className="text-lg font-extrabold text-gray-900">
                Control de Estado: {loteSeleccionado.id} (RF09)
              </h2>
              <button
                onClick={() => setModalEstadoAbierto(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            {errorEstado && (
              <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 text-xs rounded-xl font-medium">
                ⚠️ {errorEstado}
              </div>
            )}

            <form onSubmit={handleCambiarEstado} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nuevo Estado:</label>
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value as "pendiente" | "liberado" | "bloqueado")}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="liberado">Liberado (Apto para procesos y venta)</option>
                  <option value="pendiente">Pendiente (En espera de control de calidad)</option>
                  <option value="bloqueado">Bloqueado (No disponible / Alerta fitosanitaria)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Motivo Detallado del Cambio (Obligatorio - RF09):
                </label>
                <textarea
                  required
                  rows={3}
                  value={motivoEstado}
                  onChange={(e) => setMotivoEstado(e.target.value)}
                  placeholder="Ej. Incidencia fitosanitaria por exceso de humedad detectada en fermentación (mínimo 5 caracteres)."
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalEstadoAbierto(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPendingEstado}
                  className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition disabled:opacity-50 ${
                    nuevoEstado === "bloqueado"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-emerald-700 hover:bg-emerald-800"
                  }`}
                >
                  {isPendingEstado ? "Actualizando..." : "Confirmar Cambio de Estado"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
