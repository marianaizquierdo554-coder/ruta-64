'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useAuth } from '@clerk/nextjs'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function CursosPage() {
  const { isSignedIn, userId } = useAuth()
  const [cursos, setCursos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas')
  const [tipoSeleccionado, setTipoSeleccionado] = useState('todos')
  const [comprando, setComprando] = useState(null)
  const [categorias, setCategorias] = useState([])
  const [tipos, setTipos] = useState(['todos', 'online', 'presencial', 'hibrido', 'cisco', 'meet'])

  useEffect(() => {
    cargarCursos()
  }, [categoriaSeleccionada, tipoSeleccionado])

  const cargarCursos = async () => {
    let query = supabase.from('cursos').select('*').eq('activo', true)

    if (categoriaSeleccionada !== 'todas') {
      query = query.eq('categoria', categoriaSeleccionada)
    }
    if (tipoSeleccionado !== 'todos') {
      query = query.eq('tipo_curso', tipoSeleccionado)
    }

    const { data } = await query.order('created_at', { ascending: false })
    setCursos(data || [])

    const cats = new Set(data?.map(c => c.categoria).filter(Boolean) || [])
    setCategorias(['todas', ...cats])
    setCargando(false)
  }

  const comprarCurso = async (curso) => {
    if (!isSignedIn) {
      alert('Inicia sesión para inscribirte')
      return
    }

    setComprando(curso.id)
    
    // ✅ CORREGIDO: solo seleccionar email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('clerk_user_id', userId)
      .single()

    const res = await fetch('/api/comprar-curso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cursoId: curso.id,
        nombre: curso.titulo,
        precio: curso.precio,
        compradorId: userId,
        compradorNombre: profile?.email || 'Usuario', // ✅ CORREGIDO
        compradorEmail: profile?.email,
        tipo: curso.tipo_curso
      })
    })

    const { url } = await res.json()
    if (url) window.location.href = url
    setComprando(null)
  }

  const getTipoIcono = (tipo) => {
    switch(tipo) {
      case 'cisco': return ''
      case 'meet': return ''
      case 'presencial': return ''
      case 'hibrido': return ''
      default: return ''
    }
  }

  const getTipoBadge = (tipo) => {
    switch(tipo) {
      case 'cisco': return 'bg-blue-100 text-blue-800'
      case 'meet': return 'bg-purple-100 text-purple-800'
      case 'presencial': return 'bg-green-100 text-green-800'
      case 'hibrido': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTipoLabel = (tipo) => {
    switch(tipo) {
      case 'cisco': return 'Cisco Networking'
      case 'meet': return 'Google Meet'
      case 'presencial': return 'Presencial'
      case 'hibrido': return 'Híbrido'
      default: return 'En línea'
    }
  }

  if (cargando) {
    return (
      <main>
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p>Cargando cursos...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4"> Cursos y Formación</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Capacítate con nuestros cursos. El <strong>10% de tu inscripción</strong> apoya proyectos de talento mexicano.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <select
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            className="px-4 py-2 border rounded-xl text-sm bg-white"
          >
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat === 'todas' ? 'Todas las categorías' : cat}</option>
            ))}
          </select>
          <select
            value={tipoSeleccionado}
            onChange={(e) => setTipoSeleccionado(e.target.value)}
            className="px-4 py-2 border rounded-xl text-sm bg-white"
          >
            {tipos.map(tipo => (
              <option key={tipo} value={tipo}>
                {tipo === 'todos' ? 'Todos los formatos' : getTipoLabel(tipo)}
              </option>
            ))}
          </select>
        </div>

        {cursos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <p className="text-gray-500">No hay cursos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cursos.map((curso) => {
              const aportacion = Math.round(curso.precio * 0.1)
              return (
                <div key={curso.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition group">
                  <div className={`h-2 bg-gradient-to-r ${
                    curso.tipo_curso === 'cisco' ? 'from-blue-600 to-blue-800' :
                    curso.tipo_curso === 'meet' ? 'from-purple-600 to-purple-800' :
                    curso.tipo_curso === 'presencial' ? 'from-green-600 to-green-800' :
                    'from-[#5E1A2F] to-[#C6A43F]'
                  }`}></div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTipoBadge(curso.tipo_curso)}`}>
                        {getTipoIcono(curso.tipo_curso)} {getTipoLabel(curso.tipo_curso)}
                      </span>
                      {curso.certificado_incluido && (
                        <span className="text-xs text-green-600">Certificado</span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold mb-2">{curso.titulo}</h3>
                    <p className="text-gray-500 text-sm mb-4">{curso.descripcion}</p>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-medium">{curso.instructor}</span>
                      {curso.instructor_tipo === 'universitario' && (
                        <span className="text-xs text-gray-400">(Joven talento)</span>
                      )}
                      {curso.instructor_tipo === 'catedratico' && (
                        <span className="text-xs text-gray-400">(Catedrático)</span>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Duración:</span>
                        <span className="font-medium">{curso.duracion}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Modalidad:</span>
                        <span className="font-medium">{getTipoLabel(curso.tipo_curso)}</span>
                      </div>
                      {curso.fecha_inicio && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Inicio:</span>
                          <span className="font-medium">{new Date(curso.fecha_inicio).toLocaleDateString()}</span>
                        </div>
                      )}
                      {curso.horario && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Horario:</span>
                          <span className="font-medium text-xs">{curso.horario}</span>
                        </div>
                      )}
                      {curso.ubicacion && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Ubicación:</span>
                          <span className="font-medium text-xs">{curso.ubicacion}</span>
                        </div>
                      )}
                      {curso.enlace_reunion && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Enlace:</span>
                          <a href={curso.enlace_reunion} target="_blank" className="text-blue-600 text-xs hover:underline">Ver reunión</a>
                        </div>
                      )}
                      {curso.cupo_maximo && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Cupo:</span>
                          <span className="font-medium">{curso.inscritos || 0}/{curso.cupo_maximo}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="text-xs text-gray-400">Inversión</p>
                        <p className="text-2xl font-bold text-[#5E1A2F]">${curso.precio.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-green-600 font-medium">
                           10% a proyectos <br />
                          <span className="text-green-700 font-bold">${aportacion.toLocaleString()}</span>
                        </p>
                      </div>
                    </div>

                    {curso.contenido && (
                      <details className="text-sm text-gray-600 mb-3">
                        <summary className="cursor-pointer font-medium text-[#5E1A2F]">Ver contenido del curso</summary>
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <p className="whitespace-pre-wrap">{curso.contenido}</p>
                        </div>
                      </details>
                    )}

                    <button
                      onClick={() => comprarCurso(curso)}
                      disabled={comprando === curso.id}
                      className="w-full bg-[#5E1A2F] text-white py-2 rounded-xl font-semibold hover:bg-[#7A243E] transition disabled:opacity-50"
                    >
                      {comprando === curso.id ? 'Procesando...' : 'Inscribirme ahora'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}