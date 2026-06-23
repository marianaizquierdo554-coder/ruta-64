'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@clerk/nextjs'
import BeneficiarioNavbar from "@/components/BeneficiarioNavbar"

export default function EntregasPage() {
  const { userId } = useAuth()
  const [donaciones, setDonaciones] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (userId) {
      cargarDonaciones()
    }
  }, [userId])

  const cargarDonaciones = async () => {
    setCargando(true)
    
    // Obtener donaciones que están "enviado" (en camino)
    const { data } = await supabase
      .from('donaciones_especie')
      .select('*, wishlist(*)')
      .eq('estado', 'enviado')
    
    setDonaciones(data || [])
    setCargando(false)
  }

  const confirmarEntrega = async (id) => {
    const res = await fetch('/api/confirmar-entrega', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, beneficiarioId: userId })
    })
    
    if (res.ok) {
      alert(' Entrega confirmada. ¡Gracias por confirmar!')
      cargarDonaciones()
    } else {
      alert('Error al confirmar')
    }
  }

  if (cargando) {
    return (
      <main>
        <BeneficiarioNavbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p>Cargando...</p>
        </div>
      </main>
    )
  }

  return (
    <main>
      <BeneficiarioNavbar />
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2"> Confirmar recepción</h1>
          <p className="text-gray-500">Aquí aparecen las donaciones que han sido enviadas</p>
        </div>

        {donaciones.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">No hay donaciones pendientes</h3>
            <p className="text-gray-500">Tus donaciones aparecerán aquí cuando alguien te envíe algo</p>
          </div>
        ) : (
          <div className="space-y-4">
            {donaciones.map((donacion) => (
              <div key={donacion.id} className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                    
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{donacion.wishlist?.item}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Donado por: {donacion.donante_id?.slice(0, 20)}...
                    </p>
                    {donacion.tracking && (
                      <p className="text-xs text-gray-400 mt-1"> Guía: {donacion.tracking}</p>
                    )}
                    <button
                      onClick={() => confirmarEntrega(donacion.id)}
                      className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                    >
                      <span></span> Confirmar recepción
                    </button>
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
