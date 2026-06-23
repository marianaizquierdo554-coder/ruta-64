"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import DashboardNavbar from "@/components/DashboardNavbar";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const estados = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
  "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima",
  "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo",
  "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca",
  "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa",
  "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
];

const categorias = ["Estudiante", "Investigador", "Creador", "Emprendedor", "Salud"];

export default function TalentosPage() {
  const [talentos, setTalentos] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("");
  const [categoria, setCategoria] = useState("");

  useEffect(() => {
    cargarTalentos();
  }, []);

  useEffect(() => {
    filtrarTalentos();
  }, [busqueda, estado, categoria, talentos]);

  const cargarTalentos = async () => {
    setCargando(true);
    const { data } = await supabase
      .from("beneficiarios")
      .select("*")
      .eq("validado", true)
      .eq("estado_cuenta", "activo") 
      .order("created_at", { ascending: false });
    
    if (data) {
      setTalentos(data);
      setFiltrados(data);
    }
    setCargando(false);
  };

  const filtrarTalentos = () => {
    let resultados = [...talentos];
    
    if (busqueda) {
      resultados = resultados.filter(t => 
        t.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        t.historia?.toLowerCase().includes(busqueda.toLowerCase())
      );
    }
    
    if (estado && estado !== "Todos") {
      resultados = resultados.filter(t => t.estado === estado);
    }
    
    if (categoria && categoria !== "Todos") {
      resultados = resultados.filter(t => t.tipo === categoria);
    }
    
    setFiltrados(resultados);
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setEstado("");
    setCategoria("");
  };

  if (cargando) {
    return (
      <main className="min-h-screen bg-gray-100">
        <DashboardNavbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p>Cargando talentos...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <DashboardNavbar />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-2">Explorar Talento</h1>
        <p className="text-center text-gray-500 mb-8">
          Conoce a los estudiantes, investigadores y creadores que necesitan tu apoyo
        </p>

        {/* Buscador y filtros */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Localiza talento académico nacional</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Nombre o Palabra Clave (Ej. Ingeniería de Software)"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="p-3 border rounded-xl text-sm"
            />
            
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="p-3 border rounded-xl text-sm bg-white"
            >
              <option value="">Selector de Estado (Todos)</option>
              {estados.map((est) => (
                <option key={est} value={est}>{est}</option>
              ))}
            </select>
            
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="p-3 border rounded-xl text-sm bg-white"
            >
              <option value="">Selector de Categoría (Todos los estudiantes)</option>
              <option value="Estudiante">Estudiante</option>
              <option value="Investigador">Investigador</option>
              <option value="Creador">Creador</option>
              <option value="Emprendedor">Emprendedor</option>
              <option value="Salud">Salud</option>
            </select>
          </div>
          
          <button
            onClick={limpiarFiltros}
            className="bg-[#5E1A2F] text-white px-6 py-2 rounded-xl text-sm hover:bg-[#7A243E] transition"
          >
            Buscar
          </button>
        </div>

        {/* Resultados y contador */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-500 text-sm">{filtrados.length} talentos encontrados</p>
          <select className="text-sm border rounded-lg p-2">
            <option>Ordenar por: Relevancia</option>
            <option>Reciente</option>
            <option>Más recaudado</option>
          </select>
        </div>

        {filtrados.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-md">
            <p className="text-gray-500">No hay talentos que coincidan con tu búsqueda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtrados.map((talento) => {
              const porcentaje = (talento.monto_recaudado || 0) / (talento.meta || 1) * 100;
              return (
                <div key={talento.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
                  {talento.video_url && (
                    <div className="aspect-video bg-gray-200">
                      <iframe src={talento.video_url} className="w-full h-full" allowFullScreen />
                    </div>
                  )}
                  {!talento.video_url && (
                    <div className="aspect-video bg-gradient-to-r from-[#5E1A2F] to-[#7A243E] flex items-center justify-center text-white text-4xl">
                      
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-xl font-bold">{talento.nombre || "Beneficiario"}</h3>
                    <p className="text-gray-500 text-sm mt-1">{talento.tipo || "Estudiante"}</p>
                    <p className="text-gray-400 text-xs mt-1"> {talento.estado || "México"}</p>
                    
                    {talento.historia && (
                      <p className="text-gray-600 text-sm mt-2 line-clamp-2">{talento.historia}</p>
                    )}
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progreso</span>
                        <span>{Math.round(porcentaje)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-[#C6A43F] rounded-full" style={{ width: `${porcentaje}%` }}></div>
                      </div>
                      <div className="flex justify-between mt-2 text-sm">
                        <span className="font-bold">${(talento.monto_recaudado || 0).toLocaleString()}</span>
                        <span className="text-gray-400">Meta: ${(talento.meta || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <Link href={`/donar?id=${talento.id}`}>
                      <button className="w-full mt-5 bg-[#5E1A2F] text-white py-2 rounded-xl font-semibold hover:bg-[#7A243E] transition">
                        Donar ahora
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}