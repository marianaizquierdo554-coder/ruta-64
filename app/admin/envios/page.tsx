"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import AdminNavbar from "@/components/AdminNavbar";

export default function AdminEnvios() {
  const { userId, isSignedIn } = useAuth();
  const router = useRouter();
  const [envios, setEnvios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState(null);
  const [ofertas, setOfertas] = useState([]);
  const [formData, setFormData] = useState({
    direccionOrigen: "",
    direccionDestino: "",
    peso: "",
    dimensiones: ""
  });

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
      cargarEnvios();
      cargarOfertasPendientes();
    }
  };

  const cargarEnvios = async () => {
    const { data } = await supabase
      .from("envios")
      .select("*, ofertas_especie(nombre, donante_id, beneficiario_id)")
      .order("created_at", { ascending: false });
    
    if (data) setEnvios(data);
    setCargando(false);
  };

  const cargarOfertasPendientes = async () => {
    const { data } = await supabase
      .from("ofertas_especie")
      .select("*")
      .eq("estado", "pendiente")
      .order("created_at", { ascending: false });
    
    if (data) setOfertas(data);
  };

  const generarGuia = async (ofertaId) => {
    const res = await fetch("/api/envios/generar-guia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ofertaId,
        direccionOrigen: formData.direccionOrigen,
        direccionDestino: formData.direccionDestino,
        peso: formData.peso,
        dimensiones: formData.dimensiones
      })
    });
    const data = await res.json();
    if (data.success) {
      alert(` Guía generada! Número de seguimiento: ${data.numeroSeguimiento}`);
      setMostrarFormulario(false);
      setFormData({ direccionOrigen: "", direccionDestino: "", peso: "", dimensiones: "" });
      cargarEnvios();
      cargarOfertasPendientes();
    } else {
      alert("Error: " + data.error);
    }
  };

  const actualizarSeguimiento = async (envioId, estado, ubicacion, descripcion) => {
    await fetch("/api/envios/seguimiento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ envioId, estado, ubicacion, descripcion })
    });
    cargarEnvios();
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case "pendiente": return "bg-yellow-100 text-yellow-800";
      case "enviado": return "bg-blue-100 text-blue-800";
      case "en_transito": return "bg-purple-100 text-purple-800";
      case "entregado": return "bg-green-100 text-green-800";
      case "devuelto": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (cargando) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <main className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <h1 className="text-3xl font-bold mb-2"> Envíos y Logística</h1>
        <p className="text-gray-500 mb-8">Gestiona los envíos de donaciones en especie</p>

        {/* Botón para nueva guía */}
        <button
          onClick={() => setMostrarFormulario(true)}
          className="bg-[#5E1A2F] text-white px-4 py-2 rounded-lg mb-6 hover:bg-[#7A243E] transition"
        >
          + Generar guía de envío
        </button>

        {/* Formulario para generar guía */}
        {mostrarFormulario && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">Generar guía de envío</h2>
            
            <select
              onChange={(e) => {
                const oferta = ofertas.find(o => o.id === parseInt(e.target.value));
                setOfertaSeleccionada(oferta);
              }}
              className="w-full p-2 border rounded-lg mb-3"
            >
              <option value="">Selecciona una oferta pendiente</option>
              {ofertas.map(o => (
                <option key={o.id} value={o.id}>{o.nombre} - {o.donante_id}</option>
              ))}
            </select>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Dirección de origen"
                value={formData.direccionOrigen}
                onChange={(e) => setFormData({...formData, direccionOrigen: e.target.value})}
                className="p-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Dirección de destino"
                value={formData.direccionDestino}
                onChange={(e) => setFormData({...formData, direccionDestino: e.target.value})}
                className="p-2 border rounded-lg"
              />
              <input
                type="number"
                placeholder="Peso (kg)"
                value={formData.peso}
                onChange={(e) => setFormData({...formData, peso: e.target.value})}
                className="p-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Dimensiones (cm)"
                value={formData.dimensiones}
                onChange={(e) => setFormData({...formData, dimensiones: e.target.value})}
                className="p-2 border rounded-lg"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => generarGuia(ofertaSeleccionada?.id)}
                disabled={!ofertaSeleccionada}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                Generar guía
              </button>
              <button
                onClick={() => setMostrarFormulario(false)}
                className="bg-gray-300 px-4 py-2 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de envíos */}
        {envios.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <p className="text-gray-500">No hay envíos registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl shadow-md">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left">Seguimiento</th>
                  <th className="p-4 text-left">Artículo</th>
                  <th className="p-4 text-left">Destino</th>
                  <th className="p-4 text-left">Estado</th>
                  <th className="p-4 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {envios.map((envio) => (
                  <tr key={envio.id} className="border-t">
                    <td className="p-4">
                      <span className="font-mono text-sm font-bold">{envio.numero_seguimiento}</span>
                    </td>
                    <td className="p-4">{envio.ofertas_especie?.nombre}</td>
                    <td className="p-4 text-sm">{envio.direccion_destino}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getEstadoColor(envio.estado)}`}>
                        {envio.estado}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        onChange={(e) => {
                          const estado = e.target.value;
                          const ubicacion = prompt("Ubicación actual:");
                          const descripcion = prompt("Descripción:");
                          if (ubicacion && descripcion) {
                            actualizarSeguimiento(envio.id, estado, ubicacion, descripcion);
                          }
                        }}
                        className="p-1 border rounded-lg text-sm"
                        defaultValue={envio.estado}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="enviado">Enviado</option>
                        <option value="en_transito">En tránsito</option>
                        <option value="entregado">Entregado</option>
                        <option value="devuelto">Devuelto</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}