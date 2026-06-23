'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import AdminNavbar from "@/components/AdminNavbar"

export default function AdminConvocatorias() {
  const { userId } = useAuth()
  const router = useRouter()
  const [convocatorias, setConvocatorias] = useState([])
  const [editando, setEditando] = useState(null)
  const [formData, setFormData] = useState({
    empresa: '',
    titulo: '',
    descripcion: '',
    monto: '',
    fecha_limite: '',
    link: '',
    activo: true
  })

  useEffect(() => {
    cargarConvocatorias()
  }, [])

  const cargarConvocatorias = async () => {
    const { data } = await supabase
      .from('convocatorias')
      .select('*')
      .order('created_at', { ascending: false })
    setConvocatorias(data || [])
  }

  const guardar = async () => {
    if (editando) {
      await supabase.from('convocatorias').update(formData).eq('id', editando)
    } else {
      await supabase.from('convocatorias').insert(formData)
    }
    setEditando(null)
    setFormData({ empresa: '', titulo: '', descripcion: '', monto: '', fecha_limite: '', link: '', activo: true })
    cargarConvocatorias()
  }

  const eliminar = async (id) => {
    if (confirm('¿Eliminar esta convocatoria?')) {
      await supabase.from('convocatorias').delete().eq('id', id)
      cargarConvocatorias()
    }
  }

  const toggleActivo = async (id, activo) => {
    await supabase.from('convocatorias').update({ activo: !activo }).eq('id', id)
    cargarConvocatorias()
  }

  return (
    <main>
      <AdminNavbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8"> Gestionar Convocatorias</h1>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">{editando ? 'Editar' : 'Nueva'} Convocatoria</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Empresa / Institución" value={formData.empresa} onChange={e => setFormData({...formData, empresa: e.target.value})} className="p-2 border rounded-lg" />
            <input type="text" placeholder="Título de la beca" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} className="p-2 border rounded-lg" />
            <textarea placeholder="Descripción" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="p-2 border rounded-lg md:col-span-2" rows={2} />
            <input type="text" placeholder="Monto (ej: $10,000 MXN)" value={formData.monto} onChange={e => setFormData({...formData, monto: e.target.value})} className="p-2 border rounded-lg" />
            <input type="date" placeholder="Fecha límite" value={formData.fecha_limite} onChange={e => setFormData({...formData, fecha_limite: e.target.value})} className="p-2 border rounded-lg" />
            <input type="url" placeholder="Link para aplicar" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="p-2 border rounded-lg" />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={guardar} className="bg-[#5E1A2F] text-white px-6 py-2 rounded-lg">Guardar</button>
            {editando && <button onClick={() => { setEditando(null); setFormData({ empresa: '', titulo: '', descripcion: '', monto: '', fecha_limite: '', link: '', activo: true }) }} className="bg-gray-300 px-6 py-2 rounded-lg">Cancelar</button>}
          </div>
        </div>
        
        <div className="space-y-3">
          {convocatorias.map(conv => (
            <div key={conv.id} className={`bg-white rounded-xl shadow p-4 ${!conv.activo ? 'opacity-50' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{conv.empresa} - {conv.titulo}</h3>
                  <p className="text-sm text-gray-600">{conv.descripcion}</p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-green-600 font-semibold">{conv.monto}</span>
                    <span className="text-gray-400"> {conv.fecha_limite}</span>
                    <span className={conv.activo ? 'text-green-500' : 'text-red-500'}>{conv.activo ? 'Activa' : 'Inactiva'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditando(conv.id); setFormData(conv) }} className="text-blue-600 text-sm">Editar</button>
                  <button onClick={() => toggleActivo(conv.id, conv.activo)} className="text-yellow-600 text-sm">{conv.activo ? 'Desactivar' : 'Activar'}</button>
                  <button onClick={() => eliminar(conv.id)} className="text-red-600 text-sm">Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
