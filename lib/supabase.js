import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cspttrfmxpopkcpnebwu.supabase.co'
const supabaseKey = 'sb_publishable_eKLuwl6wZ5hhrpBBi_OO3Q_rMBAsHh1'

export const supabase = createClient(supabaseUrl, supabaseKey)