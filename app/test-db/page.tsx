import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cspttrfmxpopkcpnebwu.supabase.co'
           
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzcHR0cmZteHBvcGtjcG5lYnd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxODk2NTIsImV4cCI6MjA4MTc2NTY1Mn0.8eTYIiQM2XQP19o-HKjZmA6DmgDHQxRDSJllYp4pmUk'

export default async function TestDBPage() {
  // Verificar que las variables existen
  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4 text-red-600"> Error de Configuración</h1>
          <p className="text-gray-700">Faltan variables de entorno:</p>
          <ul className="list-disc pl-5 mt-2 text-sm">
            {!supabaseUrl && <li>NEXT_PUBLIC_SUPABASE_URL no está definida</li>}
            {!supabaseAnonKey && <li>NEXT_PUBLIC_SUPABASE_ANON_KEY no está definida</li>}
          </ul>
        </div>
      </div>
    )
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1)
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4"> Prueba de Conexión a Supabase</h1>
        
        <div className="space-y-4">
          <div>
            <p className="font-semibold"> URL:</p>
            <p className="text-sm text-gray-600">{supabaseUrl}</p>
          </div>
          
          <div className="border-t pt-4">
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <p className="text-red-600 font-bold"> ERROR DE CONEXIÓN</p>
                <p className="text-red-500 text-sm mt-1">{error.message}</p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <p className="text-green-600 font-bold"> CONEXIÓN EXITOSA</p>
                <p className="text-green-500 text-sm mt-1">
                  {data ? `Se encontraron ${data.length} registros` : 'Tabla "users" está vacía (pero la conexión funciona)'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}