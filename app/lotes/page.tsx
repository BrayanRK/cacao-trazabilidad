'use client';

import React, { useState } from 'react';

export default function LotesPage() {
  // Datos base exigidos por el reto
  const lotesBase = [
    { id: 'CAC001', productor: 'Productor A', origen: 'Rivera', cantidad: '100 kg', estado: 'Liberado' },
    { id: 'CAC002', productor: 'Productor B', origen: 'Campoalegre', cantidad: '150 kg', estado: 'Pendiente' },
    { id: 'CAC003', productor: 'Productor C', origen: 'Algeciras', cantidad: '80 kg', estado: 'Bloqueado' },
  ];

  // Estados para controlar los filtros seleccionados
  const [origenFiltro, setOrigenFiltro] = useState('Todos');
  const [estadoFiltro, setEstadoFiltro] = useState('Todos');

  // Filtrar los lotes según lo seleccionado por el usuario
  const lotesFiltrados = lotesBase.filter((lote) => {
    const coincideOrigen = origenFiltro === 'Todos' || lote.origen === origenFiltro;
    const coincideEstado = estadoFiltro === 'Todos' || lote.estado === estadoFiltro;
    return coincideOrigen && coincideEstado;
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Gestión y Trazabilidad de Lotes de Cacao</h1>
      <p className="mb-6 text-gray-600">Asociación Cacaotera del Huila</p>
      
      {/* Barra de Acciones y Filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <button className="bg-green-600 text-white font-medium px-4 py-2 rounded shadow hover:bg-green-700 transition-colors">
          + Recibir Nuevo Lote
        </button>

        <div className="flex flex-wrap gap-3">
          {/* Filtro por Origen */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Filtrar Origen:</label>
            <select 
              value={origenFiltro} 
              onChange={(e) => setOrigenFiltro(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Todos">Todos los orígenes</option>
              <option value="Rivera">Rivera</option>
              <option value="Campoalegre">Campoalegre</option>
              <option value="Algeciras">Algeciras</option>
            </select>
          </div>

          {/* Filtro por Estado */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Filtrar Estado:</label>
            <select 
              value={estadoFiltro} 
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Liberado">Liberado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Bloqueado">Bloqueado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Lotes */}
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="p-3 text-sm font-bold text-gray-700">ID Lote</th>
              <th className="p-3 text-sm font-bold text-gray-700">Productor</th>
              <th className="p-3 text-sm font-bold text-gray-700">Origen</th>
              <th className="p-3 text-sm font-bold text-gray-700">Cantidad</th>
              <th className="p-3 text-sm font-bold text-gray-700">Estado</th>
            </tr>
          </thead>
          <tbody>
            {lotesFiltrados.length > 0 ? (
              lotesFiltrados.map((lote) => (
                <tr key={lote.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 font-bold text-gray-800">{lote.id}</td>
                  <td className="p-3 text-gray-700">{lote.productor}</td>
                  <td className="p-3 text-gray-700">{lote.origen}</td>
                  <td className="p-3 text-gray-700">{lote.cantidad}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      lote.estado === 'Liberado' ? 'bg-green-100 text-green-800' :
                      lote.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {lote.estado}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No se encontraron lotes con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}