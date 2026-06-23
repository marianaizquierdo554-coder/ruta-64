// utils/validators.ts

/**
 * Valida un CURP mexicano
 * Formato: 18 caracteres alfanuméricos
 */
export function isValidCURP(curp: string): boolean {
  if (!curp) return false
  const curpRegex = /^[A-Z]{4}[0-9]{6}[A-Z]{6}[0-9A-Z]{2}$/
  return curpRegex.test(curp.toUpperCase())
}

/**
 * Valida un correo electrónico
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida un teléfono mexicano (10 dígitos)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false
  const cleanPhone = phone.replace(/[\s\-()]/g, '')
  return /^[0-9]{10}$/.test(cleanPhone)
}

/**
 * Valida una matrícula escolar
 */
export function isValidMatricula(matricula: string): boolean {
  if (!matricula) return false
  return matricula.length >= 5 && matricula.length <= 20
}

/**
 * Valida que el monto de donación sea válido
 */
export function isValidDonationAmount(amount: number): boolean {
  return amount > 0 && amount <= 10000000 // Máximo 10 millones MXN
}

/**
 * Valida una fecha de nacimiento (mayor de edad)
 */
export function isAdult(birthDate: Date): boolean {
  const today = new Date()
  const age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 18
  }
  return age >= 18
}