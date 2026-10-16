"use client";

import { useEffect, useState } from "react";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { getLotesAction, LoteConInventario } from "@/app/actions/lotes";
import Link from "next/link";

export default function HomePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const role = (user?.publicMetadata?.role as string) || "operador";
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  const [lotes, setLotes] = useState<LoteConInventario[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    getLotesAction()
      .then((data) => {
        setLotes(data);
      })
      .catch((err) => console.error("Error al cargar lotes:", err))
      .finally(() => setCargando(false));
  }, []);

  const totalKilos = lotes.reduce((acc, l) => acc + Number(l.cantidad_disponible || l.cantidad_inicial), 0);

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans">
      {/* Barra de navegación superior */}
      <header className="bg-stone-900 text-white shadow-md border-b border-amber-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🍫</span>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-amber-100">
                Asociación Cacaotera del Huila
              </h1>
              <p className="text-xs text-stone-400">
                Sistema de Trazabilidad, Mermas y Costos • Reto Agroindustria
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {!isLoaded ? (
              <span className="text-xs text-stone-400">Cargando sesión...</span>
            ) : isSignedIn ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs text-stone-300 font-medium">{userEmail}</span>
                  <span className="text-xs inline-flex items-center justify-end font-semibold text-amber-400">
                    Rol: {role.toUpperCase()}
                  </span>
                </div>
                <UserButton />
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow transition">
                  Iniciar Sesión
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Banner de Estado del Usuario */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-emerald-100 text-emerald-800">
                  Base de Datos Supabase Conectada
                </span>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-amber-100 text-amber-800">
                  Clerk Auth Activo
                </span>
              </div>
              <h2 className="text-2xl font-bold text-stone-900">
                Panel de Control de Trazabilidad
              </h2>
              <p className="text-sm text-stone-600 mt-1">
                {isSignedIn ? (
                  <>
                    Has iniciado sesión como <strong className="text-stone-900">{userEmail}</strong> con rol{" "}
                    <span className="font-semibold text-amber-700 uppercase">[{role}]</span>.
                  </>
                ) : (
                  "Estás navegando en modo Comprador / Público. Inicia sesión para acceder a las operaciones de la planta."
                )}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/lotes"
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow transition flex items-center gap-1.5"
              >
                📦 Módulo de Lotes →
              </Link>
            </div>
          </div>
        </section>

        {/* Tarjetas de Resumen en Tiempo Real desde Supabase */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-200">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Total Cacao en Bodega
            </p>
            <p className="text-3xl font-extrabold text-stone-900 mt-1">
              {cargando ? "..." : `${totalKilos} kg`}
            </p>
            <p className="text-xs text-stone-500 mt-2">
              Existencia real consolidada (RF08)
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-200">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Lotes Registrados
            </p>
            <p className="text-3xl font-extrabold text-stone-900 mt-1">
              {cargando ? "..." : lotes.length}
            </p>
            <p className="text-xs text-stone-500 mt-2">
              Almacenados en PostgreSQL (RF07)
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-200">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Estado de Seguridad
            </p>
            <p className="text-xl font-bold text-emerald-700 mt-1">
              RLS + Auditoría Activa
            </p>
            <p className="text-xs text-stone-500 mt-2">
              Historial inmutable de cambios (RF10)
            </p>
          </div>
        </section>

        {/* Lista de Lotes Leída en Vivo desde Postgres */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-stone-900">
              Lotes Activos en Base de Datos (Supabase)
            </h3>
            <span className="text-xs text-stone-500">
              Datos persistentes en la nube
            </span>
          </div>

          {cargando ? (
            <div className="p-8 text-center text-stone-400 text-sm">
              Consultando base de datos en Supabase...
            </div>
          ) : lotes.length === 0 ? (
            <div className="p-8 text-center text-stone-400 text-sm">
              No hay lotes registrados aún.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {lotes.map((lote) => (
                <div
                  key={lote.id}
                  className="p-4 rounded-lg border border-stone-200 bg-stone-50 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-base text-stone-900">
                        {lote.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          lote.estado === "liberado"
                            ? "bg-emerald-100 text-emerald-800"
                            : lote.estado === "bloqueado"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {lote.estado.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1">
                      <strong>Origen:</strong> {lote.origen} • {lote.productor}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-stone-200 flex justify-between items-center text-xs">
                    <span className="text-stone-500">Disponible:</span>
                    <span className="font-bold text-stone-900">
                      {lote.cantidad_disponible} kg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
