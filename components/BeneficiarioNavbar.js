"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function BeneficiarioNavbar() {
  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-[#E8DCCF] sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/beneficiario/portal" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">64</span>
            </div>
            <span className="text-2xl font-bold text-green-700">Ruta 64 Beneficiario</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/beneficiario/portal" className="text-gray-600 hover:text-green-600 transition-colors font-medium">
              Inicio
            </Link>
            <Link href="/beneficiario/perfil" className="text-gray-600 hover:text-green-600 transition-colors font-medium">
              Mi perfil
            </Link>
          
            <Link href="/beneficiario/comprobantes" className="text-gray-600 hover:text-green-600 transition-colors font-medium">
              Comprobantes
            </Link>
            <Link href="/beneficiario/wishlist" className="text-gray-600 hover:text-green-600 transition-colors font-medium">
              Lista de deseos
            </Link>
            <Link href="/beneficiario/confirmar-entregas" className="text-gray-600 hover:text-green-600 transition-colors font-medium">
              Confirmar entregas
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </nav>
  );
}
