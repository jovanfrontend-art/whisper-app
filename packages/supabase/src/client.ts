import { createClient, SupabaseClient } from '@supabase/supabase-js'

export type { SupabaseClient }

export function createWhisperClient(url: string, key: string): SupabaseClient {
  return createClient(url, key)
}
