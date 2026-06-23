'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase-client'
import BeneficiarioNavbar from '@/components/BeneficiarioNavbar'

export default function PerfilBeneficiario() {
  const router = useRouter()
  const { userId, isSignedIn } = useAuth()
  const [activeTab, setActiveTab] = useState('perfil')
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  
  // Estados para video
  const [videoFile, setVideoFile] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)
  const [subiendoVideo, setSubiendoVideo] = useState(false)
  const [confirmarEliminarVideo, setConfirmarEliminarVideo] = useState(false)
  const [mostrarCambiarVideo, setMostrarCambiarVideo] = useState(false)
  
  // Estados para solicitar nueva ayuda
  const [mostrarSolicitudAyuda, setMostrarSolicitudAyuda] = useState(false)
  const [montoAyuda, setMontoAyuda] = useState('')
  const [motivoAyuda, setMotivoAyuda] = useState('')
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false)
  const [solicitudesAyuda, setSolicitudesAyuda] = useState([])
  
  // Estados para foto de perfil
  const [fotoFile, setFotoFile] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [subiendoFoto, setSubiendoFoto] = useState(false)

  const [perfil, setPerfil] = useState({
    curp: '',
    nombre: '',
    email: '',
    primerApellido: '',
    segundoApellido: '',
    fechaNacimiento: '',
    nacionalidad: 'MEXICANA',
    telefonoFijo: '',
    telefonoMovil: '',
    estadoCivil: 'Soltero(a)',
    lugarNacimiento: '',
    codigoPostal: '',
    estado: '',
    municipio: '',
    localidad: '',
    asentamientoNombre: '',
    calleNombre: '',
    numeroExterior: '',
    numeroInterior: '',
    descripcionUbicacion: '',
    institucion: '',
    carrera: '',
    tipo_beneficiario: '',
    meta: 0,
    video_url: '',
    metas: '',
    historia: '',
    rol: '',
    foto_perfil: '',
    plan_uso_fondos: '',
    validado: false,
    monto_recaudado: 0
  })

  useEffect(() => {
    if (isSignedIn && userId) {
      cargarPerfil()
      cargarSolicitudesAyuda()
    } else if (!isSignedIn) {
      router.push('/sign-in')
    }
  }, [isSignedIn, userId])

  useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview)
      if (fotoPreview) URL.revokeObjectURL(fotoPreview)
    }
  }, [videoPreview, fotoPreview])

  const cargarPerfil = async () => {
    setLoading(true)
    try {
      // 1. Obtener el profile_id desde profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_user_id', userId)
        .single()
      
      if (!profile) {
        setLoading(false)
        return
      }

      // 2. Buscar los datos en beneficiarios usando profile_id
      const { data: beneficiario } = await supabase
        .from('beneficiarios')
        .select('*')
        .eq('profile_id', profile.id)
        .single()
      
      if (beneficiario) {
        setPerfil({
          curp: beneficiario.curp || '',
          nombre: beneficiario.nombre?.split(' ')[0] || '',
          primerApellido: beneficiario.nombre?.split(' ')[1] || '',
          segundoApellido: beneficiario.nombre?.split(' ')[2] || '',
          email: beneficiario.email || '',
          fechaNacimiento: beneficiario.fecha_nacimiento || '',
          nacionalidad: beneficiario.nacionalidad || 'MEXICANA',
          telefonoFijo: beneficiario.telefono || '',
          telefonoMovil: beneficiario.telefono || '',
          estadoCivil: beneficiario.estado_civil || 'Soltero(a)',
          lugarNacimiento: beneficiario.lugar_nacimiento || '',
          codigoPostal: beneficiario.cp || '',
          estado: beneficiario.estado || '',
          municipio: beneficiario.municipio || '',
          localidad: beneficiario.localidad || '',
          asentamientoNombre: beneficiario.asentamiento || '',
          calleNombre: beneficiario.calle || '',
          numeroExterior: beneficiario.numero || '',
          numeroInterior: beneficiario.numero_interior || '',
          descripcionUbicacion: beneficiario.descripcion_ubicacion || '',
          institucion: beneficiario.institucion || '',
          carrera: beneficiario.carrera || '',
          tipo_beneficiario: beneficiario.tipo || '',
          meta: beneficiario.meta || 0,
          video_url: beneficiario.video_url || '',
          metas: beneficiario.metas || '',
          historia: beneficiario.historia || '',
          rol: 'beneficiario',
          foto_perfil: beneficiario.foto_perfil || '',
          plan_uso_fondos: beneficiario.plan_uso_fondos || '',
          validado: beneficiario.validado || false,
          monto_recaudado: beneficiario.monto_recaudado || 0
        })
      }
    } catch (error) {
      console.error('Error cargando perfil:', error)
    } finally {
      setLoading(false)
    }
  }

  const cargarSolicitudesAyuda = async () => {
    try {
      const { data } = await supabase
        .from('solicitudes_salud')
        .select('*')
        .eq('clerk_user_id', userId)
        .order('fecha_solicitud', { ascending: false })
      
      if (data) {
        setSolicitudesAyuda(data)
      }
    } catch (error) {
      console.error('Error cargando solicitudes:', error)
    }
  }

  const obtenerProfileId = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()
    return profile?.id
  }

  const guardarPerfil = async () => {
    setGuardando(true)
    try {
      const profileId = await obtenerProfileId()
      if (!profileId) throw new Error('Perfil no encontrado')

      const { error } = await supabase
        .from('beneficiarios')
        .update({
          nombre: `${perfil.nombre} ${perfil.primerApellido} ${perfil.segundoApellido}`.trim(),
          fecha_nacimiento: perfil.fechaNacimiento,
          telefono: perfil.telefonoMovil,
          cp: perfil.codigoPostal,
          estado: perfil.estado,
          municipio: perfil.municipio,
          localidad: perfil.localidad,
          calle: perfil.calleNombre,
          numero: perfil.numeroExterior,
          institucion: perfil.institucion,
          carrera: perfil.carrera,
          tipo: perfil.tipo_beneficiario,
          meta: perfil.meta,
          historia: perfil.historia,
          metas: perfil.metas,
          plan_uso_fondos: perfil.plan_uso_fondos
        })
        .eq('profile_id', profileId)
      
      if (error) throw error
      alert('Perfil actualizado correctamente')
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setGuardando(false)
    }
  }

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (file.size > 100 * 1024 * 1024) {
      alert('El video no debe exceder 100MB')
      return
    }
    
    setVideoFile(file)
    setVideoPreview(URL.createObjectURL(file))
  }

  const cancelarSubirVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview)
    setVideoFile(null)
    setVideoPreview(null)
  }

  const guardarNuevoVideo = async () => {
    if (!videoFile) return
    
    setSubiendoVideo(true)
    try {
      const formData = new FormData()
      formData.append('file', videoFile)
      
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Error al subir video')
      
      const data = await res.json()
      
      const profileId = await obtenerProfileId()
      if (!profileId) throw new Error('Perfil no encontrado')

      const { error } = await supabase
        .from('beneficiarios')
        .update({ video_url: data.url })
        .eq('profile_id', profileId)

      if (error) throw error
      
      setPerfil({ ...perfil, video_url: data.url })
      cancelarSubirVideo()
      setMostrarCambiarVideo(false)
      alert('Video actualizado correctamente')
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setSubiendoVideo(false)
    }
  }

  const eliminarVideo = async () => {
    if (!confirmarEliminarVideo) {
      setConfirmarEliminarVideo(true)
      setTimeout(() => setConfirmarEliminarVideo(false), 3000)
      return
    }
    
    try {
      const profileId = await obtenerProfileId()
      if (!profileId) throw new Error('Perfil no encontrado')

      const { error } = await supabase
        .from('beneficiarios')
        .update({ video_url: null })
        .eq('profile_id', profileId)

      if (error) throw error
      
      setPerfil({ ...perfil, video_url: '' })
      setConfirmarEliminarVideo(false)
      setMostrarCambiarVideo(false)
      alert('Video eliminado correctamente')
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  const handleFotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (file.size > 5 * 1024 * 1024) {
      alert('La foto no debe exceder 5MB')
      return
    }
    
    setFotoFile(file)
    setFotoPreview(URL.createObjectURL(file))
  }

  const cancelarSubirFoto = () => {
    if (fotoPreview) URL.revokeObjectURL(fotoPreview)
    setFotoFile(null)
    setFotoPreview(null)
  }

  const guardarNuevaFoto = async () => {
    if (!fotoFile) return
    
    setSubiendoFoto(true)
    try {
      const formData = new FormData()
      formData.append('file', fotoFile)
      
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Error al subir foto')
      
      const data = await res.json()
      
      const profileId = await obtenerProfileId()
      if (!profileId) throw new Error('Perfil no encontrado')

      const { error } = await supabase
        .from('beneficiarios')
        .update({ foto_perfil: data.url })
        .eq('profile_id', profileId)

      if (error) throw error
      
      setPerfil({ ...perfil, foto_perfil: data.url })
      cancelarSubirFoto()
      alert('Foto de perfil actualizada')
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setSubiendoFoto(false)
    }
  }

  const enviarSolicitudAyuda = async () => {
    if (!montoAyuda || !motivoAyuda) {
      alert('Completa todos los campos')
      return
    }
    
    if (parseFloat(montoAyuda) <= 0) {
      alert('El monto debe ser mayor a 0')
      return
    }
    
    setEnviandoSolicitud(true)
    try {
      const { error } = await supabase
        .from('solicitudes_ayuda')
        .insert({
          clerk_user_id: userId,
          monto: parseFloat(montoAyuda),
          motivo: motivoAyuda,
          estado: 'pendiente',
          fecha_solicitud: new Date().toISOString()
        })

      if (error) throw error
      
      alert('Solicitud enviada correctamente. Será revisada por el equipo.')
      setMostrarSolicitudAyuda(false)
      setMontoAyuda('')
      setMotivoAyuda('')
      cargarSolicitudesAyuda()
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setEnviandoSolicitud(false)
    }
  }

  const porcentajeRecaudado = perfil.meta > 0 
    ? Math.min(((perfil.monto_recaudado || 0) / perfil.meta) * 100, 100)
    : 0

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5E1A2F] mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando tus datos...</p>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <BeneficiarioNavbar />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        
        {/* Header con foto y nombre */}
        <div className="bg-gradient-to-r from-[#5E1A2F] to-[#7A243E] rounded-2xl p-6 text-white mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              {fotoPreview || perfil.foto_perfil ? (
                <img 
                  src={fotoPreview || perfil.foto_perfil} 
                  alt="Foto de perfil" 
                  className="w-24 h-24 rounded-full object-cover border-2 border-white"
                />
              ) : (
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl">
                  {perfil.nombre?.charAt(0) || ''}
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-[#C6A43F] text-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer hover:bg-[#a88a2f] text-xs">
                📷
                <input type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />
              </label>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold">
                {perfil.nombre} {perfil.primerApellido} {perfil.segundoApellido}
              </h1>
              <p className="text-white/80">
                {perfil.tipo_beneficiario || 'Beneficiario'} • {perfil.institucion || 'Ruta 64'}
              </p>
              <p className="text-sm text-white/60 mt-1">CURP: {perfil.curp || 'No registrado'}</p>
              <p className="text-sm text-white/60">Email: {perfil.email}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                perfil.validado ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
              }`}>
                {perfil.validado ? 'Validado' : 'Pendiente de validación'}
              </span>
            </div>

            {fotoPreview && (
              <div className="flex gap-2">
                <button onClick={guardarNuevaFoto} disabled={subiendoFoto} className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm">
                  {subiendoFoto ? 'Guardando...' : 'Guardar foto'}
                </button>
                <button onClick={cancelarSubirFoto} className="px-4 py-2 bg-gray-400 text-white rounded-lg text-sm">Cancelar</button>
              </div>
            )}
          </div>

          {/* Barra de progreso */}
          {perfil.meta > 0 && (
            <div className="mt-4 bg-white/10 rounded-full p-1">
              <div className="flex justify-between text-sm mb-1">
                <span>Recaudado: ${(perfil.monto_recaudado || 0).toLocaleString()} MXN</span>
                <span>Meta: ${perfil.meta.toLocaleString()} MXN</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div className="bg-[#C6A43F] h-3 rounded-full transition-all duration-500" style={{ width: `${porcentajeRecaudado}%` }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Pestañas */}
        <div className="flex gap-2 border-b mb-8 flex-wrap">
          <button onClick={() => setActiveTab('perfil')} className={`px-6 py-3 rounded-t-lg font-semibold transition ${activeTab === 'perfil' ? 'bg-[#5E1A2F] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Perfil</button>
          <button onClick={() => setActiveTab('solicitud')} className={`px-6 py-3 rounded-t-lg font-semibold transition ${activeTab === 'solicitud' ? 'bg-[#5E1A2F] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Solicitar Ayuda</button>
          <button onClick={() => setActiveTab('seguimiento')} className={`px-6 py-3 rounded-t-lg font-semibold transition ${activeTab === 'seguimiento' ? 'bg-[#5E1A2F] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Seguimiento</button>
        </div>

        {/* PERFIL */}
        {activeTab === 'perfil' && (
          <div className="space-y-8">
            {/* Video */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-[#5E1A2F]">Video de presentación</h2>
              
              {perfil.video_url ? (
                <div>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                    <iframe src={perfil.video_url} className="w-full h-full" allowFullScreen></iframe>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setMostrarCambiarVideo(!mostrarCambiarVideo)} className="flex-1 py-2 bg-blue-600 text-white rounded-lg">Cambiar video</button>
                    <button onClick={eliminarVideo} className={`flex-1 py-2 text-white rounded-lg ${confirmarEliminarVideo ? 'bg-red-700' : 'bg-red-500'}`}>{confirmarEliminarVideo ? 'Confirmar' : 'Eliminar'}</button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No has subido un video de presentación</p>
                  <input type="file" accept="video/*" onChange={handleVideoFileChange} className="w-full p-2 border rounded-lg" />
                </div>
              )}
              
              {mostrarCambiarVideo && (
                <div className="mt-4 border-t pt-4">
                  {videoPreview && <video src={videoPreview} controls className="w-full rounded-lg mb-3" />}
                  <input type="file" accept="video/*" onChange={handleVideoFileChange} className="w-full p-2 border rounded-lg mb-2" />
                  <div className="flex gap-2">
                    <button onClick={guardarNuevoVideo} disabled={subiendoVideo} className="flex-1 py-2 bg-green-600 text-white rounded-lg">Guardar video</button>
                    <button onClick={cancelarSubirVideo} className="flex-1 py-2 bg-gray-400 text-white rounded-lg">Cancelar</button>
                  </div>
                </div>
              )}
            </div>

            {/* Información del proyecto */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-[#5E1A2F]">Información del proyecto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-500">Tipo</label><input value={perfil.tipo_beneficiario} onChange={e => setPerfil({...perfil, tipo_beneficiario: e.target.value})} className="w-full p-2 border rounded-lg" /></div>
                <div><label className="text-sm text-gray-500">Institución</label><input value={perfil.institucion} onChange={e => setPerfil({...perfil, institucion: e.target.value})} className="w-full p-2 border rounded-lg" /></div>
                <div><label className="text-sm text-gray-500">Meta</label><input type="number" value={perfil.meta} onChange={e => setPerfil({...perfil, meta: parseInt(e.target.value)})} className="w-full p-2 border rounded-lg" /></div>
                <div><label className="text-sm text-gray-500">Plan de uso</label><textarea value={perfil.plan_uso_fondos} onChange={e => setPerfil({...perfil, plan_uso_fondos: e.target.value})} rows={2} className="w-full p-2 border rounded-lg" /></div>
              </div>
            </div>

            {/* Historia */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-[#5E1A2F]">Mi historia</h2>
              <textarea value={perfil.historia} onChange={e => setPerfil({...perfil, historia: e.target.value})} rows={4} className="w-full p-2 border rounded-lg"></textarea>
            </div>

            {/* Datos personales */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-[#5E1A2F]">Datos personales</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label>CURP</label><input value={perfil.curp} className="w-full p-2 border rounded-lg bg-gray-50" readOnly /></div>
                <div><label>Nombre</label><input value={perfil.nombre} onChange={e => setPerfil({...perfil, nombre: e.target.value})} className="w-full p-2 border rounded-lg" /></div>
                <div><label>Primer apellido</label><input value={perfil.primerApellido} onChange={e => setPerfil({...perfil, primerApellido: e.target.value})} className="w-full p-2 border rounded-lg" /></div>
                <div><label>Segundo apellido</label><input value={perfil.segundoApellido} onChange={e => setPerfil({...perfil, segundoApellido: e.target.value})} className="w-full p-2 border rounded-lg" /></div>
                <div><label>Fecha nacimiento</label><input type="date" value={perfil.fechaNacimiento} onChange={e => setPerfil({...perfil, fechaNacimiento: e.target.value})} className="w-full p-2 border rounded-lg" /></div>
                <div><label>Teléfono</label><input value={perfil.telefonoMovil} onChange={e => setPerfil({...perfil, telefonoMovil: e.target.value})} className="w-full p-2 border rounded-lg" /></div>
              </div>
            </div>

            {/* Domicilio */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-[#5E1A2F]">Domicilio</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label>CP</label><input value={perfil.codigoPostal} onChange={e => setPerfil({...perfil, codigoPostal: e.target.value})} className="w-full p-2 border rounded-lg" /></div>
                <div><label>Estado</label><input value={perfil.estado} onChange={e => setPerfil({...perfil, estado: e.target.value})} className="w-full p-2 border rounded-lg" /></div>
                <div><label>Municipio</label><input value={perfil.municipio} onChange={e => setPerfil({...perfil, municipio: e.target.value})} className="w-full p-2 border rounded-lg" /></div>
                <div><label>Calle</label><input value={perfil.calleNombre} onChange={e => setPerfil({...perfil, calleNombre: e.target.value})} className="w-full p-2 border rounded-lg" /></div>
                <div><label>Número</label><input value={perfil.numeroExterior} onChange={e => setPerfil({...perfil, numeroExterior: e.target.value})} className="w-full p-2 border rounded-lg" /></div>
              </div>
            </div>

            <button onClick={guardarPerfil} disabled={guardando} className="w-full bg-[#5E1A2F] text-white py-3 rounded-xl font-semibold">Guardar cambios</button>
          </div>
        )}

        {/* SOLICITUD */}
        {activeTab === 'solicitud' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-[#5E1A2F]">Solicitar nueva ayuda</h2>
              
              {!mostrarSolicitudAyuda ? (
                <div className="text-center py-8">
                  <button onClick={() => setMostrarSolicitudAyuda(true)} className="bg-[#C6A43F] text-white px-8 py-3 rounded-xl font-bold">Solicitar nueva ayuda</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div><label>Monto (MXN)</label><input type="number" value={montoAyuda} onChange={e => setMontoAyuda(e.target.value)} className="w-full p-2 border rounded-lg" /></div>
                  <div><label>Motivo</label><textarea value={motivoAyuda} onChange={e => setMotivoAyuda(e.target.value)} rows={4} className="w-full p-2 border rounded-lg"></textarea></div>
                  <div className="flex gap-2">
                    <button onClick={enviarSolicitudAyuda} className="flex-1 py-2 bg-[#5E1A2F] text-white rounded-lg">Enviar</button>
                    <button onClick={() => setMostrarSolicitudAyuda(false)} className="px-6 py-2 bg-gray-300 rounded-lg">Cancelar</button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-[#5E1A2F]">Mis solicitudes</h2>
              {solicitudesAyuda.length > 0 ? (
                solicitudesAyuda.map(s => (
                  <div key={s.id} className="border rounded-lg p-4 mb-2">
                    <div className="flex justify-between">
                      <span className="font-bold">${s.monto} MXN</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${s.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : s.estado === 'aprobada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{s.estado}</span>
                    </div>
                    <p className="text-sm text-gray-600">{s.motivo}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(s.fecha_solicitud).toLocaleDateString()}</p>
                  </div>
                ))
              ) : <p className="text-gray-400 text-center py-4">No hay solicitudes</p>}
            </div>
          </div>
        )}

        {/* SEGUIMIENTO */}
        {activeTab === 'seguimiento' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-[#5E1A2F]">Estado de recaudación</h2>
              <div className="text-center mb-4"><p className="text-4xl font-bold">${(perfil.monto_recaudado || 0).toLocaleString()}</p><p className="text-gray-500">de ${perfil.meta.toLocaleString()} MXN</p></div>
              <div className="w-full bg-gray-200 rounded-full h-4"><div className="bg-[#C6A43F] h-4 rounded-full" style={{ width: `${porcentajeRecaudado}%` }}></div></div>
              <p className="text-center text-sm mt-2">{porcentajeRecaudado.toFixed(1)}% completado</p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}