'use client'
import { useStore } from '@whisper/supabase'
import type { Notification } from '@whisper/shared'
import { useRouter } from 'next/navigation'
import Modal from '@/components/ui/Modal'
import { t } from '@/lib/i18n'

interface Props {
  open: boolean
  onClose: () => void
}

export default function NotificationsPanel({ open, onClose }: Props) {
  const { notifications, markAllRead, markOneRead, deleteNotification, user } = useStore()
  const router = useRouter()
  const lang = user?.language

  function handleNavigate(n: Notification) {
    const url = n.type === 'comment' && n.commentId
      ? `/thread/${n.postId}#comment-${n.commentId}`
      : `/thread/${n.postId}`
    router.push(url)
    onClose()
  }

  const action = notifications.some(n => !n.read)
    ? <button className="notif-mark-all" onClick={markAllRead}>{t(lang, 'notifMarkAll')}</button>
    : undefined

  return (
    <Modal open={open} onClose={onClose} title={t(lang, 'notifTitle')} action={action}>
      <div className="notif-panel-list">
        {notifications.length === 0 ? (
          <div className="notif-empty" style={{ paddingTop: 40, fontSize: 14 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
            <div>{t(lang, 'notifEmpty')}</div>
          </div>
        ) : notifications.map(n => (
          <div key={n.id} className={`notif-panel-item${!n.read ? ' unread' : ''}`}>
            <div className="notif-panel-item-body" onClick={() => handleNavigate(n)}>
              <div className={`notif-dot${n.read ? ' notif-dot-read' : ''}`} />
              <div className="notif-content">
                <div className="notif-text">
                  <strong>{n.commenterUsername}</strong>
                  {n.type === 'comment' ? t(lang, 'notifComment') : t(lang, 'notifReaction')}
                </div>
                <div className="notif-time">{n.time}</div>
              </div>
            </div>
            <div className="notif-panel-item-btns">
              {!n.read && (
                <button className="notif-action-btn" title={t(lang, 'notifMarkRead')} onClick={() => markOneRead(n.id)}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </button>
              )}
              <button className="notif-action-btn notif-action-delete" title={t(lang, 'notifDelete')} onClick={() => deleteNotification(n.id)}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}
