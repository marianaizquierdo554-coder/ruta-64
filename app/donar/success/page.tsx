"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";

export default function DonarSuccessPage({ searchParams }) {
  const router = useRouter();
  const beneficiario = searchParams?.beneficiario || "";

  useEffect(() => {
    // Redirigir a la página de talentos después de 5 segundos
    const timer = setTimeout(() => {
      router.push("/talentos");
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-100">
      <DashboardNavbar />
      <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold mb-4">¡Gracias por tu apoyo!</h1>
          <p className="text-gray-600 mb-2">
            Tu donación ha sido procesada exitosamente.
          </p>
          {beneficiario && (
            <p className="text-gray-600 mb-6">
              Tu apoyo para <strong>{beneficiario}</strong> ya está en camino.
            </p>
          )}
          <p className="text-sm text-gray-500 mb-6">
            Recibirás un correo de confirmación con los detalles.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/talentos" className="bg-[#5E1A2F] text-white px-6 py-2 rounded-xl hover:bg-[#7A243E] transition">
              Explorar más talentos
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
