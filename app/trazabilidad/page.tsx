'use client';

import React, { useState } from 'react';

export default function TrazabilidadPage() {
  const [busqueda, setBusqueda] = useState('CAC001');

  // Datos detallados del lote para la ficha de trazabilidad
  const lotesDetalle: Record<string, any> = {
    CAC001: {
      id: 'CAC001',
      productor: 'Productor A',
      origen: 'Rivera, Huila',
      finca: 'Finca La Esperanza',
      variedad: 'Trinitario',
      fechaRecepcion: '2026-10-12',
      cantidadInicial: '100 kg',
      estadoActual: 'Liberado',
      transformaciones: [
        { paso: '1. Fermentación', fecha: '2026-10-14', entrada: '100 kg', salida: '95 kg', notas: 'Cajas de madera por 5 días' },
        { paso: '2. Secado', fecha: '2026-10-15', entrada: '95 kg', salida: '88 kg', notas: 'Secado al sol en marquesinas' },
      ],
    },
    CAC002: {
      id: 'CAC002',
      productor: 'Productor B',
      origen: 'Campoalegre, Huila',
      finca: 'El Cacaotal',
      variedad: 'Criollo',
      fechaRecepcion: '2026-10-13',
      cantidadInicial: '150 kg',
      estadoActual: 'Pendiente',
      transformaciones: [
        { paso: '1. Fermentación', fecha: '2026-10-15', entrada: '150 kg', salida: '142 kg', notas: 'En proceso' },
      ],
    },
  };

  const loteEncontrado = lotesDetalle[busqueda.trim().toUpperCase()];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Consulta Pública de Trazabilidad</h1>
      <p className="mb-6 text-gray-600">Transparencia del cacao del Huila de la finca a la mesa</p>

      {/* Buscador de Lote */}
      <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Buscar por Código de Lote:
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Ej. CAC001, CAC002..."
            className="flex-1 border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Ficha de Trazabilidad */}
      {loteEncontrado ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {/* Encabezado Ficha */}
          <div className="bg-green-700 text-white p-6 flex justify-between items-center flex-wrap gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-green-200 font-semibold">Lote de Cacao</span>
              <h2 className="text-3xl font-extrabold">{loteEncontrado.id}</h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              loteEncontrado.estadoActual === 'Liberado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {loteEncontrado.estadoActual}
            </span>
          </div>

          <div className="p-6">
            {/* Información de Origen */}
            <h3 className="text-md font-bold text-gray-800 border-b pb-2 mb-4">Origen Agrícola</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-xs text-gray-500 font-medium">Productor</p>
                <p className="font-semibold text-gray-800">{loteEncontrado.productor}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Ubicación</p>
                <p className="font-semibold text-gray-800">{loteEncontrado.origen}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Finca</p>
                <p className="font-semibold text-gray-800">{loteEncontrado.finca}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Variedad</p>
                <p className="font-semibold text-gray-800">{loteEncontrado.variedad}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Fecha Recepción</p>
                <p className="font-semibold text-gray-800">{loteEncontrado.fechaRecepcion}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Cantidad Inicial</p>
                <p className="font-semibold text-gray-800">{loteEncontrado.cantidadInicial}</p>
              </div>
            </div>

            {/* Línea del Tiempo de Transformaciones */}
            <h3 className="text-md font-bold text-gray-800 border-b pb-2 mb-4">Línea de Transformación</h3>
            <div className="space-y-4">
              {loteEncontrado.transformaciones.map((trf: any, idx: number) => (
                <div key={idx} className="flex gap-4 items-start p-3 bg-gray-50 rounded border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-gray-800 text-sm">{trf.paso}</h4>
                      <span className="text-xs text-gray-500">{trf.fecha}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Entrada: <span className="font-medium">{trf.entrada}</span> | Salida: <span className="font-medium text-green-700">{trf.salida}</span>
                    </p>
                    <p className="text-xs text-gray-500 italic mt-0.5">{trf.notas}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center bg-white border border-gray-200 rounded-lg text-gray-500">
          No se encontró ningún lote registrado con el código <span className="font-bold">{busqueda}</span>.
        </div>
      )}
    </div>
  );
}
