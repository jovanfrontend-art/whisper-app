'use client'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  onPick: (emoji: string) => void
  anchorRef: React.RefObject<HTMLElement | null>
  open: boolean
  onClose: () => void
}

const EMOJIS = ['❤️', '😢', '😮', '😂', '🔥']

export default function EmojiPicker({ onPick, anchorRef, open, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!open) return
    const calculate = () => {
      if (!anchorRef.current || !ref.current) return
      const btn = anchorRef.current.getBoundingClientRect()
      const pw = ref.current.offsetWidth || 230
      const ph = ref.current.offsetHeight || 52
      let left = btn.left + btn.width / 2 - pw / 2
      let top = btn.top - ph - 8
      if (top < 8) top = btn.bottom + 8
      if (left < 8) left = 8
      if (left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 8
      setPos({ top, left })
    }
    calculate()
    // recalculate after paint in case ref wasn't ready
    const raf = requestAnimationFrame(calculate)
    return () => cancelAnimationFrame(raf)
  }, [open, anchorRef])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        !ref.current?.contains(e.target as Node) &&
        !anchorRef.current?.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    // delay to avoid same-click closing
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handler)
    }
  }, [open, onClose, anchorRef])

  if (!open || !mounted) return null

  return createPortal(
    <div ref={ref} className="emoji-picker-popup" style={{ top: pos.top, left: pos.left }}>
      {EMOJIS.map(e => (
        <button key={e} className="emoji-option" onMouseDown={ev => { ev.stopPropagation(); onPick(e); onClose() }}>{e}</button>
      ))}
    </div>,
    document.body
  )
}
