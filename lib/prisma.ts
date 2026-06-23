import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Verificar que DATABASE_URL existe
if (!process.env.DATABASE_URL) {
  console.error('ERROR CRÍTICO: DATABASE_URL no está definida en el entorno')
  console.error('Asegúrate de tener un archivo .env en la raíz del proyecto')
  process.exit(1)
}

// Crear el pool de conexiones a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Crear el adapter para Prisma
const adapter = new PrismaPg(pool)

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Inicializar PrismaClient con el adapter
export const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma