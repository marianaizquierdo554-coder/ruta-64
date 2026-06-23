// utils/constants.ts

// Estados de la República Mexicana
export const ESTADOS_MEXICO = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
  'Chiapas', 'Chihuahua', 'CDMX', 'Coahuila', 'Colima', 'Durango',
  'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco',
  'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla',
  'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora',
  'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
] as const

// Categorías de proyectos
export const CATEGORIAS_PROYECTO = [
  'Educación',
  'Salud',
  'Tecnología',
  'Cultura',
  'Medio Ambiente',
  'Deporte',
  'Investigación',
  'Emprendimiento'
] as const

// Planes de padrinazgo
export const PLANES_PADRINAZGO = {
  semilla: { nombre: 'Semilla', monto: 500, descripcion: 'Apoyo básico mensual' },
  crecimiento: { nombre: 'Crecimiento', monto: 1500, descripcion: 'Apoyo intermedio mensual' },
  transformacion: { nombre: 'Transformación', monto: 3000, descripcion: 'Apoyo completo mensual' }
} as const

// Insignias disponibles
export const INSIGNIAS = {
  INVERSOR_PIONERO: 'Inversor Pionero',
  DONANTE_FRECUENTE: 'Donante Frecuente',
  PADRINO_DEL_MES: 'Padrino del Mes',
  PRIMER_DONATIVO: 'Primer Donativo',
  ALIADO_DE_BRIGADAS: 'Aliado de Brigadas',
  IMPULSOR_DE_EDUCACION: 'Impulsor de Educación',
  EMBAJADOR_SOLIDARIO: 'Embajador Solidario'
} as const

// Porcentajes de distribución de impacto
export const DISTRIBUCION_IMPACTO = {
  BECAS_ACADEMICAS: 33,
  INFRAESTRUCTURA_SOCIAL: 33,
  OPERACION_LOGISTICA: 34
} as const

// Montos rápidos para donación
export const MONTO_RAPIDO = [100, 500, 1000] as const

// URI de la plataforma
export const PLATAFORMA_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Contacto de soporte
export const SOPORTE_EMAIL = 'soporte@ruta64.mx'
export const SOPORTE_WHATSAPP = '+52 55 0000 0000'