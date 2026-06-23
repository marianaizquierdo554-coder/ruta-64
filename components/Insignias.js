'use client'

import { useEffect, useState } from 'react'

export default function Insignias({ userId }) {
  const [insignias, setInsignias] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (userId) {
      cargarInsignias()
    }
  }, [userId])

  const cargarInsignias = async () => {
    try {
      // 1. Obtener insignias ganadas del usuario
      const res1 = await fetch(`/api/user-badges?userId=${userId}`)
      const ganadas = await res1.json()
      
      console.log('Ganadas:', ganadas)
      
      if (ganadas && ganadas.length > 0) {
        // 2. Obtener detalles de las insignias
        const ids = ganadas.map(g => g.insignia_id).join(',')
        const res2 = await fetch(`/api/badges?ids=${ids}`)
        const detalles = await res2.json()
        
        console.log('Detalles:', detalles)
        setInsignias(detalles)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setCargando(false)
    }
  }

  if (cargando) {
    return (
      <div className="bg-gray-50 rounded-2xl p-6 text-center">
        <p className="text-gray-500">Cargando insignias...</p>
      </div>
    )
  }

  if (insignias.length === 0) {
    return (
      <div className="bg-gray-50 rounded-2xl p-6 text-center">
        <p className="text-gray-500">Aún no tienes insignias</p>
        <p className="text-sm text-gray-400">¡Realiza tu primera donación para ganar tu primera insignia!</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-8">
      <h3 className="text-lg font-bold mb-4">🏆 Mis Insignias</h3>
      <div className="flex flex-wrap gap-3">
        {insignias.map((insignia) => (
          <div 
            key={insignia.id} 
            className="bg-white rounded-xl shadow-sm p-3 border-l-4 min-w-[140px]"
            style={{ borderLeftColor: insignia.color || '#0057B3' }}
          >
            <p className="font-semibold text-gray-800 text-sm">{insignia.nombre}</p>
            <p className="text-xs text-gray-400 mt-0.5">{insignia.descripcion}</p>
          </div>
        ))}
      </div>
    </div>
  )
}