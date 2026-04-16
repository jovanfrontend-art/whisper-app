'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useCallback } from 'react'
import { createWhisperClient } from '@whisper/supabase'
import { useRouter } from 'next/navigation'

const supabase = createWhisperClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
)

const PAGE_SIZE = 10
const CATEGORIES = ['sve', 'ljubav', 'blamovi', 'misli', 'random', 'posao', 'veze']
const CAT_LABELS: Record<string, string> = { sve: 'Sve', ljubav: 'Ljubav', blamovi: 'Blamovi', misli: 'Misli', random: 'Random', posao: 'Posao', veze: 'Veze' }

type Section = 'dashboard' | 'posts' | 'tema' | 'users'

interface Stats { users: number; activeUsers: number; posts: number; comments: number; reactions: number }
interface Post { id: string; text: string; category: string; comment_count: number; created_at: string; is_admin: boolean }
interface Highlight { category: string; title: string; subtitle: string; postId?: string }
interface UserRow { id: string; username: string | null; email: string | null; is_admin: boolean; created_at: string }
interface DayPoint { label: string; value: number }

const CAT_EMOJIS: Record<string, string> = { sve: '✨', ljubav: '❤️', blamovi: '😳', misli: '💭', random: '🎲', posao: '💼', veze: '💔' }

