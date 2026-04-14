'use client'
import { StoreProvider } from '@whisper/supabase'
import type { ReactNode } from 'react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export default function WebStoreProvider({ children }: { children: ReactNode }) {
  if (!supabaseUrl || !supabaseKey) return <>{children}</>
  return (
    <StoreProvider supabaseUrl={supabaseUrl} supabaseKey={supabaseKey}>
      {children}
    </StoreProvider>
  )
}
