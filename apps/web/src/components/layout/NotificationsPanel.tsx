'use client'
import { useStore } from '@whisper/supabase'
import type { Notification } from '@whisper/shared'
import { useRouter } from 'next/navigation'

interface Props {
  open: boolean
  onClose: () => void
}

export default function NotificationsPanel({ open, onClose }: Props) {
  const { notifications, markAllRead, markOneRead, deleteNotification } = useStore()
  const router = useRouter()

  function handleNavigate(n: Notification) {
    const url = n.type === 'comment' && n.commentId
      ? `/thread/${n.postId}#comment-${n.commentId}`
      : `/thread/${n.postId}`
    router.push(url)
    onClose()
  }

  return (
    <>
      <div className={`modal-backdrop${open ? ' active' : ''}`} onClick={onClose} />
      <div className={`notif-panel${open ? ' active' : ''}`}>
        <div className="notif-panel-header">
          <button className="notif-panel-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
          <span className="notif-panel-title">Obaveštenja</span>
          {notifications.some(n => !n.read)
            ? <button className="notif-mark-all" onClick={markAllRead}>Označi sve</button>
            : <div style={{ width: 80 }} />
          }
        </div>

        <div className="notif-panel-list">
          {notifications.length === 0 ? (
            <div className="notif-empty" style={{ paddingTop: 60, fontSize: 14 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
              <div>Nema obaveštenja</div>
            </div>
          ) : notifications.map(n => (
            <div key={n.id} className={`notif-panel-item${!n.read ? ' unread' : ''}`}>
              <div className="notif-panel-item-body" onClick={() => handleNavigate(n)}>
                <div className={`notif-dot${n.read ? ' notif-dot-read' : ''}`} />
                <div className="notif-content">
                  <div className="notif-text">
                    <strong>{n.commenterUsername}</strong>
                    {n.type === 'comment' ? ' je komentarisao/la tvoju priču 💬' : ' je reagovao/la na tvoju priču ❤️'}
                  </div>
                  <div className="notif-time">{n.time}</div>
                </div>
              </div>
              <div className="notif-panel-item-btns">
                {!n.read && (
                  <button className="notif-action-btn" title="Označi kao pročitano" onClick={() => markOneRead(n.id)}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </button>
                )}
                <button className="notif-action-btn notif-action-delete" title="Obriši" onClick={() => deleteNotification(n.id)}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
