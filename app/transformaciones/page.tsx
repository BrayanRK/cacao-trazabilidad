'use client';

import React, { useState } from 'react';

export default function TransformacionesPage() {
  // Historial sintético inicial de transformaciones
  const [transformaciones, setTransformaciones] = useState([
    { id: 'TRF001', loteId: 'CAC001', tipo: 'Fermentación', pesoEntrada: '100 kg', pesoSalida: '95 kg', fecha: '2026-10-14' },
    { id: 'TRF002', loteId: 'CAC001', tipo: 'Secado', pesoEntrada: '95 kg', pesoSalida: '88 kg', fecha: '2026-10-15' },
  ]);

  // Estados del formulario
  const [loteId, setLoteId] = useState('CAC001');
  const [tipo, setTipo] = useState('Fermentación');
  const [pesoEntrada, setPesoEntrada] = useState('');
  const [pesoSalida, setPesoSalida] = useState('');
  const [error, setError] = useState('');

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();

    if (!pesoEntrada || !pesoSalida) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    const pEntrada = parseFloat(pesoEntrada);
    const pSalida = parseFloat(pesoSalida);

    if (pEntrada <= 0 || pSalida <= 0) {
      setError('Los pesos deben ser mayores a 0 kg.');
      return;
    }

    if (pSalida > pEntrada) {
      setError('El peso de salida no puede ser mayor al peso de entrada (mermas del proceso).');
      return;
    }

    const nuevaTrf = {
      id: `TRF00${transformaciones.length + 1}`,
      loteId,
      tipo,
      pesoEntrada: `${pEntrada} kg`,
      pesoSalida: `${pSalida} kg`,
      fecha: new Date().toISOString().split('T')[0],
    };

    setTransformaciones([nuevaTrf, ...transformaciones]);
    setPesoEntrada('');
    setPesoSalida('');
    setError('');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Registro de Transformaciones de Cacao</h1>
      <p className="mb-6 text-gray-600">Control de procesos: Fermentación, Secado, Trillado y Tostado</p>

      {/* Formulario */}
      <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-bold mb-4 text-gray-800">Nueva Transformación</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleGuardar} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Lote Relacionado:</label>
            <select
              value={loteId}
              onChange={(e) => setLoteId(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
            >
              <option value="CAC001">CAC001 - Rivera (100 kg)</option>
              <option value="CAC002">CAC002 - Campoalegre (150 kg)</option>
              <option value="CAC003">CAC003 - Algeciras (80 kg)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo de Proceso:</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
            >
              <option value="Fermentación">Fermentación</option>
              <option value="Secado">Secado</option>
              <option value="Trillado">Trillado</option>
              <option value="Tostado">Tostado</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Peso Entrada (kg):</label>
            <input
              type="number"
              step="any"
              value={pesoEntrada}
              onChange={(e) => setPesoEntrada(e.target.value)}
              placeholder="Ej. 100"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Peso Resultante / Salida (kg):</label>
            <input
              type="number"
              step="any"
              value={pesoSalida}
              onChange={(e) => setPesoSalida(e.target.value)}
              placeholder="Ej. 92"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-2 flex justify-end mt-2">
            <button
              type="submit"
              className="bg-green-600 text-white font-medium px-5 py-2 rounded shadow hover:bg-green-700 transition-colors text-sm"
            >
              Registrar Transformación
            </button>
          </div>
        </form>
      </div>

      {/* Tabla de Historial */}
      <h2 className="text-xl font-bold mb-3 text-gray-800">Historial de Transformaciones</h2>
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="p-3 text-sm font-bold text-gray-700">ID</th>
              <th className="p-3 text-sm font-bold text-gray-700">Lote</th>
              <th className="p-3 text-sm font-bold text-gray-700">Proceso</th>
              <th className="p-3 text-sm font-bold text-gray-700">Entrada</th>
              <th className="p-3 text-sm font-bold text-gray-700">Salida</th>
              <th className="p-3 text-sm font-bold text-gray-700">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {transformaciones.map((trf) => (
              <tr key={trf.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3 font-bold text-gray-800">{trf.id}</td>
                <td className="p-3 font-semibold text-green-700">{trf.loteId}</td>
                <td className="p-3 text-gray-700">{trf.tipo}</td>
                <td className="p-3 text-gray-700">{trf.pesoEntrada}</td>
                <td className="p-3 text-gray-700 font-medium">{trf.pesoSalida}</td>
                <td className="p-3 text-gray-500 text-sm">{trf.fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}