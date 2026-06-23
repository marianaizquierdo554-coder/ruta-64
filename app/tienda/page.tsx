'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useAuth } from '@clerk/nextjs'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function TiendaPage() {
  const { userId, isSignedIn } = useAuth()
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [categorias, setCategorias] = useState([])
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas')
  const [comprando, setComprando] = useState(null)
  const [direccion, setDireccion] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)

  useEffect(() => {
    cargarProductos()
  }, [categoriaSeleccionada])

  const cargarProductos = async () => {
    let query = supabase.from('productos').select('*').eq('estado', 'aprobado')

    if (categoriaSeleccionada !== 'todas') {
      query = query.eq('categoria', categoriaSeleccionada)
    }

    const { data } = await query.order('created_at', { ascending: false })
    setProductos(data || [])

    const categoriasSet = new Set(data?.map(p => p.categoria) || [])
    const cats = Array.from(categoriasSet)
    setCategorias(cats)
    setCargando(false)
  }

  const comprarProducto = (producto) => {
    if (!isSignedIn) {
      alert('Inicia sesión para comprar')
      return
    }
    setProductoSeleccionado(producto)
    setMostrarFormulario(true)
  }

  const procesarPago = async () => {
    if (!direccion) {
      alert('Ingresa tu dirección de envío')
      return
    }

    setComprando(productoSeleccionado.id)

    // ✅ CORREGIDO: solo seleccionar email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('clerk_user_id', userId)
      .single()

    const res = await fetch('/api/comprar-producto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productoId: productoSeleccionado.id,
        nombre: productoSeleccionado.nombre,
        precio: productoSeleccionado.precio,
        compradorId: userId,
        compradorNombre: profile?.email || 'Usuario',
        compradorEmail: profile?.email,
        direccion: direccion
      })
    })

    const { url } = await res.json()
    if (url) window.location.href = url

    setComprando(null)
    setMostrarFormulario(false)
  }

  if (cargando) {
    return (
      <main>
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p>Cargando productos...</p>
        </div>
      </main>
    )
  }

  return (
    <main>
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4"> Centro Comercial Local</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Cada compra apoya el talento mexicano. Productos 100% originales de artesanos y pequeños productores.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <button
            onClick={() => setCategoriaSeleccionada('todas')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              categoriaSeleccionada === 'todas'
                ? 'bg-[#5E1A2F] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaSeleccionada(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                categoriaSeleccionada === cat
                  ? 'bg-[#5E1A2F] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {productos.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <p className="text-gray-500">No hay productos disponibles</p>
            <p className="text-sm text-gray-400 mt-2">Próximamente más artículos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productos.map((producto) => (
              <div key={producto.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition group">
                <div className="h-1 bg-gradient-to-r from-[#5E1A2F] to-[#C6A43F]"></div>
                <div className="p-5">
                  <div className="text-5xl mb-3 text-center">{producto.imagen || ''}</div>
                  <h3 className="font-bold text-lg text-center mb-1">{producto.nombre}</h3>
                  <p className="text-gray-500 text-sm text-center mb-3">{producto.descripcion}</p>

                  <div className="flex justify-between items-center mb-3 pt-2 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400">Donado por:</p>
                      <p className="text-sm font-semibold">{producto.donante_nombre || 'Anónimo'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Precio</p>
                      <p className="text-xl font-bold text-[#5E1A2F]">${producto.precio.toLocaleString()}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => comprarProducto(producto)}
                    disabled={comprando === producto.id}
                    className="w-full bg-[#5E1A2F] text-white py-2 rounded-xl font-semibold hover:bg-[#7A243E] transition disabled:opacity-50"
                  >
                    {comprando === producto.id ? 'Procesando...' : 'Comprar ahora'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">¿Tienes productos para donar?</h2>
          <p className="text-gray-600 mb-4">Ayuda a recaudar fondos para el talento mexicano donando tus productos</p>
          <Link href="/donar-producto" className="inline-block bg-[#C6A43F] text-[#2C2C2C] px-6 py-2 rounded-xl font-semibold hover:bg-[#D4B458] transition">
            Quiero donar productos →
          </Link>
        </div>
      </div>

      {/* Modal para dirección de envío */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Dirección de envío</h2>
            <textarea
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Calle, número, colonia, ciudad, código postal"
              className="w-full p-3 border rounded-xl mb-4"
              rows={4}
            />
            <div className="flex gap-3">
              <button onClick={procesarPago} className="flex-1 bg-green-600 text-white py-2 rounded-xl">
                Continuar al pago
              </button>
              <button onClick={() => setMostrarFormulario(false)} className="flex-1 bg-gray-300 py-2 rounded-xl">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}