// types/user.ts
export interface User {
  id: string
  clerkId: string
  email: string
  name: string
  lastName?: string
  role: 'admin' | 'beneficiario' | 'donante' | 'padrino' | 'moderador' | 'user'
  phone?: string
  curp?: string
  estado?: string
  municipio?: string
  createdAt: Date
  updatedAt: Date
}

export interface Beneficiario extends User {
  matricula?: string
  institucion?: string
  carrera?: string
  semestre?: number
  historia?: string
  metaRecaudacion?: number
  recaudado?: number
  verificado: boolean
  documentosVerificados: string[]
  proyectosActivos: number
  proyectosCompletados: number
}

export interface Donante extends User {
  donacionesRealizadas: number
  montoTotalDonado: number
  donacionesRecurrentes: boolean
  insignias: string[]
  esPadrino: boolean
  padrinoDesde?: Date
}