'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useAuth } from '@clerk/nextjs'
import Navbar from '@/components/Navbar'

export default function ObjetosPerdidos() {
  const { userId } = useAuth()
  const [objetos, setObjetos] = useState([])
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    lugar: '',
    contacto: ''
  })

  useEffect(() => {
    cargarObjetos()
  }, [])

  const cargarObjetos = async () => {
    const { data } = await supabase
      .from('objetos_perdidos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    setObjetos(data || [])
  }

  const reportarObjeto = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('objetos_perdidos').insert({
      ...formData,
      reportado_por: userId,
      estado: 'perdido'
    })
    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert(' Objeto reportado. ¡Gracias por tu honestidad!')
      setFormData({ nombre: '', descripcion: '', lugar: '', contacto: '' })
      cargarObjetos()
    }
  }

  const marcarComoEncontrado = async (id) => {
    await supabase
      .from('objetos_perdidos')
      .update({ estado: 'encontrado' })
      .eq('id', id)
    cargarObjetos()
  }

  return (
    <main>
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2"> Objetos Perdidos</h1>
          <p className="text-gray-600">Ejercicio práctico del Centro de Honestidad y Valores</p>
          <div className="inline-block mt-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
             Practica la honestidad
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Formulario para reportar objeto */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4"> Reportar objeto perdido</h2>
            <form onSubmit={reportarObjeto} className="space-y-4">
              <input type="text" placeholder="Nombre del objeto" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full p-2 border rounded-lg" required />
              <textarea placeholder="Descripción" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="w-full p-2 border rounded-lg" rows={2} required />
              <input type="text" placeholder="Lugar donde se perdió" value={formData.lugar} onChange={e => setFormData({...formData, lugar: e.target.value})} className="w-full p-2 border rounded-lg" required />
              <input type="text" placeholder="Contacto (correo o teléfono)" value={formData.contacto} onChange={e => setFormData({...formData, contacto: e.target.value})} className="w-full p-2 border rounded-lg" required />
              <button type="submit" className="w-full bg-[#5E1A2F] text-white py-2 rounded-lg">Reportar objeto</button>
            </form>
          </div>

          {/* Lista de objetos perdidos */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4"> Objetos reportados</h2>
            {objetos.length === 0 ? (
              <p className="text-gray-500">No hay objetos reportados</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {objetos.map(obj => (
                  <div key={obj.id} className={`border rounded-lg p-3 ${obj.estado === 'encontrado' ? 'bg-green-50' : 'bg-white'}`}>
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-bold">{obj.nombre}</h3>
                        <p className="text-sm text-gray-600">{obj.descripcion}</p>
                        <p className="text-xs text-gray-400"> {obj.lugar}</p>
                        {obj.estado === 'encontrado' && <span className="text-green-600 text-xs">Encontrado</span>}
                      </div>
                      {obj.estado !== 'encontrado' && (
                        <button onClick={() => marcarComoEncontrado(obj.id)} className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm">
                          Lo encontré
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-xl text-center">
          <p className="text-sm text-blue-800">
             Este ejercicio forma parte del <strong>Centro de Honestidad y Valores</strong>. 
            Practicar la honestidad nos hace mejor comunidad.
          </p>
        </div>
      </div>
    </main>
  )
}