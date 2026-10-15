'use client';

import React, { useState } from 'react';

export default function LotesPage() {
  // Datos base iniciales
  const [lotes, setLotes] = useState([
    { id: 'CAC001', productor: 'Productor A', origen: 'Rivera', cantidad: 100, unidad: 'kg', estado: 'Liberado' },
    { id: 'CAC002', productor: 'Productor B', origen: 'Campoalegre', cantidad: '150 kg', estado: 'Pendiente' },
    { id: 'CAC003', productor: 'Productor C', origen: 'Algeciras', cantidad: '80 kg', estado: 'Bloqueado' },
  ]);

  // Estados para filtros
  const [origenFiltro, setOrigenFiltro] = useState('Todos');
  const [estadoFiltro, setEstadoFiltro] = useState('Todos');

  // Estado para controlar si el modal del formulario está abierto o cerrado
  const [modalAbierto, setModalAbierto] = useState(false);

  // Estados para los campos del nuevo lote
  const [nuevoProductor, setNuevoProductor] = useState('');
  const [nuevoOrigen, setNuevoOrigen] = useState('Rivera');
  const [nuevaCantidad, setNuevaCantidad] = useState('');
  const [errorValidacion, setErrorValidacion] = useState('');

  // Función para manejar el envío del formulario con validaciones estrictas
  const handleCrearLote = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación 1: Campos vacíos
    if (!nuevoProductor.trim() || !nuevaCantidad) {
      setErrorValidacion('Todos los campos son obligatorios.');
      return;
    }

    // Validación 2: Cantidad mayor a 0 (RF01)
    const cantidadNumerica = parseFloat(nuevaCantidad);
    if (isNaN(cantidadNumerica) || cantidadNumerica <= 0) {
      setErrorValidacion('La cantidad inicial debe ser mayor a 0.');
      return;
    }

    // Si pasa las validaciones, creamos el nuevo lote
    const idGenerado = `CAC00${lotes.length + 1}`;
    const loteNuevo = {
      id: idGenerado,
      productor: nuevoProductor,
      origen: nuevoOrigen,
      cantidad: `${cantidadNumerica} kg`,
      estado: 'Pendiente', // Por defecto nace como pendiente
    };

    setLotes([loteNuevo, ...lotes]);

    // Limpiar formulario y cerrar modal
    setNuevoProductor('');
    setNuevaCantidad('');
    setErrorValidacion('');
    setModalAbierto(false);
  };

  // Filtrado de lotes
  const lotesFiltrados = lotes.filter((lote) => {
    const origenStr = typeof lote.origen === 'string' ? lote.origen : '';
    const estadoStr = typeof lote.estado === 'string' ? lote.estado : '';
    
    const coincideOrigen = origenFiltro === 'Todos' || origenStr === origenFiltro;
    const coincideEstado = estadoFiltro === 'Todos' || estadoStr === estadoFiltro;
    return coincideOrigen && coincideEstado;
  });

  return (
    <div className="p-8 max-w-4xl mx-auto relative">
      <h1 className="text-2xl font-bold mb-1">Gestión y Trazabilidad de Lotes de Cacao</h1>
      <p className="mb-6 text-gray-600">Asociación Cacaotera del Huila</p>
      
      {/* Botón y Filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <button 
          onClick={() => setModalAbierto(true)}
          className="bg-green-600 text-white font-medium px-4 py-2 rounded shadow hover:bg-green-700 transition-colors"
        >
          + Recibir Nuevo Lote
        </button>

        <div className="flex flex-wrap gap-3">
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

      {/* VENTANA MODAL DEL FORMULARIO */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Recibir Nuevo Lote de Cacao</h2>
            
            {errorValidacion && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
                {errorValidacion}
              </div>
            )}

            <form onSubmit={handleCrearLote}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Productor:</label>
                <input 
                  type="text" 
                  value={nuevoProductor}
                  onChange={(e) => setNuevoProductor(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Municipio de Origen:</label>
                <select 
                  value={nuevoOrigen}
                  onChange={(e) => setNuevoOrigen(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Rivera">Rivera</option>
                  <option value="Campoalegre">Campoalegre</option>
                  <option value="Algeciras">Algeciras</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad Inicial (kg):</label>
                <input 
                  type="number" 
                  step="any"
                  value={nuevaCantidad}
                  onChange={(e) => setNuevaCantidad(e.target.value)}
                  placeholder="Ej. 120"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setModalAbierto(false);
                    setErrorValidacion('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 shadow"
                >
                  Guardar Lote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}