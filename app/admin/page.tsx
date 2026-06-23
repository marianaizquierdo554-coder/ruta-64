import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import AdminNavbar from "@/components/AdminNavbar"
import Link from 'next/link'

export default async function AdminPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }
  
  // Verificar rol del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('rol')
    .eq('clerk_user_id', userId)
    .single()
  
  // Si no es admin, redirigir al dashboard
  if (profile?.rol !== 'admin') {
    redirect('/dashboard')
  }
  
  return (
    <main>
      <AdminNavbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8"> Panel de Administración</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/validar" className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-4xl mb-3"></div>
            <h3 className="text-xl font-bold mb-2">Validar beneficiarios</h3>
            <p className="text-gray-500">Aprobar o rechazar solicitudes</p>
          </Link>
          
          <Link href="/admin/donaciones" className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-4xl mb-3"></div>
            <h3 className="text-xl font-bold mb-2">Ver donaciones</h3>
            <p className="text-gray-500">Monitorear todas las transacciones</p>
          </Link>
          
          <Link href="/admin/usuarios" className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-4xl mb-3"></div>
            <h3 className="text-xl font-bold mb-2">Gestionar usuarios</h3>
            <p className="text-gray-500">Asignar roles y moderar</p>
          </Link>
        </div>
      </div>
    </main>
  )
}
