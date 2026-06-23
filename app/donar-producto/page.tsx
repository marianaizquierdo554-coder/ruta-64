'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase-client'
import Navbar from '@/components/Navbar'

export default function DonarProducto() {
  const { userId, isSignedIn } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [subiendoImagen, setSubiendoImagen] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: '',
    imagen_url: '',
    imagen_preview: ''
  })

  const subirImagen = async (file) => {
    setSubiendoImagen(true)
    const formDataImg = new FormData()
    formDataImg.append('imagen', file)
    
    const res = await fetch('/api/subir-imagen', {
      method: 'POST',
      body: formDataImg
    })
    
    const data = await res.json()
    setSubiendoImagen(false)
    
    if (data.url) {
      setFormData(prev => ({ ...prev, imagen_url: data.url, imagen_preview: URL.createObjectURL(file) }))
    } else {
      alert('Error al subir la imagen')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('clerk_user_id', userId)
      .single()

    const { error } = await supabase.from('productos').insert({
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precio: parseInt(formData.precio),
      imagen: formData.imagen_url,
      donante_id: userId,
      donante_nombre: profile?.full_name || 'Anónimo',
      categoria: formData.categoria,
      estado: 'pendiente'
    })

    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert(' Producto donado. Será revisado y publicado pronto.')
      router.push('/tienda')
    }
    setLoading(false)
  }

  if (!isSignedIn) {
    return (
      <main>
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-gray-500">Inicia sesión para donar productos</p>
          <a href="/sign-in" className="text-blue-600">Iniciar sesión</a>
        </div>
      </main>
    )
  }

  return (
    <main>
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8"> Donar Producto</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-4">
          <input type="text" placeholder="Nombre del producto" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full p-3 border rounded-xl" required />
          <textarea placeholder="Descripción" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} rows={3} className="w-full p-3 border rounded-xl" required />
          <input type="number" placeholder="Precio (MXN)" value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} className="w-full p-3 border rounded-xl" required />
          <select value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} className="w-full p-3 border rounded-xl" required>
            <option value="">Categoría</option>
            <option>Artesanía</option><option>Alimentos</option><option>Textil</option><option>Arte</option><option>Otros</option>
          </select>
          
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files[0] && subirImagen(e.target.files[0])}
              className="w-full"
              disabled={subiendoImagen}
            />
            {subiendoImagen && <p className="text-sm text-gray-500 mt-2">Subiendo imagen...</p>}
            {formData.imagen_preview && (
              <div className="mt-3">
                <img src={formData.imagen_preview} alt="Vista previa" className="w-32 h-32 object-cover rounded-lg mx-auto" />
              </div>
            )}
          </div>
          
          <button type="submit" disabled={loading || subiendoImagen} className="w-full bg-[#5E1A2F] text-white py-3 rounded-xl font-semibold">
            {loading ? 'Enviando...' : 'Donar producto'}
          </button>
        </form>
      </div>
    </main>
  )
}