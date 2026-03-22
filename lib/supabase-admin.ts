import { createClient } from '@supabase/supabase-js'

// Admin client: server-side / API routes ONLY.
// Factory function: client created at request time, not module import time.
// This bypasses RLS. Never import this in a "use client" component.
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
