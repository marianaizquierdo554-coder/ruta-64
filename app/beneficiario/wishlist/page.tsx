"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import BeneficiarioNavbar from "@/components/BeneficiarioNavbar";

export default function WishlistPage() {
  const { userId, isSignedIn } = useAuth();
  const router = useRouter();
  const [beneficiarioId, setBeneficiarioId] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nuevoItem, setNuevoItem] = useState({
    nombre: "",
    descripcion: "",
    urgencia: "necesario",
    cantidad: 1
  });

  useEffect(() => {
    if (isSignedIn && userId) {
      obtenerBeneficiario();
    }
  }, [isSignedIn, userId]);

  const obtenerBeneficiario = async () => {
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
        setBeneficiarioId(beneficiario.id);
        cargarWishlist(beneficiario.id);
      } else {
        router.push("/beneficiario/completar-perfil");
      }
    }
    setCargando(false);
  };

  const cargarWishlist = async (id) => {
    const { data } = await supabase
      .from("wishlist")
      .select("*")
      .eq("beneficiario_id", id)
      .order("created_at", { ascending: false });
    
    if (data) setWishlist(data);
  };

  const handleChange = (e) => {
    setNuevoItem({ ...nuevoItem, [e.target.name]: e.target.value });
  };

  const agregarItem = async () => {
    if (!nuevoItem.nombre.trim()) {
      alert("Ingresa el nombre del artículo");
      return;
    }

    const { data, error } = await supabase
      .from("wishlist")
      .insert({
        beneficiario_id: beneficiarioId,
        nombre: nuevoItem.nombre,
        descripcion: nuevoItem.descripcion,
        urgencia: nuevoItem.urgencia,
        cantidad: parseInt(nuevoItem.cantidad) || 1
      })
      .select();

    if (error) {
      alert("Error: " + error.message);
    } else {
      setWishlist([data[0], ...wishlist]);
      setNuevoItem({ nombre: "", descripcion: "", urgencia: "necesario", cantidad: 1 });
    }
  };

  const eliminarItem = async (id) => {
    await supabase.from("wishlist").delete().eq("id", id);
    setWishlist(wishlist.filter(i => i.id !== id));
  };

  if (cargando) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <main className="min-h-screen bg-gray-100">
      <BeneficiarioNavbar />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8"> Mi Lista de Deseos</h1>
        <p className="text-gray-500 mb-8">
          Agrega los artículos que necesitas para tus estudios. Los donantes podrán ver esta lista y ofrecerte ayuda.
        </p>

        {/* Formulario para agregar */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Agregar artículo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre del artículo *"
              value={nuevoItem.nombre}
              onChange={handleChange}
              className="p-3 border rounded-xl"
            />
            <input
              type="text"
              name="descripcion"
              placeholder="Descripción"
              value={nuevoItem.descripcion}
              onChange={handleChange}
              className="p-3 border rounded-xl"
            />
            <select
              name="urgencia"
              value={nuevoItem.urgencia}
              onChange={handleChange}
              className="p-3 border rounded-xl"
            >
              <option value="necesario">Necesario</option>
              <option value="urgente">Urgente</option>
              <option value="bajo">Baja prioridad</option>
            </select>
            <input
              type="number"
              name="cantidad"
              placeholder="Cantidad"
              value={nuevoItem.cantidad}
              onChange={handleChange}
              className="p-3 border rounded-xl"
              min="1"
            />
          </div>
          <button
            onClick={agregarItem}
            className="mt-4 bg-[#5E1A2F] text-white px-6 py-2 rounded-xl hover:bg-[#7A243E] transition"
          >
            + Agregar a la lista
          </button>
        </div>

        {/* Lista de deseos */}
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <p className="text-gray-500">No tienes artículos en tu lista de deseos</p>
            <p className="text-sm text-gray-400 mt-2">Agrega los productos que necesitas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {wishlist.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-md p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold">{item.nombre}</p>
                  <p className="text-sm text-gray-500">{item.descripcion}</p>
                  <div className="flex gap-3 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.urgencia === "urgente" ? "bg-red-100 text-red-600" : 
                      item.urgencia === "bajo" ? "bg-gray-100 text-gray-600" : 
                      "bg-yellow-100 text-yellow-600"
                    }`}>
                      {item.urgencia === "urgente" ? "Urgente" : item.urgencia === "bajo" ? "Baja" : "Necesario"}
                    </span>
                    <span className="text-xs text-gray-400">Cantidad: {item.cantidad || 1}</span>
                  </div>
                </div>
                <button
                  onClick={() => eliminarItem(item.id)}
                  className="text-red-600 text-sm hover:underline"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}