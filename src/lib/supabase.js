import { createClient } from '@supabase/supabase-js'

// -------------------------------------------------------
// SETUP INSTRUCTIONS:
// 1. Go to your Supabase project dashboard
// 2. Click "Settings" in the left sidebar
// 3. Click "API"
// 4. Copy "Project URL" and paste it below replacing YOUR_SUPABASE_URL
// 5. Copy "anon public" key and paste it below replacing YOUR_SUPABASE_ANON_KEY
// -------------------------------------------------------

const SUPABASE_URL = 'https://dcttyqkrmeheksuzztfe.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjdHR5cWtybWVoZWtzdXp6dGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMjA4ODgsImV4cCI6MjA5NzU5Njg4OH0.Y0wcVjf1w5wDjU-6tkZ5LC4mYULZ2VExGLINQkkbHoo'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
