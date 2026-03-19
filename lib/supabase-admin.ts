import { createClient } from '@supabase/supabase-js'

// Admin client — server-side / API routes ONLY
// This bypasses RLS. Never import this in a "use client" component.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
