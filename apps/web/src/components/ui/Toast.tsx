'use client'
import { useStore } from '@whisper/supabase'

export default function Toast() {
  const { toastMsg } = useStore()
  return (
    <div className={`toast${toastMsg ? ' show' : ''}`}>
      {toastMsg}
    </div>
  )
}
