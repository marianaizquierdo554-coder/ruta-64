"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import AdminNavbar from "@/components/AdminNavbar";

export default function ConfiguracionPage() {
  const { userId, isSignedIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    site_name: "Ruta 64",
    site_description: "Plataforma Nacional de Talento",
    contact_email: "info@ruta64.com",
    contact_phone: "",
    maintenance_mode: false,
    allow_registrations: true
  });
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    if (isSignedIn && userId) {
      const checkAdmin = async () => {
        const { data } = await supabase
          .from("profiles")
          .select("rol")
          .eq("clerk_user_id", userId)
          .single();
        
        if (data?.rol !== "admin") {
          router.push("/dashboard");
        }
        
        // Cargar configuración (desde localStorage o API)
        const savedConfig = localStorage.getItem("admin_config");
        if (savedConfig) {
          setConfig(JSON.parse(savedConfig));
        }
        setVerificando(false);
      };
      checkAdmin();
    }
  }, [isSignedIn, userId, router]);

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleToggle = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Guardar configuración
      localStorage.setItem("admin_config", JSON.stringify(config));
      
      // Aquí se puede guardar en Supabase si se crea una tabla de configuración
      alert("Configuración guardada exitosamente");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (verificando) {
    return (
      <main>
        <AdminNavbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p>Verificando...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <AdminNavbar />
      
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Configuración de la plataforma</h1>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre del sitio</label>
            <input
              type="text"
              name="site_name"
              value={config.site_name}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Descripción</label>
            <textarea
              name="site_description"
              value={config.site_description}
              onChange={handleChange}
              rows={3}
              className="w-full p-3 border rounded-xl"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Correo de contacto</label>
            <input
              type="email"
              name="contact_email"
              value={config.contact_email}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Teléfono de contacto</label>
            <input
              type="text"
              name="contact_phone"
              value={config.contact_phone}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl"
              placeholder="Opcional"
            />
          </div>
          
          <div className="flex items-center justify-between py-4 border-t">
            <div>
              <p className="font-medium">Modo mantenimiento</p>
              <p className="text-sm text-gray-500">Mostrar página de mantenimiento a los usuarios</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="maintenance_mode"
                checked={config.maintenance_mode}
                onChange={handleToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between py-4 border-t">
            <div>
              <p className="font-medium">Permitir nuevos registros</p>
              <p className="text-sm text-gray-500">Si está desactivado, nadie nuevo puede registrarse</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="allow_registrations"
                checked={config.allow_registrations}
                onChange={handleToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar configuración"}
          </button>
        </form>
      </div>
    </main>
  );
}
