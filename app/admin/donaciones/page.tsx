import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import AdminNavbar from "@/components/AdminNavbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default async function DonacionesPage() {
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

  // Obtener donaciones pendientes y completadas
  const { data: donaciones } = await supabase
    .from("donaciones_usuarios")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-gray-50">
      <AdminNavbar />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Gestionar Donaciones</h1>
        
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-4">Usuario</th>
                <th className="text-left p-4">Título</th>
                <th className="text-left p-4">Estado del producto</th>
                <th className="text-left p-4">Estado donación</th>
                <th className="text-left p-4">Fecha</th>
                <th className="text-left p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {donaciones?.map((donacion) => (
                <tr key={donacion.id} className="border-t">
                  <td className="p-4">{donacion.user_id?.slice(0, 12)}...</td>
                  <td className="p-4 font-medium">{donacion.titulo}</td>
                  <td className="p-4">
                    {donacion.estado_producto === "nuevo" ? "Nuevo" : "En uso"}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      donacion.estado_donacion === "aceptada" ? "bg-green-100 text-green-700" :
                      donacion.estado_donacion === "rechazada" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {donacion.estado_donacion || "pendiente"}
                    </span>
                  </td>
                  <td className="p-4">
                    {new Date(donacion.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 space-x-2">
                    <button className="text-green-600 hover:underline text-sm">Aceptar</button>
                    <button className="text-red-600 hover:underline text-sm">Rechazar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
