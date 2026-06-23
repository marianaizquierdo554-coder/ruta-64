import DashboardNavbar from "@/components/DashboardNavbar"
import Link from "next/link"

export default function ExplorarPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-12">Explorar Talento Académico</h1>

        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Próximamente: Lista de beneficiarios verificados</p>
          <p className="text-gray-400 mt-2">Estamos preparando la vitrina de talentos</p>
        </div>
      </div>
    </main>
  )
}
