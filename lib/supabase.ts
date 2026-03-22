import { createClient } from '@supabase/supabase-js'

// Factory function: client created at request time, not module import time.
// This prevents build failures when env vars aren't available during Next.js
// static analysis / page data collection.
export function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
