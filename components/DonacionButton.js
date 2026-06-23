'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { useAuth } from '@clerk/nextjs'

const stripePromise = loadStripe('pk_live_P 51TGj2EE9pdtBUwWF4WZg8X6MIurrJ7ch4EYgirfDyybQO8BMlTtPS9Fyb5qxiHAikEJ5XzMh3y9KqOeDyU0BYSkL00DHSWGwMP')

export default function DonacionButton() {
  const { userId } = useAuth()  //  Obtener ID del usuario logueado
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState(100)

  const handleDonate = async () => {
    console.log('1. Inicio - monto:', amount)
    setLoading(true)
    
    console.log('2. Llamando a API...')
    const response = await fetch('/api/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    })
    
    console.log('3. Respuesta status:', response.status)
    const data = await response.json()
    console.log('4. Datos recibidos:', data)
    
    const stripe = await stripePromise
    console.log('5. Stripe cargado')
    
    const { error } = await stripe.confirmPayment({
      clientSecret: data.clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard`
      }
    })
    
    if (error) {
      console.log('6. Error:', error)
    } else {
      console.log('6. Pago exitoso')
      
      // ✅ INSIGNIA: Primera donación (solo si hay usuario logueado)
      if (userId) {
        try {
          await fetch('/api/insignias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              userId: userId, 
              tipo: 'primera_donacion' 
            })
          })
          console.log('✅ Insignia asignada!')
        } catch (err) {
          console.log('Error al asignar insignia:', err)
        }
      }
    }
    setLoading(false)
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Donar a Ruta 64</h2>
      
      <div className="flex gap-2 mb-4">
        {[100, 500, 1000].map(m => (
          <button
            key={m}
            onClick={() => setAmount(m)}
            className={`px-4 py-2 rounded ${amount === m ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            ${m}
          </button>
        ))}
      </div>
      
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="w-full p-2 border rounded mb-4"
        placeholder="Otro monto"
      />
      
      <button
        onClick={handleDonate}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
      >
        {loading ? 'Procesando...' : `Donar $${amount} MXN`}
      </button>
      
      <p className="text-xs text-gray-500 mt-4 text-center">
        Donación 100% deducible de impuestos
      </p>
    </div>
  )
}