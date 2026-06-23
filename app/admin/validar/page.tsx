import { supabase } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import ValidarClient from './ValidarClient'

export const dynamic = 'force-dynamic'

export default async function ValidarPage() {
  const { userId } = await auth()
  
  if (!userId) redirect('/sign-in')
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('rol')
    .eq('clerk_user_id', userId)
    .single()
  
  if (profile?.rol !== 'admin') redirect('/dashboard')
  
  const { data: pendientes } = await supabase
    .from('beneficiarios')
    .select('*')
    .eq('validado', false)
    .order('created_at', { ascending: false })
  
  return <ValidarClient initialPendientes={pendientes || []} />
}
