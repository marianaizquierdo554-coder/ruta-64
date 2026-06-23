"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import BeneficiarioNavbar from "@/components/BeneficiarioNavbar";

export default function ComprobantesPage() {
  const { userId, isSignedIn } = useAuth();
  const router = useRouter();
  const [beneficiarioId, setBeneficiarioId] = useState(null);
  const [comprobantes, setComprobantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    monto: "",
    fecha_gasto: "",
    imagen: null
  });
  const [imagenPreview, setImagenPreview] = useState(null);

  useEffect(() => {
    if (isSignedIn && userId) {
      obtenerBeneficiario();
    }
  }, [isSignedIn, userId]);

  const obtenerBeneficiario = async () => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();
    
    if (profile) {
      const { data: beneficiario } = await supabase
        .from("beneficiarios")
        .select("id")
        .eq("profile_id", profile.id)
        .single();
      
      if (beneficiario) {
        setBeneficiarioId(beneficiario.id);
        cargarComprobantes(beneficiario.id);
      } else {
        router.push("/beneficiario/completar-perfil");
      }
    }
  };

  const cargarComprobantes = async (id) => {
    const { data } = await supabase
      .from("comprobantes")
      .select("*")
      .eq("beneficiario_id", id)
      .order("created_at", { ascending: false });
    
    if (data) setComprobantes(data);
    setCargando(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, imagen: file });
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  const subirImagenAPinata = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo || !formData.monto || !formData.fecha_gasto) {
      alert("Completa los campos obligatorios");
      return;
    }
    
    setSubiendo(true);
    let imagenUrl = null;
    
    if (formData.imagen) {
      imagenUrl = await subirImagenAPinata(formData.imagen);
    }
    
    // Insertar comprobante
    const { error: compError } = await supabase.from("comprobantes").insert({
      beneficiario_id: beneficiarioId,
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      monto: parseFloat(formData.monto),
      fecha_gasto: formData.fecha_gasto,
      imagen_url: imagenUrl
    });
    
    if (compError) {
      alert("Error: " + compError.message);
    } else {
      // Actualizar beneficiario (reiniciar contador de advertencias)
      const hoy = new Date().toISOString().split('T')[0];
      
      const { error: updateError } = await supabase
        .from("beneficiarios")
        .update({ 
          ultimo_comprobante: hoy,
          advertencias: 0,
          estado: "activo"
        })
        .eq("id", beneficiarioId);
      
      if (updateError) {
        console.error("Error al actualizar beneficiario:", updateError);
      }
      
      alert("Comprobante subido correctamente. ¡Tu estado ha sido restaurado a activo!");
      setFormData({ titulo: "", descripcion: "", monto: "", fecha_gasto: "", imagen: null });
      setImagenPreview(null);
      setMostrarFormulario(false);
      cargarComprobantes(beneficiarioId);
    }
    setSubiendo(false);
  };

  if (cargando) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <main className="min-h-screen bg-gray-100">
      <BeneficiarioNavbar />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold"> Comprobantes de gastos</h1>
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="bg-[#5E1A2F] text-white px-4 py-2 rounded-lg text-sm"
          >
            + Subir comprobante
          </button>
        </div>

        {/* Formulario para subir comprobante */}
        {mostrarFormulario && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Subir nuevo comprobante</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título *</label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={2}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Monto (MXN) *</label>
                  <input
                    type="number"
                    name="monto"
                    value={formData.monto}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha del gasto *</label>
                  <input
                    type="date"
                    name="fecha_gasto"
                    value={formData.fecha_gasto}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Factura/Recibo (imagen o PDF)</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleImagenChange}
                  className="w-full p-2 border rounded-lg"
                />
                {imagenPreview && (
                  <div className="mt-2">
                    <img src={imagenPreview} className="w-32 h-32 object-cover rounded-lg" />
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={subiendo} className="bg-green-600 text-white px-6 py-2 rounded-lg">
                  {subiendo ? "Subiendo..." : "Guardar comprobante"}
                </button>
                <button type="button" onClick={() => setMostrarFormulario(false)} className="bg-gray-300 px-6 py-2 rounded-lg">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de comprobantes */}
        {comprobantes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <p className="text-gray-500">No has subido comprobantes de gastos</p>
            <p className="text-sm text-gray-400 mt-2">Sube facturas y recibos para mantener la transparencia</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comprobantes.map((comp) => (
              <div key={comp.id} className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{comp.titulo}</h3>
                    <p className="text-gray-500 text-sm">{comp.descripcion}</p>
                    <div className="flex gap-3 mt-2 text-sm">
                      <span className="text-[#5E1A2F] font-medium">${comp.monto?.toLocaleString()} MXN</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-500">{new Date(comp.fecha_gasto).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {comp.imagen_url && (
                    <a href={comp.imagen_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                      Ver comprobante →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}