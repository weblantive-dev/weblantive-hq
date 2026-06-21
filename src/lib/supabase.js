import { createClient } from '@supabase/supabase-js'

// -------------------------------------------------------
// SETUP INSTRUCTIONS:
// 1. Go to your Supabase project dashboard
// 2. Click "Settings" in the left sidebar
// 3. Click "API"
// 4. Copy "Project URL" and paste it below replacing YOUR_SUPABASE_URL
// 5. Copy "anon public" key and paste it below replacing YOUR_SUPABASE_ANON_KEY
// -------------------------------------------------------

const SUPABASE_URL = 'YOUR_SUPABASE_URL'
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
