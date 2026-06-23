import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default async function TalentosPage() {
  const { data: talentos, error } = await supabase
    .from('talentos')
    .select('*')

  if (error) {
    console.error('Error:', error)
  }

  return (
    <main>
      <Navbar />
      <section className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-4">Explorar Talento</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(talentos || []).map((talento) => (
            <div key={talento.id} className="bg-white rounded-2xl shadow-xl p-6">
              <div className="text-6xl mb-4"></div>
              <h3 className="text-xl font-bold">{talento.nombre}</h3>
              <p className="text-gray-600">{talento.carrera}</p>
              <p className="text-gray-400"> {talento.estado}</p>
              <div className="mt-4">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${(talento.actual/talento.meta)*100}%` }}></div>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>${talento.actual}</span>
                  <span>${talento.meta}</span>
                </div>
              </div>
              <Link href={`/donar?id=${talento.id}`}>
                <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl">
                  Donar ahora
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}