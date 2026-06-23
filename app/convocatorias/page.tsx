import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default async function ConvocatoriasPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }
  
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('rol')
    .eq('clerk_user_id', userId)
    .single()
  
  const userRole = profile?.rol || 'donante'
  
  // Solo beneficiarios y admin pueden ver convocatorias
  if (userRole !== 'beneficiario' && userRole !== 'admin') {
    redirect('/dashboard')
  }
  
  const { data: convocatorias } = await supabaseAdmin
    .from('convocatorias')
    .select('*')
    .eq('activo', true)
    .order('fecha_limite', { ascending: true })
  
  return (
    <main>
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-4"> Convocatorias Activas</h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Encuentra oportunidades de financiamiento y apoyo para tus estudios
        </p>
        
        {!convocatorias || convocatorias.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <p className="text-gray-500">No hay convocatorias activas en este momento</p>
            <p className="text-sm text-gray-400 mt-2">Revisa más tarde</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {convocatorias.map((conv) => (
              <div key={conv.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl"></div>
                  <div>
                    <h3 className="font-bold text-lg">{conv.empresa}</h3>
                    <p className="text-xs text-gray-500">{conv.titulo}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{conv.descripcion}</p>
                <div className="flex justify-between items-center text-sm mb-4">
                  <span className="font-bold text-green-600">{conv.monto}</span>
                  <span className="text-gray-400"> Vence: {new Date(conv.fecha_limite).toLocaleDateString()}</span>
                </div>
                <a 
                  href={conv.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block text-center bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
                >
                  Aplicar ahora →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}