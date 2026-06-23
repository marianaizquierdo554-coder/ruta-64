"use client";

import { useState, useEffect, use } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import DashboardNavbar from "@/components/DashboardNavbar";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function DonarPage({ searchParams }) {
  const { id } = use(searchParams);
  const { isSignedIn, userId } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dinero");
  const [beneficiario, setBeneficiario] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [montoDonacion, setMontoDonacion] = useState("");
  const [cargando, setCargando] = useState(false);
  const [planPadrino, setPlanPadrino] = useState("");
  const [montoPersonalizado, setMontoPersonalizado] = useState("");

  useEffect(() => {
    if (id) {
      cargarBeneficiario();
      cargarWishlist();
    }
  }, [id]);

  const cargarBeneficiario = async () => {
    const { data } = await supabase
      .from("beneficiarios")
      .select("*")
      .eq("id", id)
      .single();
    if (data) setBeneficiario(data);
  };

  const cargarWishlist = async () => {
    const { data } = await supabase
      .from("wishlist")
      .select("*")
      .eq("beneficiario_id", id)
      .eq("ofrecido", false)
      .order("created_at", { ascending: false });
    if (data) setWishlist(data);
  };

  const handleDonarDinero = async () => {
    if (!isSignedIn) {
      alert("Inicia sesión para donar");
      router.push("/sign-in");
      return;
    }
    if (!montoDonacion || montoDonacion <= 0) {
      alert("Ingresa un monto válido");
      return;
    }
    setCargando(true);

    // ✅ CORREGIDO: solo seleccionar email
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("clerk_user_id", userId)
      .single();

    const res = await fetch("/api/donar-dinero", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        beneficiarioId: id,
        beneficiarioNombre: beneficiario?.nombre,
        monto: montoDonacion,
        donanteId: userId,
        donanteNombre: profile?.email || "Usuario",
        donanteEmail: profile?.email
      })
    });

    const { url } = await res.json();
    if (url) window.location.href = url;

    setCargando(false);
  };

  const handleSerPadrino = async () => {
    if (!isSignedIn) {
      alert("Inicia sesión para ser padrino");
      router.push("/sign-in");
      return;
    }

    let montoFinal = 0;
    let planNombre = "";

    if (planPadrino === "semilla") {
      montoFinal = 500;
      planNombre = "semilla";
    } else if (planPadrino === "crecimiento") {
      montoFinal = 1500;
      planNombre = "crecimiento";
    } else if (planPadrino === "transformacion") {
      montoFinal = 3000;
      planNombre = "transformacion";
    } else if (planPadrino === "personalizado") {
      if (!montoPersonalizado || montoPersonalizado <= 0) {
        alert("Ingresa un monto válido");
        return;
      }
      montoFinal = parseFloat(montoPersonalizado);
      planNombre = "personalizado";
    } else {
      alert("Selecciona un plan o ingresa una cantidad");
      return;
    }

    setCargando(true);

    // ✅ CORREGIDO: solo seleccionar email
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("clerk_user_id", userId)
      .single();

    const res = await fetch("/api/crear-suscripcion-padrino", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        beneficiarioId: id,
        beneficiarioNombre: beneficiario?.nombre,
        plan: planNombre,
        monto: montoFinal,
        donanteId: userId,
        donanteNombre: profile?.email || "Usuario",
        donanteEmail: profile?.email
      })
    });

    const { url } = await res.json();
    if (url) window.location.href = url;

    setCargando(false);
  };

  const handleDonarEspecie = async (itemId, itemNombre, itemDescripcion) => {
    if (!isSignedIn) {
      alert("Inicia sesión para donar");
      router.push("/sign-in");
      return;
    }

    setCargando(true);

    const { data: wishlistItem } = await supabase
      .from("wishlist")
      .select("ofrecido")
      .eq("id", itemId)
      .single();

    if (wishlistItem?.ofrecido) {
      alert("Este artículo ya fue ofrecido por otro donante");
      setCargando(false);
      return;
    }

    const { data: oferta, error } = await supabase
      .from("ofertas_especie")
      .insert({
        donante_id: userId,
        beneficiario_id: id,
        wishlist_id: itemId,
        nombre: itemNombre,
        descripcion: itemDescripcion || "",
        estado: "pendiente"
      })
      .select()
      .single();

    if (error) {
      alert("Error al registrar tu oferta: " + error.message);
    } else {
      await supabase
        .from("wishlist")
        .update({
          ofrecido: true,
          oferta_activa_id: oferta.id
        })
        .eq("id", itemId);

      alert("Oferta registrada! El artículo ya no estará visible para otros donantes.");
    }

    cargarWishlist();
    setCargando(false);
  };

  if (!beneficiario) return <div className="p-8 text-center">Cargando...</div>;

  const porcentaje = (beneficiario.monto_recaudado || 0) / (beneficiario.meta || 1) * 100;

  return (
    <main className="min-h-screen bg-gray-100">
      <DashboardNavbar />

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* COLUMNA 1 */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-md p-5">
              <p className="text-xs text-gray-400">Estudiantes que nos inspiran</p>
              {beneficiario.video_url && (
                <div className="mt-3 aspect-video rounded-xl overflow-hidden">
                  <iframe src={beneficiario.video_url} className="w-full h-full" allowFullScreen />
                </div>
              )}
              <h1 className="text-xl font-bold mt-4">{beneficiario.nombre}</h1>
              <p className="text-gray-500 text-sm">{beneficiario.tipo || "Estudiante"}</p>
              <p className="text-gray-500 italic text-xs mt-2">"{beneficiario.historia}"</p>
              <div className="mt-4">
                <p className="text-xs text-gray-400">Meta de recaudación</p>
                <p className="text-xl font-bold">${(beneficiario.monto_recaudado || 0).toLocaleString()}</p>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>{Math.round(porcentaje)}%</span>
                  <span>Meta: ${(beneficiario.meta || 0).toLocaleString()} MXN</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full mt-1">
                  <div className="h-1.5 bg-[#5E1A2F] rounded-full" style={{ width: `${porcentaje}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA 2 */}
          <div className="bg-white rounded-2xl shadow-md p-5">
            <h2 className="text-lg font-bold mb-4">Haz tu Aportación</h2>

            <div className="flex gap-2 mb-5">
              <button onClick={() => setActiveTab("dinero")} className={`flex-1 px-2 py-1.5 rounded-full text-xs font-medium ${activeTab === "dinero" ? "bg-[#5E1A2F] text-white" : "border text-gray-600"}`}>Dinero</button>
              <button onClick={() => setActiveTab("especie")} className={`flex-1 px-2 py-1.5 rounded-full text-xs font-medium ${activeTab === "especie" ? "bg-[#5E1A2F] text-white" : "border text-gray-600"}`}>Especie</button>
              <button onClick={() => setActiveTab("padrino")} className={`flex-1 px-2 py-1.5 rounded-full text-xs font-medium ${activeTab === "padrino" ? "bg-[#5E1A2F] text-white" : "border text-gray-600"}`}>Ser Padrino</button>
            </div>

            {activeTab === "dinero" && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Única vez</p>
                <div className="flex gap-2 mb-3">
                  {[100, 500, 1000].map(m => (
                    <button key={m} onClick={() => setMontoDonacion(m)} className={`flex-1 py-1.5 border rounded-lg text-xs ${montoDonacion == m ? "bg-[#5E1A2F] border-[#5E1A2F] text-white" : "hover:border-[#5E1A2F]"}`}>${m}</button>
                  ))}
                </div>
                <input type="number" placeholder="Otro monto" value={montoDonacion} onChange={e => setMontoDonacion(e.target.value)} className="w-full p-2 border rounded-lg text-xs mb-4" />
                <button onClick={handleDonarDinero} disabled={cargando || !montoDonacion} className="w-full bg-[#5E1A2F] text-white py-2 rounded-xl text-sm font-medium">
                  {cargando ? "Procesando..." : "Pagar con Tarjeta"}
                </button>
                <button className="w-full border border-[#5E1A2F] text-[#5E1A2F] py-2 rounded-xl text-sm font-medium mt-2">Depósito Bancario</button>

                <div className="mt-4 pt-3 border-t text-center">
                  <p className="text-xs text-gray-500 font-medium">
                    Tu donación es 100% deducible de impuestos (Donataria Autorizada Cluster ITMx / Ruta 64)
                  </p>
                </div>
              </div>
            )}

            {activeTab === "especie" && (
              <div>
                <p className="text-sm font-medium mb-3">Lista de Deseos</p>
                <p className="text-xs text-gray-500 mb-4">
                  Tu apoyo en especie ayuda directamente a que los estudiantes tengan las herramientas necesarias.
                </p>

                {wishlist.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No hay artículos disponibles</p>
                ) : (
                  wishlist.map(item => (
                    <div key={item.id} className="border rounded-xl p-3 mb-2">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-bold text-sm">{item.nombre}</p>
                          <p className="text-xs text-gray-500">{item.descripcion}</p>
                          <p className="text-xs text-gray-400">Cantidad: {item.cantidad || 1}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${item.urgencia === "urgente" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"}`}>
                          {item.urgencia === "urgente" ? "Urgente" : "Necesario"}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDonarEspecie(item.id, item.nombre, item.descripcion)}
                        disabled={cargando}
                        className="w-full mt-2 bg-[#5E1A2F] text-white py-1.5 rounded-lg text-xs hover:bg-[#7A243E] transition disabled:opacity-50"
                      >
                        {cargando ? "Procesando..." : "Ofrecer donación"}
                      </button>
                    </div>
                  ))
                )}

                <div className="mt-4 pt-3 border-t text-center">
                  <p className="text-xs text-gray-500 font-medium">
                    Tu donación es 100% deducible de impuestos (Donataria Autorizada Cluster ITMx / Ruta 64)
                  </p>
                </div>
              </div>
            )}

            {activeTab === "padrino" && (
              <div>
                <p className="text-xs text-gray-500 mb-3">Selecciona un plan de apoyo mensual</p>
                <div className="space-y-2 mb-4">
                  <div onClick={() => setPlanPadrino("semilla")} className={`border rounded-xl p-3 cursor-pointer transition ${planPadrino === "semilla" ? "border-[#5E1A2F] bg-[#5E1A2F]/5" : "hover:border-gray-400"}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm">Semilla</p>
                        <p className="text-xs text-gray-500">Materiales, uniformes y transporte esencial.</p>
                      </div>
                      <p className="font-bold text-[#5E1A2F] text-sm">$500/mes</p>
                    </div>
                  </div>
                  <div onClick={() => setPlanPadrino("crecimiento")} className={`border rounded-xl p-3 cursor-pointer transition ${planPadrino === "crecimiento" ? "border-[#5E1A2F] bg-[#5E1A2F]/5" : "hover:border-gray-400"}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm">Crecimiento</p>
                        <p className="text-xs text-gray-500">Beca parcial, mentoría y talleres técnicos.</p>
                      </div>
                      <p className="font-bold text-[#5E1A2F] text-sm">$1,500/mes</p>
                    </div>
                  </div>
                  <div onClick={() => setPlanPadrino("transformacion")} className={`border rounded-xl p-3 cursor-pointer transition ${planPadrino === "transformacion" ? "border-[#5E1A2F] bg-[#5E1A2F]/5" : "hover:border-gray-400"}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm">Transformación</p>
                        <p className="text-xs text-gray-500">Beca completa, salud mental y apoyo familiar.</p>
                      </div>
                      <p className="font-bold text-[#5E1A2F] text-sm">$3,000/mes</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3 mt-2">
                  <p className="text-xs text-gray-500 mb-2">Otra cantidad mensual</p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Ej: 200"
                      className="flex-1 p-2 border rounded-lg text-sm"
                      value={montoPersonalizado}
                      onChange={(e) => {
                        setMontoPersonalizado(e.target.value);
                        setPlanPadrino("personalizado");
                      }}
                    />
                    <span className="text-sm text-gray-500 flex items-center">MXN/mes</span>
                  </div>
                </div>

                <button onClick={handleSerPadrino} disabled={cargando || !planPadrino} className="w-full mt-4 bg-[#5E1A2F] text-white py-2 rounded-xl text-sm font-medium">
                  {cargando ? "Procesando..." : "Iniciar mi compromiso como Padrino"}
                </button>

                <div className="mt-4 pt-3 border-t text-center">
                  <p className="text-xs text-gray-500 font-medium">
                    Tu donación recurrente es 100% deducible de impuestos (Donataria Autorizada Cluster ITMx / Ruta 64)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* COLUMNA 3 */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-md p-5 text-center">
              <h2 className="text-base font-bold mb-2 text-left">Distribución de Impacto</h2>
              <div className="relative w-32 h-32 mx-auto my-4">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#22c55e" strokeWidth="10" strokeDasharray="93.4 283" strokeDashoffset="0" transform="rotate(-90 50 50)" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" strokeWidth="10" strokeDasharray="93.4 283" strokeDashoffset="-93.4" transform="rotate(-90 50 50)" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#eab308" strokeWidth="10" strokeDasharray="96.2 283" strokeDashoffset="-186.8" transform="rotate(-90 50 50)" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold">100%</span>
                  <span className="text-[8px] text-gray-500">Transparencia</span>
                </div>
              </div>
              <div className="text-left mt-4 space-y-2">
                <div><p className="font-bold text-sm">Becas Académicas</p><p className="text-xs text-gray-500">Apoyo directo a mensualidades</p><p className="text-sm font-bold text-green-600">33%</p></div>
                <div><p className="font-bold text-sm">Infraestructura</p><p className="text-xs text-gray-500">Equipamiento de laboratorios</p><p className="text-sm font-bold text-blue-600">33%</p></div>
                <div><p className="font-bold text-sm">Operación</p><p className="text-xs text-gray-500">Logística y mantenimiento</p><p className="text-sm font-bold text-yellow-600">34%</p></div>
              </div>
              <Link href="/transparencia" className="text-blue-600 text-xs hover:underline">Ver Reporte →</Link>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-5">
              <h3 className="font-bold text-xs mb-1">INSTRUCCIONES DE ENTREGA</h3>
              <p className="text-xs text-gray-600">Entrega en oficinas Cluster ITMx o solicita recolección.</p>
              <Link href="/mapa" className="text-blue-600 text-xs hover:underline block mt-2">Ver mapa →</Link>
              <p className="text-xs text-green-600 mt-2">Deducible de impuestos</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}