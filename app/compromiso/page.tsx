'use client'

import { useState } from 'react'
import DashboardNavbar from "@/components/DashboardNavbar"
import { useAuth } from '@clerk/nextjs'

export default function CompromisoPage() {
  const { isSignedIn, userId } = useAuth()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    amount: 100,
    friends: ['', '', '', '']
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFriendChange = (index, value) => {
    const newFriends = [...formData.friends]
    newFriends[index] = value
    setFormData({ ...formData, friends: newFriends })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Guardar en Supabase (lo conectaremos después)
    console.log('Compromiso guardado:', formData)
    
    setSubmitted(true)
    
    // Enviar invitaciones por email (después)
    alert(' ¡Compromiso registrado! Te recordaremos en 3 días. Cada amigo que done te dará una insignia.')
  }

  if (submitted) {
    return (
      <main>
        <DashboardNavbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
            <div className="text-6xl mb-4"></div>
            <h1 className="text-2xl font-bold mb-4">¡Compromiso Registrado!</h1>
            <p className="text-gray-600 mb-6">
              Gracias por tu compromiso solidario. En 3 días te recordaremos amablemente.
              <br /><br />
               Por cada amigo que done, ganarás la insignia <strong>"Embajador Solidario"</strong>
            </p>
            <a href="/" className="bg-[#0057B3] text-white px-6 py-3 rounded-xl inline-block">
              Volver al inicio
            </a>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main>
      <DashboardNavbar />
      
      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4"></div>
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Compromiso Solidario</span>
          </h1>
          <p className="text-gray-600 text-lg">
            "No puedes donar hoy? <strong>Invita a 4 amigos y dona después</strong>"
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto mt-4 rounded-full"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Paso 1: Datos de contacto */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#0057B3] text-white rounded-full flex items-center justify-center font-bold">1</div>
              <h2 className="text-xl font-bold">Tus datos de contacto</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Nombre completo</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#0057B3]"
                  placeholder="Ana García"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1">Correo electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#0057B3]"
                  placeholder="ana@ejemplo.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1">Teléfono (WhatsApp)</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#0057B3]"
                  placeholder="+52 55 1234 5678"
                />
              </div>
            </div>
          </div>

          {/* Paso 2: Monto a donar después */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#0057B3] text-white rounded-full flex items-center justify-center font-bold">2</div>
              <h2 className="text-xl font-bold">¿Cuánto te gustaría aportar después?</h2>
            </div>
            
            <div className="flex flex-wrap gap-3 mb-4">
              {[100, 500, 1000].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setFormData({ ...formData, amount: m })}
                  className={`px-6 py-2 rounded-xl font-semibold transition ${
                    formData.amount === m 
                      ? 'bg-[#0057B3] text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ${m}
                </button>
              ))}
            </div>
            
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#0057B3]"
              placeholder="Otro monto"
            />
          </div>

          {/* Paso 3: Invitar amigos */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#0057B3] text-white rounded-full flex items-center justify-center font-bold">3</div>
              <h2 className="text-xl font-bold">Multiplica tu impacto invitando 4 amigos</h2>
            </div>
            
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                className="flex-1 bg-green-500 text-white py-2 rounded-xl font-semibold hover:bg-green-600 transition"
                onClick={() => alert('Comparte este link: ' + window.location.origin + '/compromiso')}
              >
                 WhatsApp
              </button>
              <button
                type="button"
                className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                 Facebook
              </button>
              <button
                type="button"
                className="flex-1 bg-gray-600 text-white py-2 rounded-xl font-semibold hover:bg-gray-700 transition"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + '/compromiso')
                  alert('Link copiado!')
                }}
              >
                 Copiar Link
              </button>
            </div>
            
            <div className="space-y-3">
              {[0, 1, 2, 3].map(i => (
                <input
                  key={i}
                  type="email"
                  placeholder={`Amigo ${i + 1} (Correo)`}
                  value={formData.friends[i]}
                  onChange={(e) => handleFriendChange(i, e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#0057B3]"
                />
              ))}
            </div>
          </div>

          {/* Info de beneficios */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6">
            <p className="text-sm text-gray-600 mb-2">
               <strong>Te recordamos amablemente en 3 días</strong><br />
              No es una obligación, es un recordatorio de la meta que trazamos juntos. Tu palabra vale mucho.
            </p>
            <p className="text-sm text-gray-600">
               <strong>Por cada amigo que done después, tu ganas:</strong><br />
              • Badge "Embajador Solidario"<br />
              • Subir en ranking de padrinos
            </p>
          </div>

          {/* Botón de enviar */}
          <button
            type="submit"
            className="w-full bg-[#FF6B35] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#E55A2B] transition transform hover:scale-[1.02]"
          >
             REGISTRAR COMPROMISO E INVITAR
          </button>
        </form>
      </section>
    </main>
  )
}
