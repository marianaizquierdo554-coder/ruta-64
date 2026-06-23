'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@clerk/nextjs'

const stripePromise = loadStripe('pk_live_sb_publishable_eKLuwl6wZ5hhrpBBi_OO3Q_rMBAsHh1')

export default function PanelDonacion({ beneficiario }) {
  const { userId } = useAuth()
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState(100)
  const [donationType, setDonationType] = useState('unique')
  const [error, setError] = useState('')
  const [wishlist, setWishlist] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)

  // Cargar wishlist del beneficiario
  useEffect(() => {
    if (beneficiario?.id) {
      cargarWishlist()
    }
  }, [beneficiario])

  const cargarWishlist = async () => {
    const { data } = await supabase
      .from('wishlist')
      .select('*')
      .eq('talento_id', beneficiario.id)
    setWishlist(data || [])
  }

  // Donación monetaria
  const handleDonate = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      })
      
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error)
      
      const stripe = await stripePromise
      
      const { error } = await stripe.confirmPayment({
        clientSecret: data.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`
        }
      })
      
      if (error) setError(error.message)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Donación en especie
  const donarEnEspecie = async (item, telefono) => {
    if (!userId) {
      alert('Inicia sesión para donar')
      return
    }

    const { error } = await supabase.from('donaciones_especie').insert({
      wishlist_id: item.id,
      donante_id: userId,
      telefono: telefono,
      cantidad: 1,
      estado: 'pendiente'
    })

    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert(` Compromiso registrado: ${item.item}\n\n Próximos pasos:\n1. Te contactaremos por WhatsApp\n2. Recibirás instrucciones de envío\n3. Al enviar, registra tu número de guía en "Mis donaciones"\n\n¡Gracias por tu solidaridad!`)
      setSelectedItem(null)
      cargarWishlist()
    }
  }

  const porcentaje = beneficiario ? (beneficiario.actual / beneficiario.meta) * 100 : 75

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* COLUMNA IZQUIERDA - Storytelling */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center">
          <div className="text-8xl mb-4"></div>
          <h3 className="text-xl font-bold mb-2">{beneficiario?.nombre || 'María García'}</h3>
          <p className="text-gray-500 text-sm mb-4">{beneficiario?.carrera || 'Ingeniería en Computación'} • {beneficiario?.estado || 'CDMX'}</p>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-gray-600 italic">
              "{beneficiario?.historia || 'Mi sueño es terminar mi tesis sobre IA para ayudar a diagnosticar enfermedades en zonas rurales...'}"
            </p>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-semibold">Progreso</span>
              <span className="text-gray-500">{Math.round(porcentaje)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-[#0057B3] rounded-full" style={{ width: `${porcentaje}%` }}></div>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="font-bold text-[#0057B3]">${beneficiario?.actual?.toLocaleString() || '7,500'}</span>
              <span className="text-gray-500">de ${beneficiario?.meta?.toLocaleString() || '10,000'}</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-400">
             15 días para completar la meta
          </div>
        </div>
      </div>

      {/* COLUMNA CENTRAL - Pasarela de Donación */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-bold mb-4 text-center"> Elige tu aportación</h3>
        
        {/* 3 TABS de donación */}
        <div className="grid grid-cols-3 gap-1 mb-6">
          {[
            { id: 'unique', label: ' Dinero', icon: '' },
            { id: 'especie', label: ' Especie', icon: '' },
            { id: 'subasta', label: ' Subasta', icon: '' }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setDonationType(type.id)}
              className={`py-2 rounded-xl text-sm font-semibold transition ${
                donationType === type.id 
                  ? 'bg-[#0057B3] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="text-lg">{type.icon}</div>
              {type.label}
            </button>
          ))}
        </div>
        
        {/* 1. DONACIÓN MONETARIA */}
        {donationType === 'unique' && (
          <>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setDonationType('unique')}
                className={`flex-1 py-2 rounded-xl font-semibold transition ${
                  donationType === 'unique' 
                    ? 'bg-[#0057B3] text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Donación Única
              </button>
              <button
                onClick={() => setDonationType('monthly')}
                className={`flex-1 py-2 rounded-xl font-semibold transition ${
                  donationType === 'monthly' 
                    ? 'bg-[#0057B3] text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Socio Mensual
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[100, 500, 1000].map(m => (
                <button
                  key={m}
                  onClick={() => setAmount(m)}
                  className={`py-2 rounded-xl font-semibold transition ${
                    amount === m 
                      ? 'bg-[#0057B3] text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  ${m}
                </button>
              ))}
            </div>
            
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:outline-none focus:border-[#0057B3]"
              placeholder="Otro monto"
            />
            
            <div className="space-y-2 mb-6">
              <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
                <input type="radio" name="payment" defaultChecked className="text-[#0057B3]" />
                <span> Tarjeta de crédito/débito</span>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
                <input type="radio" name="payment" className="text-[#0057B3]" />
                <span> Depósito bancario</span>
              </label>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-3 mb-4 text-center">
              <p className="text-xs text-blue-800">
                 Tu donación es 100% deducible de impuestos<br/>
                <span className="text-[10px]">Donataria Autorizada Cluster ITMx / Ruta 64</span>
              </p>
            </div>
            
            <button
              onClick={handleDonate}
              disabled={loading}
              className="w-full bg-[#FF6B35] text-white py-3 rounded-xl font-bold hover:bg-[#E55A2B] transition disabled:opacity-50"
            >
              {loading ? 'Procesando...' : ` Donar $${amount} MXN`}
            </button>
          </>
        )}
        
        {/* 2. DONACIÓN EN ESPECIE */}
        {donationType === 'especie' && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2"></div>
              <p className="text-sm text-gray-600">Dona materiales, equipos o libros que el beneficiario necesita</p>
            </div>
            
            {wishlist.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-xl border-gray-300">
                <p className="text-gray-500">Este beneficiario aún no ha agregado items a su lista de deseos</p>
                <p className="text-xs text-gray-400 mt-2">Pronto podrás donar materiales, equipos y libros</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {wishlist.map((item) => {
                  const completado = item.cantidad_recibida >= item.cantidad_necesaria
                  return (
                    <div key={item.id} className={`border rounded-xl p-3 ${completado ? 'opacity-50 bg-gray-50' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{item.item}</p>
                          <p className="text-xs text-gray-500">Necesita: {item.cantidad_necesaria} | Recibido: {item.cantidad_recibida}</p>
                          <p className="text-xs text-gray-400 mt-1">{item.descripcion}</p>
                          {item.prioridad === 'alta' && <span className="text-xs text-red-500 mt-1 inline-block"> Urgente</span>}
                        </div>
                        {!completado && (
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700"
                          >
                            Donar
                          </button>
                        )}
                        {completado && <span className="text-green-500 text-sm">✅ Completado</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
            {/* Modal de confirmación */}
            {selectedItem && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                  <h3 className="text-xl font-bold mb-4">Confirmar donación</h3>
                  <p className="mb-4">Vas a donar: <strong>{selectedItem.item}</strong></p>
                  
                  <div className="space-y-3 mb-4">
                    <input
                      type="tel"
                      id="telefonoDonante"
                      placeholder=" Tu número de WhatsApp *"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500">Te contactaremos para coordinar la entrega</p>
                  </div>
                  
                  <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                    <p className="text-xs text-yellow-800">
                      Al confirmar, te comprometes a enviar el artículo.<br/>
                      Si no lo envías, no podrás seguir donando en el futuro.
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        const telefono = document.getElementById('telefonoDonante').value
                        if (!telefono) {
                          alert('Ingresa tu número de teléfono')
                          return
                        }
                        donarEnEspecie(selectedItem, telefono)
                      }} 
                      className="flex-1 bg-green-600 text-white py-2 rounded-xl hover:bg-green-700"
                    >
                      Confirmar compromiso
                    </button>
                    <button onClick={() => setSelectedItem(null)} className="flex-1 bg-gray-300 py-2 rounded-xl hover:bg-gray-400">
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-3 bg-gray-50 rounded-xl text-center">
              <p className="text-xs text-gray-500">
                 Los artículos se entregan en oficinas Cluster ITMx<br/>
                 Lunes-Viernes 9am-6pm
              </p>
            </div>
          </div>
        )}
        
        {/* 3. SUBASTA (placeholder) */}
        {donationType === 'subasta' && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2"></div>
            <p className="text-gray-500">Próximamente: Subastas solidarias</p>
            <p className="text-xs text-gray-400 mt-2">Puja por artículos y apoya al talento mexicano</p>
          </div>
        )}
        
        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
      </div>

      {/* COLUMNA DERECHA - Distribución de Impacto */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-bold mb-4 text-center"> Distribución de Impacto</h3>
        
        <div className="space-y-4">
          <div className="group cursor-pointer">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-semibold"> Becas Académicas</span>
              <span className="text-[#0057B3] font-bold">33%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-[#0057B3] rounded-full" style={{ width: '33%' }}></div>
            </div>
            <p className="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition">
              Directo al estudiante
            </p>
          </div>
          
          <div className="group cursor-pointer">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-semibold"> Infraestructura Social</span>
              <span className="text-[#00C2A0] font-bold">33%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-[#00C2A0] rounded-full" style={{ width: '33%' }}></div>
            </div>
            <p className="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition">
              Equipo, materiales, espacios
            </p>
          </div>
          
          <div className="group cursor-pointer">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-semibold">⚙️ Operación y Logística</span>
              <span className="text-[#FF6B35] font-bold">34%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-[#FF6B35] rounded-full" style={{ width: '34%' }}></div>
            </div>
            <p className="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition">
              Plataforma, validación, seguimiento
            </p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-center text-gray-600">
             <strong>100% transparente</strong><br />
            Cada peso es trazable mediante blockchain
          </p>
        </div>
        
        <div className="mt-4 text-center text-xs text-gray-400">
          Simulación a 6 meses si eres Socio Mensual
        </div>
      </div>
    </div>
  )
}