'use client'

import { useState, useEffect } from 'react'
import AdminNavbar from "@/components/AdminNavbar"

export default function ValidarClient({ initialPendientes }) {
  const [pendientes, setPendientes] = useState(initialPendientes)

  const aprobar = async (id) => {
    const res = await fetch('/api/admin/aprobar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    if (res.ok) {
      setPendientes(pendientes.filter(p => p.id !== id))
    } else {
      alert('Error al aprobar')
    }
  }

  const rechazar = async (id) => {
    const res = await fetch('/api/admin/rechazar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    if (res.ok) {
      setPendientes(pendientes.filter(p => p.id !== id))
    } else {
      alert('Error al rechazar')
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Validar beneficiarios</h1>
        <p className="text-gray-500 mb-8">Revisa las solicitudes de nuevos beneficiarios</p>
        
        {pendientes?.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-gray-500">No hay solicitudes pendientes</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendientes.map((beneficiario) => (
              <div key={beneficiario.id} className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    {beneficiario.foto_perfil ? (
                      <img src={beneficiario.foto_perfil} className="w-32 h-32 rounded-full object-cover border-4 border-[#5E1A2F]" />
                    ) : (
                      <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-4xl">👤</div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{beneficiario.nombre || 'Sin nombre'}</h3>
                    <p className="text-gray-500">{beneficiario.email}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      <div><p className="text-xs text-gray-400">CURP</p><p className="font-medium text-sm">{beneficiario.curp || 'No registrada'}</p></div>
                      <div><p className="text-xs text-gray-400">Teléfono</p><p className="font-medium text-sm">{beneficiario.telefono || 'No registrado'}</p></div>
                      <div><p className="text-xs text-gray-400">Institución</p><p className="font-medium text-sm">{beneficiario.institucion || 'No registrada'}</p></div>
                      <div><p className="text-xs text-gray-400">Estado</p><p className="font-medium text-sm">{beneficiario.estado || 'No registrado'}</p></div>
                      <div><p className="text-xs text-gray-400">Municipio</p><p className="font-medium text-sm">{beneficiario.municipio || 'No registrado'}</p></div>
                      <div><p className="text-xs text-gray-400">Meta</p><p className="font-medium text-sm">${beneficiario.meta?.toLocaleString() || 0} MXN</p></div>
                    </div>

                    {beneficiario.historia && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">"{beneficiario.historia}"</p>
                      </div>
                    )}

                    {beneficiario.video_url && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-400 mb-2">Video de presentación</p>
                        <div className="aspect-video max-w-md bg-gray-100 rounded-lg overflow-hidden">
                          <iframe src={beneficiario.video_url} className="w-full h-full" allowFullScreen />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => aprobar(beneficiario.id)}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
                      >
                        ✓ Aprobar
                      </button>
                      <button
                        onClick={() => rechazar(beneficiario.id)}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700"
                      >
                        ✗ Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
