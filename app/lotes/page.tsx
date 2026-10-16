'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser, SignInButton } from '@clerk/nextjs';

export default function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-emerald-950/95 backdrop-blur-md text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo y Badge Huila */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
              <span className="text-lg">🍫</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                Cacao Trazabilidad
              </span>
              <span className="bg-emerald-800/80 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-600/50 uppercase tracking-wide">
                Huila
              </span>
            </div>
          </Link>

          {/* Menú de Navegación Principal */}
          <nav className="hidden md:flex items-center gap-1 bg-emerald-900/40 p-1.5 rounded-2xl border border-emerald-800/30">
            <Link
              href="/lotes"
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-2 ${
                isActive('/lotes')
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
              }`}
            >
              <span>📦</span> Gestor de Lotes
            </Link>

            <Link
              href="/transformaciones"
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-2 ${
                isActive('/transformaciones')
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
              }`}
            >
              <span>⚙️</span> Transformaciones
            </Link>

            <Link
              href="/trazabilidad"
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-2 ${
                isActive('/trazabilidad')
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
              }`}
            >
              <span>🔍</span> Consulta Pública
            </Link>
          </nav>

          {/* Botón de Autenticación */}
          <div className="flex items-center gap-3">
            {isLoaded && (
              <>
                {isSignedIn ? (
                  <div className="flex items-center gap-2 pl-2 border-l border-emerald-800/60">
                    <UserButton />
                  </div>
                ) : (
                  <SignInButton mode="modal">
                    <button className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all duration-150">
                      Iniciar Sesión
                    </button>
                  </SignInButton>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}