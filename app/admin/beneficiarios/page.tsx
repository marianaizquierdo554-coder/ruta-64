"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import AdminNavbar from "@/components/AdminNavbar";

export default function AdminBeneficiarios() {
  const { userId, isSignedIn } = useAuth();
  const router = useRouter();
  const [beneficiarios, setBeneficiarios] = useState([]);
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
      cargarBeneficiarios();
    }
  };

  const cargarBeneficiarios = async () => {
    const { data } = await supabase
      .from("beneficiarios")
      .select("*")
      .eq("rol", "beneficiario")
      .order("created_at", { ascending: false });
    
    if (data) setBeneficiarios(data);
    setCargando(false);
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    const { error } = await supabase
      .from("beneficiarios")
      .update({ estado: nuevoEstado })
      .eq("id", id);
    
    if (error) {
      alert("Error: " + error.message);
    } else {
      alert(`Estado cambiado a ${nuevoEstado}`);
      cargarBeneficiarios();
    }
  };

  if (cargando) return <div className="p-8 text-center">Cargando...</div>;

  const getEstadoColor = (estado) => {
    switch(estado) {
      case "activo": return "bg-green-100 text-green-800";
      case "advertencia": return "bg-yellow-100 text-yellow-800";
      case "suspendido": return "bg-red-100 text-red-800";
      case "cancelado": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Gestión de Beneficiarios</h1>
        <p className="text-gray-500 mb-8">Revisa el estado de los beneficiarios y su cumplimiento</p>

        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-2xl shadow-md">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">Nombre</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Meta</th>
                <th className="p-4 text-left">Último comprobante</th>
                <th className="p-4 text-left">Estado</th>
                <th className="p-4 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {beneficiarios.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="p-4">{b.nombre}</td>
                  <td className="p-4">{b.email}</td>
                  <td className="p-4">${b.meta?.toLocaleString()}</td>
                  <td className="p-4">{b.ultimo_comprobante ? new Date(b.ultimo_comprobante).toLocaleDateString() : "Nunca"}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getEstadoColor(b.estado)}`}>
                      {b.estado || "activo"}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      onChange={(e) => cambiarEstado(b.id, e.target.value)}
                      defaultValue={b.estado || "activo"}
                      className="p-1 border rounded-lg text-sm"
                    >
                      <option value="activo">Activo</option>
                      <option value="advertencia">Advertencia</option>
                      <option value="suspendido">Suspendido</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
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