export default function AdminPage() {
  const router = useRouter()
  const [adminUser, setAdminUser] = useState<{ username: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [section, setSection] = useState<Section>('dashboard')
  const [stats, setStats] = useState<Stats>({ users: 0, activeUsers: 0, posts: 0, comments: 0, reactions: 0 })
  const [posts, setPosts] = useState<Post[]>([])
  const [postsPage, setPostsPage] = useState(1)
  const [postsTotal, setPostsTotal] = useState(0)
  const [allHighlights, setAllHighlights] = useState<Highlight[]>([])
  const [highlight, setHighlight] = useState<Highlight | null>(null)
  const [filterCat, setFilterCat] = useState<string>('all')
  const [newPost, setNewPost] = useState<{ category: string; title: string; subtitle: string }>({ category: 'ljubav', title: '', subtitle: '' })
  const [creating, setCreating] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [users, setUsers] = useState<UserRow[]>([])
  const [active24h, setActive24h] = useState(0)
  const [active7d, setActive7d] = useState(0)
  const [active30d, setActive30d] = useState(0)
  const [registrationsChart, setRegistrationsChart] = useState<DayPoint[]>([])
  const [chartRange, setChartRange] = useState<'7d' | '30d' | '1y'>('30d')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const checkAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.replace('/'); return }
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
    if (!profile?.is_admin) { router.replace('/'); return }
    setAdminUser({ username: profile.username ?? 'Admin', email: session.user.email! })
    setLoading(false)
  }, [router])

  const fetchStats = useCallback(async () => {
    const [users, postsRes, comments, reactions] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('is_admin', false),
      supabase.from('comments').select('*', { count: 'exact', head: true }),
      supabase.from('post_reactions').select('*', { count: 'exact', head: true }),
    ])
    setStats(s => ({
      ...s,
      users: users.count ?? 0,
      posts: postsRes.count ?? 0,
      comments: comments.count ?? 0,
      reactions: reactions.count ?? 0,
    }))
  }, [])

  const fetchPosts = useCallback(async (page = 1) => {
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    const { data, count } = await supabase
      .from('posts')
      .select('id,text,category,comment_count,created_at,is_admin', { count: 'exact' })
      .eq('is_admin', false)
      .order('created_at', { ascending: false })
      .range(from, to)
    setPosts(data ?? [])
    setPostsTotal(count ?? 0)
    setPostsPage(page)
  }, [])

  const fetchAllHighlights = useCallback(async () => {
    const { data } = await supabase
      .from('posts')
      .select('id, title, text, admin_category')
      .eq('is_admin', true)
      .order('admin_category')
    setAllHighlights((data ?? []).map(d => ({
      category: d.admin_category ?? '',
      title: d.title ?? '',
      subtitle: d.text ?? '',
      postId: d.id,
    })))
  }, [])

  const fetchHighlight = useCallback(async (postId: string) => {
    const { data } = await supabase
      .from('posts')
      .select('id, title, text, admin_category')
      .eq('id', postId)
      .single()
    if (data) setHighlight({ category: data.admin_category ?? '', title: data.title ?? '', subtitle: data.text ?? '', postId: data.id })
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const fetchUsers = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, email, is_admin, created_at')
      .order('created_at', { ascending: false })
    setUsers(data ?? [])
  }, [])

  const fetchActivityStats = useCallback(async () => {
    const now = new Date()
    const ago24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
    const ago7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const ago30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const [r24, r7, r30] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('last_seen_at', ago24h),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('last_seen_at', ago7d),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('last_seen_at', ago30d),
    ])
    setActive24h(r24.count ?? 0)
    setActive7d(r7.count ?? 0)
    setActive30d(r30.count ?? 0)
  }, [])

  const fetchRegistrationsChart = useCallback(async (range: '7d' | '30d' | '1y') => {
    const now = new Date()
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 365
    const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
    const { data } = await supabase.from('profiles').select('created_at').gte('created_at', since)

    const points: DayPoint[] = []
    if (range === '1y') {
      // Group by month
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const label = d.toLocaleDateString('sr-RS', { month: '2-digit', year: '2-digit' })
        const ym = d.toISOString().slice(0, 7)
        const count = (data ?? []).filter(r => r.created_at?.slice(0, 7) === ym).length
        points.push({ label, value: count })
      }
    } else {
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const label = d.toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit' })
        const dateStr = d.toISOString().slice(0, 10)
        const count = (data ?? []).filter(r => r.created_at?.slice(0, 10) === dateStr).length
        points.push({ label, value: count })
      }
    }
    setRegistrationsChart(points)
  }, [])

  useEffect(() => {
    if (!loading) { fetchStats(); fetchPosts(); fetchAllHighlights(); fetchUsers(); fetchActivityStats(); fetchRegistrationsChart(chartRange) }
  }, [loading, fetchStats, fetchPosts, fetchAllHighlights, fetchUsers, fetchActivityStats, fetchRegistrationsChart, chartRange])

  useEffect(() => {
    if (loading) return
    const channel = supabase.channel('online-users')
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<{ user_id: string; username: string }>()
      const users = Object.values(state).flat().map(p => p.username).filter(Boolean)
      setOnlineUsers(users)
      setStats(s => ({ ...s, activeUsers: users.length }))
    })
    channel.subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [loading])


  async function handleSaveHighlight() {
    if (!highlight?.postId) return
    setSaving(true)
    await supabase.from('posts').update({ title: highlight.title, text: highlight.subtitle }).eq('id', highlight.postId)
    await supabase.from('daily_highlights').update({
      title: highlight.title,
      subtitle: highlight.subtitle,
      updated_at: new Date().toISOString(),
    }).eq('category', highlight.category)
    setSaving(false)
    fetchAllHighlights()
    showToast('Tema dana sačuvana! ✅')
  }

  async function handleDeleteHighlight(postId: string) {
    if (!confirm('Obrisati ovu temu?')) return
    await supabase.from('posts').delete().eq('id', postId)
    setAllHighlights(h => h.filter(x => x.postId !== postId))
    if (highlight?.postId === postId) setHighlight(null)
    showToast('Tema obrisana.')
  }

  async function handleDeletePost(id: string) {
    if (!confirm('Obrisati ovu priču?')) return
    await supabase.from('posts').delete().eq('id', id)
    fetchPosts(postsPage)
    setPostsTotal(t => t - 1)
    showToast('Priča obrisana.')
  }

  async function handleCreateHighlight() {
    if (!newPost.title.trim() && !newPost.subtitle.trim()) return
    setCreating(true)
    const { data: { session } } = await supabase.auth.getSession()
    const { error } = await supabase.from('posts').insert({
      title: newPost.title,
      text: newPost.subtitle,
      category: newPost.category,
      admin_category: newPost.category,
      is_admin: true,
      user_id: session?.user.id,
    })
    setCreating(false)
    if (!error) {
      setNewPost({ category: newPost.category, title: '', subtitle: '' })
      fetchAllHighlights()
      showToast('Nova tema kreirana! ✅')
    } else {
      showToast('Greška pri kreiranju.')
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/')
  }

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0E0E0F', color: '#ADADB8', fontSize: 14 }}>Provera pristupa...</div>
  }

  return (
    <div className="admin-layout">

      {/* Mobile Header */}
      <div className="admin-mobile-header">
        <div className="admin-mobile-header-logo">
          <div className="admin-mobile-header-logo-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.35A9.96 9.96 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg>
          </div>
          <div>
            <div className="admin-mobile-header-title">WhisperX</div>
            <div className="admin-mobile-header-sub">Admin Panel</div>
          </div>
        </div>
        <button className="admin-mobile-logout" onClick={handleLogout}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <div className="admin-sidebar-logo-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.35A9.96 9.96 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg>
          </div>
          <div>
            <div className="admin-sidebar-logo-name">WhisperX</div>
            <div className="admin-sidebar-logo-sub">Admin Panel</div>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-nav-label">Glavni</div>
          <button className={`admin-nav-link${section === 'dashboard' ? ' active' : ''}`} onClick={() => setSection('dashboard')}>
            <svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
            Dashboard
          </button>
          <button className="admin-nav-link" onClick={() => router.push('/')}>
            <svg viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>
            Prikaži sajt
          </button>

          <div className="admin-nav-label" style={{ marginTop: 12 }}>Sadržaj</div>
          <button className={`admin-nav-link${section === 'users' ? ' active' : ''}`} onClick={() => setSection('users')}>
            <svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            Korisnici
            <span className="admin-nav-badge">{stats.users}</span>
          </button>
          <button className={`admin-nav-link${section === 'posts' ? ' active' : ''}`} onClick={() => setSection('posts')}>
            <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
            Priče
            <span className="admin-nav-badge">{stats.posts}</span>
          </button>

          <div className="admin-nav-label" style={{ marginTop: 12 }}>Alati</div>
          <button className={`admin-nav-link${section === 'tema' ? ' active' : ''}`} onClick={() => setSection('tema')}>
            <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            Tema dana
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <div className="admin-sidebar-avatar">{(adminUser?.username || 'A')[0].toUpperCase()}</div>
            <div className="admin-sidebar-user-info">
              <div className="admin-sidebar-username">{adminUser?.username}</div>
              <div className="admin-sidebar-role">Administrator</div>
            </div>
            <button className="admin-btn-logout" onClick={handleLogout} title="Odjavi se">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        <header className="admin-header">
          <div>
            <div className="admin-header-title">
              {section === 'dashboard' ? 'Dashboard' : section === 'posts' ? 'Priče' : section === 'users' ? 'Korisnici' : 'Tema dana'}
            </div>
            <div className="admin-header-sub">
              {section === 'dashboard' ? 'Pregled statistika i aktivnosti' : section === 'posts' ? 'Upravljanje pričama korisnika' : section === 'users' ? 'Pregled svih registrovanih korisnika' : 'Uredi temu dana po kategoriji'}
            </div>
          </div>
          <div className="admin-header-live">
            <div className="admin-live-dot" />
            Live
          </div>
        </header>

        <div className="admin-content">

          {/* DASHBOARD */}
          {section === 'dashboard' && (
            <>
              <div className="admin-stats-grid">
                <div className="admin-stat-card red">
                  <div className="admin-stat-header">
                    <span className="admin-stat-label">Korisnici</span>
                    <div className="admin-stat-icon red">
                      <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    </div>
                  </div>
                  <div className="admin-stat-value">{stats.users}</div>
                  <div className="admin-stat-label">registrovanih</div>
                  <div className="admin-stat-divider" />
                  <div className="admin-stat-active">
                    <span className="admin-stat-active-dot" />
                    <span className="admin-stat-active-count">{stats.activeUsers}</span>
                    <span className="admin-stat-active-label">online sada</span>
                  </div>
                </div>

                <div className="admin-stat-card blue">
                  <div className="admin-stat-header">
                    <span className="admin-stat-label">Priče</span>
                    <div className="admin-stat-icon blue">
                      <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                    </div>
                  </div>
                  <div className="admin-stat-value">{stats.posts}</div>
                  <div className="admin-stat-label">objavljenih</div>
                </div>

                <div className="admin-stat-card green">
                  <div className="admin-stat-header">
                    <span className="admin-stat-label">Komentari</span>
                    <div className="admin-stat-icon green">
                      <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    </div>
                  </div>
                  <div className="admin-stat-value">{stats.comments}</div>
                  <div className="admin-stat-label">ukupno</div>
                </div>

                <div className="admin-stat-card purple">
                  <div className="admin-stat-header">
                    <span className="admin-stat-label">Reakcije</span>
                    <div className="admin-stat-icon purple">
                      <svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
                    </div>
                  </div>
                  <div className="admin-stat-value">{stats.reactions}</div>
                  <div className="admin-stat-label">ukupno</div>
                </div>
              </div>

              {/* Aktivnost + Registracije — 50/50 */}
              <div className="admin-half-row">
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <div className="admin-panel-title">Aktivni korisnici</div>
                  </div>
                  <div className="admin-activity-row">
                    <div className="admin-activity-cell">
                      <div className="admin-activity-value">{active24h}</div>
                      <div className="admin-activity-label">poslednja 24h</div>
                    </div>
                    <div className="admin-activity-divider" />
                    <div className="admin-activity-cell">
                      <div className="admin-activity-value">{active7d}</div>
                      <div className="admin-activity-label">poslednja 7 dana</div>
                    </div>
                    <div className="admin-activity-divider" />
                    <div className="admin-activity-cell">
                      <div className="admin-activity-value">{active30d}</div>
                      <div className="admin-activity-label">poslednji mesec</div>
                    </div>
                  </div>
                </div>

                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <div className="admin-panel-title">Registracije</div>
                    <div className="admin-chart-range-btns">
                      {(['7d', '30d', '1y'] as const).map(r => (
                        <button
                          key={r}
                          className={`admin-chart-range-btn${chartRange === r ? ' active' : ''}`}
                          onClick={() => { setChartRange(r); fetchRegistrationsChart(r) }}
                        >
                          {r === '7d' ? '7 dana' : r === '30d' ? '30 dana' : 'Godina'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <MiniBarChart data={registrationsChart} />
                </div>
              </div>

              {/* Online users */}
              {onlineUsers.length > 0 && (
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <div className="admin-panel-title">
                      <span className="admin-stat-active-dot" style={{ display: 'inline-block' }} />
                      Online sada
                    </div>
                    <span className="admin-panel-badge">{onlineUsers.length}</span>
                  </div>
                  <div className="admin-online-list">
                    {onlineUsers.map((username, i) => (
                      <div key={i} className="admin-online-item">
                        <div className="admin-online-avatar">{username[0]?.toUpperCase()}</div>
                        <span className="admin-online-name">{username}</span>
                        <span className="admin-stat-active-dot" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent posts preview */}
              <div className="admin-panel">
                <div className="admin-panel-header">
                  <div className="admin-panel-title">Nedavne priče</div>
                  <button className="admin-panel-action" onClick={() => setSection('posts')}>Sve priče →</button>
                </div>
                <AdminPostsTable posts={posts.slice(0, 5)} onDelete={handleDeletePost} />
              </div>
            </>
          )}

          {/* USERS */}
          {section === 'users' && (
            <div className="admin-panel">
              <div className="admin-panel-header">
                <div className="admin-panel-title">Svi korisnici</div>
                <span className="admin-panel-badge">{users.length}</span>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Korisnik</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Uloga</th>
                      <th>Registrovan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => {
                      const isOnline = onlineUsers.includes(u.username ?? '')
                      const joined = new Date(u.created_at).toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric' })
                      return (
                        <tr key={u.id}>
                          <td>
                            <div className="admin-user-cell">
                              <div className="admin-online-avatar">{(u.username || '?')[0].toUpperCase()}</div>
                              <span style={{ fontWeight: 600 }}>{u.username || '—'}</span>
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-3)', fontSize: 13 }}>{u.email || '—'}</td>
                          <td>
                            <span className={`admin-status-pill ${isOnline ? 'online' : 'offline'}`}>
                              <span className={`admin-status-dot ${isOnline ? 'online' : ''}`} />
                              {isOnline ? 'Online' : 'Offline'}
                            </span>
                          </td>
                          <td>
                            {u.is_admin
                              ? <span className="admin-role-pill admin">Admin</span>
                              : <span className="admin-role-pill user">Korisnik</span>}
                          </td>
                          <td style={{ color: 'var(--text-3)', fontSize: 12 }}>{joined}</td>
                        </tr>
                      )
                    })}
                    {users.length === 0 && (
                      <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-3)', padding: 32 }}>Nema korisnika</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* POSTS */}
          {section === 'posts' && (
            <div className="admin-panel">
              <div className="admin-panel-header">
                <div className="admin-panel-title">Sve priče ({stats.posts})</div>
              </div>
              <AdminPostsTable
                posts={posts}
                onDelete={handleDeletePost}
                page={postsPage}
                totalCount={postsTotal}
                onPageChange={p => fetchPosts(p)}
              />
            </div>
          )}

          {/* TEMA DANA */}
          {section === 'tema' && (
            <div className="admin-content-grid">

              {/* Lista tema */}
              <div className="admin-panel">
                <div className="admin-panel-header">
                  <div className="admin-panel-title">Pregled tema</div>
                  <span className="admin-panel-badge">{allHighlights.length} tema</span>
                </div>
                <div style={{ padding: '0 16px 12px' }}>
                  <div className="admin-cat-selector">
                    <button
                      className={`admin-cat-btn${filterCat === 'all' ? ' active' : ''}`}
                      onClick={() => setFilterCat('all')}
                    >
                      Sve
                    </button>
                    {CATEGORIES.filter(c => c !== 'sve').map(cat => (
                      <button
                        key={cat}
                        className={`admin-cat-btn${filterCat === cat ? ' active' : ''}`}
                        onClick={() => setFilterCat(cat)}
                      >
                        {CAT_EMOJIS[cat]} {CAT_LABELS[cat]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="admin-highlights-list">
                  {allHighlights
                    .filter(h => filterCat === 'all' || h.category === filterCat)
                    .map(h => (
                      <div
                        key={h.postId}
                        className={`admin-highlight-item${highlight?.postId === h.postId ? ' active' : ''}`}
                        onClick={() => setHighlight(h)}
                      >
                        <div className="admin-highlight-item-top">
                          <span className={`cat-pill cat-${h.category}`}>{CAT_EMOJIS[h.category]} {CAT_LABELS[h.category]}</span>
                          <button
                            className="admin-highlight-delete"
                            onClick={e => { e.stopPropagation(); handleDeleteHighlight(h.postId!) }}
                            title="Obriši"
                          >×</button>
                        </div>
                        <div className="admin-highlight-item-title">{h.title || <em style={{ opacity: 0.4 }}>Bez naslova</em>}</div>
                        <div className="admin-highlight-item-sub">{h.subtitle || <em style={{ opacity: 0.4 }}>Bez teksta</em>}</div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Desni panel — Novi post + Edit */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Kreiranje novog posta */}
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <div className="admin-panel-title">
                      <div className="admin-panel-title-icon">
                        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
                      </div>
                      Nova tema
                    </div>
                  </div>
                  <div className="admin-editor-form">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Kategorija</label>
                      <select
                        className="admin-form-input"
                        value={newPost.category}
                        onChange={e => setNewPost(p => ({ ...p, category: e.target.value }))}
                      >
                        {CATEGORIES.filter(c => c !== 'sve').map(cat => (
                          <option key={cat} value={cat}>{CAT_EMOJIS[cat]} {CAT_LABELS[cat]}</option>
                        ))}
                      </select>
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Naslov</label>
                      <input
                        className="admin-form-input"
                        placeholder="Naslov teme dana..."
                        value={newPost.title}
                        onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Tekst / poziv na akciju</label>
                      <textarea
                        className="admin-form-input admin-form-textarea"
                        placeholder="Kratki opis ili poziv na akciju..."
                        value={newPost.subtitle}
                        onChange={e => setNewPost(p => ({ ...p, subtitle: e.target.value }))}
                      />
                    </div>
                    <div className="admin-editor-actions">
                      <button
                        className="admin-btn-primary"
                        onClick={handleCreateHighlight}
                        disabled={creating || (!newPost.title.trim() && !newPost.subtitle.trim())}
                      >
                        {creating ? 'Kreiranje...' : '+ Kreiraj temu'}
                      </button>
                      <button className="admin-btn-secondary" onClick={() => setNewPost(p => ({ ...p, title: '', subtitle: '' }))}>
                        Obriši polja
                      </button>
                    </div>
                  </div>
                </div>

                {/* Editor postojeće teme */}
                {highlight && (
                  <div className="admin-panel">
                    <div className="admin-panel-header">
                      <div className="admin-panel-title">
                        <div className="admin-panel-title-icon">
                          <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                        </div>
                        Uredi — {CAT_EMOJIS[highlight.category]} {CAT_LABELS[highlight.category]}
                      </div>
                      <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 18 }} onClick={() => setHighlight(null)}>×</button>
                    </div>
                    <div className="admin-editor-form">
                      <div className="admin-form-group">
                        <label className="admin-form-label">Naslov</label>
                        <input
                          className="admin-form-input"
                          placeholder="Naslov teme dana..."
                          value={highlight.title}
                          onChange={e => setHighlight(h => h ? { ...h, title: e.target.value } : h)}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Tekst / poziv na akciju</label>
                        <textarea
                          className="admin-form-input admin-form-textarea"
                          placeholder="Kratki opis / poziv na akciju..."
                          value={highlight.subtitle}
                          onChange={e => setHighlight(h => h ? { ...h, subtitle: e.target.value } : h)}
                        />
                      </div>
                      <div className="admin-editor-actions">
                        <button className="admin-btn-primary" onClick={handleSaveHighlight} disabled={saving}>
                          {saving ? 'Čuvanje...' : 'Sačuvaj'}
                        </button>
                        <button className="admin-btn-secondary" onClick={() => highlight.postId && fetchHighlight(highlight.postId)}>
                          Poništi
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="admin-mobile-nav">
        <button className={`admin-mobile-nav-btn${section === 'dashboard' ? ' active' : ''}`} onClick={() => setSection('dashboard')}>
          <svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
          Dashboard
        </button>
        <button className={`admin-mobile-nav-btn${section === 'posts' ? ' active' : ''}`} onClick={() => setSection('posts')}>
          <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
          Priče
        </button>
        <button className={`admin-mobile-nav-btn${section === 'tema' ? ' active' : ''}`} onClick={() => setSection('tema')}>
          <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
          Tema dana
        </button>
        <button className="admin-mobile-nav-btn" onClick={() => router.push('/')}>
          <svg viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>
          Sajt
        </button>
      </nav>

      {toast && <div className="admin-toast show">{toast}</div>}
    </div>
  )
}


function AdminPostsTable({ posts, onDelete, page, totalCount, onPageChange }: {
  posts: Post[]
  onDelete: (id: string) => void
  page?: number
  totalCount?: number
  onPageChange?: (p: number) => void
}) {
  function timeAgo(ts: string) {
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 60000)
    if (diff < 60) return `pre ${diff}min`
    if (diff < 1440) return `pre ${Math.floor(diff / 60)}h`
    return `pre ${Math.floor(diff / 1440)}d`
  }

  const resolvedPage = page ?? 1
  const resolvedTotal = totalCount ?? 0
  const totalPages = Math.max(1, Math.ceil(resolvedTotal / PAGE_SIZE))

  return (
    <div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Priča</th>
              <th>Kategorija</th>
              <th>Komentari</th>
              <th>Vreme</th>
              <th>Akcije</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id}>
                <td className="admin-td-text">{post.text}</td>
                <td><span className={`cat-pill cat-${post.category}`}>{post.category}</span></td>
                <td>{post.comment_count}</td>
                <td style={{ color: 'var(--text-3)', fontSize: 12, whiteSpace: 'nowrap' }}>{timeAgo(post.created_at)}</td>
                <td>
                  <div className="admin-table-actions">
                    <button className="admin-btn-delete" onClick={() => onDelete(post.id)}>Obriši</button>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-3)', padding: 32 }}>Nema priča</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="admin-pagination">
          <button className="admin-page-btn" onClick={() => onPageChange(1)} disabled={resolvedPage === 1}>«</button>
          <button className="admin-page-btn" onClick={() => onPageChange(resolvedPage - 1)} disabled={resolvedPage === 1}>‹</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - resolvedPage) <= 2)
            .reduce<(number | '...')[]>((acc, p, i, arr) => {
              if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...')
              acc.push(p)
              return acc
            }, [])
            .map((p, i) =>
              p === '...'
                ? <span key={`ellipsis-${i}`} className="admin-page-ellipsis">…</span>
                : <button key={p} className={`admin-page-btn${resolvedPage === p ? ' active' : ''}`} onClick={() => onPageChange(p as number)}>{p}</button>
            )}
          <button className="admin-page-btn" onClick={() => onPageChange(resolvedPage + 1)} disabled={resolvedPage === totalPages}>›</button>
          <button className="admin-page-btn" onClick={() => onPageChange(totalPages)} disabled={resolvedPage === totalPages}>»</button>
          <span className="admin-page-info">{(resolvedPage - 1) * PAGE_SIZE + 1}–{Math.min(resolvedPage * PAGE_SIZE, resolvedTotal)} od {resolvedTotal}</span>
        </div>
      )}
    </div>
  )
}

function MiniBarChart({ data }: { data: DayPoint[] }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="admin-bar-chart">
      {data.map((d, i) => (
        <div key={i} className="admin-bar-col">
          <div className="admin-bar-value">{d.value > 0 ? d.value : ''}</div>
          <div className="admin-bar-wrap">
            <div
              className="admin-bar"
              style={{ height: `${Math.max((d.value / max) * 100, d.value > 0 ? 4 : 0)}%` }}
            />
          </div>
          <div className="admin-bar-label">{d.label}</div>
        </div>
      ))}
    </div>
  )
}
