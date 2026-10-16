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

const initialLotes: LoteConInventario[] = [
  {
    id: "CAC001",
    productor: "Carlos Dussán",
    origen: "Rivera",
    fecha_recepcion: "2026-10-15T12:00:00+00:00",
    cantidad_inicial: 500,
    unidad: "kg",
    estado: "liberado",
    motivo_estado: null,
    cantidad_disponible: 400,
  },
  {
    id: "CAC002",
    productor: "Ana María Trujillo",
    origen: "Campoalegre",
    fecha_recepcion: "2026-10-15T13:30:00+00:00",
    cantidad_inicial: 400,
    unidad: "kg",
    estado: "liberado",
    motivo_estado: null,
    cantidad_disponible: 400,
  },
  {
    id: "CAC003",
    productor: "Jorge Eliécer Perdomo",
    origen: "Algeciras",
    fecha_recepcion: "2026-10-15T15:00:00+00:00",
    cantidad_inicial: 350,
    unidad: "kg",
    estado: "bloqueado",
    motivo_estado: "Cadmio elevado por muestreo preventivo",
    cantidad_disponible: 350,
  },
];

export default function LotesPage() {
  const { user } = useUser();
  const userRole = (user?.publicMetadata?.role as string) || "operador";

  const [lotes, setLotes] = useState<LoteConInventario[]>(initialLotes);
  const [cargando, setCargando] = useState(false);
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
    try {
      const data = await getLotesAction();
      if (Array.isArray(data) && data.length > 0) {
        setLotes(data);
      }
    } catch (err) {
      console.error("Error al cargar lotes desde Supabase:", err);
    } finally {
      setCargando(false);
    }
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Inventario & Trazabilidad (RF01 / RF08 / RF09)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            Gestión de Lotes de Cacao
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Asociación de Productores del Huila (Rivera, Campoalegre y Algeciras)
          </p>
        </div>

        <button
          onClick={() => setModalRecepcionAbierto(true)}
          className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-xs sm:text-sm self-stretch sm:self-auto min-h-[44px]"
        >
          <span>➕</span> Recibir Nuevo Lote
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 items-center">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
              Origen:
            </label>
            <select
              value={origenFiltro}
              onChange={(e) => setOrigenFiltro(e.target.value)}
              className="w-full sm:w-auto border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="Todos">Todos</option>
              <option value="Rivera">Rivera</option>
              <option value="Campoalegre">Campoalegre</option>
              <option value="Algeciras">Algeciras</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
              Estado:
            </label>
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="w-full sm:w-auto border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="Todos">Todos</option>
              <option value="liberado">Liberados</option>
              <option value="pendiente">Pendientes</option>
              <option value="bloqueado">Bloqueados</option>
            </select>
          </div>
        </div>

        <button
          onClick={cargarLotes}
          className="text-xs text-slate-500 hover:text-emerald-700 font-semibold flex items-center justify-center gap-1.5 py-1.5 transition self-end sm:self-center"
        >
          <span>🔄</span> Actualizar
        </button>
      </div>

      {/* VISTA 1: Tarjetas táctiles en Celular (< md) */}
      <div className="block md:hidden space-y-3">
        {cargando ? (
          <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 text-sm">
            Cargando lotes en tiempo real...
          </div>
        ) : lotesFiltrados.length > 0 ? (
          lotesFiltrados.map((lote) => {
            const estadoBadge =
              lote.estado === "liberado"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : lote.estado === "pendiente"
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-red-50 text-red-800 border-red-200";

            return (
              <div
                key={lote.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3"
              >
                {/* Cabecera Tarjeta Móvil */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-slate-900 tracking-tight">
                      {lote.id}
                    </span>
                    <span className="text-xs text-slate-500">📍 {lote.origen}</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${estadoBadge}`}
                  >
                    {lote.estado}
                  </span>
                </div>

                {/* Métricas Principales */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Productor</span>
                    <span className="font-bold text-slate-800 truncate block">{lote.productor}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Saldo Disponible</span>
                    <span className="font-extrabold text-emerald-700 text-sm block">
                      {lote.cantidad_disponible} kg
                    </span>
                  </div>
                </div>

                {lote.motivo_estado && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                    Motivo: {lote.motivo_estado}
                  </p>
                )}

                {/* Botones Táctiles Móvil */}
                <div className="flex gap-2 pt-1">
                  {userRole === "admin" && (
                    <button
                      onClick={() => {
                        setLoteSeleccionado(lote);
                        setNuevoEstado(lote.estado === "bloqueado" ? "liberado" : "bloqueado");
                        setMotivoEstado("");
                        setErrorEstado("");
                        setModalEstadoAbierto(true);
                      }}
                      className="flex-1 min-h-[40px] text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-2 rounded-xl transition flex items-center justify-center gap-1 active:scale-95"
                    >
                      🛡️ Estado
                    </button>
                  )}
                  <Link
                    href={`/trazabilidad`}
                    className="flex-1 min-h-[40px] text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3 py-2 rounded-xl transition flex items-center justify-center gap-1 active:scale-95"
                  >
                    🔍 Ficha
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 text-sm">
            No se encontraron lotes con los filtros seleccionados.
          </div>
        )}
      </div>

      {/* VISTA 2: Tabla de Datos en Computador (>= md) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 text-white text-xs uppercase tracking-wider">
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
            <tbody className="divide-y divide-slate-100 text-sm">
              {cargando ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Cargando inventario en tiempo real desde Supabase...
                  </td>
                </tr>
              ) : lotesFiltrados.length > 0 ? (
                lotesFiltrados.map((lote) => {
                  const estadoBadge =
                    lote.estado === "liberado"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : lote.estado === "pendiente"
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-red-50 text-red-800 border-red-200";

                  return (
                    <tr key={lote.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3.5 font-extrabold text-slate-900">{lote.id}</td>
                      <td className="p-3.5 font-medium text-slate-800">{lote.productor}</td>
                      <td className="p-3.5 text-slate-600">📍 {lote.origen}</td>
                      <td className="p-3.5 text-slate-600">{lote.cantidad_inicial} kg</td>
                      <td className="p-3.5 font-extrabold text-emerald-700">
                        {lote.cantidad_disponible} kg
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${estadoBadge}`}
                        >
                          {lote.estado}
                        </span>
                        {lote.motivo_estado && (
                          <p className="text-[11px] text-slate-500 mt-1 max-w-xs truncate" title={lote.motivo_estado}>
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
                            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-lg transition"
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
                  <td colSpan={7} className="p-8 text-center text-slate-500">
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-lg font-extrabold text-slate-900">Recibir Nuevo Lote (RF01)</h2>
              <button
                onClick={() => setModalRecepcionAbierto(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 text-base"
              >
                ✕
              </button>
            </div>

            {errorRecepcion && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                ⚠️ {errorRecepcion}
              </div>
            )}

            <form onSubmit={handleCrearLote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Productor:</label>
                <input
                  type="text"
                  required
                  value={productor}
                  onChange={(e) => setProductor(e.target.value)}
                  placeholder="Ej. Carlos Ortiz"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Municipio de Origen (Huila):</label>
                <select
                  value={origen}
                  onChange={(e) => setOrigen(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-900"
                >
                  <option value="Rivera">Rivera</option>
                  <option value="Campoalegre">Campoalegre</option>
                  <option value="Algeciras">Algeciras</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cantidad Inicial Recibida (kg):</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder="Ej. 120 (estrictamente > 0)"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 bg-white"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  El lote nace en estado <strong>Pendiente</strong> con trazabilidad y auditoría inmutable.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalRecepcionAbierto(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPendingRecepcion}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition disabled:opacity-50"
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-lg font-extrabold text-slate-900">
                Control de Estado: {loteSeleccionado.id} (RF09)
              </h2>
              <button
                onClick={() => setModalEstadoAbierto(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 text-base"
              >
                ✕
              </button>
            </div>

            {errorEstado && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                ⚠️ {errorEstado}
              </div>
            )}

            <form onSubmit={handleCambiarEstado} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nuevo Estado:</label>
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value as "pendiente" | "liberado" | "bloqueado")}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="liberado">Liberado (Apto para procesos y venta)</option>
                  <option value="pendiente">Pendiente (En espera de control de calidad)</option>
                  <option value="bloqueado">Bloqueado (No disponible / Alerta sanitaria)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motivo Detallado del Cambio (Obligatorio - RF09):
                </label>
                <textarea
                  required
                  rows={3}
                  value={motivoEstado}
                  onChange={(e) => setMotivoEstado(e.target.value)}
                  placeholder="Ej. Incidencia fitosanitaria por exceso de humedad detectada en fermentación (mínimo 5 caracteres)."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalEstadoAbierto(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPendingEstado}
                  className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition disabled:opacity-50 ${
                    nuevoEstado === "bloqueado"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-emerald-600 hover:bg-emerald-700"
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
