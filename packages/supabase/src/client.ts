import { createClient, SupabaseClient } from '@supabase/supabase-js'

export type { SupabaseClient }

let instance: SupabaseClient | null = null

export function createWhisperClient(url: string, key: string): SupabaseClient {
  if (!instance) {
    instance = createClient(url, key, {
      auth: {
        flowType: 'pkce',
      },
    })
  }
  return instance
}
