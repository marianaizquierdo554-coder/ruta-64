"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import AdminNavbar from "@/components/AdminNavbar";

export default function FondoBecas() {
  const { userId, isSignedIn } = useAuth();
  const router = useRouter();
  const [registros, setRegistros] = useState([]);
  const [totales, setTotales] = useState({ total: 0, becas: 0, operacion: 0 });
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
      cargarDatos();
    }
  };

  const cargarDatos = async () => {
    const { data } = await supabase
      .from("fondo_becas")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) {
      setRegistros(data);
      const totales = data.reduce((acc, r) => ({
        total: acc.total + r.monto_total,
        becas: acc.becas + r.monto_beca,
        operacion: acc.operacion + r.monto_operacion
      }), { total: 0, becas: 0, operacion: 0 });
      setTotales(totales);
    }
    setCargando(false);
  };

  if (cargando) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <main className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <h1 className="text-3xl font-bold mb-2"> Fondo de Becas</h1>
        <p className="text-gray-500 mb-8">10% de cada inscripción a cursos se destina a becas</p>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <p className="text-sm text-gray-500">Total recaudado</p>
            <p className="text-3xl font-bold text-[#5E1A2F]">${totales.total.toFixed(2)} MXN</p>
          </div>
          <div className="bg-green-50 rounded-2xl shadow-md p-6 text-center border-2 border-green-200">
            <p className="text-sm text-green-600"> Fondo de becas (10%)</p>
            <p className="text-3xl font-bold text-green-600">${totales.becas.toFixed(2)} MXN</p>
          </div>
          <div className="bg-blue-50 rounded-2xl shadow-md p-6 text-center border-2 border-blue-200">
            <p className="text-sm text-blue-600">Operación (90%)</p>
            <p className="text-3xl font-bold text-blue-600">${totales.operacion.toFixed(2)} MXN</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">Curso</th>
                <th className="p-4 text-left">Donante</th>
                <th className="p-4 text-left">Total</th>
                <th className="p-4 text-left">Beca (10%)</th>
                <th className="p-4 text-left">Operación (90%)</th>
                <th className="p-4 text-left">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-4">{r.curso_nombre}</td>
                  <td className="p-4">{r.donante_email}</td>
                  <td className="p-4 font-bold">${r.monto_total.toFixed(2)}</td>
                  <td className="p-4 text-green-600">${r.monto_beca.toFixed(2)}</td>
                  <td className="p-4 text-blue-600">${r.monto_operacion.toFixed(2)}</td>
                  <td className="p-4 text-sm">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}