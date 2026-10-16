'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Banner Principal */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white rounded-2xl p-8 mb-8 shadow-md">
        <span className="bg-green-700/60 text-green-200 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-green-500/30">
          Asociación Cacaotera del Huila
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold mt-3 mb-2">
          Sistema Digital de Trazabilidad de Cacao
        </h1>
        <p className="text-green-100 max-w-2xl text-sm md:text-base mb-6">
          Garantizando la transparencia, calidad e historia del cacao huilense desde la finca hasta la mesa.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/lotes"
            className="bg-white text-green-900 font-bold px-5 py-2.5 rounded-lg shadow hover:bg-green-50 transition-colors text-sm"
          >
            Gestionar Lotes
          </Link>
          <Link
            href="/trazabilidad"
            className="bg-green-900/40 text-white font-semibold border border-green-400/30 px-5 py-2.5 rounded-lg hover:bg-green-900/60 transition-colors text-sm"
          >
            Consulta Pública
          </Link>
        </div>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Lotes Registrados</p>
          <p className="text-3xl font-extrabold text-gray-800 mt-2">3 Lotes</p>
          <p className="text-xs text-green-600 font-medium mt-1">✓ Rivera, Campoalegre, Algeciras</p>
        </div>

        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Volumen Total</p>
          <p className="text-3xl font-extrabold text-gray-800 mt-2">330 kg</p>
          <p className="text-xs text-gray-500 font-medium mt-1">Cacao en grano recibido</p>
        </div>

        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Transformaciones</p>
          <p className="text-3xl font-extrabold text-gray-800 mt-2">2 Procesos</p>
          <p className="text-xs text-green-600 font-medium mt-1">✓ Fermentación y Secado</p>
        </div>
      </div>

      {/* Secciones del Sistema */}
      <h2 className="text-xl font-bold mb-4 text-gray-800">Módulos del Sistema</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/lotes" className="group bg-white p-6 border border-gray-200 rounded-xl shadow-sm hover:border-green-500 transition-all">
          <div className="text-3xl mb-3">📦</div>
          <h3 className="font-bold text-gray-800 group-hover:text-green-700 transition-colors">Recepción y Lotes</h3>
          <p className="text-xs text-gray-600 mt-2">
            Registro de lotes entrantes, control de municipios de origen, validaciones de volumen y estados de aprobación.
          </p>
        </Link>

        <Link href="/transformaciones" className="group bg-white p-6 border border-gray-200 rounded-xl shadow-sm hover:border-green-500 transition-all">
          <div className="text-3xl mb-3">⚙️</div>
          <h3 className="font-bold text-gray-800 group-hover:text-green-700 transition-colors">Transformaciones</h3>
          <p className="text-xs text-gray-600 mt-2">
            Seguimiento a los procesos post-cosecha: fermentación, secado, trillado y tostado con cálculo automático de mermas.
          </p>
        </Link>

        <Link href="/trazabilidad" className="group bg-white p-6 border border-gray-200 rounded-xl shadow-sm hover:border-green-500 transition-all">
          <div className="text-3xl mb-3">🔍</div>
          <h3 className="font-bold text-gray-800 group-hover:text-green-700 transition-colors">Consulta Pública</h3>
          <p className="text-xs text-gray-600 mt-2">
            Ficha interactiva accesible por código de lote para consumidores y compradores internacionales.
          </p>
        </Link>
      </div>
    </div>
  );
}