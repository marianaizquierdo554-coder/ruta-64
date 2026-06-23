'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import AdminNavbar from "@/components/AdminNavbar"

export default function AdminSubastas() {
  const { userId } = useAuth()
  const router = useRouter()
  const [subastas, setSubastas] = useState([])
  const [editando, setEditando] = useState(null)
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    imagen: '',
    precio_inicial: '',
    fecha_fin: '',
    activo: true
  })

  useEffect(() => {
    cargarSubastas()
  }, [])

  const cargarSubastas = async () => {
    const { data } = await supabase
      .from('subastas')
      .select('*')
      .order('created_at', { ascending: false })
    setSubastas(data || [])
  }

  const guardar = async () => {
    const data = {
      ...formData,
      precio_inicial: parseInt(formData.precio_inicial),
      puja_actual: parseInt(formData.precio_inicial),
      fecha_fin: formData.fecha_fin
    }

    if (editando) {
      await supabase.from('subastas').update(data).eq('id', editando)
    } else {
      await supabase.from('subastas').insert(data)
    }
    setEditando(null)
    setFormData({ titulo: '', descripcion: '', imagen: '', precio_inicial: '', fecha_fin: '', activo: true })
    cargarSubastas()
  }

  const eliminar = async (id) => {
    if (confirm('¿Eliminar esta subasta?')) {
      await supabase.from('subastas').delete().eq('id', id)
      cargarSubastas()
    }
  }

  const toggleActivo = async (id, activo) => {
    await supabase.from('subastas').update({ activo: !activo }).eq('id', id)
    cargarSubastas()
  }

  return (
    <main>
      <AdminNavbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">🔨 Gestionar Subastas</h1>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">{editando ? 'Editar' : 'Nueva'} Subasta</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Título" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} className="p-2 border rounded-lg" />
            <input type="text" placeholder="Descripción" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="p-2 border rounded-lg" />
            <input type="text" placeholder="Imagen (emoji)" value={formData.imagen} onChange={e => setFormData({...formData, imagen: e.target.value})} className="p-2 border rounded-lg" />
            <input type="number" placeholder="Precio inicial" value={formData.precio_inicial} onChange={e => setFormData({...formData, precio_inicial: e.target.value})} className="p-2 border rounded-lg" />
            <input type="datetime-local" placeholder="Fecha fin" value={formData.fecha_fin} onChange={e => setFormData({...formData, fecha_fin: e.target.value})} className="p-2 border rounded-lg" />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={guardar} className="bg-[#5E1A2F] text-white px-6 py-2 rounded-lg">Guardar</button>
            {editando && <button onClick={() => { setEditando(null); setFormData({ titulo: '', descripcion: '', imagen: '', precio_inicial: '', fecha_fin: '', activo: true }) }} className="bg-gray-300 px-6 py-2 rounded-lg">Cancelar</button>}
          </div>
        </div>
        
        <div className="space-y-3">
          {subastas.map(sub => (
            <div key={sub.id} className={`bg-white rounded-xl shadow p-4 ${!sub.activo ? 'opacity-50' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{sub.titulo}</h3>
                  <p className="text-sm text-gray-600">{sub.descripcion}</p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-green-600 font-semibold">${sub.precio_inicial}</span>
                    <span className="text-orange-600">Puja actual: ${sub.puja_actual}</span>
                    <span className={sub.activo ? 'text-green-500' : 'text-red-500'}>{sub.activo ? 'Activa' : 'Inactiva'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditando(sub.id); setFormData(sub) }} className="text-blue-600 text-sm">Editar</button>
                  <button onClick={() => toggleActivo(sub.id, sub.activo)} className="text-yellow-600 text-sm">{sub.activo ? 'Desactivar' : 'Activar'}</button>
                  <button onClick={() => eliminar(sub.id)} className="text-red-600 text-sm">Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
