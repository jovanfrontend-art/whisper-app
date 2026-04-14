'use client'
import { StoreProvider } from '@whisper/supabase'
import type { ReactNode } from 'react'

export default function WebStoreProvider({ children }: { children: ReactNode }) {
  return (
    <StoreProvider
      supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'}
      supabaseKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'}
    >
      {children}
    </StoreProvider>
  )
}
