'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase-client'
import Navbar from '@/components/Navbar'

export default function SolicitarAyudaSalud() {
  const { userId, isSignedIn } = useAuth()
  const router = useRouter()
  const [servicios, setServicios] = useState([])
  const [formData, setFormData] = useState({
    servicio_id: '',
    diagnostico: '',
    documentos: ''
  })

  useEffect(() => {
    cargarServicios()
  }, [])

  const cargarServicios = async () => {
    const { data } = await supabase
      .from('servicios_salud')
      .select('id, nombre, costo')
      .eq('activo', true)
    setServicios(data || [])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isSignedIn) {
      alert('Inicia sesión para solicitar ayuda')
      router.push('/sign-in')
      return
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('clerk_user_id', userId)
      .single()
    
    const { error } = await supabase.from('solicitudes_salud').insert({
      beneficiario_id: userId,
      beneficiario_nombre: profile?.full_name,
      servicio_id: parseInt(formData.servicio_id),
      diagnostico: formData.diagnostico,
      documentos: formData.documentos,
      estado: 'pendiente'
    })
    
    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert(' Solicitud enviada. Un administrador la revisará.')
      router.push('/salud')
    }
  }

  return (
    <main>
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8"> Solicitar ayuda médica</h1>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Tipo de servicio *</label>
            <select
              value={formData.servicio_id}
              onChange={(e) => setFormData({...formData, servicio_id: e.target.value})}
              className="w-full p-3 border rounded-xl"
              required
            >
              <option value="">Seleccionar</option>
              {servicios.map(s => (
                <option key={s.id} value={s.id}>{s.nombre} (${s.costo})</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-1">Diagnóstico / Motivo *</label>
            <textarea
              value={formData.diagnostico}
              onChange={(e) => setFormData({...formData, diagnostico: e.target.value})}
              className="w-full p-3 border rounded-xl"
              rows={4}
              placeholder="Describe tu situación médica"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-1">Documentos </label>
            <input
              type="text"
              value={formData.documentos}
              onChange={(e) => setFormData({...formData, documentos: e.target.value})}
              className="w-full p-3 border rounded-xl"
              placeholder="URL de estudios, recetas, etc."
            />
          </div>
          
          <button type="submit" className="w-full bg-[#5E1A2F] text-white py-3 rounded-xl font-semibold">
            Enviar solicitud
          </button>
        </form>
      </div>
    </main>
  )
}