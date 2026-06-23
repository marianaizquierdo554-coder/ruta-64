"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import AdminNavbar from "@/components/AdminNavbar";

export default function AdminOfertas() {
  const { userId, isSignedIn } = useAuth();
  const router = useRouter();
  const [ofertas, setOfertas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (isSignedIn && userId) {
      verificarAdmin();
    }
  }, [isSignedIn, userId]);

  const verificarAdmin = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("rol")
      .eq("clerk_user_id", userId)
      .single();
    
    if (data?.rol !== "admin") {
      router.push("/dashboard");
    } else {
      cargarOfertas();
    }
  };

  const cargarOfertas = async () => {
    const { data } = await supabase
      .from("ofertas_especie")
      .select("*, beneficiarios(nombre, email)")
      .eq("estado", "pendiente")
      .order("created_at", { ascending: false });
    
    if (data) setOfertas(data);
    setCargando(false);
  };

  const aceptarOferta = async (ofertaId, wishlistId) => {
    await supabase
      .from("ofertas_especie")
      .update({ estado: "aprobado" })
      .eq("id", ofertaId);
    
    // El artículo queda como ofrecido (no vuelve a aparecer)
    alert(" Oferta aceptada. El artículo ya no estará disponible.");
    cargarOfertas();
  };

  const rechazarOferta = async (ofertaId, wishlistId) => {
    // Reactivar el artículo en la wishlist
    if (wishlistId) {
      await supabase
        .from("wishlist")
        .update({ 
          ofrecido: false,
          oferta_activa_id: null
        })
        .eq("id", wishlistId);
    }

    await supabase
      .from("ofertas_especie")
      .update({ estado: "rechazado" })
      .eq("id", ofertaId);
    
    alert(" Oferta rechazada. El artículo vuelve a estar disponible.");
    cargarOfertas();
  };

  if (cargando) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <main className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2"> Ofertas en Especie</h1>
        <p className="text-gray-500 mb-8">Revisa las ofertas de donaciones en especie</p>

        {ofertas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <p className="text-gray-500">No hay ofertas pendientes</p>
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
                      Donante: {oferta.donante_id}
                    </p>
                    <p className="text-xs text-gray-400">
                      Beneficiario: {oferta.beneficiarios?.nombre}
                    </p>
                    <p className="text-xs text-gray-400">
                      Ofrecido el {new Date(oferta.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => aceptarOferta(oferta.id, oferta.wishlist_id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition"
                    >
                      ✓ Aceptar
                    </button>
                    <button
                      onClick={() => rechazarOferta(oferta.id, oferta.wishlist_id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition"
                    >
                      ✗ Rechazar
                    </button>
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