"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function DashboardNavbar() {
  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-[#E8DCCF] sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-[#5E1A2F] to-[#C6A43F] rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">64</span>
            </div>
            <span className="text-2xl font-bold text-[#5E1A2F]">Ruta 64</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/talentos" className="text-gray-600 hover:text-[#5E1A2F] transition-colors font-medium">
              Explorar talento
            </Link>
            <Link href="/mis-donaciones" className="text-gray-600 hover:text-[#5E1A2F] transition-colors font-medium">
              Mis donaciones
            </Link>
            <Link href="/donar-producto" className="text-gray-600 hover:text-[#5E1A2F] transition-colors font-medium">
              Donar ahora
            </Link>
            <Link href="/mis-ofertas" className="text-gray-600 hover:text-[#5E1A2F] transition-colors font-medium">
              Mis ofertas
            </Link>
            <Link href="/insignias" className="text-gray-600 hover:text-[#5E1A2F] transition-colors font-medium">
              Mis insignias
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
