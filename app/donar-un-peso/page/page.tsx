'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { loadStripe } from '@stripe/stripe-js'
import Navbar from '@/components/Navbar'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function DonarUnPeso() {
  const { isSignedIn, userId } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [monto, setMonto] = useState(1)

  const handleDonate = async () => {
    if (!isSignedIn) {
      router.push('/sign-in?redirect=/donar-un-peso')
      return
    }
    
    setLoading(true)
    
    const res = await fetch('/api/donar-un-peso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monto })
    })
    
    const { url } = await res.json()
    if (url) window.location.href = url
    
    setLoading(false)
  }

  return (
    <main>
      <Navbar />
      <div className="container mx-auto px-4 py-20 max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4"></div>
          <h1 className="text-3xl font-bold mb-2">Donar un peso</h1>
          <p className="text-gray-500 mb-6">Un peso transforma vidas</p>
          
          <div className="mb-6">
            <div className="text-5xl font-bold text-[#C6A43F]">$1 MXN</div>
            <p className="text-xs text-gray-400 mt-2">Monto fijo</p>
          </div>
          
          <button
            onClick={handleDonate}
            disabled={loading}
            className="w-full bg-[#C6A43F] text-[#2C2C2C] py-3 rounded-xl font-bold text-lg hover:bg-[#D4B458] transition"
          >
            {loading ? 'Procesando...' : ' Donar $1 ahora'}
          </button>
          
          <p className="text-xs text-gray-400 mt-4">
             Donación 100% deducible de impuestos
          </p>
        </div>
      </div>
    </main>
  )
}