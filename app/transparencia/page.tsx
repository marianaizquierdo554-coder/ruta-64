"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import DashboardNavbar from "@/components/DashboardNavbar";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function TransparenciaPage() {
  const [comprobantes, setComprobantes] = useState([]);
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [beneficiarioSeleccionado, setBeneficiarioSeleccionado] = useState("todos");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    
    // Cargar beneficiarios validados
    const { data: benefData } = await supabase
      .from("beneficiarios")
      .select("id, nombre")
      .eq("validado", true);
    
    if (benefData) setBeneficiarios(benefData);
    
    // Cargar todos los comprobantes
    const { data: compData } = await supabase
      .from("comprobantes")
      .select("*, beneficiarios(nombre)")
      .order("created_at", { ascending: false });
    
    if (compData) setComprobantes(compData);
    
    setCargando(false);
  };

  const comprobantesFiltrados = beneficiarioSeleccionado === "todos" 
    ? comprobantes 
    : comprobantes.filter(c => c.beneficiario_id == beneficiarioSeleccionado);

  return (
    <main className="min-h-screen bg-gray-100">
      <DashboardNavbar />
      
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Reporte de Transparencia</h1>
          <p className="text-gray-500">
            Aquí puedes ver cómo se utilizan los fondos. Cada gasto está respaldado por facturas y comprobantes.
          </p>
        </div>

        {/* Filtro por beneficiario */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Filtrar por beneficiario:</span>
            <select
              value={beneficiarioSeleccionado}
              onChange={(e) => setBeneficiarioSeleccionado(e.target.value)}
              className="p-2 border rounded-lg text-sm"
            >
              <option value="todos">Todos los beneficiarios</option>
              {beneficiarios.map(b => (
                <option key={b.id} value={b.id}>{b.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de comprobantes */}
        {cargando ? (
          <div className="text-center py-20">
            <p>Cargando...</p>
          </div>
        ) : comprobantesFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4"></div>
            <p className="text-gray-500">No hay comprobantes de gastos disponibles aún</p>
            <p className="text-sm text-gray-400 mt-2">Los beneficiarios subirán sus facturas y recibos aquí</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comprobantesFiltrados.map((comp) => (
              <div key={comp.id} className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🧾</span>
                      <h3 className="font-bold text-lg">{comp.titulo}</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{comp.descripcion}</p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="text-[#5E1A2F] font-medium">Monto: ${comp.monto?.toLocaleString() || 0} MXN</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-500">Fecha: {new Date(comp.fecha_gasto).toLocaleDateString()}</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-500">Beneficiario: {comp.beneficiarios?.nombre}</span>
                    </div>
                  </div>
                  {comp.imagen_url && (
                    <a 
                      href={comp.imagen_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-shrink-0"
                    >
                      <img 
                        src={comp.imagen_url} 
                        alt="Comprobante" 
                        className="w-24 h-24 object-cover rounded-lg border hover:opacity-80 transition"
                      />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resumen de transparencia */}
        <div className="mt-8 bg-gradient-to-r from-[#5E1A2F] to-[#7A243E] rounded-2xl p-6 text-white text-center">
          <p className="text-sm opacity-90">100% Transparencia</p>
          <p className="text-xs opacity-75 mt-1">Cada peso está respaldado por evidencia documental</p>
        </div>
      </div>
    </main>
  );
}