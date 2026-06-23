'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import AdminNavbar from "@/components/AdminNavbar"

export default function AdminSolicitudesSalud() {
  const [solicitudes, setSolicitudes] = useState([])

  useEffect(() => {
    cargarSolicitudes()
  }, [])

  const cargarSolicitudes = async () => {
    const { data } = await supabase
      .from('solicitudes_salud')
      .select('*, servicios_salud(*)')
      .order('created_at', { ascending: false })
    setSolicitudes(data || [])
  }

  const actualizarEstado = async (id, estado) => {
    await supabase.from('solicitudes_salud').update({ estado }).eq('id', id)
    cargarSolicitudes()
  }

  return (
    <main>
      <AdminNavbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8"> Solicitudes de ayuda médica</h1>
        
        {solicitudes.length === 0 ? (
          <p>No hay solicitudes</p>
        ) : (
          <div className="space-y-4">
            {solicitudes.map((solicitud) => (
              <div key={solicitud.id} className="bg-white rounded-xl shadow p-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold">{solicitud.beneficiario_nombre}</h3>
                    <p>Servicio: {solicitud.servicios_salud?.nombre}</p>
                    <p>Diagnóstico: {solicitud.diagnostico}</p>
                    <p>Estado: 
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        solicitud.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                        solicitud.estado === 'aprobado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {solicitud.estado}
                      </span>
                    </p>
                  </div>
                  {solicitud.estado === 'pendiente' && (
                    <div className="flex gap-2">
                      <button onClick={() => actualizarEstado(solicitud.id, 'aprobado')} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Aprobar</button>
                      <button onClick={() => actualizarEstado(solicitud.id, 'rechazado')} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Rechazar</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
