'use client'

import { createClient } from '@supabase/supabase-js'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'

const supabase = createClient(
  'https://cspttrfmxpopkcpnebwu.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

export default function Home() {
  const [video, setVideo] = useState(null)
  const [donanteMes, setDonanteMes] = useState([])
  const [convocatorias, setConvocatorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    donantes: 0,
    proyectos: 0,
    estados: 0,
    recaudado: '$0',
    recaudadoRaw: 0
  })
  const [estadoFiltro, setEstadoFiltro] = useState('todos')
  const [convocatoriasFiltradas, setConvocatoriasFiltradas] = useState([])

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic'
    })

    const fetchData = async () => {
      try {
        // 1️⃣ Obtener video destacado
        const { data: videoData } = await supabase
          .from('video_destacado')
          .select('*')
          .eq('activo', true)
          .limit(1)
        
        setVideo(videoData?.[0] || {
          titulo: 'Ruta 64 impulsa tus estudios',
          descripcion: '¿Eres estudiante y necesitas apoyo? Conectamos tu talento con donantes.',
          video_url: 'https://www.youtube.com/embed/zQPBwwjcZn8'
        })

        // 2️⃣ Obtener Donante del Mes
        const { data: donanteData } = await supabase
          .from('padrino_mes')
          .select('nombre')
          .order('monto_total', { ascending: false })
          .limit(1)
        setDonanteMes(donanteData || [])

        // 3️⃣ Obtener Convocatorias activas
        const { data: convocatoriasData } = await supabase
          .from('convocatorias')
          .select('*')
          .eq('activo', true)
          .order('fecha_limite', { ascending: true })
          .limit(6)
        setConvocatorias(convocatoriasData || [])
        setConvocatoriasFiltradas(convocatoriasData || [])

        //  OBTENER DATOS REALES DE ESTADÍSTICAS
        // Contar donantes
        const { count: totalDonantes } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('rol', 'donante')

        // Contar proyectos (beneficiarios validados)
        const { count: totalProyectos } = await supabase
          .from('beneficiarios')
          .select('*', { count: 'exact', head: true })
          .eq('validado', true)

        // Contar estados únicos con beneficiarios
        const { data: estadosData } = await supabase
          .from('beneficiarios')
          .select('estado')
          .eq('validado', true)
          .not('estado', 'is', null)

        const estadosUnicos = new Set(estadosData?.map(item => item.estado) || [])
        const totalEstados = estadosUnicos.size

        // Sumar recaudado (donaciones completadas)
        const { data: recaudadoData } = await supabase
          .from('donaciones')
          .select('monto')
          .eq('estado', 'completada')

        const totalRecaudado = recaudadoData?.reduce((sum, item) => sum + (item.monto || 0), 0) || 0
        const totalRecaudadoFormateado = new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(totalRecaudado)

        setStats({
          donantes: totalDonantes || 0,
          proyectos: totalProyectos || 0,
          estados: totalEstados || 0,
          recaudado: totalRecaudadoFormateado,
          recaudadoRaw: totalRecaudado
        })

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filtrar convocatorias por estado
  useEffect(() => {
    if (estadoFiltro === 'todos') {
      setConvocatoriasFiltradas(convocatorias)
    } else {
      const filtradas = convocatorias.filter(
        (conv) => conv.estado?.toLowerCase() === estadoFiltro.toLowerCase()
      )
      setConvocatoriasFiltradas(filtradas)
    }
  }, [estadoFiltro, convocatorias])

  if (!video) return null

  const videoUrl = video.video_url.includes('youtube') 
    ? `${video.video_url}?autoplay=1&mute=1&loop=1&playlist=${video.video_url.split('/embed/')[1]}`
    : video.video_url

  return (
    <main className="overflow-x-hidden">
      <Navbar />
      
      {/* ============================================ */}
      {/* SECCIÓN 1: HERO - IMPACTANTE */}
      {/* ============================================ */}
      <section className="relative bg-gradient-to-br from-[#5E1A2F] via-[#7A243E] to-[#4A1525] text-white overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C6A43F] rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#C6A43F] rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#5E1A2F] rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
          <div className="text-center mb-12" data-aos="fade-down">
            <span className="inline-block bg-[#C6A43F]/20 backdrop-blur-sm px-6 py-2 rounded-full text-sm font-semibold text-[#C6A43F] border border-[#C6A43F]/30 mb-6">
              🇲🇽 Plataforma Nacional
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 font-['Playfair_Display']">
              Un peso <span className="text-[#C6A43F]">transforma</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
              Millones de mexicanos apoyando al talento
            </p>
            <p className="text-sm text-gray-300 mt-2 flex items-center justify-center gap-1">
              <span></span> Operando en los {stats.estados} estados
            </p>
            <div className="w-24 h-1 bg-[#C6A43F] mx-auto mt-6 rounded-full"></div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
            <div className="flex-1 text-center lg:text-left" data-aos="fade-right">
              <div className="inline-block bg-red-500/80 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-semibold mb-6">
                 RUTA 64 IMPULSA TUS METAS
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 font-['Playfair_Display']">
                {video.titulo}
              </h2>
              <p className="text-base md:text-lg text-gray-200 mb-8 leading-relaxed">
                {video.descripcion}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  href="/sign-up?redirect_url=/redirect-by-role?rol=donante" 
                  className="bg-[#C6A43F] hover:bg-[#D4B458] text-[#2C2C2C] px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl text-center"
                >
                  Quiero ser donante
                </Link>
                <div className="flex flex-col items-center sm:items-start">
                  <Link 
                    href="/sign-up?redirect_url=/redirect-by-role?rol=beneficiario" 
                    className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-3 rounded-xl font-semibold transition border border-white/30 text-center"
                  >
                    Quiero ser beneficiario
                  </Link>
                  <span className="text-xs text-gray-300 mt-1 flex items-center gap-1">
                    100% deducible de impuestos
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-300 mt-6 italic font-['Playfair_Display']">
                "El inicio de un país diferente. Porque cada peso cuenta."
              </p>
            </div>
            <div className="flex-1 w-full" data-aos="fade-left">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video group">
                <iframe
                  src={videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#C6A43F] transition-all duration-300 pointer-events-none rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="w-full h-12 text-white fill-current">
            <path fill="white" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
          </svg>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECCIÓN 2: ESTADÍSTICAS DE IMPACTO (DATOS REALES) */}
      {/* ============================================ */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12" data-aos="fade-up">
            <span className="inline-block px-4 py-1 bg-[#5E1A2F]/10 text-[#5E1A2F] rounded-full text-sm font-semibold mb-4">
               IMPACTO REAL
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-['Playfair_Display']">
              Nuestro <span className="text-[#5E1A2F]">Impacto</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Datos actualizados de nuestra comunidad
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="group" data-aos="fade-up" data-aos-delay="0">
              <div className="relative p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <div className="text-4xl mb-3"></div>
                <p className="text-3xl md:text-4xl font-bold text-[#5E1A2F]">
                  {stats.donantes.toLocaleString()}+
                </p>
                <p className="text-gray-600 font-medium mt-2">Donantes</p>
              </div>
            </div>
            <div className="group" data-aos="fade-up" data-aos-delay="100">
              <div className="relative p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <div className="text-4xl mb-3"></div>
                <p className="text-3xl md:text-4xl font-bold text-[#C6A43F]">
                  {stats.proyectos.toLocaleString()}+
                </p>
                <p className="text-gray-600 font-medium mt-2">Proyectos</p>
              </div>
            </div>
            <div className="group" data-aos="fade-up" data-aos-delay="200">
              <div className="relative p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <div className="text-4xl mb-3">🇲🇽</div>
                <p className="text-3xl md:text-4xl font-bold text-green-600">
                  {stats.estados}
                </p>
                <p className="text-gray-600 font-medium mt-2">Estados</p>
              </div>
            </div>
            <div className="group" data-aos="fade-up" data-aos-delay="300">
              <div className="relative p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <div className="text-4xl mb-3">$</div>
                <p className="text-3xl md:text-4xl font-bold text-blue-600">
                  {stats.recaudado}
                </p>
                <p className="text-gray-600 font-medium mt-2">Recaudado</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECCIÓN 3: DONACIÓN EN 3 PASOS */}
      {/* ============================================ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12" data-aos="fade-up">
            <span className="inline-block px-4 py-1 bg-[#5E1A2F]/10 text-[#5E1A2F] rounded-full text-sm font-semibold mb-4">
              * CÓMO FUNCIONA
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-['Playfair_Display']">
              Donación en <span className="text-[#C6A43F]">3 Pasos</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tres pasos simples para transformar vidas
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: '1', title: 'Regístrate', description: 'Crea tu perfil como donante o beneficiario', icon: '📝', color: 'from-[#5E1A2F] to-[#7A243E]' },
              { step: '2', title: 'Conecta', description: 'Encuentra un proyecto o talento en tu estado', icon: '🤝', color: 'from-[#C6A43F] to-[#D4B458]' },
              { step: '3', title: 'Transforma', description: 'Dona y ve el impacto en tiempo real', icon: '🌟', color: 'from-green-500 to-green-700' }
            ].map((item, index) => (
              <div key={index} className="text-center p-6 group" data-aos="fade-up" data-aos-delay={index * 150}>
                <div className="relative">
                  <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-3xl">{item.icon}</span>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#C6A43F] to-[#5E1A2F]"></div>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm max-w-xs mx-auto">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECCIÓN 4: DONANTE DEL MES (Premium) */}
      {/* ============================================ */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <div data-aos="fade-up">
            <div className="inline-block px-4 py-1 bg-[#C6A43F] text-[#2C2C2C] rounded-full text-sm font-semibold mb-4">
               DONANTE DEL MES
            </div>
            <div className="max-w-md mx-auto">
              <div className="bg-gradient-to-br from-white to-yellow-50 rounded-3xl shadow-2xl p-8 border-2 border-yellow-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C6A43F]/5 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#C6A43F]/5 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <div className="text-6xl mb-3">🏆</div>
                  <h3 className="text-2xl font-bold text-gray-900 font-['Playfair_Display']">
                    {donanteMes?.[0]?.nombre || 'Próximamente'}
                  </h3>
                  <p className="text-gray-500 mt-2">
                    {donanteMes?.[0]?.nombre ? ' Gracias por tu generosidad' : ' Sé el primer donante destacado'}
                  </p>
                  <div className="mt-4 flex justify-center gap-1">
                    <span className="w-2 h-2 bg-[#C6A43F] rounded-full"></span>
                    <span className="w-2 h-2 bg-[#C6A43F] rounded-full"></span>
                    <span className="w-2 h-2 bg-[#C6A43F] rounded-full"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECCIÓN 5: CONVOCATORIAS DE BECAS (Premium) */}
      {/* ============================================ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12" data-aos="fade-up">
            <span className="inline-block px-4 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-4">
               OPORTUNIDADES
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-['Playfair_Display']">
              Convocatorias de <span className="text-[#5E1A2F]">Becas</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Becas y apoyos disponibles para tu desarrollo
            </p>
          </div>
          
          {/* Filtro por estado - TODOS LOS 32 ESTADOS */}
          <div className="flex flex-wrap justify-center items-center gap-2 mb-8" data-aos="fade-up">
            <span className="text-sm font-medium text-gray-700"> Filtrar por estado:</span>
            <select 
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E1A2F] bg-white"
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
            >
              <option value="todos"> Todos los estados</option>
              <option value="aguascalientes">Aguascalientes</option>
              <option value="baja-california">Baja California</option>
              <option value="baja-california-sur">Baja California Sur</option>
              <option value="campeche">Campeche</option>
              <option value="chiapas">Chiapas</option>
              <option value="chihuahua">Chihuahua</option>
              <option value="cdmx">Ciudad de México</option>
              <option value="coahuila">Coahuila</option>
              <option value="colima">Colima</option>
              <option value="durango">Durango</option>
              <option value="estado-de-mexico">Estado de México</option>
              <option value="guanajuato">Guanajuato</option>
              <option value="guerrero">Guerrero</option>
              <option value="hidalgo">Hidalgo</option>
              <option value="jalisco">Jalisco</option>
              <option value="michoacan">Michoacán</option>
              <option value="morelos">Morelos</option>
              <option value="nayarit">Nayarit</option>
              <option value="nuevo-leon">Nuevo León</option>
              <option value="oaxaca">Oaxaca</option>
              <option value="puebla">Puebla</option>
              <option value="queretaro">Querétaro</option>
              <option value="quintana-roo">Quintana Roo</option>
              <option value="san-luis-potosi">San Luis Potosí</option>
              <option value="sinaloa">Sinaloa</option>
              <option value="sonora">Sonora</option>
              <option value="tabasco">Tabasco</option>
              <option value="tamaulipas">Tamaulipas</option>
              <option value="tlaxcala">Tlaxcala</option>
              <option value="veracruz">Veracruz</option>
              <option value="yucatan">Yucatán</option>
              <option value="zacatecas">Zacatecas</option>
            </select>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-[#5E1A2F] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500">Cargando convocatorias...</p>
            </div>
          ) : !convocatoriasFiltradas || convocatoriasFiltradas.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <p className="text-gray-500">No hay convocatorias disponibles en este estado</p>
              <p className="text-sm text-gray-400 mt-2">Próximamente</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {convocatoriasFiltradas.map((conv, index) => (
                <div 
                  key={conv.id} 
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#5E1A2F] via-[#C6A43F] to-[#5E1A2F]"></div>
                  
                  {new Date(conv.fecha_limite) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white text-xs px-3 py-1 rounded-full shadow-lg animate-pulse z-10">
                       ¡Últimos días!
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#5E1A2F]/10 to-[#C6A43F]/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                        {conv.logo ? (
                          <img src={conv.logo} alt={conv.empresa} className="w-10 h-10 object-contain" />
                        ) : (
                          <span></span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#5E1A2F] transition">
                          {conv.empresa}
                        </h3>
                        <p className="text-sm text-gray-500">{conv.titulo}</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{conv.descripcion}</p>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-xs text-gray-400">Monto</span>
                        <p className="font-bold text-[#5E1A2F] text-lg">{conv.monto}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400">Fecha límite</span>
                        <p className="text-sm font-medium text-gray-600">
                          {new Date(conv.fecha_limite).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <a 
                      href={conv.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="mt-4 block w-full text-center bg-gradient-to-r from-[#5E1A2F] to-[#7A243E] hover:from-[#7A243E] hover:to-[#5E1A2F] text-white py-3 rounded-xl font-semibold transition-all duration-300 group-hover:shadow-lg"
                    >
                      Conocer más →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}