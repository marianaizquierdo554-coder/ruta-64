import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import DashboardNavbar from "@/components/DashboardNavbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default async function MisDonacionesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Todas las tablas de donaciones
  const consultas = [
    { 
      nombre: "donaciones_especie", 
      tipo: "En Especie",
      mapeo: (d) => ({ ...d, nombre_item: d.producto_nombre || d.item || "Producto", monto: d.valor_estimado })
    },
    { 
      nombre: "donacion_proyecto", 
      tipo: "Proyecto Educativo",
      mapeo: (d) => ({ ...d, nombre_item: d.proyecto_nombre || "Proyecto", monto: d.monto })
    },
    { 
      nombre: "donaciones_salud", 
      tipo: "Salud",
      mapeo: (d) => ({ ...d, nombre_item: d.tratamiento_nombre || "Apoyo de salud", monto: d.monto })
    },
    { 
      nombre: "algarabia_donaciones", 
      tipo: "Algarabía",
      mapeo: (d) => ({ ...d, nombre_item: d.evento_nombre || "Donación Algarabía", monto: d.monto })
    },
    { 
      nombre: "donation_volunteer_requests", 
      tipo: "Voluntariado",
      mapeo: (d) => ({ ...d, nombre_item: d.causa_nombre || "Voluntariado", monto: null })
    }
  ];

  let todasLasDonaciones = [];

  for (const consulta of consultas) {
    try {
      const { data } = await supabase
        .from(consulta.nombre)
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        const mapeadas = data.map(d => ({
          ...consulta.mapeo(d),
          id_original: d.id,
          tabla: consulta.nombre,
          tipo: consulta.tipo,
          fecha: d.created_at,
          estado: d.estado || "completado"
        }));
        todasLasDonaciones.push(...mapeadas);
      }
    } catch (error) {
      console.error(`Error en ${consulta.nombre}:`, error);
    }
  }

  // Ordenar por fecha más reciente
  todasLasDonaciones.sort((a, b) => 
    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">Mis Donaciones</h1>
        <p className="text-gray-500 mb-8">Todo lo que has donado en Ruta 64</p>

        {todasLasDonaciones.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <p className="text-gray-500 text-lg">No has realizado donaciones aún</p>
            <a href="/talentos" className="text-blue-600 mt-4 inline-block">Explorar talentos →</a>
          </div>
        ) : (
          <div className="space-y-4">
            {todasLasDonaciones.map((donacion, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 mb-2">
                      {donacion.tipo}
                    </span>
                    <h3 className="font-bold text-lg">
                      {donacion.nombre_item || "Donación"}
                    </h3>
                    {donacion.monto && (
                      <p className="text-green-600 font-semibold">
                        ${donacion.monto.toLocaleString()}
                      </p>
                    )}
                    <p className="text-gray-500 text-sm">
                      {new Date(donacion.fecha).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-green-600 text-sm capitalize">
                    {donacion.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
