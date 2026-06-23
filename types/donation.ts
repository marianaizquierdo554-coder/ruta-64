// types/donation.ts
export interface Donation {
  id: string
  donanteId: string
  beneficiarioId?: string
  proyectoId?: string
  monto: number
  tipo: 'monetaria' | 'especie' | 'subasta' | 'padrinazgo'
  metodoPago?: 'stripe' | 'mercadopago' | 'transferencia' | 'oxxo'
  estado: 'pendiente' | 'completada' | 'cancelada' | 'reembolsada'
  fecha: Date
  comprobante?: string
  transaccionId?: string
  deducible: boolean
}

export interface DonationInKind {
  id: string
  donanteId: string
  beneficiarioId: string
  articulo: string
  cantidad: number
  estado: 'solicitado' | 'enviado' | 'recibido'
  folioEnvio?: string
  fechaEnvio?: Date
  fechaRecepcion?: Date
}

export interface Subscription {
  id: string
  donanteId: string
  beneficiarioId: string
  plan: 'semilla' | 'crecimiento' | 'transformacion'
  montoMensual: number
  activa: boolean
  fechaInicio: Date
  fechaProximoPago: Date
}