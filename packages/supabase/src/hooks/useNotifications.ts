import { useState, useEffect } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Notification, User } from '@whisper/shared'
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  deleteNotification as deleteNotificationQuery,
} from '../queries/notifications'
import { subscribeToNotifications } from '../realtime/notifications'

export function useNotifications(client: SupabaseClient, user: User | null) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (!user) { setNotifications([]); return }

    fetchNotifications(client, user.id).then(setNotifications)

    const channel = subscribeToNotifications(client, user.id, (newNotif) => {
      setNotifications(prev => [newNotif, ...prev])
    })

    return () => { client.removeChannel(channel) }
  }, [client, user?.id])

  function markAllRead() {
    if (!user) return
    markAllNotificationsRead(client, user.id)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  function markOneRead(id: string) {
    markNotificationRead(client, id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  function removeNotification(id: string) {
    deleteNotificationQuery(client, id)
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return { notifications, markAllRead, markOneRead, deleteNotification: removeNotification }
}
