"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import AdminNavbar from "@/components/AdminNavbar";

export default function AdminCursos() {
  const { userId, isSignedIn } = useAuth();
  const router = useRouter();
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    instructor: "",
    instructor_tipo: "universitario",
    duracion: "",
    precio: "",
    tipo_curso: "online",
    categoria: "",
    modalidad: "online",
    nivel: "principiante",
    enlace_reunion: "",
    ubicacion: "",
    horario: "",
    instructor_biografia: "",
    contenido: "",
    requisitos: "",
    certificado_incluido: true,
    duracion_semanas: "",
    fecha_inicio: "",
    fecha_fin: "",
    cupo_maximo: "",
    imagen_url: "",
    activo: true
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
      cargarCursos();
    }
  };

  const cargarCursos = async () => {
    const { data } = await supabase
      .from("cursos")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setCursos(data);
    setCargando(false);
  };

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const guardarCurso = async (e) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      precio: parseFloat(formData.precio) || 0,
      duracion_semanas: parseInt(formData.duracion_semanas) || null,
      cupo_maximo: parseInt(formData.cupo_maximo) || null
    };

    let result;
    if (editando) {
      result = await supabase
        .from("cursos")
        .update(data)
        .eq("id", editando);
    } else {
      result = await supabase
        .from("cursos")
        .insert(data);
    }

    if (result.error) {
      alert("Error: " + result.error.message);
    } else {
      alert(editando ? "Curso actualizado" : "Curso creado");
      setMostrarFormulario(false);
      setEditando(null);
      setFormData({
        titulo: "", descripcion: "", instructor: "", instructor_tipo: "universitario",
        duracion: "", precio: "", tipo_curso: "online", categoria: "",
        modalidad: "online", nivel: "principiante", enlace_reunion: "",
        ubicacion: "", horario: "", instructor_biografia: "", contenido: "",
        requisitos: "", certificado_incluido: true, duracion_semanas: "",
        fecha_inicio: "", fecha_fin: "", cupo_maximo: "", imagen_url: "", activo: true
      });
      cargarCursos();
    }
  };

  const editarCurso = (curso) => {
    setFormData({
      titulo: curso.titulo || "",
      descripcion: curso.descripcion || "",
      instructor: curso.instructor || "",
      instructor_tipo: curso.instructor_tipo || "universitario",
      duracion: curso.duracion || "",
      precio: curso.precio || "",
      tipo_curso: curso.tipo_curso || "online",
      categoria: curso.categoria || "",
      modalidad: curso.modalidad || "online",
      nivel: curso.nivel || "principiante",
      enlace_reunion: curso.enlace_reunion || "",
      ubicacion: curso.ubicacion || "",
      horario: curso.horario || "",
      instructor_biografia: curso.instructor_biografia || "",
      contenido: curso.contenido || "",
      requisitos: curso.requisitos || "",
      certificado_incluido: curso.certificado_incluido !== false,
      duracion_semanas: curso.duracion_semanas || "",
      fecha_inicio: curso.fecha_inicio || "",
      fecha_fin: curso.fecha_fin || "",
      cupo_maximo: curso.cupo_maximo || "",
      imagen_url: curso.imagen_url || "",
      activo: curso.activo !== false
    });
    setEditando(curso.id);
    setMostrarFormulario(true);
  };

  const eliminarCurso = async (id) => {
    if (!confirm("¿Eliminar este curso?")) return;
    await supabase.from("cursos").delete().eq("id", id);
    cargarCursos();
  };

  if (cargando) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <main className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold"> Gestión de Cursos</h1>
          <button
            onClick={() => { setMostrarFormulario(true); setEditando(null); }}
            className="bg-[#5E1A2F] text-white px-4 py-2 rounded-lg hover:bg-[#7A243E] transition"
          >
            + Nuevo curso
          </button>
        </div>

        {mostrarFormulario && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">{editando ? "Editar curso" : "Nuevo curso"}</h2>
            <form onSubmit={guardarCurso} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="titulo" placeholder="Título" value={formData.titulo} onChange={handleChange} className="p-2 border rounded-lg" required />
              <input name="descripcion" placeholder="Descripción" value={formData.descripcion} onChange={handleChange} className="p-2 border rounded-lg" required />
              <input name="instructor" placeholder="Instructor" value={formData.instructor} onChange={handleChange} className="p-2 border rounded-lg" required />
              <select name="instructor_tipo" value={formData.instructor_tipo} onChange={handleChange} className="p-2 border rounded-lg">
                <option value="universitario">Joven talento</option>
                <option value="catedratico">Catedrático</option>
              </select>
              <input name="duracion" placeholder="Duración (ej: 40 horas)" value={formData.duracion} onChange={handleChange} className="p-2 border rounded-lg" />
              <input name="precio" type="number" placeholder="Precio" value={formData.precio} onChange={handleChange} className="p-2 border rounded-lg" required />
              
              <select name="tipo_curso" value={formData.tipo_curso} onChange={handleChange} className="p-2 border rounded-lg">
                <option value="online">En línea</option>
                <option value="presencial">Presencial</option>
                <option value="hibrido">Híbrido</option>
                <option value="cisco">Cisco Networking</option>
                <option value="meet">Google Meet</option>
              </select>
              <input name="categoria" placeholder="Categoría" value={formData.categoria} onChange={handleChange} className="p-2 border rounded-lg" />
              <input name="enlace_reunion" placeholder="Enlace de reunión (Meet/Zoom)" value={formData.enlace_reunion} onChange={handleChange} className="p-2 border rounded-lg" />
              <input name="ubicacion" placeholder="Ubicación (para presencial)" value={formData.ubicacion} onChange={handleChange} className="p-2 border rounded-lg" />
              <input name="horario" placeholder="Horario (ej: Lunes 10am-12pm)" value={formData.horario} onChange={handleChange} className="p-2 border rounded-lg" />
              <input name="fecha_inicio" type="date" placeholder="Fecha inicio" value={formData.fecha_inicio} onChange={handleChange} className="p-2 border rounded-lg" />
              <input name="fecha_fin" type="date" placeholder="Fecha fin" value={formData.fecha_fin} onChange={handleChange} className="p-2 border rounded-lg" />
              <input name="duracion_semanas" type="number" placeholder="Duración (semanas)" value={formData.duracion_semanas} onChange={handleChange} className="p-2 border rounded-lg" />
              <input name="cupo_maximo" type="number" placeholder="Cupo máximo" value={formData.cupo_maximo} onChange={handleChange} className="p-2 border rounded-lg" />
              <input name="imagen_url" placeholder="URL de imagen" value={formData.imagen_url} onChange={handleChange} className="p-2 border rounded-lg" />
              <textarea name="contenido" placeholder="Contenido del curso" value={formData.contenido} onChange={handleChange} rows={3} className="p-2 border rounded-lg col-span-2" />
              <textarea name="requisitos" placeholder="Requisitos" value={formData.requisitos} onChange={handleChange} rows={2} className="p-2 border rounded-lg col-span-2" />
              <textarea name="instructor_biografia" placeholder="Biografía del instructor" value={formData.instructor_biografia} onChange={handleChange} rows={2} className="p-2 border rounded-lg col-span-2" />
              
              <div className="flex items-center gap-4 col-span-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="certificado_incluido" checked={formData.certificado_incluido} onChange={handleChange} />
                  Certificado incluido
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="activo" checked={formData.activo} onChange={handleChange} />
                  Activo
                </label>
              </div>

              <div className="flex gap-3 col-span-2">
                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
                  {editando ? "Actualizar" : "Crear"} curso
                </button>
                <button type="button" onClick={() => { setMostrarFormulario(false); setEditando(null); }} className="bg-gray-300 px-6 py-2 rounded-lg">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-2xl shadow-md">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">Curso</th>
                <th className="p-4 text-left">Instructor</th>
                <th className="p-4 text-left">Tipo</th>
                <th className="p-4 text-left">Precio</th>
                <th className="p-4 text-left">Estado</th>
                <th className="p-4 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cursos.map((curso) => (
                <tr key={curso.id} className="border-t">
                  <td className="p-4">
                    <div className="font-bold">{curso.titulo}</div>
                    <div className="text-xs text-gray-400">{curso.categoria}</div>
                  </td>
                  <td className="p-4">{curso.instructor}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${curso.tipo_curso === 'cisco' ? 'bg-blue-100 text-blue-800' : curso.tipo_curso === 'meet' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100'}`}>
                      {curso.tipo_curso || 'online'}
                    </span>
                  </td>
                  <td className="p-4">${curso.precio?.toLocaleString()}</td>
                  <td className="p-4">
                    {curso.activo ? (
                      <span className="text-green-600 text-sm">Activo</span>
                    ) : (
                      <span className="text-red-600 text-sm">Inactivo</span>
                    )}
                  </td>
                  <td className="p-4">
                    <button onClick={() => editarCurso(curso)} className="text-blue-600 hover:underline text-sm mr-2">Editar</button>
                    <button onClick={() => eliminarCurso(curso.id)} className="text-red-600 hover:underline text-sm">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}