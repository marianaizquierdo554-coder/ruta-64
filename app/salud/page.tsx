'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useAuth } from '@clerk/nextjs'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function SaludPage() {
  const { isSignedIn, userId } = useAuth()
  const [servicios, setServicios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [donando, setDonando] = useState(null)
  const [solicitudes, setSolicitudes] = useState([])

  useEffect(() => {
    cargarServicios()
    if (isSignedIn) {
      cargarSolicitudes()
    }
  }, [isSignedIn])

  const cargarServicios = async () => {
    const { data } = await supabase
      .from('servicios_salud')
      .select('*')
      .eq('activo', true)
      .order('costo', { ascending: true })
    setServicios(data || [])
    setCargando(false)
  }

  const cargarSolicitudes = async () => {
    const { data } = await supabase
      .from('solicitudes_salud')
      .select('*, servicios_salud(*)')
      .eq('estado', 'aprobado')
      .limit(5)
    setSolicitudes(data || [])
  }

  const donarServicio = async (servicio) => {
    if (!isSignedIn) {
      alert('Inicia sesión para donar')
      return
    }

    setDonando(servicio.id)

    // ✅ CORREGIDO: solo seleccionar email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('clerk_user_id', userId)
      .single()

    const res = await fetch('/api/donar-salud', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        servicioId: servicio.id,
        nombre: servicio.nombre,
        monto: servicio.costo,
        donanteId: userId,
        donanteNombre: profile?.email || 'Usuario',
        donanteEmail: profile?.email
      })
    })

    const { url } = await res.json()
    if (url) window.location.href = url

    setDonando(null)
  }

  if (cargando) {
    return (
      <main>
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p>Cargando servicios...</p>
        </div>
      </main>
    )
  }

  return (
    <main>
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4"> Servicios de Salud</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tu donación puede salvar vidas. Elige un servicio y ayúdanos a brindar atención médica a quienes más lo necesitan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {servicios.map((servicio) => (
            <div key={servicio.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition group">
              <div className="h-1 bg-gradient-to-r from-green-500 to-green-700"></div>
              <div className="p-6 text-center">
                <div className="text-6xl mb-4">{servicio.imagen || ''}</div>
                <h3 className="text-xl font-bold mb-2">{servicio.nombre}</h3>
                <p className="text-gray-500 text-sm mb-4">{servicio.descripcion}</p>

                <div className="flex justify-center items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-green-600">${servicio.costo.toLocaleString()}</span>
                  <span className="text-gray-400">MXN</span>
                </div>

                <button
                  onClick={() => donarServicio(servicio)}
                  disabled={donando === servicio.id}
                  className="w-full bg-green-600 text-white py-2 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
                >
                  {donando === servicio.id ? 'Procesando...' : `Donar ${servicio.nombre}`}
                </button>
              </div>
            </div>
          ))}
        </div>

        {solicitudes.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-center"> Solicitudes de ayuda</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {solicitudes.map((solicitud) => (
                <div key={solicitud.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{solicitud.servicios_salud?.imagen || ''}</div>
                    <div>
                      <p className="font-semibold">{solicitud.beneficiario_nombre}</p>
                      <p className="text-sm text-gray-500">Necesita: {solicitud.servicios_salud?.nombre}</p>
                      <p className="text-xs text-gray-400">{solicitud.diagnostico}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 bg-blue-50 rounded-2xl p-6 text-center">
          <h2 className="text-xl font-bold mb-2">¿Necesitas ayuda médica?</h2>
          <p className="text-gray-600 mb-4">Si no puedes costear un tratamiento, solicita ayuda aquí</p>
          <Link href="/solicitar-ayuda-salud" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition">
            Solicitar ayuda →
          </Link>
        </div>
      </div>
    </main>
  )
}