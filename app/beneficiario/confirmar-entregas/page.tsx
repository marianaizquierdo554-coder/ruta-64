"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import BeneficiarioNavbar from "@/components/BeneficiarioNavbar";

export default function ConfirmarEntregas() {
  const { userId, isSignedIn } = useAuth();
  const router = useRouter();
  const [entregas, setEntregas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (isSignedIn && userId) {
      cargarEntregas();
    }
  }, [isSignedIn, userId]);

  const cargarEntregas = async () => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (profile) {
      const { data: beneficiario } = await supabase
        .from("beneficiarios")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

      if (beneficiario) {
        const { data } = await supabase
          .from("ofertas_especie")
          .select("*")
          .eq("beneficiario_id", beneficiario.id)
          .eq("estado", ["entregado"])
          .order("created_at", { ascending: false });

        if (data) setEntregas(data);
      }
    }
    setCargando(false);
  };

  const confirmarRecepcion = async (id) => {
    await supabase
      .from("ofertas_especie")
      .update({ estado: "recibido", fecha_confirmacion: new Date().toISOString() })
      .eq("id", id);
    cargarEntregas();
    alert(" Donación confirmada");
  };

  if (cargando) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <main className="min-h-screen bg-gray-100">
      <BeneficiarioNavbar />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8"> Confirmar entregas</h1>
        <p className="text-gray-500 mb-8">
          Aquí puedes confirmar que has recibido las donaciones en especie.
        </p>

        {entregas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <p className="text-gray-500">No hay entregas pendientes de confirmar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entregas.map((entrega) => (
              <div key={entrega.id} className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{entrega.nombre}</h3>
                    <p className="text-sm text-gray-500">{entrega.descripcion}</p>
                    {entrega.comprobante_url && (
                      <a href={entrega.comprobante_url} target="_blank" className="text-blue-600 text-sm hover:underline">
                        Ver comprobante de entrega →
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => confirmarRecepcion(entrega.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition"
                  >
                    ✓ Confirmar recepción
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}