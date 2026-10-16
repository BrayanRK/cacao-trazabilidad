'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Banner Principal / Hero */}
      <div className="bg-gradient-to-r from-green-800 to-emerald-900 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-2xl">
          <span className="bg-green-700/60 text-green-100 text-xs font-semibold px-3 py-1 rounded-full border border-green-600/50">
            Hackathon — Cacao Huilense
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Sistema Digital de Trazabilidad de Cacao
          </h1>
          <p className="text-green-100 text-sm md:text-base leading-relaxed">
            Garantizando la transparencia, calidad y la historia única del cacao del Huila (Rivera, Campoalegre y Algeciras) desde la finca hasta la mesa.
          </p>

          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              href="/lotes"
              className="bg-white text-green-900 font-semibold px-6 py-3 rounded-xl shadow-md hover:bg-green-50 transition duration-150 text-sm"
            >
              Gestionar Lotes
            </Link>
            <Link
              href="/trazabilidad"
              className="bg-green-700/80 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl border border-green-600 transition duration-150 text-sm"
            >
              Consulta Pública (QR)
            </Link>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Lotes Registrados</span>
          <div className="text-3xl font-extrabold text-gray-900">3 Lotes</div>
          <p className="text-xs text-emerald-700 font-medium">📍 Rivera, Campoalegre, Algeciras</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Volumen Total</span>
          <div className="text-3xl font-extrabold text-gray-900">330 kg</div>
          <p className="text-xs text-gray-500">Cacao en grano recibido</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Transformaciones</span>
          <div className="text-3xl font-extrabold text-gray-900">2 Procesos</div>
          <p className="text-xs text-emerald-700 font-medium">✓ Fermentación y Secado</p>
        </div>
      </div>

      {/* Módulos del Sistema */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Módulos del Sistema</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/lotes" className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition duration-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-700 font-bold text-lg">📦</div>
            <h3 className="text-base font-bold text-gray-900 group-hover:text-green-800 transition">Recepción y Lotes</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Registro de lotes entrantes, control de municipios de origen y validaciones de volumen y estados de calidad.
            </p>
          </Link>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-700 font-bold text-lg">⚙️</div>
            <h3 className="text-base font-bold text-gray-900">Transformaciones</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Seguimiento a los procesos post-cosecha: fermentación, secado, trillado y tostado con cálculo automático de mermas.
            </p>
          </div>

          <Link href="/trazabilidad" className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition duration-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-700 font-bold text-lg">🔍</div>
            <h3 className="text-base font-bold text-gray-900 group-hover:text-green-800 transition">Consulta Pública</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Ficha interactiva accesible por código de lote para consumidores y compradores internacionales sin revelar datos de costos.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}