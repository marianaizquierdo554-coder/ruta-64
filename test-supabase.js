// test-supabase.js
const { createClient } = require('@supabase/supabase-js')


const supabaseUrl = 'https://cspttrfmxpopkcpnebwu.supabase.co'

const supabaseKey = 'sb_publishable_eKLuwl6wZ5hhrpBBi_OO3Q_rMBAsHh1'  

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  try {
    console.log(' Conectando a Supabase con Publishable Key...')
    
    // Probar conexión
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log(' Error:', error.message)
      console.log(' Ve a Supabase → SQL Editor y crea las tablas.')
      return
    }
    
    console.log(' Conexión exitosa!')
    console.log(` Usuarios encontrados: ${data.length}`)
    
  } catch (error) {
    console.error(' Error:', error.message)
  }
}

main()