'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { useSignUp } from '@clerk/nextjs'
import Navbar from '@/components/Navbar'

const estados = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
  "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima",
  "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo",
  "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca",
  "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa",
  "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
]

export default function RegistroBeneficiario() {
  const router = useRouter()
  const { signUp, setActive } = useSignUp()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    curp: '',
    tipo: '',
    institucion: '',
    estado: '',
    meta: '',
    historia: ''
  })

  // Efecto para cargar el CAPTCHA
  useEffect(() => {
    // Forzar la carga del CAPTCHA
    const loadCaptcha = () => {
      const captchaDiv = document.getElementById('clerk-captcha')
      if (captchaDiv && window.Clerk) {
        // El CAPTCHA se cargará automáticamente
        console.log('CAPTCHA container ready')
      }
    }
    loadCaptcha()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Verificar que el CAPTCHA esté presente
      const captchaDiv = document.getElementById('clerk-captcha')
      if (!captchaDiv) {
        console.warn('CAPTCHA element not found')
      }

      // 1. Crear usuario en Clerk
      const signUpResult = await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
      })

      if (signUpResult.status === 'missing_requirements') {
        // Completar el registro con verificación de email
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      }

      // 2. Guardar en Supabase con el clerk_user_id
      const { error } = await supabase.from('profiles').insert({
        email: formData.email,
        full_name: formData.nombre,
        curp: formData.curp,
        tipo_beneficiario: formData.tipo,
        institucion: formData.institucion,
        estado: formData.estado,
        meta: parseInt(formData.meta) || 0,
        historia: formData.historia,
        rol: 'beneficiario',
        validado: false,
        clerk_user_id: signUpResult.createdUserId
      })

      if (error) throw error

      alert('Registro exitoso. Revisa tu correo para verificar tu cuenta.')
      router.push('/sign-in')
    } catch (error) {
      alert('Error: ' + error.message)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8">Registro de Beneficiario</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-4">
          <input type="text" name="nombre" placeholder="Nombre completo" onChange={handleChange} className="w-full p-3 border rounded-xl" required />
          <input type="email" name="email" placeholder="Correo electrónico" onChange={handleChange} className="w-full p-3 border rounded-xl" required />
          <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} className="w-full p-3 border rounded-xl" required />
          <input type="text" name="curp" placeholder="CURP" onChange={handleChange} className="w-full p-3 border rounded-xl" required />
          <select name="tipo" onChange={handleChange} className="w-full p-3 border rounded-xl">
            <option value="">Tipo de beneficiario</option>
            <option>Estudiante</option><option>Investigador</option><option>Creador</option>
            <option>Emprendedor</option><option>Salud</option>
          </select>
          <input type="text" name="institucion" placeholder="Institución / Universidad" onChange={handleChange} className="w-full p-3 border rounded-xl" />
          <select name="estado" onChange={handleChange} className="w-full p-3 border rounded-xl">
            <option value="">Selecciona tu estado</option>
            {estados.map((estado) => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
          <input type="number" name="meta" placeholder="Meta de recaudación" onChange={handleChange} className="w-full p-3 border rounded-xl" />
          <textarea name="historia" placeholder="Cuéntanos tu historia" rows={4} onChange={handleChange} className="w-full p-3 border rounded-xl"></textarea>
          
          {/* Elemento CAPTCHA requerido por Clerk */}
          <div id="clerk-captcha" data-cl-theme="light" data-cl-size="normal"></div>
          
          <button type="submit" disabled={loading} className="w-full bg-[#5E1A2F] text-white py-3 rounded-xl font-semibold">
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
      </div>
    </main>
  )
}
