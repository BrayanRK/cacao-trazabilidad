"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser, SignInButton } from "@clerk/nextjs";
import { getLotesAction, LoteConInventario } from "@/app/actions/lotes";
import { getTransformacionesAction } from "@/app/actions/transformaciones";

export default function HomePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const role = (user?.publicMetadata?.role as string) || "operador";
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  const [lotes, setLotes] = useState<LoteConInventario[]>([]);
  const [totalTransformaciones, setTotalTransformaciones] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([getLotesAction(), getTransformacionesAction()])
      .then(([lotesData, transfData]) => {
        setLotes(lotesData);
        setTotalTransformaciones(transfData.length);
      })
      .catch((err) => console.error("Error al cargar datos del dashboard:", err))
      .finally(() => setCargando(false));
  }, []);

  const totalKilos = lotes.reduce(
    (acc, l) => acc + Number(l.cantidad_disponible || l.cantidad_inicial),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner Principal / Hero con Estilo Huila */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-900 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden border border-emerald-800/40">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-emerald-800/80 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full border border-emerald-600/50 uppercase tracking-wider">
              Hackathon Agroindustria • Cacao Huilense
            </span>
            <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/40">
              ⚡ Supabase + Clerk Activos
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Sistema Digital de Trazabilidad de Cacao
          </h1>

          <p className="text-emerald-100 text-sm md:text-base leading-relaxed">
            Garantizando la transparencia, trazabilidad de origen y calidad del cacao fino y de aroma del Huila
            (<strong>Rivera, Campoalegre y Algeciras</strong>) desde la finca cacaotera hasta la barra de chocolate.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/lotes"
              className="bg-white text-emerald-950 font-bold px-5 py-2.5 rounded-xl shadow-md hover:bg-emerald-50 transition text-sm flex items-center gap-1.5"
            >
              <span>📦</span> Gestionar Lotes
            </Link>

            <Link
              href="/transformaciones"
              className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl border border-emerald-500 shadow-md transition text-sm flex items-center gap-1.5"
            >
              <span>⚙️</span> Nueva Transformación
            </Link>

            <Link
              href="/trazabilidad"
              className="bg-emerald-950/60 hover:bg-emerald-950 text-emerald-200 font-bold px-5 py-2.5 rounded-xl border border-emerald-700/60 transition text-sm flex items-center gap-1.5"
            >
              <span>🔍</span> Consulta Pública (QR)
            </Link>
          </div>
        </div>
      </div>

      {/* Tarjetas de Métricas en Tiempo Real (Desde Supabase) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
            Lotes Registrados en Bodega
          </span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {cargando ? "..." : `${lotes.length} Lotes`}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">📍 Rivera, Campoalegre y Algeciras</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
            Existencia Disponible en Granos
          </span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {cargando ? "..." : `${totalKilos} kg`}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Balance en tiempo real con inventario (RF08)</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
            Transformaciones Ejecutadas
          </span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {cargando ? "..." : `${totalTransformaciones} Procesos`}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">✓ Con auditoría inmutable (RF10)</p>
        </div>
      </div>

      {/* Estado de Sesión y Acceso Rápido */}
      {isLoaded && !isSignedIn && (
        <div className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-emerald-950 dark:text-emerald-200 text-base">
              ¿Eres operador de planta o administrador de la asociación?
            </h3>
            <p className="text-xs text-emerald-800 dark:text-emerald-300">
              Inicia sesión con Clerk para registrar recepciones de lotes, controlar mermas y gestionar estados.
            </p>
          </div>
          <SignInButton mode="modal">
            <button className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition">
              Iniciar Sesión con Clerk
            </button>
          </SignInButton>
        </div>
      )}

      {/* Módulos Principales del Sistema */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Módulos del Sistema</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/lotes"
            className="group bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition duration-200 space-y-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-lg">
              📦
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
              Recepción y Lotes (RF01)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Registro de lotes entrantes con ID único, validación de cantidades estrictamente mayores a 0 kg y
              control de municipios cacaoteros del Huila.
            </p>
          </Link>

          <Link
            href="/transformaciones"
            className="group bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition duration-200 space-y-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-lg">
              ⚙️
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
              Transformaciones y Mermas (RF02 / RF04)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Seguimiento a fermentación, secado y tostado con cálculo automático de mermas, alertas cuando superan
              el 15.0% y costeo unitario.
            </p>
          </Link>

          <Link
            href="/trazabilidad"
            className="group bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition duration-200 space-y-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-lg">
              🔍
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
              Consulta Pública (RF06 / QR)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Ficha pública accesible por consumidores y compradores por código o QR sin revelar datos privados ni
              costos internos de producción.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
