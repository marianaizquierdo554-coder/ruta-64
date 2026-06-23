'use client'

import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'

export default function SeleccionarRol() {
  const { isLoaded, isSignedIn, userId } = useAuth()

  useEffect(() => {
    console.log(' useEffect ejecutado')
    console.log('isLoaded:', isLoaded)
    console.log('isSignedIn:', isSignedIn)
    console.log('userId:', userId)

    if (!isLoaded) {
      console.log(' Clerk cargando...')
      return
    }

    if (!isSignedIn || !userId) {
      console.log(' No autenticado, redirigiendo a /sign-in')
      window.location.href = '/sign-in'
      return
    }

    const verificarYRedirigir = async () => {
      try {
        console.log(' Consultando perfil para userId:', userId)

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('rol')
          .eq('clerk_user_id', userId)
          .maybeSingle()

        console.log(' Perfil encontrado:', profile)
        console.log(' Error:', error)

        if (error) {
          console.error(' Error en Supabase:', error)
          window.location.href = '/'
          return
        }

        if (profile?.rol) {
          console.log(' Rol detectado:', profile.rol)
          if (profile.rol === 'beneficiario') {
            console.log(' Redirigiendo a /beneficiario/portal')
            window.location.href = '/beneficiario/portal'
          } else if (profile.rol === 'admin') {
            console.log(' Redirigiendo a /admin')
            window.location.href = '/admin'
          } else {
            console.log(' Redirigiendo a /dashboard')
            window.location.href = '/dashboard'
          }
        } else {
          console.log(' Usuario sin rol, redirigiendo a /sign-up')
          window.location.href = '/sign-up'
        }
      } catch (error) {
        console.error(' Error en verificarYRedirigir:', error)
        window.location.href = '/'
      }
    }

    verificarYRedirigir()
  }, [isLoaded, isSignedIn, userId])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Redirigiendo...</p>
    </div>
  )
}