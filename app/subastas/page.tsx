'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useAuth } from '@clerk/nextjs'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import AOS from 'aos'
import 'aos/dist/aos.css'

export default function SubastasPage() {
  const { userId, isSignedIn } = useAuth()
  const [subastas, setSubastas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [pujando, setPujando] = useState(null)
  const [montoPuja, setMontoPuja] = useState('')
  const [telefono, setTelefono] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userNombre, setUserNombre] = useState('')
  const [filtro, setFiltro] = useState('todas') // 'todas', 'activas', 'finalizadas'

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic'
    })

    if (userId) {
      cargarDatosUsuario()
    }
    cargarSubastas()
    const interval = setInterval(cargarSubastas, 10000)
    return () => clearInterval(interval)
  }, [userId])

  const cargarDatosUsuario = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('email')
      .eq('clerk_user_id', userId)
      .single()
    if (data) {
      setUserEmail(data.email)
      setUserNombre(data.email ? data.email.split('@')[0] : 'Usuario')
    }
  }

  const cargarSubastas = async () => {
    const { data } = await supabase
      .from('subastas')
      .select('*')
      .order('fecha_fin', { ascending: true })
    setSubastas(data || [])
    setCargando(false)
  }

  const realizarPuja = async (subastaId, precioActual) => {
    if (!isSignedIn) {
      alert('Inicia sesión para pujar')
      return
    }

    const monto = parseInt(montoPuja)
    if (monto <= precioActual) {
      alert(`La puja debe ser mayor a $${precioActual}`)
      return
    }

    if (!telefono) {
      alert('Ingresa tu número de teléfono')
      return
    }

    const res = await fetch('/api/pujar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subastaId, userId, monto, telefono })
    })

    if (res.ok) {
      alert(' Puja realizada con éxito')
      cargarSubastas()
      setPujando(null)
      setMontoPuja('')
      setTelefono('')
    } else {
      alert('Error al realizar la puja')
    }
  }

  const pagarSubasta = async (subastaId, monto) => {
    const res = await fetch('/api/pagar-subasta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subastaId,
        monto,
        email: userEmail,
        nombre: userNombre
      })
    })

    const { url } = await res.json()
    if (url) window.location.href = url
  }

  const tiempoRestante = (fechaFin) => {
    const diff = new Date(fechaFin) - new Date()
    if (diff <= 0) return 'Finalizada'
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24))
    const horas = Math.floor((diff % (86400000)) / 3600000)
    const minutos = Math.floor((diff % 3600000) / 60000)
    const segundos = Math.floor((diff % 60000) / 1000)
    if (dias > 0) return `${dias}d ${horas}h`
    if (horas > 0) return `${horas}h ${minutos}m`
    return `${minutos}m ${segundos}s`
  }

  // Filtrar subastas
  const subastasFiltradas = subastas.filter(sub => {
    if (filtro === 'activas') return new Date(sub.fecha_fin) > new Date()
    if (filtro === 'finalizadas') return new Date(sub.fecha_fin) <= new Date()
    return true
  })

  if (cargando) {
    return (
      <main>
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#5E1A2F] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">Cargando subastas...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* ============================================ */}
      {/* HERO */}
      {/* ============================================ */}
      <section className="relative bg-gradient-to-r from-[#5E1A2F] to-[#7A243E] text-white py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C6A43F] rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10" data-aos="fade-up">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-['Playfair_Display'] mb-4">
              Subastas <span className="text-[#C6A43F]">Solidarias</span>
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Puja por artículos únicos. El <span className="text-[#C6A43F] font-semibold">100%</span> va al talento mexicano.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="w-full h-12 text-gray-50 fill-current">
            <path fill="#F9FAFB" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
          </svg>
        </div>
      </section>

      {/* ============================================ */}
      {/* FILTROS Y LISTADO */}
      {/* ============================================ */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Filtros */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8" data-aos="fade-up">
            <div className="flex gap-2">
              {['todas', 'activas', 'finalizadas'].map((opcion) => (
                <button
                  key={opcion}
                  onClick={() => setFiltro(opcion)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
                    ${filtro === opcion 
                      ? 'bg-[#5E1A2F] text-white shadow-lg' 
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                  {opcion === 'todas' && ' Todas'}
                  {opcion === 'activas' && ' Activas'}
                  {opcion === 'finalizadas' && 'Finalizadas'}
                </button>
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {subastasFiltradas.length} subastas
            </span>
          </div>

          {subastasFiltradas.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <p className="text-gray-500">No hay subastas disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subastasFiltradas.map((subasta, index) => {
                const subastaTerminada = new Date(subasta.fecha_fin) < new Date()
                const esGanador = subasta.puja_ganador_id === userId
                const tiempo = tiempoRestante(subasta.fecha_fin)

                return (
                  <div 
                    key={subasta.id} 
                    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    {/* Imagen o icono */}
                    <div className="relative h-48 bg-gradient-to-br from-[#5E1A2F]/10 to-[#C6A43F]/10 flex items-center justify-center overflow-hidden">
                      {subasta.imagen ? (
                        <img 
                          src={subasta.imagen} 
                          alt={subasta.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <span className="text-7xl"></span>
                      )}
                      
                      {/* Badge de estado */}
                      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg
                        ${subastaTerminada ? 'bg-gray-500' : 'bg-green-500'}`}
                      >
                        {subastaTerminada ? ' Finalizada' : 'Activa'}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#5E1A2F] transition-colors">
                        {subasta.titulo}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {subasta.descripcion}
                      </p>

                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-sm">Puja actual</span>
                          <span className="font-bold text-xl text-[#5E1A2F]">
                            ${subasta.puja_actual?.toLocaleString()}
                          </span>
                        </div>
                        {subasta.puja_ganador_nombre && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Líder</span>
                            <span className="font-semibold text-green-600">{subasta.puja_ganador_nombre}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Precio inicial</span>
                          <span>${subasta.precio_inicial?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Tiempo restante</span>
                          <span className={`font-semibold ${subastaTerminada ? 'text-gray-400' : 'text-red-500'}`}>
                            {tiempo}
                          </span>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      {subastaTerminada ? (
                        esGanador ? (
                          <div className="mt-4 space-y-2">
                            {!subasta.pagado ? (
                              <button
                                onClick={() => pagarSubasta(subasta.id, subasta.puja_actual)}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
                              >
                                 Pagar ${subasta.puja_actual}
                              </button>
                            ) : (
                              <div className="bg-green-100 p-3 rounded-lg text-center">
                                <p className="font-bold text-green-700"> Pago completado</p>
                                <p className="text-sm">Te contactaremos para la entrega</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="mt-4 bg-gray-100 p-3 rounded-lg text-center">
                            <p className="text-gray-500">Subasta finalizada</p>
                            <p className="text-sm">Ganador: {subasta.puja_ganador_nombre || 'Desconocido'}</p>
                          </div>
                        )
                      ) : (
                        pujando === subasta.id ? (
                          <div className="mt-4 space-y-2">
                            <input
                              type="number"
                              value={montoPuja}
                              onChange={(e) => setMontoPuja(e.target.value)}
                              placeholder={`Monto mayor a $${subasta.puja_actual}`}
                              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5E1A2F] focus:outline-none"
                            />
                            <input
                              type="tel"
                              value={telefono}
                              onChange={(e) => setTelefono(e.target.value)}
                              placeholder=" Tu número de WhatsApp"
                              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5E1A2F] focus:outline-none"
                            />
                            <div className="flex gap-2">
                              <button 
                                onClick={() => realizarPuja(subasta.id, subasta.puja_actual)} 
                                className="flex-1 bg-[#5E1A2F] hover:bg-[#7A243E] text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
                              >
                                 Confirmar
                              </button>
                              <button 
                                onClick={() => setPujando(null)} 
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setPujando(subasta.id)} 
                            className="mt-4 w-full bg-[#C6A43F] hover:bg-[#D4B458] text-[#2C2C2C] py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                          >
                             Hacer puja
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}