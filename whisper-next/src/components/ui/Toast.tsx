'use client'
import { useStore } from '@/lib/store'

export default function Toast() {
  const { toastMsg } = useStore()
  return (
    <div className={`toast${toastMsg ? ' show' : ''}`}>
      {toastMsg}
    </div>
  )
}
