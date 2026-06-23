"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import DashboardNavbar from "@/components/DashboardNavbar";
import Link from "next/link";

export default function MisConversaciones() {
  const { userId, isSignedIn } = useAuth();
  const router = useRouter();
  const [conversaciones, setConversaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (isSignedIn && userId) {
      cargarConversaciones();
    }
  }, [isSignedIn, userId]);

  const cargarConversaciones = async () => {
    // Obtener conversaciones donde el usuario es donante
    const { data: comoDonante } = await supabase
      .from("conversaciones")
      .select("*, ofertas_especie(nombre, estado)")
      .eq("donante_id", userId)
      .order("ultimo_mensaje_fecha", { ascending: false });

    // Obtener conversaciones donde el usuario es beneficiario
    const { data: comoBeneficiario } = await supabase
      .from("conversaciones")
      .select("*, ofertas_especie(nombre, estado)")
      .eq("beneficiario_id", userId)
      .order("ultimo_mensaje_fecha", { ascending: false });

    const todas = [...(comoDonante || []), ...(comoBeneficiario || [])];
    // Eliminar duplicados
    const unicas = todas.filter((conv, index, self) => 
      index === self.findIndex(c => c.oferta_id === conv.oferta_id)
    );
    setConversaciones(unicas);
    setCargando(false);
  };

  if (cargando) return <div className="p-8 text-center">Cargando conversaciones...</div>;

  return (
    <main className="min-h-screen bg-gray-100">
      <DashboardNavbar />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2"> Mis conversaciones</h1>
        <p className="text-gray-500 mb-8">Coordina la entrega de tus donaciones en especie</p>

        {conversaciones.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <p className="text-gray-500">No tienes conversaciones activas</p>
            <p className="text-sm text-gray-400 mt-2">Cuando ofrezcas una donación en especie, podrás chatear aquí</p>
            <Link href="/talentos" className="inline-block mt-4 bg-[#5E1A2F] text-white px-6 py-2 rounded-xl hover:bg-[#7A243E] transition">
              Explorar talentos
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {conversaciones.map((conv) => (
              <Link 
                key={conv.id} 
                href={`/mis-ofertas/mensajes/${conv.oferta_id}`}
                className="block bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{conv.ofertas_especie?.nombre}</h3>
                    <p className="text-sm text-gray-500 truncate max-w-xs">
                      {conv.ultimo_mensaje || "Inicia la conversación"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      conv.ofertas_especie?.estado === "pendiente" ? "bg-yellow-100 text-yellow-800" :
                      conv.ofertas_especie?.estado === "entregado" ? "bg-blue-100 text-blue-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {conv.ofertas_especie?.estado || "pendiente"}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {conv.ultimo_mensaje_fecha ? new Date(conv.ultimo_mensaje_fecha).toLocaleDateString() : ""}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}