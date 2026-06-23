import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import BeneficiarioNavbar from "@/components/BeneficiarioNavbar";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default async function BeneficiarioPortal() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // 1. Obtener el profile_id desde profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  if (!profile) {
    redirect("/beneficiario/completar-perfil");
  }

  // 2. Buscar el beneficiario por profile_id
  const { data: beneficiario } = await supabase
    .from("beneficiarios")
    .select("*")
    .eq("profile_id", profile.id)
    .single();

  if (!beneficiario) {
    redirect("/beneficiario/completar-perfil");
  }

  // 3. Contar comprobantes subidos
  const { count: totalComprobantes } = await supabase
    .from("comprobantes")
    .select("*", { count: "exact", head: true })
    .eq("beneficiario_id", beneficiario.id);

  const porcentaje = (beneficiario.monto_recaudado || 0) / (beneficiario.meta || 1) * 100;

  // Calcular días sin comprobante
  let diasSinComprobante = null;
  if (beneficiario.ultimo_comprobante) {
    const ultimo = new Date(beneficiario.ultimo_comprobante);
    const hoy = new Date();
    const diffTime = Math.abs(hoy - ultimo);
    diasSinComprobante = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <BeneficiarioNavbar />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">Bienvenido, {beneficiario.nombre}</h1>
        <p className="text-gray-500 mb-8">Panel de control</p>

        {/* Advertencias */}
        {beneficiario.advertencias > 0 && beneficiario.estado === 'advertencia' && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl"></span>
              <div>
                <p className="font-bold text-yellow-800">¡Atención! Tu perfil está en estado de advertencia</p>
                <p className="text-sm text-yellow-700">
                  Llevas {diasSinComprobante || 0} días sin subir comprobantes de gastos.
                  Sube tus facturas para mantener tu beca activa.
                </p>
                <Link href="/beneficiario/comprobantes" className="text-sm text-yellow-800 underline mt-1 inline-block">
                  Subir comprobantes ahora →
                </Link>
              </div>
            </div>
          </div>
        )}

        {beneficiario.estado === 'suspendido' && (
          <div className="bg-red-50 border border-red-300 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl"></span>
              <div>
                <p className="font-bold text-red-800">Tu perfil ha sido suspendido</p>
                <p className="text-sm text-red-700">
                  No has subido comprobantes de gastos en el tiempo requerido. Tu perfil ya no es visible para donantes.
                  Contacta al administrador para reactivar tu cuenta.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECCIÓN DE COMPROBANTES */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg"> Comprobantes de gastos</h3>
              <p className="text-sm text-gray-500">
                Sube facturas y recibos para mantener la transparencia de tus gastos
              </p>
            </div>
            <Link href="/beneficiario/comprobantes" className="bg-[#5E1A2F] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#7A243E] transition">
              Ver todos →
            </Link>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-[#5E1A2F]">{totalComprobantes || 0}</p>
              <p className="text-xs text-gray-500">Comprobantes subidos</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${beneficiario.monto_recaudado > 0 ? "text-green-600" : "text-gray-400"}`}>
                {beneficiario.monto_recaudado > 0 ? "" : ""}
              </p>
              <p className="text-xs text-gray-500">{beneficiario.monto_recaudado > 0 ? "Transparencia activa" : "Sin donaciones aún"}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${
                diasSinComprobante !== null && diasSinComprobante > 60 ? "text-red-600" : 
                diasSinComprobante !== null && diasSinComprobante > 30 ? "text-yellow-600" : 
                "text-green-600"
              }`}>
                {diasSinComprobante !== null ? `${diasSinComprobante} días` : "—"}
              </p>
              <p className="text-xs text-gray-500">Último comprobante</p>
            </div>
          </div>
          
          <div className="mt-4">
            <Link href="/beneficiario/comprobantes" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
              + Subir comprobante
            </Link>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="text-sm text-gray-500">Recaudado</p>
            <p className="text-3xl font-bold text-green-600">${beneficiario.monto_recaudado?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="text-sm text-gray-500">Progreso</p>
            <p className="text-3xl font-bold">{Math.round(porcentaje) || 0}%</p>
            <div className="h-2 bg-gray-200 rounded-full mt-2">
              <div className="h-2 bg-green-600 rounded-full" style={{ width: `${porcentaje || 0}%` }}></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="text-sm text-gray-500">Meta</p>
            <p className="text-3xl font-bold">${beneficiario.meta?.toLocaleString() || 0}</p>
          </div>
        </div>
      </div>
    </main>
  );
}