// hooks/useAuth.ts
import { useUser } from '@clerk/nextjs'
import { useMemo } from 'react'

export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser()

  // Obtener el rol del usuario desde los metadatos de Clerk
  const role = useMemo(() => {
    if (!user) return null
    return user.publicMetadata?.role as string || null
  }, [user])

  const isAdmin = useMemo(() => role === 'admin', [role])
  const isBeneficiario = useMemo(() => role === 'beneficiario', [role])
  const isDonante = useMemo(() => role === 'donante' || role === 'user', [role])
  const isPadrino = useMemo(() => role === 'padrino', [role])

  return {
    user,
    isLoaded,
    isSignedIn,
    role,
    isAdmin,
    isBeneficiario,
    isDonante,
    isPadrino,
  }
}