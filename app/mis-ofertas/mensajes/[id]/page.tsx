"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import DashboardNavbar from "@/components/DashboardNavbar";
import Link from "next/link";

export default function ChatPage({ params }) {
  const { id: ofertaId } = params;
  const { userId, isSignedIn } = useAuth();
  const router = useRouter();
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [oferta, setOferta] = useState(null);
  const [destinatarioId, setDestinatarioId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isSignedIn && userId && ofertaId) {
      cargarOferta();
      cargarMensajes();
      marcarComoLeidos();
    }
  }, [isSignedIn, userId, ofertaId]);

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const cargarOferta = async () => {
    const { data } = await supabase
      .from("ofertas_especie")
      .select("*, beneficiarios(id, profile_id)")
      .eq("id", ofertaId)
      .single();
    
    if (data) {
      setOferta(data);
      // Determinar destinatario
      if (data.donante_id === userId) {
        // Soy donante, el destinatario es el beneficiario
        const { data: profile } = await supabase
          .from("profiles")
          .select("clerk_user_id")
          .eq("id", data.beneficiarios?.profile_id)
          .single();
        setDestinatarioId(profile?.clerk_user_id);
      } else {
        // Soy beneficiario, el destinatario es el donante
        setDestinatarioId(data.donante_id);
      }
    }
  };

  const cargarMensajes = async () => {
    const res = await fetch(`/api/mensajes/obtener?ofertaId=${ofertaId}&userId=${userId}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      setMensajes(data);
    }
    setCargando(false);
  };

  const marcarComoLeidos = async () => {
    await supabase
      .from("mensajes")
      .update({ leido: true })
      .eq("oferta_id", ofertaId)
      .neq("remitente_id", userId);
  };

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim()) return;
    setEnviando(true);

    const res = await fetch("/api/mensajes/enviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ofertaId,
        remitenteId: userId,
        destinatarioId,
        mensaje: nuevoMensaje
      })
    });

    if (res.ok) {
      setNuevoMensaje("");
      cargarMensajes();
    } else {
      const error = await res.json();
      alert("Error: " + error.error);
    }
    setEnviando(false);
  };

  if (cargando) return <div className="p-8 text-center">Cargando conversación...</div>;

  return (
    <main className="min-h-screen bg-gray-100">
      <DashboardNavbar />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-[#5E1A2F] text-white p-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-lg font-bold"> Coordinación de entrega</h1>
                <p className="text-sm opacity-90">Artículo: {oferta?.nombre}</p>
                <p className="text-xs opacity-75">
                  Estado: {oferta?.estado === "pendiente" ? " Pendiente" : 
                           oferta?.estado === "entregado" ? " Entregado" : 
                           oferta?.estado === "recibido" ? " Recibido" : oferta?.estado}
                </p>
              </div>
              <Link href="/mis-ofertas/mensajes" className="text-white/80 hover:text-white text-sm">
                ← Volver
              </Link>
            </div>
          </div>

          {/* Mensajes */}
          <div className="p-4 max-h-[500px] overflow-y-auto space-y-3">
            {mensajes.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No hay mensajes. Inicia la conversación para coordinar la entrega.
              </p>
            ) : (
              mensajes.map((msg) => {
                const esMio = msg.remitente_id === userId;
                return (
                  <div key={msg.id} className={`flex ${esMio ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] p-3 rounded-xl ${esMio ? "bg-[#5E1A2F] text-white" : "bg-gray-100 text-gray-800"}`}>
                      <p className="text-sm">{msg.mensaje}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 p-2 border rounded-lg text-sm"
                onKeyPress={(e) => e.key === "Enter" && enviarMensaje()}
              />
              <button
                onClick={enviarMensaje}
                disabled={enviando || !nuevoMensaje.trim()}
                className="bg-[#5E1A2F] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#7A243E] transition disabled:opacity-50"
              >
                {enviando ? "Enviando..." : "Enviar"}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Coordina la entrega del artículo. Puedes acordar dirección, horario y compartir detalles.
            </p>
          </div>
        </div>

        {/* Botón para subir comprobante */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*,.pdf";
              input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const formData = new FormData();
                formData.append("file", file);
                const res = await fetch("/api/upload", { method: "POST", body: formData });
                const data = await res.json();
                if (data.url) {
                  await supabase
                    .from("ofertas_especie")
                    .update({ comprobante_url: data.url })
                    .eq("id", ofertaId);
                  alert(" Comprobante subido");
                }
              };
              input.click();
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition"
          >
            📎 Subir comprobante de entrega
          </button>
          <Link href="/mis-ofertas" className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-400 transition">
            Ver mis ofertas
          </Link>
        </div>
      </div>
    </main>
  );
}