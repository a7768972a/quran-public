import { createClient } from '@supabase/supabase-js'

// Supabase client للاستخدام server-side
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  {
    auth: { persistSession: false },
  }
)

export const LESSONS_BUCKET = 'lessons'
