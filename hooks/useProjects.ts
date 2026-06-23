// hooks/useProjects.ts
import { useState, useEffect } from 'react'

interface Project {
  id: string
  titulo: string
  descripcion: string
  metaTotal: number
  recaudado: number
  estado: string
  categoria: string
  beneficiarioId: string
}

export function useProjects(filters?: { estado?: string; categoria?: string }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const query = new URLSearchParams()
        if (filters?.estado) query.append('estado', filters.estado)
        if (filters?.categoria) query.append('categoria', filters.categoria)

        const res = await fetch(`/api/projects?${query.toString()}`)
        if (!res.ok) throw new Error('Error al cargar proyectos')
        const data = await res.json()
        setProjects(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [filters?.estado, filters?.categoria])

  const projectsActivos = projects.filter(p => p.estado === 'activo')
  const projectsCompletados = projects.filter(p => p.estado === 'completado')

  return {
    projects,
    projectsActivos,
    projectsCompletados,
    loading,
    error,
  }
}