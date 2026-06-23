"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { municipiosPorEstado } from "@/lib/municipios";
import BeneficiarioNavbar from "@/components/BeneficiarioNavbar";

const estados = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
  "Chiapas", "Chihuahua", "Ciudad de Mexico", "Coahuila", "Colima",
  "Durango", "Estado de Mexico", "Guanajuato", "Guerrero", "Hidalgo",
  "Jalisco", "Michoacan", "Morelos", "Nayarit", "Nuevo Leon", "Oaxaca",
  "Puebla", "Queretaro", "Quintana Roo", "San Luis Potosi", "Sinaloa",
  "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatan", "Zacatecas"
];

const CURP_REGEX = /^[A-Z]{1}[AEIOU]{1}[A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM]{1}(AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]{1}\d{1}$/;

const PALABRAS_OMITIR = new Set([
  "DE", "DEL", "LA", "LAS", "LOS", "Y", "E", "DA", "DAS", "DOS",
  "MAC", "MC", "VAN", "VON", "EL"
]);

export default function CompletarPerfilBeneficiario() {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [yaRegistrado, setYaRegistrado] = useState(false);
  const [municipios, setMunicipios] = useState([]);
  const [curpValida, setCurpValida] = useState(null);
  const [validandoCURP, setValidandoCURP] = useState(false);

  const [fotoPreview, setFotoPreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [ineFrontalPreview, setIneFrontalPreview] = useState(null);
  const [ineReversoPreview, setIneReversoPreview] = useState(null);
  const [credencialPreview, setCredencialPreview] = useState(null);
  const [comprobantePreview, setComprobantePreview] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "",
    curp: "",
    fechaNacimiento: "",
    telefono: "",
    cp: "",
    estado: "",
    municipio: "",
    localidad: "",
    calle: "",
    numero: "",
    tipo: "",
    institucion: "",
    historia: "",
    meta: "",
    plan_uso_fondos: "",
    video_url: "",
    ine_frontal: null,
    ine_reverso: null,
    credencial_escolar: null,
    comprobante_inscripcion: null,
    foto_perfil: null,
    video_file: null
  });

  useEffect(() => {
    if (isSignedIn && userId) {
      verificarRegistro();
    }
  }, [isSignedIn, userId]);

  const verificarRegistro = async () => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (!profile) return;

    const { data } = await supabase
      .from("beneficiarios")
      .select("id")
      .eq("profile_id", profile.id)
      .maybeSingle();

    if (data) {
      setYaRegistrado(true);
      setTimeout(() => router.push("/beneficiario/portal"), 3000);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "estado") {
      setMunicipios(municipiosPorEstado[e.target.value] || []);
    }
  };

  const buscarPorCP = async () => {
    if (formData.cp.length === 5) {
      const res = await fetch(`/api/cp?cp=${formData.cp}`);
      const data = await res.json();
      if (data.estado) {
        setFormData(prev => ({
          ...prev,
          estado: data.estado,
          municipio: data.municipio || "",
          localidad: data.localidad || ""
        }));
        setMunicipios(municipiosPorEstado[data.estado] || []);
      }
    }
  };

  const validarCURP = async () => {
    const curp = formData.curp.toUpperCase().trim();

    if (!CURP_REGEX.test(curp)) {
      alert("Formato de CURP inválido. Verifica que esté escrita correctamente.");
      setCurpValida(false);
      return;
    }

    setValidandoCURP(true);

    const partes = formData.nombre
      .trim()
      .toUpperCase()
      .split(/\s+/)
      .filter(p => !PALABRAS_OMITIR.has(p));

    const primerApellido = partes[partes.length - 2] || "";
    const segundoApellido = partes[partes.length - 1] || "";
    const nombrePila = partes[0] || "";

    const curpLetra1 = curp.charAt(0);
    const curpLetra3 = curp.charAt(2);
    const curpLetra4 = curp.charAt(3);

    const anioCurp = parseInt(curp.substring(4, 6));
    const mesCurp = parseInt(curp.substring(6, 8));
    const diaCurp = parseInt(curp.substring(8, 10));

    const anioActual = new Date().getFullYear();
    const anio2digitos = anioActual % 100;
    const siglo = anioCurp <= anio2digitos ? 2000 : 1900;
    const anioCompleto = siglo + anioCurp;

    const fnac = new Date(formData.fechaNacimiento);
    const diaNac = fnac.getUTCDate();
    const mesNac = fnac.getUTCMonth() + 1;
    const anioNac = fnac.getUTCFullYear();

    const letra1Coincide = curpLetra1 === primerApellido.charAt(0);
    const letra3Coincide = curpLetra3 === "X" || curpLetra3 === segundoApellido.charAt(0);
    const letra4Coincide = curpLetra4 === nombrePila.charAt(0);
    const fechaCoincide = diaCurp === diaNac && mesCurp === mesNac && anioCompleto === anioNac;

    if (letra1Coincide && letra3Coincide && letra4Coincide && fechaCoincide) {
      setCurpValida(true);
      alert("CURP validada correctamente ✓");
    } else {
      setCurpValida(false);
      alert("La CURP no coincide con los datos ingresados");
    }

    setValidandoCURP(false);
  };

  const subirArchivoAPinata = async (file) => {
    const formDataFile = new FormData();
    formDataFile.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formDataFile });
    const data = await res.json();
    return data.url;
  };

  const handleFileChange = (e, campo, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, [campo]: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const eliminarArchivo = (campo, setPreview) => {
    setFormData({ ...formData, [campo]: null });
    setPreview(null);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, video_file: file, video_url: "" });
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const eliminarVideo = () => {
    setFormData({ ...formData, video_file: null, video_url: "" });
    setVideoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!curpValida) {
      alert("Debes validar tu CURP primero");
      return;
    }

    setLoading(true);
    try {
      let profileId;
      const userEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress;

      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", userId)
        .maybeSingle();

      if (existingProfile) {
        profileId = existingProfile.id;
      } else {
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({
            clerk_user_id: userId,
            email: userEmail,
            rol: "beneficiario",
          })
          .select()
          .single();

        if (insertError) throw new Error("Error al crear perfil: " + insertError.message);
        profileId = newProfile.id;
      }

      let ineFrontalUrl = null, ineReversoUrl = null, credencialUrl = null,
          comprobanteUrl = null, fotoUrl = null, videoFinalUrl = null;

      if (formData.ine_frontal) ineFrontalUrl = await subirArchivoAPinata(formData.ine_frontal);
      if (formData.ine_reverso) ineReversoUrl = await subirArchivoAPinata(formData.ine_reverso);
      if (formData.credencial_escolar) credencialUrl = await subirArchivoAPinata(formData.credencial_escolar);
      if (formData.comprobante_inscripcion) comprobanteUrl = await subirArchivoAPinata(formData.comprobante_inscripcion);
      if (formData.foto_perfil) fotoUrl = await subirArchivoAPinata(formData.foto_perfil);
      if (formData.video_file) videoFinalUrl = await subirArchivoAPinata(formData.video_file);

      const { error: insertBeneficiarioError } = await supabase.from("beneficiarios").insert({
        profile_id: profileId,
        email: userEmail,
        nombre: formData.nombre,
        curp: formData.curp.toUpperCase(),
        fecha_nacimiento: formData.fechaNacimiento,
        telefono: formData.telefono,
        cp: formData.cp,
        estado: formData.estado,
        municipio: formData.municipio,
        localidad: formData.localidad,
        calle: formData.calle,
        numero: formData.numero,
        tipo: formData.tipo,
        institucion: formData.institucion,
        historia: formData.historia,
        meta: parseInt(formData.meta) || 0,
        plan_uso_fondos: formData.plan_uso_fondos,
        video_url: videoFinalUrl || formData.video_url,
        foto_perfil: fotoUrl,
        ine_frontal: ineFrontalUrl,
        ine_reverso: ineReversoUrl,
        credencial_escolar: credencialUrl,
        comprobante_inscripcion: comprobanteUrl,
        validado: false
      });

      if (insertBeneficiarioError) throw insertBeneficiarioError;

      alert("Registro completado exitosamente");
      router.push("/beneficiario/portal");
    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (yaRegistrado) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Este correo y usuario ya estan registrados</h2>
          <p className="text-gray-500">Redirigiendo a tu portal...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Redirigiendo a login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-[#5E1A2F] text-white p-6">
            <h1 className="text-2xl font-bold">Registro de Primer Ingreso</h1>
            <p className="text-sm opacity-90 mt-1">
              Completa los datos de tu perfil y sube tu documentacion oficial para la validacion de identidad.
            </p>
          </div>

          <div className="flex border-b">
            {[
              { n: 1, label: "1. Identidad" },
              { n: 2, label: "2. Academia" },
              { n: 3, label: "3. Historia" },
              { n: 4, label: "4. Meta" },
              { n: 5, label: "5. Legal" },
            ].map(({ n, label }) => (
              <button
                key={n}
                onClick={() => setStep(n)}
                className={`flex-1 py-3 text-center font-medium ${
                  step === n ? "bg-[#C6A43F] text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-4">Datos Personales</h2>
                  <div className="space-y-4">
                    <input name="nombre" placeholder="Nombre(s) Primer Apellido Segundo Apellido" value={formData.nombre} onChange={handleChange} className="w-full p-3 border rounded-xl" required />
                    <p className="text-xs text-gray-400 -mt-2">Ejemplo: Juan Carlos García López</p>
                    <div className="flex gap-2">
                      <input name="curp" placeholder="CURP (18 caracteres)" value={formData.curp} onChange={handleChange} maxLength={18} className="flex-1 p-3 border rounded-xl uppercase" required />
                      <button type="button" onClick={validarCURP} disabled={validandoCURP} className="px-4 bg-blue-600 text-white rounded-xl">Validar</button>
                    </div>
                    {curpValida === true && <p className="text-green-600 text-sm">✓ CURP validada</p>}
                    {curpValida === false && <p className="text-red-600 text-sm">✗ CURP no coincide con tus datos</p>}
                    <a href="https://www.gob.mx/curp/" target="_blank" className="text-blue-600 text-sm">¿No recuerdas tu CURP? Consulta aquí →</a>
                    <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} className="w-full p-3 border rounded-xl" required />
                    <input name="telefono" placeholder="Telefono" value={formData.telefono} onChange={handleChange} className="w-full p-3 border rounded-xl" />
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-4">Identificacion Oficial (INE / Cedula)</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Lado Frontal (Opcional)</label>
                      {ineFrontalPreview && <img src={ineFrontalPreview} className="w-full h-32 object-cover rounded-lg mb-2" />}
                      <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, "ine_frontal", setIneFrontalPreview)} className="w-full p-2 border rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Lado Posterior (Opcional)</label>
                      {ineReversoPreview && <img src={ineReversoPreview} className="w-full h-32 object-cover rounded-lg mb-2" />}
                      <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, "ine_reverso", setIneReversoPreview)} className="w-full p-2 border rounded-xl" />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-4">Domicilio</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <input name="cp" placeholder="Codigo postal" value={formData.cp} onChange={handleChange} onBlur={buscarPorCP} className="p-3 border rounded-xl" />
                    <select name="estado" value={formData.estado} onChange={handleChange} className="p-3 border rounded-xl">
                      <option value="">Estado</option>
                      {estados.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <select name="municipio" value={formData.municipio} onChange={handleChange} className="p-3 border rounded-xl">
                      <option value="">Municipio</option>
                      {municipios.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <input name="localidad" placeholder="Localidad" value={formData.localidad} onChange={handleChange} className="p-3 border rounded-xl" />
                    <input name="calle" placeholder="Calle" value={formData.calle} onChange={handleChange} className="p-3 border rounded-xl" />
                    <input name="numero" placeholder="Numero" value={formData.numero} onChange={handleChange} className="p-3 border rounded-xl" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-4">Vinculacion Academica</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Credencial o Matricula Escolar Vigente (Opcional)</label>
                      {credencialPreview && <img src={credencialPreview} className="w-full h-32 object-cover rounded-lg mb-2" />}
                      <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, "credencial_escolar", setCredencialPreview)} className="w-full p-2 border rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Comprobante de Inscripcion *</label>
                      {comprobantePreview && <img src={comprobantePreview} className="w-full h-32 object-cover rounded-lg mb-2" />}
                      <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, "comprobante_inscripcion", setComprobantePreview)} className="w-full p-2 border rounded-xl" required />
                    </div>
                    <select name="tipo" value={formData.tipo} onChange={handleChange} className="w-full p-3 border rounded-xl" required>
                      <option value="">Tipo de beneficiario</option>
                      <option>Estudiante</option><option>Investigador</option><option>Creador</option>
                      <option>Emprendedor</option><option>Salud</option>
                    </select>
                    <input name="institucion" placeholder="Institucion / Universidad" value={formData.institucion} onChange={handleChange} className="w-full p-3 border rounded-xl" />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-4">Vitrina de Talentos y Storytelling</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Fotografia de Perfil Publico *</label>
                      {fotoPreview && <img src={fotoPreview} className="w-32 h-32 rounded-full object-cover mb-2" />}
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "foto_perfil", setFotoPreview)} className="w-full p-2 border rounded-xl" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tu Historia Personal *</label>
                      <textarea name="historia" rows={5} placeholder="Cuentale a la comunidad quien eres..." value={formData.historia} onChange={handleChange} className="w-full p-3 border rounded-xl" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Video de Presentacion (Opcional)</label>
                      {videoPreview && <video src={videoPreview} controls className="w-full rounded-xl max-h-48 mb-2" />}
                      <input type="file" accept="video/*" onChange={handleVideoChange} className="w-full p-2 border rounded-xl" />
                      <input type="text" name="video_url" placeholder="O pega un enlace de YouTube / Vimeo" value={formData.video_url} onChange={handleChange} className="w-full p-3 border rounded-xl mt-2" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-4">Metas de Recaudacion</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Monto Economico Necesario *</label>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">$</span>
                        <input type="number" name="meta" placeholder="0.00" value={formData.meta} onChange={handleChange} className="flex-1 p-3 border rounded-xl" required />
                        <span className="text-gray-500">MXN</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Plan de Uso de Fondos *</label>
                      <textarea name="plan_uso_fondos" rows={4} placeholder="Desglosa en que gastaras el dinero..." value={formData.plan_uso_fondos} onChange={handleChange} className="w-full p-3 border rounded-xl" required />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-bold mb-2">Marca Legal y Validacion</h3>
                  <label className="flex items-start gap-3 mt-2">
                    <input type="checkbox" required />
                    <span className="text-sm">Acepto el tratamiento de mis datos conforme a la LFPDPPP</span>
                  </label>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl">
                  <p className="text-sm">Tu perfil entrara a un proceso de moderacion de 24-48 horas.</p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              {step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-2 border rounded-xl">Anterior</button>}
              {step < 5 ? (
                <button type="button" onClick={() => setStep(step + 1)} className="px-6 py-2 bg-[#5E1A2F] text-white rounded-xl ml-auto">Siguiente</button>
              ) : (
                <button type="submit" disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-xl ml-auto">Finalizar Registro</button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}