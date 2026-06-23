import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import AdminNavbar from "@/components/AdminNavbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default async function ReportesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Verificar que es admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("clerk_user_id", userId)
    .single();

  if (profile?.rol !== "admin") {
    redirect("/dashboard");
  }

  // Obtener estadísticas
  const [
    { count: totalBeneficiarios },
    { count: totalDonantes },
    { count: totalDonaciones },
    { count: totalSubastas },
    { count: totalCursos },
    { count: pendientesValidacion }
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("rol", "beneficiario"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("rol", "donante"),
    supabase.from("donaciones_usuarios").select("*", { count: "exact", head: true }),
    supabase.from("subastas").select("*", { count: "exact", head: true }),
    supabase.from("cursos").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("validado", false).eq("rol", "beneficiario")
  ]);

  // Donaciones por mes (últimos 6 meses)
  const meses = [];
  const donacionesPorMes = [];
  for (let i = 5; i >= 0; i--) {
    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() - i);
    const mesNombre = fecha.toLocaleString("es", { month: "short" });
    meses.push(mesNombre);
    
    const { count } = await supabase
      .from("donaciones_usuarios")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(fecha.getFullYear(), fecha.getMonth(), 1).toISOString())
      .lt("created_at", new Date(fecha.getFullYear(), fecha.getMonth() + 1, 1).toISOString());
    
    donacionesPorMes.push(count || 0);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <AdminNavbar />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Reportes y Estadísticas</h1>
        
        {/* Tarjetas resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <div className="text-3xl mb-2">👥</div>
            <p className="text-2xl font-bold">{totalBeneficiarios || 0}</p>
            <p className="text-sm text-gray-500">Beneficiarios</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <div className="text-3xl mb-2">🤝</div>
            <p className="text-2xl font-bold">{totalDonantes || 0}</p>
            <p className="text-sm text-gray-500">Donantes</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-2xl font-bold">{totalDonaciones || 0}</p>
            <p className="text-sm text-gray-500">Donaciones</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <div className="text-3xl mb-2">🔨</div>
            <p className="text-2xl font-bold">{totalSubastas || 0}</p>
            <p className="text-sm text-gray-500">Subastas</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <div className="text-3xl mb-2">📚</div>
            <p className="text-2xl font-bold">{totalCursos || 0}</p>
            <p className="text-sm text-gray-500">Cursos</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <div className="text-3xl mb-2">⏳</div>
            <p className="text-2xl font-bold text-yellow-600">{pendientesValidacion || 0}</p>
            <p className="text-sm text-gray-500">Pendientes</p>
          </div>
        </div>

        {/* Gráfica de donaciones por mes */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Donaciones por mes</h2>
          <div className="flex items-end h-64 gap-2">
            {donacionesPorMes.map((cantidad, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
                  style={{ height: `${Math.min(300, (cantidad / Math.max(...donacionesPorMes, 1)) * 200)}px` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">{meses[index]}</span>
                <span className="text-sm font-bold">{cantidad}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Resumen de beneficiarios</h2>
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr><th className="text-left py-2">Estado</th><th className="text-right py-2">Cantidad</th></tr>
              </thead>
              <tbody>
                <tr className="border-b"><td className="py-2">Validados</td><td className="text-right text-green-600">{(totalBeneficiarios || 0) - (pendientesValidacion || 0)}</td></tr>
                <tr><td className="py-2">Pendientes</td><td className="text-right text-yellow-600">{pendientesValidacion || 0}</td></tr>
              </tbody>
            </table>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Enlaces rápidos</h2>
            <div className="space-y-2">
              <a href="/admin/validar" className="block text-blue-600 hover:underline">✓ Validar beneficiarios pendientes</a>
              <a href="/admin/donaciones" className="block text-blue-600 hover:underline">� Revisar donaciones</a>
              <a href="/admin/usuarios" className="block text-blue-600 hover:underline">� Gestionar usuarios</a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
