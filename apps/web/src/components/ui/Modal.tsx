'use client'
import { ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  action?: ReactNode
  wide?: boolean
}

export default function Modal({ open, onClose, title, children, action, wide }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  return createPortal(
    <>
      <div
        className={`modal-backdrop${open ? ' active' : ''}`}
        onClick={onClose}
        style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      />
      <div className={`modal-popup${open ? ' active' : ''}${wide ? ' wide' : ''}`}>
        <div className="modal-popup-header">
          <span className="modal-popup-title">{title}</span>
          <div className="modal-popup-header-actions">
            {action}
            <button className="modal-popup-close" onClick={onClose}>
              <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
        </div>
        <div className="modal-popup-body">
          {children}
        </div>
      </div>
    </>,
    document.body
  )
}
