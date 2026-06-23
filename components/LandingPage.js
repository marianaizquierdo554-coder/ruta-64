import Link from 'next/link'

export default function LandingPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Un peso <span className="text-[#0057B3]">sí transforma</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            La primera plataforma en México que conecta talento académico 
            con microdonaciones masivas, transparencia radical y deducción fiscal.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/talentos" className="bg-[#0057B3] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#003C80] transition">
              Explorar Talento
            </Link>
            <Link href="/compromiso" className="bg-[#FF6B35] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#E55A2B] transition">
              Compromiso Solidario
            </Link>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="text-4xl font-bold text-[#0057B3]">$0</div>
              <div className="text-gray-600 mt-2">Recaudados</div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="text-4xl font-bold text-[#0057B3]">0</div>
              <div className="text-gray-600 mt-2">Proyectos Activos</div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="text-4xl font-bold text-[#0057B3]">0</div>
              <div className="text-gray-600 mt-2">Donantes</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}