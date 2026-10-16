'use client';

import React from 'react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-green-900 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍫</span>
          <span className="font-extrabold text-lg tracking-wide">Cacao Trazabilidad</span>
          <span className="bg-green-700 text-green-200 text-xs font-semibold px-2 py-0.5 rounded ml-2">Huila</span>
        </div>

        <div className="flex gap-6 text-sm font-medium">
          <Link href="/lotes" className="hover:text-green-300 transition-colors">
            Gestión de Lotes
          </Link>
          <Link href="/transformaciones" className="hover:text-green-300 transition-colors">
            Transformaciones
          </Link>
          <Link href="/trazabilidad" className="hover:text-green-300 transition-colors">
            Consulta Pública
          </Link>
        </div>
      </div>
    </nav>
  );
}