// types/project.ts
export interface Project {
  id: string
  beneficiarioId: string
  titulo: string
  descripcion: string
  categoria: 'educacion' | 'salud' | 'tecnologia' | 'cultura' | 'medio-ambiente'
  estado: 'borrador' | 'validado' | 'activo' | 'completado' | 'cancelado'
  metaTotal: number
  recaudado: number
  donantes: number
  fechaInicio: Date
  fechaFin?: Date
  imagenPrincipal?: string
  video?: string
  historia?: string
  metas: ProjectGoal[]
  impactos: Impacto[]
}

export interface ProjectGoal {
  id: string
  proyectoId: string
  nombre: string
  descripcion: string
  montoRequerido: number
  montoRecaudado: number
  completada: boolean
  fechaCompletada?: Date
}

export interface Impacto {
  id: string
  proyectoId: string
  tipo: 'beca' | 'infraestructura' | 'operacion' | 'salud' | 'educacion'
  porcentaje: number
  descripcion: string
}

export interface Badge {
  id: string
  nombre: string
  descripcion: string
  icono: string
  criterio: string
  categoria: 'donante' | 'padrino' | 'beneficiario' | 'embajador'
}