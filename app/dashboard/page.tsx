import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("clerk_user_id", userId)
    .single();

  if (profile?.rol === "beneficiario") {
    redirect("/beneficiario/portal");
  }
  if (profile?.rol === "admin") {
    redirect("/admin");
  }

  const { data: donaciones } = await supabase
    .from("donaciones_usuarios")
    .select("*")
    .eq("user_id", userId);

  const totalDonado = donaciones?.reduce((sum, d) => sum + (d.monto || 0), 0) || 0;
  const cantidadDonaciones = donaciones?.length || 0;

  const { data: insignias } = await supabase
    .from("insignias_ganadas")
    .select("*")
    .eq("user_id", userId);

  // USAR beneficiarios en lugar de talentos
  const { data: talentos } = await supabase
    .from("beneficiarios")
    .select("*")
    .eq("validado", true)
    .eq("estado_cuenta", "activo")
    .limit(3);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Bienvenid@</h1>
        <p className="text-gray-500">Aquí puedes ver tu impacto y descubrir talento mexicano</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-[#5E1A2F] to-[#7A243E] rounded-2xl shadow-lg p-6 text-white">
          <div className="text-4xl mb-3"></div>
          <p className="text-3xl font-bold">{talentos?.length || 0}</p>
          <p className="text-sm opacity-90">Beneficiarios apoyados</p>
        </div>
        
        <div className="bg-gradient-to-r from-[#C6A43F] to-[#D4B458] rounded-2xl shadow-lg p-6 text-[#2C2C2C]">
          <div className="text-4xl mb-3"></div>
          <p className="text-3xl font-bold">${totalDonado.toLocaleString()}</p>
          <p className="text-sm opacity-90">Total donado</p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl shadow-lg p-6 text-white">
          <div className="text-4xl mb-3"></div>
          <p className="text-3xl font-bold">{insignias?.length || 0}</p>
          <p className="text-sm opacity-90">Insignias ganadas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4"> Mi actividad reciente</h2>
          <p className="text-gray-400 text-center py-8">No hay actividad reciente</p>
          <Link href="/mis-donaciones" className="text-sm text-[#5E1A2F] hover:underline mt-4 inline-block">
            Ver todo mi historial →
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4"> Beneficiarios destacados</h2>
          {talentos && talentos.length > 0 ? (
            <div className="space-y-4">
              {talentos.map((talento) => {
                const porcentaje = (talento.monto_recaudado || 0) / (talento.meta || 1) * 100;
                return (
                  <div key={talento.id} className="flex items-center gap-4 border-b pb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#5E1A2F] to-[#7A243E] rounded-xl flex items-center justify-center text-white text-xl">
                      
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold">{talento.nombre}</h3>
                      <p className="text-sm text-gray-500">{talento.tipo || "Estudiante"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 bg-gray-200 rounded-full max-w-[80px]">
                          <div className="h-1 bg-[#C6A43F] rounded-full" style={{ width: `${Math.min(porcentaje, 100)}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-400">{Math.round(porcentaje)}%</span>
                      </div>
                    </div>
                    <Link href={`/donar?id=${talento.id}`}>
                      <button className="px-3 py-1 bg-[#5E1A2F] text-white text-sm rounded-lg hover:bg-[#7A243E] transition">
                        Donar
                      </button>
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No hay beneficiarios destacados</p>
          )}
          <Link href="/talentos" className="text-sm text-[#5E1A2F] hover:underline mt-4 inline-block">
            Ver todos los talentos →
          </Link>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4"> Acciones rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/donar-producto" className="text-center p-4 rounded-xl hover:bg-gray-50 transition">
            <div className="text-3xl mb-2"></div>
            <p className="font-medium text-sm">Donar producto</p>
          </Link>
          <Link href="/compromiso" className="text-center p-4 rounded-xl hover:bg-gray-50 transition">
            <div className="text-3xl mb-2"></div>
            <p className="font-medium text-sm">Compromiso solidario</p>
          </Link>
          <Link href="/insignias" className="text-center p-4 rounded-xl hover:bg-gray-50 transition">
            <div className="text-3xl mb-2"></div>
            <p className="font-medium text-sm">Ver insignias</p>
          </Link>
          <Link href="/mis-donaciones" className="text-center p-4 rounded-xl hover:bg-gray-50 transition">
            <div className="text-3xl mb-2"></div>
            <p className="font-medium text-sm">Historial</p>
          </Link>
        </div>
      </div>
    </div>
  );
}