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
    created_at: "2026-10-15T12:00:00+00:00",
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
    created_at: "2026-10-15T13:30:00+00:00",
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
    created_at: "2026-10-15T15:00:00+00:00",
  },
];

export default function LotesPage() {
  const { user } = useUser();
  const userRole = (user?.publicMetadata?.role as string) || "operador";

  const [lotes, setLotes] = useState<LoteConInventario[]>(initialLotes);
  const [cargando, setCargando] = useState(false);
  const [origenFiltro, setOrigenFiltro] = useState("Todos");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [mostrarNombresReales, setMostrarNombresReales] = useState(true);

  const getNombreProductor = (lote: LoteConInventario) => {
    // Seguridad Habeas Data: Solo administradores autenticados pueden revelar nombres reales
    const permitirReales = userRole === "admin" && mostrarNombresReales;
    if (permitirReales) {
      const mapaReales: Record<string, string> = {
        CAC001: "Don Carlos Dussán",
        CAC002: "Doña Ana María Trujillo",
        CAC003: "Don Jorge Eliécer Perdomo",
        CAC004: "Don Carlos Dussán",
      };
      return mapaReales[lote.id] || lote.productor;
    }
    const mapaAnonimo: Record<string, string> = {
      CAC001: "Productor A",
      CAC002: "Productor B",
      CAC003: "Productor C",
      CAC004: "Productor D",
    };
    return mapaAnonimo[lote.id] || "Productor Anónimo";
  };

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

  const totalLotes = lotes.length;
  const totalDisponible = lotes.reduce((acc, l) => acc + Number(l.cantidad_disponible || 0), 0);
  const lotesBloqueados = lotes.filter((l) => l.estado === "bloqueado").length;
  const municipiosActivos = new Set(lotes.map((l) => l.origen)).size;

  const renderBadge = (estado: string) => {
    if (estado === "liberado") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700/60 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          LIBERADO
        </span>
      );
    }
    if (estado === "bloqueado") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/80 dark:text-red-300 dark:border-red-700/60 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          BLOQUEADO
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700/60 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        PENDIENTE
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/80 dark:border-emerald-700/60 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            Inventario & Trazabilidad (RF01 / RF08 / RF09)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2.5 tracking-tight">
            Gestión de Lotes de Cacao
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Asociación de Productores del Huila (Rivera, Campoalegre y Algeciras)
          </p>
        </div>

        <button
          onClick={() => setModalRecepcionAbierto(true)}
          className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm self-stretch sm:self-auto min-h-[44px]"
        >
          <span>➕</span> Recibir Nuevo Lote
        </button>
      </div>

      {/* Tarjetas KPI Ejecutivas AgroTech */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Lotes en Acopio
            </span>
            <span className="text-xl">📦</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {totalLotes} <span className="text-xs font-bold text-slate-400">lotes</span>
          </p>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Trazados al 100%
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Cacao Disponible
            </span>
            <span className="text-xl">⚖️</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {totalDisponible} <span className="text-xs font-bold text-slate-400">kg</span>
          </p>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            Saldo real en bodega (RF08)
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-red-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Filtro Calidad (RF09)
            </span>
            <span className="text-xl">🛡️</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 mt-1">
            {lotesBloqueados} <span className="text-xs font-bold text-slate-400">en cuarentena</span>
          </p>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" /> Protección fitosanitaria
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Municipios Activos
            </span>
            <span className="text-xl">📍</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {municipiosActivos} <span className="text-xs font-bold text-slate-400">zonas</span>
          </p>
          <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 mt-1 block truncate">
            Rivera, Campoalegre, Algeciras
          </span>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 items-center">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
              Origen:
            </label>
            <select
              value={origenFiltro}
              onChange={(e) => setOrigenFiltro(e.target.value)}
              className="w-full sm:w-auto border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs bg-white dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="Todos">Todos</option>
              <option value="Rivera">Rivera</option>
              <option value="Campoalegre">Campoalegre</option>
              <option value="Algeciras">Algeciras</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
              Estado:
            </label>
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="w-full sm:w-auto border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs bg-white dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="Todos">Todos</option>
              <option value="liberado">Liberados</option>
              <option value="pendiente">Pendientes</option>
              <option value="bloqueado">Bloqueados</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {userRole === "admin" ? (
            <button
              type="button"
              onClick={() => setMostrarNombresReales(!mostrarNombresReales)}
              className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 shadow-sm active:scale-95 whitespace-nowrap"
              title="Habeas Data (Solo Administrador): Alternar entre nombres certificados y modo anónimo"
            >
              <span>{mostrarNombresReales ? "👁️ Nombres Reales" : "🕶️ Modo Anónimo"}</span>
              <span className="text-[9px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold px-1.5 py-0.5 rounded border border-amber-500/30">
                ADMIN
              </span>
            </button>
          ) : (
            <div
              className="text-xs bg-slate-100/70 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 font-medium px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800 flex items-center gap-1.5 whitespace-nowrap cursor-not-allowed select-none"
              title="Habeas Data: Solo el Administrador puede revelar identidades de productores (Ley 1581)"
            >
              <span>🕶️ Modo Anónimo</span>
              <span className="text-[10px]">🔒 Solo Admin</span>
            </div>
          )}

          <button
            onClick={cargarLotes}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold flex items-center justify-center gap-1.5 py-1.5 transition"
          >
            <span>🔄</span> Actualizar
          </button>
        </div>
      </div>

      {/* VISTA 1: Tarjetas táctiles en Celular (< md) */}
      <div className="block md:hidden space-y-3">
        {cargando ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm">
            Cargando lotes en tiempo real...
          </div>
        ) : lotesFiltrados.length > 0 ? (
          lotesFiltrados.map((lote) => (
            <div
              key={lote.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              {/* Cabecera Tarjeta Móvil */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">
                    {lote.id}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">📍 {lote.origen}</span>
                </div>

                {renderBadge(lote.estado)}
              </div>

              {/* Métricas Principales */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 font-semibold block uppercase">Productor</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 truncate block">{getNombreProductor(lote)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 font-semibold block uppercase">Fecha</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300 block truncate">
                    {new Date(lote.fecha_recepcion || lote.created_at).toLocaleDateString("es-CO")}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 font-semibold block uppercase">Saldo</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm block">
                    {lote.cantidad_disponible} kg
                  </span>
                </div>
              </div>

              {lote.motivo_estado && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-slate-50/50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
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
                    className="flex-1 min-h-[42px] text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center justify-center gap-1 active:scale-95"
                  >
                    🛡️ Estado
                  </button>
                )}
                <Link
                  href={`/trazabilidad?lote=${lote.id}`}
                  className="flex-1 min-h-[42px] text-xs bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 transition flex items-center justify-center gap-1 active:scale-95"
                >
                  🔍 Ficha
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm">
            No se encontraron lotes con los filtros seleccionados.
          </div>
        )}
      </div>

      {/* VISTA 2: Tabla de Datos en Computador (>= md) */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 dark:bg-slate-950 text-white text-xs uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">ID Lote</th>
                <th className="p-4">Productor</th>
                <th className="p-4">Origen</th>
                <th className="p-4">Fecha (RF01)</th>
                <th className="p-4">Cantidad Inicial</th>
                <th className="p-4">Saldo Disponible (RF08)</th>
                <th className="p-4">Estado (RF09)</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
              {cargando ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    Cargando inventario en tiempo real desde Supabase...
                  </td>
                </tr>
              ) : lotesFiltrados.length > 0 ? (
                lotesFiltrados.map((lote) => (
                  <tr key={lote.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition">
                    <td className="p-4 font-extrabold text-slate-900 dark:text-white">{lote.id}</td>
                    <td className="p-4 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">{getNombreProductor(lote)}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">📍 {lote.origen}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 text-xs font-medium">
                      {new Date(lote.fecha_recepcion || lote.created_at).toLocaleDateString("es-CO")}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">{lote.cantidad_inicial} kg</td>
                    <td className="p-4 font-black text-emerald-600 dark:text-emerald-400 text-base">
                      {lote.cantidad_disponible} kg
                    </td>
                    <td className="p-4">
                      {renderBadge(lote.estado)}
                      {lote.motivo_estado && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs truncate" title={lote.motivo_estado}>
                          {lote.motivo_estado}
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {userRole === "admin" && (
                        <button
                          onClick={() => {
                            setLoteSeleccionado(lote);
                            setNuevoEstado(lote.estado === "bloqueado" ? "liberado" : "bloqueado");
                            setMotivoEstado("");
                            setErrorEstado("");
                            setModalEstadoAbierto(true);
                          }}
                          className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 transition shadow-sm active:scale-95"
                        >
                          🛡️ Cambiar Estado
                        </button>
                      )}
                      <Link
                        href={`/trazabilidad?lote=${lote.id}`}
                        className="text-xs bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 transition shadow-sm active:scale-95 inline-block"
                      >
                        🔍 Ficha
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400">
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
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Recibir Nuevo Lote (RF01)</h2>
              <button
                onClick={() => setModalRecepcionAbierto(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 text-base"
              >
                ✕
              </button>
            </div>

            {errorRecepcion && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-xl font-medium">
                ⚠️ {errorRecepcion}
              </div>
            )}

            <form onSubmit={handleCrearLote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre del Productor:</label>
                <input
                  type="text"
                  required
                  value={productor}
                  onChange={(e) => setProductor(e.target.value)}
                  placeholder="Ej. Carlos Ortiz"
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Municipio de Origen (Huila):</label>
                <select
                  value={origen}
                  onChange={(e) => setOrigen(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-900 dark:text-white"
                >
                  <option value="Rivera">Rivera</option>
                  <option value="Campoalegre">Campoalegre</option>
                  <option value="Algeciras">Algeciras</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Cantidad Inicial Recibida (kg):</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder="Ej. 120 (estrictamente > 0)"
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  El lote nace en estado <strong>Pendiente</strong> con trazabilidad y auditoría inmutable.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalRecepcionAbierto(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
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
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Control de Estado: {loteSeleccionado.id} (RF09)
              </h2>
              <button
                onClick={() => setModalEstadoAbierto(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 text-base"
              >
                ✕
              </button>
            </div>

            {errorEstado && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-xl font-medium">
                ⚠️ {errorEstado}
              </div>
            )}

            <form onSubmit={handleCambiarEstado} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nuevo Estado:</label>
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value as "pendiente" | "liberado" | "bloqueado")}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="liberado">Liberado (Apto para procesos y venta)</option>
                  <option value="pendiente">Pendiente (En espera de control de calidad)</option>
                  <option value="bloqueado">Bloqueado (No disponible / Alerta sanitaria)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Motivo Detallado del Cambio (Obligatorio - RF09):
                </label>
                <textarea
                  required
                  rows={3}
                  value={motivoEstado}
                  onChange={(e) => setMotivoEstado(e.target.value)}
                  placeholder="Ej. Incidencia fitosanitaria por exceso de humedad detectada en fermentación (mínimo 5 caracteres)."
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalEstadoAbierto(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
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
