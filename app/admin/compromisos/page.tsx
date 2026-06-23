"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import AdminNavbar from "@/components/AdminNavbar";

export default function AdminCompromisos() {
  const { userId, isSignedIn } = useAuth();
  const router = useRouter();
  const [compromisos, setCompromisos] = useState([]);
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
      cargarCompromisos();
    }
  };

  const cargarCompromisos = async () => {
    const { data } = await supabase
      .from("compromisos_solidarios")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setCompromisos(data);
    setCargando(false);
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    await supabase
      .from("compromisos_solidarios")
      .update({ estado: nuevoEstado })
      .eq("id", id);
    cargarCompromisos();
  };

  if (cargando) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <main className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2"> Compromisos Solidarios</h1>
        <p className="text-gray-500 mb-8">Usuarios que prometieron donar después</p>

        {compromisos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <p className="text-gray-500">No hay compromisos registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl shadow-md">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left">Usuario</th>
                  <th className="p-4 text-left">Teléfono</th>
                  <th className="p-4 text-left">Monto</th>
                  <th className="p-4 text-left">Invitados</th>
                  <th className="p-4 text-left">Estado</th>
                  <th className="p-4 text-left">Fecha</th>
                  <th className="p-4 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {compromisos.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="p-4">{c.nombre || c.email}</td>
                    <td className="p-4">{c.telefono || "—"}</td>
                    <td className="p-4">${c.monto_comprometido?.toLocaleString()}</td>
                    <td className="p-4">{c.invitados?.length || 0}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        c.estado === "completado" ? "bg-green-100 text-green-800" :
                        c.estado === "recordado" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {c.estado}
                      </span>
                    </td>
                    <td className="p-4">{new Date(c.fecha_compromiso).toLocaleDateString()}</td>
                    <td className="p-4">
                      <select
                        onChange={(e) => cambiarEstado(c.id, e.target.value)}
                        defaultValue={c.estado}
                        className="p-1 border rounded-lg text-sm"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="recordado">Recordado</option>
                        <option value="completado">Completado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}