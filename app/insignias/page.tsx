import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import DashboardNavbar from "@/components/DashboardNavbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default async function InsigniasPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // 1. Obtener TODAS las insignias (16)
  const { data: todasInsignias, error } = await supabase
    .from("insignias")
    .select("*")
    .order("id", { ascending: true });

  // 2. Obtener las insignias GANADAS por este donante
  const { data: ganadas } = await supabase
    .from("insignias_ganadas")
    .select("insignia_id, fecha_ganada")
    .eq("user_id", userId);

  const idsGanadas = new Set(ganadas?.map(g => g.insignia_id) || []);
  const fechasGanadas = {};
  ganadas?.forEach(g => { fechasGanadas[g.insignia_id] = g.fecha_ganada; });

  // Separar en ganadas y por ganar
  const insigniasGanadas = todasInsignias?.filter(i => idsGanadas.has(i.id)) || [];
  const insigniasPorGanar = todasInsignias?.filter(i => !idsGanadas.has(i.id)) || [];

  return (
    <main className="min-h-screen bg-gray-100">
      <DashboardNavbar />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-4"> Mis Insignias</h1>
        <p className="text-center text-gray-500 mb-8">
          Logros obtenidos por tu apoyo y compromiso con Ruta 64
        </p>

        {/* Resumen */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-12">
          <div className="bg-gradient-to-r from-[#5E1A2F] to-[#7A243E] rounded-2xl p-4 text-center text-white">
            <p className="text-3xl font-bold">{insigniasGanadas.length}</p>
            <p className="text-xs opacity-90">Insignias Ganadas</p>
          </div>
          <div className="bg-gray-600 rounded-2xl p-4 text-center text-white">
            <p className="text-3xl font-bold">{insigniasPorGanar.length}</p>
            <p className="text-xs opacity-90">Por Ganar</p>
          </div>
        </div>

        {/* Sección: Insignias Ganadas */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span></span> Insignias Ganadas
            <span className="text-sm text-gray-500 font-normal">({insigniasGanadas.length}/16)</span>
          </h2>
          
          {insigniasGanadas.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <p className="text-gray-500">Aún no has ganado insignias. ¡Comienza a donar!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {insigniasGanadas.map((insignia) => (
                <div key={insignia.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1">
                  <div className="h-2 bg-gradient-to-r from-green-500 to-green-700"></div>
                  <div className="p-6 text-center">
                    <div className="text-5xl mb-4">{insignia.icono || ''}</div>
                    <h3 className="text-lg font-bold mb-2">{insignia.nombre}</h3>
                    <p className="text-sm text-gray-500">{insignia.descripcion}</p>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-green-600 font-medium">✓ Obtenida</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Sección: Insignias por Ganar */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>🔒</span> Insignias por Ganar
            <span className="text-sm text-gray-500 font-normal">({insigniasPorGanar.length}/16)</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {insigniasPorGanar.map((insignia) => (
              <div key={insignia.id} className="bg-white rounded-2xl shadow-md overflow-hidden opacity-75 hover:opacity-100 transition">
                <div className="h-2 bg-gradient-to-r from-gray-300 to-gray-400"></div>
                <div className="p-6 text-center">
                  <div className="text-5xl mb-4 opacity-50">{insignia.icono || '🏆'}</div>
                  <h3 className="text-lg font-bold mb-2 text-gray-600">{insignia.nombre}</h3>
                  <p className="text-sm text-gray-400">{insignia.descripcion}</p>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-400">🔒 Por completar</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mensaje de motivación */}
        <div className="mt-12 bg-gradient-to-r from-[#5E1A2F] to-[#7A243E] rounded-2xl p-6 text-white text-center">
          <p className="text-sm opacity-90">
             ¡Sigue participando! Cada donación, cada invitación y cada compromiso te acerca a nuevas insignias.
          </p>
        </div>
      </div>
    </main>
  );
}