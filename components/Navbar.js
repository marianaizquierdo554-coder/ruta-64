'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useAuth, UserButton } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const { isSignedIn } = useAuth()
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  
  // Estado para la barra deslizante
  const [barraStyle, setBarraStyle] = useState({ left: 0, width: 0 })
  const linkRefs = useRef({})

  // Definir los enlaces del menú (SIN ICONOS)
  const menuLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/subastas', label: 'Subastas' },
    { href: '/tienda', label: 'Centro Comercial' },
    { href: '/cursos', label: 'Cursos' },
    { href: '/objetos-perdidos', label: 'Objetos Perdidos' },
    { href: '/salud', label: 'Salud' },
  ]

  // Calcular la posición de la barra cuando cambia la página
  useEffect(() => {
    const indexActivo = menuLinks.findIndex(
      link => pathname === link.href || pathname?.startsWith(link.href + '/')
    )
    
    if (indexActivo !== -1 && linkRefs.current[indexActivo]) {
      const el = linkRefs.current[indexActivo]
      setBarraStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
      })
    }
  }, [pathname])

  const donarUnPeso = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/donar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monto: 10 })
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch (error) {
      console.error('Error:', error)
      alert('Error al procesar la donación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-[#E8DCCF] sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-[#5E1A2F] to-[#C6A43F] rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">64</span>
            </div>
            <span className="text-2xl font-bold text-[#5E1A2F]">Ruta 64</span>
          </Link>

          {/* Menú central con barra deslizante */}
          <div className="hidden md:flex items-center gap-1 relative">
            {menuLinks.map((link, index) => {
              const isActive = pathname === link.href || pathname?.startsWith(link.href + '/')
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  ref={(el) => { linkRefs.current[index] = el }}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
                    ${isActive 
                      ? 'text-[#5E1A2F]' 
                      : 'text-gray-600 hover:text-[#5E1A2F] hover:bg-[#5E1A2F]/5'
                    }
                  `}
                >
                  {link.label}
                </Link>
              )
            })}
            
            {/* 🔥 BARRA DESLIZANTE 🔥 */}
            {barraStyle.width > 0 && (
              <span 
                className="absolute bottom-0 h-0.5 bg-[#C6A43F] rounded-full transition-all duration-300"
                style={{
                  left: barraStyle.left,
                  width: barraStyle.width,
                }}
              />
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <>
                <Link href="/dashboard" className="bg-[#5E1A2F] hover:bg-[#7A243E] text-white px-4 py-2 rounded-xl font-semibold text-sm transition">
                  Mi Cuenta
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <>
                <Link href="/sign-in?redirect_url=/redirect-by-role" className="text-gray-600 hover:text-[#5E1A2F] transition-colors font-medium">
                  Entrar
                </Link>
                <button
                  onClick={donarUnPeso}
                  disabled={loading}
                  className="bg-[#C6A43F] hover:bg-[#D4B458] text-[#2C2C2C] px-4 py-2 rounded-xl font-semibold text-sm transition"
                >
                  {loading ? 'Procesando...' : 'Donar $1'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}