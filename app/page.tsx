"use client";

import { useUser, SignInButton, UserButton } from "@clerk/nextjs";

export default function HomePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const role = (user?.publicMetadata?.role as string) || "operador";
  const userEmail = user?.primaryEmailAddress?.emailAddress;

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
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-amber-100 text-amber-800 mb-2">
                Tarea 1: Autenticación con Clerk
              </span>
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
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                ● Sesión activa en Clerk
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                ● Middleware activo
              </span>
            </div>
          </div>
        </section>

        {/* Tarjetas de Resumen de Inventario Base (Datos del Hackathon) */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-200">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Lote CAC001 (Rivera)
            </p>
            <p className="text-2xl font-bold text-stone-900 mt-1">100 kg</p>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-stone-500">Productor A</span>
              <span className="px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800">
                Liberado
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-200">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Lote CAC002 (Campoalegre)
            </p>
            <p className="text-2xl font-bold text-stone-900 mt-1">150 kg</p>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-stone-500">Productor B</span>
              <span className="px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800">
                Pendiente
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-200">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Lote CAC003 (Algeciras)
            </p>
            <p className="text-2xl font-bold text-stone-900 mt-1">80 kg</p>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-stone-500">Productor C</span>
              <span className="px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-800">
                Bloqueado
              </span>
            </div>
          </div>
        </section>

        {/* Guía rápida de Verificación para Jurados */}
        <section className="bg-stone-900 text-stone-200 rounded-xl p-6 shadow-md border border-stone-800">
          <h3 className="text-base font-bold text-amber-300 uppercase tracking-wide">
            Prueba de Roles para el Jurado
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            En Clerk puedes asignar los roles en los metadatos públicos de cada usuario:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs font-mono">
            <div className="bg-stone-950 p-3 rounded-lg border border-stone-800">
              <span className="text-blue-400 font-bold block mb-1">Rol: Operador</span>
              <code>&#123; &quot;role&quot;: &quot;operador&quot; &#125;</code>
              <p className="text-stone-500 font-sans mt-2">
                Permite: Recepción (RF01), Transformación (RF02) e Inventario (RF08).
              </p>
            </div>
            <div className="bg-stone-950 p-3 rounded-lg border border-stone-800">
              <span className="text-amber-400 font-bold block mb-1">Rol: Administrador</span>
              <code>&#123; &quot;role&quot;: &quot;admin&quot; &#125;</code>
              <p className="text-stone-500 font-sans mt-2">
                Permite: Liberar/Bloquear (RF09), Costos (RF05), Auditoría (RF10) y CSV (RF11).
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
