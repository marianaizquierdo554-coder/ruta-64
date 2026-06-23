"use client";

import { useState } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import Link from "next/link";

export default function MapaPage() {
  const [oficinaSeleccionada, setOficinaSeleccionada] = useState("villahermosa");

  const oficinas = {
    villahermosa: {
      nombre: "Cluster ITMx - Villahermosa",
      direccion: "Periferico Carlos Pellicer Camara 100, Miguel Hidalgo I Etapa, CP 86150, Villahermosa, Tabasco",
      horario: "Lunes a Viernes: 9:00 AM - 6:00 PM",
      telefono: "+52 (993) 123 4567",
      mapsUrl: `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent("Periferico Carlos Pellicer Camara 100, Villahermosa, Tabasco")}&zoom=15`
    },
    cdmx: {
      nombre: "Cluster ITMx - Ciudad de Mexico",
      direccion: "Rincon Leones 30, Bosque del Sur, Xochimilco, CP 16010, Ciudad de Mexico",
      horario: "Lunes a Viernes: 9:00 AM - 6:00 PM",
      telefono: "+52 (55) 1234 5678",
      mapsUrl: `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent("Rincon Leones 30, Xochimilco, CDMX")}&zoom=15`
    }
  };

  const ofi = oficinas[oficinaSeleccionada];

  return (
    <main className="min-h-screen bg-gray-100">
      <DashboardNavbar />
      
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2"> Puntos de Entrega</h1>
          <p className="text-gray-500">
            Puedes entregar tus donaciones fisicas en nuestras oficinas o solicitar una recoleccion a domicilio.
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setOficinaSeleccionada("villahermosa")}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition ${
              oficinaSeleccionada === "villahermosa"
                ? "bg-[#5E1A2F] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
             Villahermosa
          </button>
          <button
            onClick={() => setOficinaSeleccionada("cdmx")}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition ${
              oficinaSeleccionada === "cdmx"
                ? "bg-[#5E1A2F] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Ciudad de Mexico
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="h-96 w-full">
              <iframe
                src={ofi.mapsUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-[#5E1A2F]">{ofi.nombre}</h2>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="text-xl"></span>
                <div>
                  <p className="font-medium">Direccion</p>
                  <p className="text-gray-600 text-sm">{ofi.direccion}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-xl"></span>
                <div>
                  <p className="font-medium">Horario de atencion</p>
                  <p className="text-gray-600 text-sm">{ofi.horario}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-xl"></span>
                <div>
                  <p className="font-medium">Telefono</p>
                  <p className="text-gray-600 text-sm">{ofi.telefono}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-[#5E1A2F] to-[#7A243E] rounded-2xl p-6 text-white">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2"> ¿No estas cerca de nuestras oficinas?</h3>
            <p className="text-sm opacity-90 mb-4">
              Ofrecemos servicio de recoleccion a domicilio para articulos de alto valor en todo el pais.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button className="bg-white text-[#5E1A2F] px-6 py-2 rounded-xl font-semibold text-sm hover:bg-gray-100 transition">
                Solicitar recoleccion
              </button>
              <Link href="/contacto" className="border border-white text-white px-6 py-2 rounded-xl font-semibold text-sm hover:bg-white/10 transition">
                Contactar para mas informacion
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
             Al entregar tu donacion, recibiras un comprobante fiscal y tu constancia de deduccion de impuestos.
          </p>
        </div>
      </div>
    </main>
  );
}