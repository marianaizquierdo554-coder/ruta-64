"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function DonarUnPesoSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-6xl mb-4"></div>
          <h1 className="text-2xl font-bold mb-4">¡Gracias por tu donación!</h1>
          <p className="text-gray-600 mb-4">
            Tu donación de <strong>$1 MXN</strong> se ha destinado completamente al <strong>Fondo de Becas</strong>.
          </p>
          <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-200">
            <p className="text-sm text-green-700">
              Esto se suma al fondo para becas de talento mexicano.
              Cada peso cuenta y transforma vidas.
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Link href="/" className="bg-[#5E1A2F] text-white px-6 py-2 rounded-xl hover:bg-[#7A243E] transition">
              Volver al inicio
            </Link>
            <Link href="/talentos" className="border border-[#5E1A2F] text-[#5E1A2F] px-6 py-2 rounded-xl hover:bg-gray-50 transition">
              Explorar talentos
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}