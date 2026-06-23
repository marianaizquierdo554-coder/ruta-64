"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import BeneficiarioNavbar from "@/components/BeneficiarioNavbar";
import Link from "next/link";

export default function BeneficiarioMensajes() {
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
    // Obtener el beneficiario_id del usuario
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (!profile) {
      setCargando(false);
      return;
    }

    const { data: beneficiario } = await supabase
      .from("beneficiarios")
      .select("id")
      .eq("profile_id", profile.id)
      .single();

    if (!beneficiario) {
      setCargando(false);
      return;
    }

    const { data } = await supabase
      .from("conversaciones")
      .select("*, ofertas_especie(nombre, estado)")
      .eq("beneficiario_id", beneficiario.id)
      .order("ultimo_mensaje_fecha", { ascending: false });

    if (data) setConversaciones(data);
    setCargando(false);
  };

  if (cargando) return <div className="p-8 text-center">Cargando conversaciones...</div>;

  return (
    <main className="min-h-screen bg-gray-100">
      <BeneficiarioNavbar />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">💬 Mis conversaciones</h1>
        <p className="text-gray-500 mb-8">Coordina la entrega de tus donaciones en especie</p>

        {conversaciones.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <p className="text-gray-500">No tienes conversaciones activas</p>
            <p className="text-sm text-gray-400 mt-2">Cuando recibas una oferta en especie, podrás chatear aquí</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversaciones.map((conv) => (
              <Link 
                key={conv.id} 
                href={`/beneficiario/mensajes/${conv.oferta_id}`}
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