"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function CursoSuccessPage({ searchParams }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Obtener los datos de la sesión
    const fetchData = async () => {
      const sessionId = searchParams?.session_id;
      if (sessionId) {
        const res = await fetch(`/api/stripe-session?session_id=${sessionId}`);
        const data = await res.json();
        setData(data);
      }
      setLoading(false);
    };
    fetchData();
  }, [searchParams]);

  if (loading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <main className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold mb-4">¡Inscripción exitosa!</h1>
          <p className="text-gray-600 mb-6">
            Gracias por inscribirte. Tu apoyo hace la diferencia.
          </p>

          {/* Desglose de fondos */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
            <h2 className="font-bold mb-3">📊 Desglose de tu aportación</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total pagado</span>
                <span className="font-bold">${data?.total || 0} MXN</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-green-600">🌱 10% para becas</span>
                <span className="font-bold text-green-600">${data?.beca || 0} MXN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">90% para operación</span>
                <span className="font-bold">${data?.operacion || 0} MXN</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-400 mb-6">
            El 10% de tu inscripción se destina a becas para talento mexicano.
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/cursos" className="bg-[#5E1A2F] text-white px-6 py-2 rounded-xl hover:bg-[#7A243E] transition">
              Ver más cursos
            </Link>
            <Link href="/dashboard" className="border border-[#5E1A2F] text-[#5E1A2F] px-6 py-2 rounded-xl hover:bg-gray-50 transition">
              Ir a mi dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}