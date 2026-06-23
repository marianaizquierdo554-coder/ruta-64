// hooks/useDonations.ts
import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'

interface Donation {
  id: string
  monto: number
  tipo: string
  estado: string
  fecha: string
}

export function useDonations() {
  const { user } = useAuth()
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchDonations = async () => {
      try {
        const res = await fetch('/api/mis-donaciones')
        if (!res.ok) throw new Error('Error al cargar donaciones')
        const data = await res.json()
        setDonations(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchDonations()
  }, [user])

  const totalDonado = donations.reduce((sum, d) => sum + d.monto, 0)
  const donacionesCompletadas = donations.filter(d => d.estado === 'completada').length

  return {
    donations,
    loading,
    error,
    totalDonado,
    donacionesCompletadas,
  }
}