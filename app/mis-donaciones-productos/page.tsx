'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useAuth } from '@clerk/nextjs'
import Navbar from '@/components/Navbar'

export default function MisDonacionesProductos() {
  const { userId } = useAuth()
  const [donaciones, setDonaciones] = useState([])

  useEffect(() => {
    if (userId) {
      cargarDonaciones()
    }
  }, [userId])

  const cargarDonaciones = async () => {
    const { data } = await supabase
      .from('productos')
      .select('*')
      .eq('donante_id', userId)
      .order('created_at', { ascending: false })
    setDonaciones(data || [])
  }

  const registrarEnvio = async (id, guia) => {
    await supabase
      .from('productos')
      .update({ guia_envio: guia, estado: 'enviado' })
      .eq('id', id)
    
    alert(' Guía registrada. Cuando el comprador confirme, ganarás tu insignia.')
    cargarDonaciones()
  }

  return (
    <main>
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8"> Mis donaciones de productos</h1>
        
        {donaciones.length === 0 ? (
          <p>No has donado productos aún</p>
        ) : (
          <div className="space-y-4">
            {donaciones.map((d) => (
              <div key={d.id} className="bg-white rounded-xl shadow p-4">
                <h3 className="font-bold">{d.nombre}</h3>
                <p>Estado: {d.estado}</p>
                {d.estado === 'aprobado' && !d.guia_envio && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      id={`guia-${d.id}`}
                      placeholder="Número de guía"
                      className="border rounded-lg p-2 flex-1"
                    />
                    <button
                      onClick={() => {
                        const guia = document.getElementById(`guia-${d.id}`).value
                        if (guia) registrarEnvio(d.id, guia)
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                      Registrar envío
                    </button>
                  </div>
                )}
                {d.guia_envio && <p> Guía: {d.guia_envio}</p>}
                {d.estado === 'vendido' && <p className="text-green-600"> Vendido. Ganaste insignia "Aliado Comercial"</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}