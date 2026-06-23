"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import DashboardNavbar from "@/components/DashboardNavbar";
import Link from "next/link";

export default function MisOfertas() {
  const { userId, isSignedIn } = useAuth();
  const router = useRouter();
  const [ofertas, setOfertas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (isSignedIn && userId) {
      cargarOfertas();
    }
  }, [isSignedIn, userId]);

  const cargarOfertas = async () => {
    const { data } = await supabase
      .from("ofertas_especie")
      .select("*")
      .eq("donante_id", userId)
      .order("created_at", { ascending: false });

    if (data) setOfertas(data);
    setCargando(false);
  };

  const subirComprobante = async (id) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,.pdf";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.url) {
        await supabase
          .from("ofertas_especie")
          .update({ 
            comprobante_url: data.url,
            estado: "entregado",
            fecha_entrega: new Date().toISOString()
          })
          .eq("id", id);
        cargarOfertas();
        alert(" Comprobante de entrega subido");
      }
    };
    input.click();
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case "pendiente": return "bg-yellow-100 text-yellow-800";
      case "entregado": return "bg-blue-100 text-blue-800";
      case "recibido": return "bg-green-100 text-green-800";
      case "completado": return "bg-green-600 text-white";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (cargando) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <main className="min-h-screen bg-gray-100">
      <DashboardNavbar />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8"> Mis Ofertas en Especie</h1>
        <p className="text-gray-500 mb-8">
          Aquí puedes ver el estado de tus ofertas de donación en especie.
        </p>

        {ofertas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <p className="text-gray-500">No has hecho ofertas en especie</p>
            <a href="/talentos" className="text-[#5E1A2F] hover:underline">Explorar talentos →</a>
          </div>
        ) : (
          <div className="space-y-4">
            {ofertas.map((oferta) => (
              <div key={oferta.id} className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{oferta.nombre}</h3>
                    <p className="text-sm text-gray-500">{oferta.descripcion}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Ofrecido el {new Date(oferta.fecha_oferta).toLocaleDateString()}
                    </p>
                    {oferta.comprobante_url && (
                      <a href={oferta.comprobante_url} target="_blank" className="text-blue-600 text-sm hover:underline">
                        Ver comprobante →
                      </a>
                    )}
                    <Link href={`/mis-ofertas/mensajes/${oferta.id}`} className="text-blue-600 text-sm hover:underline ml-3">
                       Mensajes
                    </Link>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(oferta.estado)}`}>
                      {oferta.estado === "pendiente" ? "Pendiente" :
                       oferta.estado === "entregado" ? "Entregado" :
                       oferta.estado === "recibido" ? "Recibido" : "Completado"}
                    </span>
                    <div className="mt-2">
                      {oferta.estado === "pendiente" && (
                        <button
                          onClick={() => subirComprobante(oferta.id)}
                          className="bg-[#5E1A2F] text-white px-3 py-1 rounded-lg text-xs hover:bg-[#7A243E] transition"
                        >
                          Subir comprobante
                        </button>
                      )}
                      {oferta.estado === "entregado" && (
                        <span className="text-xs text-blue-600"> Esperando confirmación</span>
                      )}
                      {oferta.estado === "recibido" && (
                        <span className="text-xs text-green-600"> Donación completada</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}