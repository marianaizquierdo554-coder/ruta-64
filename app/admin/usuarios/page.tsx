import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import AdminNavbar from "@/components/AdminNavbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default async function UsuariosPage() {
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

  // Obtener todos los usuarios
  const { data: usuarios } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-gray-50">
      <AdminNavbar />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Gestión de Usuarios</h1>
        
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-4">Nombre</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Rol</th>
                <th className="text-left p-4">Estado</th>
                <th className="text-left p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios?.map((usuario) => (
                <tr key={usuario.id} className="border-t">
                  <td className="p-4">{usuario.full_name || "—"}</td>
                  <td className="p-4">{usuario.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      usuario.rol === "admin" ? "bg-red-100 text-red-700" :
                      usuario.rol === "beneficiario" ? "bg-green-100 text-green-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {usuario.rol || "donante"}
                    </span>
                  </td>
                  <td className="p-4">
                    {usuario.validado ? (
                      <span className="text-green-600">✓ Validado</span>
                    ) : (
                      <span className="text-yellow-600">⏳ Pendiente</span>
                    )}
                  </td>
                  <td className="p-4">
                    <button className="text-blue-600 hover:underline text-sm">Editar</button>
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
