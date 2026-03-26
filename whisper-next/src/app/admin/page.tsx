'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CATEGORIES = ['sve', 'ljubav', 'blamovi', 'misli', 'random', 'posao', 'veze']
const CAT_LABELS: Record<string, string> = { sve: 'Sve', ljubav: 'Ljubav', blamovi: 'Blamovi', misli: 'Misli', random: 'Random', posao: 'Posao', veze: 'Veze' }

type Section = 'dashboard' | 'posts' | 'tema'

interface Stats { users: number; posts: number; comments: number; reactions: number }
interface Post { id: string; text: string; category: string; comment_count: number; created_at: string; is_admin: boolean }
interface Highlight { category: string; title: string; subtitle: string }

export default function AdminPage() {
  const router = useRouter()
  const [adminUser, setAdminUser] = useState<{ username: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [section, setSection] = useState<Section>('dashboard')
  const [stats, setStats] = useState<Stats>({ users: 0, posts: 0, comments: 0, reactions: 0 })
  const [posts, setPosts] = useState<Post[]>([])
  const [highlight, setHighlight] = useState<Highlight>({ category: 'sve', title: '', subtitle: '' })
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
    setStats({
      users: users.count ?? 0,
      posts: postsRes.count ?? 0,
      comments: comments.count ?? 0,
      reactions: reactions.count ?? 0,
    })
  }, [])

  const fetchPosts = useCallback(async () => {
    const { data } = await supabase.from('posts').select('id,text,category,comment_count,created_at,is_admin').eq('is_admin', false).order('created_at', { ascending: false }).limit(50)
    setPosts(data ?? [])
  }, [])

  const fetchHighlight = useCallback(async (cat: string) => {
    const { data } = await supabase.from('daily_highlights').select('*').eq('category', cat).single()
    if (data) setHighlight({ category: cat, title: data.title ?? '', subtitle: data.subtitle ?? '' })
    else setHighlight({ category: cat, title: '', subtitle: '' })
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!loading) { fetchStats(); fetchPosts() }
  }, [loading, fetchStats, fetchPosts])

  useEffect(() => {
    if (!loading) fetchHighlight(highlight.category)
  }, [highlight.category, loading, fetchHighlight])

  async function handleSaveHighlight() {
    setSaving(true)
    await supabase.from('daily_highlights').update({ title: highlight.title, subtitle: highlight.subtitle, updated_at: new Date().toISOString() }).eq('category', highlight.category)
    setSaving(false)
    showToast('Tema dana sačuvana! ✅')
  }

  async function handleDeletePost(id: string) {
    if (!confirm('Obrisati ovu priču?')) return
    await supabase.from('posts').delete().eq('id', id)
    setPosts(p => p.filter(x => x.id !== id))
    showToast('Priča obrisana.')
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

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <div className="admin-sidebar-logo-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.35A9.96 9.96 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg>
          </div>
          <div>
            <div className="admin-sidebar-logo-name">Whisper</div>
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
              {section === 'dashboard' ? 'Dashboard' : section === 'posts' ? 'Priče' : 'Tema dana'}
            </div>
            <div className="admin-header-sub">
              {section === 'dashboard' ? 'Pregled statistika i aktivnosti' : section === 'posts' ? 'Upravljanje pričama korisnika' : 'Uredi temu dana po kategoriji'}
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

          {/* POSTS */}
          {section === 'posts' && (
            <div className="admin-panel">
              <div className="admin-panel-header">
                <div className="admin-panel-title">Sve priče ({stats.posts})</div>
              </div>
              <AdminPostsTable posts={posts} onDelete={handleDeletePost} />
            </div>
          )}

          {/* TEMA DANA */}
          {section === 'tema' && (
            <div className="admin-content-grid">
              <div className="admin-panel">
                <div className="admin-panel-header">
                  <div className="admin-panel-title">
                    <div className="admin-panel-title-icon">
                      <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                    </div>
                    Tema dana editor
                  </div>
                  <span className="admin-panel-badge">Live</span>
                </div>

                <div className="admin-editor-form">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Kategorija</label>
                    <div className="admin-cat-selector">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          className={`admin-cat-btn${highlight.category === cat ? ' active' : ''}`}
                          onClick={() => setHighlight(h => ({ ...h, category: cat }))}
                        >
                          {CAT_LABELS[cat]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Naslov</label>
                    <input
                      className="admin-form-input"
                      placeholder="Naslov teme dana..."
                      value={highlight.title}
                      onChange={e => setHighlight(h => ({ ...h, title: e.target.value }))}
                      maxLength={80}
                    />
                    <span className="admin-char-hint">{highlight.title.length}/80</span>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Podnaslov</label>
                    <textarea
                      className="admin-form-input admin-form-textarea"
                      placeholder="Kratki opis / poziv na akciju..."
                      value={highlight.subtitle}
                      onChange={e => setHighlight(h => ({ ...h, subtitle: e.target.value }))}
                      maxLength={160}
                    />
                    <span className="admin-char-hint">{highlight.subtitle.length}/160</span>
                  </div>

                  <div className="admin-editor-preview">
                    <div className="admin-preview-tag">✨ Tema dana</div>
                    <div className="admin-preview-title">{highlight.title || 'Naslov teme...'}</div>
                    <div className="admin-preview-subtitle">{highlight.subtitle || 'Podnaslov...'}</div>
                  </div>

                  <div className="admin-editor-actions">
                    <button className="admin-btn-primary" onClick={handleSaveHighlight} disabled={saving}>
                      {saving ? 'Čuvanje...' : 'Sačuvaj temu'}
                    </button>
                    <button className="admin-btn-secondary" onClick={() => fetchHighlight(highlight.category)}>
                      Poništi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {toast && <div className="admin-toast show">{toast}</div>}
    </div>
  )
}

function AdminPostsTable({ posts, onDelete }: { posts: Post[]; onDelete: (id: string) => void }) {
  function timeAgo(ts: string) {
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 60000)
    if (diff < 60) return `pre ${diff}min`
    if (diff < 1440) return `pre ${Math.floor(diff / 60)}h`
    return `pre ${Math.floor(diff / 1440)}d`
  }
  return (
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
  )
}
