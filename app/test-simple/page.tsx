import { supabase } from '@/lib/supabase'

export default async function TestSimple() {
  const { data, error } = await supabase.from('talentos').select('*')
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Prueba Supabase</h1>
      <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '8px' }}>
        <p><strong>Número de registros:</strong> {data?.length || 0}</p>
        <p><strong>Error:</strong> {error?.message || 'Ninguno'}</p>
      </div>
      <pre style={{ background: '#eee', padding: '10px', marginTop: '10px' }}>
        {JSON.stringify(data?.slice(0, 2), null, 2)}
      </pre>
    </div>
  )
}
