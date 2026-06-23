import { supabase } from './supabase'

// Obtener todos los perfiles con sus posts (si tienes relación)
export async function getProfilesWithPosts() {
  const { data, error } = await supabase
    .from('profiles')  // 
    .select(`
      *,
      posts:posts (  //
        id,
        title,
        content,
        created_at
      )
    `)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error al obtener perfiles:', error)
    return []
  }
  
  return data
}

// Crear un nuevo perfil (si lo necesitas)
export async function createProfile(email: string, name: string) {
  const { data, error } = await supabase
    .from('profiles') 
    .insert([
      { email, name }
    ])
    .select()
  
  if (error) {
    console.error('Error al crear perfil:', error)
    return null
  }
  
  return data[0]
}