'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useAuth } from '@clerk/nextjs'
import Navbar from '@/components/Navbar'

export default function MisCompras() {
  const { userId } = useAuth()
  const [compras, setCompras] = useState([])
  const [confirmando, setConfirmando] = useState(null)

  useEffect(() => {
    if (userId) {
      cargarCompras()
    }
  }, [userId])

  const cargarCompras = async () => {
    const { data } = await supabase
      .from('ventas')
      .select('*, productos(*)')
      .eq('comprador_id', userId)
      .order('created_at', { ascending: false })
    setCompras(data || [])
  }

  const confirmarRecepcion = async (ventaId, donanteId) => {
    setConfirmando(ventaId)
    
    // 1. Actualizar estado de la venta
    await supabase
      .from('ventas')
      .update({ status: 'entregado' })
      .eq('id', ventaId)
    
    // 2. Dar insignia "Aliado Comercial" al donante (id=13)
    const { data: existe } = await supabase
      .from('insignias_ganadas')
      .select('*')
      .eq('user_id', donanteId)
      .eq('insignia_id', 13)
    
    if (!existe || existe.length === 0) {
      await supabase
        .from('insignias_ganadas')
        .insert({ user_id: donanteId, insignia_id: 13 })
    }
    
    alert(' Recepción confirmada. El donante recibió la insignia "Aliado Comercial"')
    cargarCompras()
    setConfirmando(null)
  }

  const getEstadoInfo = (status) => {
    switch(status) {
      case 'pagado': return { text: 'Pagado - Esperando envío', color: 'text-yellow-600', bg: 'bg-yellow-50' }
      case 'enviado': return { text: 'En camino', color: 'text-blue-600', bg: 'bg-blue-50' }
      case 'entregado': return { text: 'Entregado', color: 'text-green-600', bg: 'bg-green-50' }
      default: return { text: status, color: 'text-gray-600', bg: 'bg-gray-50' }
    }
  }

  return (
    <main>
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8"> Mis compras</h1>
        
        {compras.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <p className="text-gray-500">No has comprado nada aún</p>
            <a href="/tienda" className="text-blue-600 text-sm mt-2 inline-block">Ir a la tienda →</a>
          </div>
        ) : (
          <div className="space-y-4">
            {compras.map((compra) => {
              const estadoInfo = getEstadoInfo(compra.status)
              return (
                <div key={compra.id} className="bg-white rounded-xl shadow p-4 border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{compra.productos?.nombre}</h3>
                      <p className="text-gray-500 text-sm">Monto: ${compra.monto?.toLocaleString()}</p>
                      <p className="text-gray-500 text-sm">Dirección: {compra.direccion_envio}</p>
                      {compra.guia_envio && (
                        <p className="text-sm text-gray-500 mt-1"> Guía: {compra.guia_envio}</p>
                      )}
                      <div className={`mt-2 inline-block px-2 py-1 rounded-full text-xs font-semibold ${estadoInfo.bg} ${estadoInfo.color}`}>
                        {estadoInfo.text}
                      </div>
                    </div>
                    
                    {compra.status === 'enviado' && (
                      <button
                        onClick={() => confirmarRecepcion(compra.id, compra.productos?.donante_id)}
                        disabled={confirmando === compra.id}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition"
                      >
                        {confirmando === compra.id ? 'Procesando...' : ' Confirmar recepción'}
                      </button>
                    )}
                    
                    {compra.status === 'entregado' && (
                      <span className="text-green-600 font-semibold text-sm"> Compra completada</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}