"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function AdminNavbar() {
  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-[#E8DCCF] sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">64</span>
            </div>
            <span className="text-2xl font-bold text-red-700">Admin Ruta 64</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/admin" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
              Dashboard
            </Link>
            <Link href="/admin/validar" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
              Validar
            </Link>
            <Link href="/admin/usuarios" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
              Usuarios
            </Link>
            <Link href="/admin/donaciones" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
              Donaciones
            </Link>
            <Link href="/admin/subastas" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
              Subastas
            </Link>
            <Link href="/admin/cursos" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
              Cursos
            </Link>
            <Link href="/admin/beneficiarios" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
              Beneficiarios
            </Link>
            <Link href="/admin/ofertas" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
              Ofertas
            </Link>
            <Link href="/admin/fondo-becas" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
              Fondo Becas
            </Link>
            <Link href="/admin/reportes" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
              Reportes
            </Link>
            <Link href="/admin/configuracion" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
              Configuración
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