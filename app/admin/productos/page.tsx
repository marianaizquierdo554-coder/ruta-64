'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import AdminNavbar from "@/components/AdminNavbar"

export default function AdminProductos() {
  const [productos, setProductos] = useState([])

  useEffect(() => {
    cargarProductos()
  }, [])

  const cargarProductos = async () => {
    const { data } = await supabase
      .from('productos')
      .select('*')
      .eq('estado', 'pendiente')
      .order('created_at', { ascending: false })
    setProductos(data || [])
  }

  const aprobar = async (id) => {
    await supabase.from('productos').update({ estado: 'aprobado' }).eq('id', id)
    cargarProductos()
  }

  const rechazar = async (id) => {
    await supabase.from('productos').update({ estado: 'rechazado' }).eq('id', id)
    cargarProductos()
  }

  return (
    <main>
      <AdminNavbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8"> Productos pendientes</h1>
        {productos.length === 0 ? (
          <p>No hay productos pendientes</p>
        ) : (
          <div className="space-y-4">
            {productos.map(p => (
              <div key={p.id} className="bg-white rounded-xl shadow p-4">
                <h3 className="font-bold">{p.nombre}</h3>
                <p>{p.descripcion}</p>
                <p>Precio: ${p.precio}</p>
                <p>Donante: {p.donante_nombre}</p>
                {p.imagen && <img src={p.imagen} className="w-32 h-32 object-cover mt-2" />}
                <div className="flex gap-2 mt-4">
                  <button onClick={() => aprobar(p.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg"> Aprobar</button>
                  <button onClick={() => rechazar(p.id)} className="bg-red-600 text-white px-4 py-2 rounded-lg"> Rechazar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
