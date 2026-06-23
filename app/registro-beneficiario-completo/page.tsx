'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase-client'
import Navbar from '@/components/Navbar'

export default function RegistroBeneficiarioCompleto() {
  const router = useRouter()
  const { userId, isLoaded } = useAuth()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [formData, setFormData] = useState({
    nombre: '',
    curp: '',
    tipo: '',
    institucion: '',
    estado: '',
    meta: '',
    historia: ''
  })

  useEffect(() => {
    const savedEmail = localStorage.getItem('beneficiarioEmail')
    if (savedEmail) {
      setEmail(savedEmail)
    } else if (isLoaded && !userId) {
      router.push('/sign-up?rol=beneficiario')
    }
  }, [isLoaded, userId])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (!userId) {
      alert('Error: No se pudo obtener tu usuario')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('profiles').upsert({
      clerk_user_id: userId,
      email: email,
      full_name: formData.nombre,
      curp: formData.curp,
      tipo_beneficiario: formData.tipo,
      institucion: formData.institucion,
      estado: formData.estado,
      meta: parseInt(formData.meta) || 0,
      historia: formData.historia,
      rol: 'beneficiario',
      validado: false
    }, { onConflict: 'clerk_user_id' })

    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert(' Registro completo. Tu perfil será validado por el administrador.')
      localStorage.removeItem('beneficiarioEmail')
      router.push('/dashboard')
    }
    setLoading(false)
  }

  if (!isLoaded) return <div>Cargando...</div>
  if (!userId) return null

  return (
    <main>
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8">Completa tu perfil</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-4">
          <p className="text-sm text-gray-500">Email: {email}</p>
          <input type="text" name="nombre" placeholder="Nombre completo" onChange={handleChange} className="w-full p-3 border rounded-xl" required />
          <input type="text" name="curp" placeholder="CURP" onChange={handleChange} className="w-full p-3 border rounded-xl" required />
          <select name="tipo" onChange={handleChange} className="w-full p-3 border rounded-xl">
            <option value="">Tipo de beneficiario</option>
            <option>Estudiante</option><option>Investigador</option><option>Creador</option>
            <option>Emprendedor</option><option>Salud</option>
          </select>
          <input type="text" name="institucion" placeholder="Institución" onChange={handleChange} className="w-full p-3 border rounded-xl" />
          <select name="estado" onChange={handleChange} className="w-full p-3 border rounded-xl">
            <option value="">Estado</option>
            {['CDMX','Jalisco','Nuevo León','Puebla','Veracruz','Guanajuato','Michoacán','Oaxaca','Chiapas','Yucatán'].map(e => <option key={e}>{e}</option>)}
          </select>
          <input type="number" name="meta" placeholder="Meta de recaudación" onChange={handleChange} className="w-full p-3 border rounded-xl" />
          <textarea name="historia" placeholder="Cuéntanos tu historia" rows={4} onChange={handleChange} className="w-full p-3 border rounded-xl"></textarea>
          <button type="submit" disabled={loading} className="w-full bg-[#5E1A2F] text-white py-3 rounded-xl">
            {loading ? 'Guardando...' : 'Completar registro'}
          </button>
        </form>
      </div>
    </main>
  )
}