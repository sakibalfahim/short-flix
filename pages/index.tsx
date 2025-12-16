// pages/index.tsx
import { useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import VideoGrid from '../components/VideoGrid'
import ThemeToggle from '../components/ThemeToggle'
import AddShortForm from '../components/AddShortForm'

type Short = {
  id: number
  videoUrl: string
  title: string
  tags: string[]
}

export default function Home(props: any) {
  const { theme, setTheme } = props

  const [shorts, setShorts] = useState<Short[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [tag, setTag] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    async function fetchShorts() {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (q) params.set('q', q)
        if (tag) params.set('tag', tag)
        const res = await fetch('/api/shorts?' + params.toString())
        if (!res.ok) throw new Error('Failed to fetch shorts: ' + res.status)
        const data = await res.json()
        setShorts(data)
      } catch (err: any) {
        setError(err.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchShorts()
  }, [q, tag])

  useEffect(() => {
    if (!mounted) return
    if (showAdd) {
      const prev = window.scrollY || window.pageYOffset || 0
      ;(window as any).__SHORTFLIX_SCROLL_Y = prev
      document.body.style.position = 'fixed'
      document.body.style.top = `-${prev}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
    } else {
      const stored = (window as any).__SHORTFLIX_SCROLL_Y
      if (stored || stored === 0) {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        window.scrollTo(0, Number(stored) || 0)
        try { delete (window as any).__SHORTFLIX_SCROLL_Y } catch {}
      }
    }
    return () => {
      const stored = (window as any).__SHORTFLIX_SCROLL_Y
      if (stored || stored === 0) {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        window.scrollTo(0, Number(stored) || 0)
        try { delete (window as any).__SHORTFLIX_SCROLL_Y } catch {}
      }
    }
  }, [showAdd, mounted])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowAdd(false)
    }
    if (showAdd) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showAdd])

  function showToast(msg: string, ms = 1800) {
    setToast(msg)
    setTimeout(() => setToast(null), ms)
  }

  function onAddedShort(item: Short) {
    setShorts(prev => [item, ...prev])
    setShowAdd(false)
    setTimeout(() => showToast('Short Added'), 120)
    setTimeout(() => {
      const el = document.getElementById(`short-${item.id}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 200)
  }

  const [hoverAdd, setHoverAdd] = useState(false)

  const addButtonStyle = useMemo(() => {
    if (!mounted) return undefined
    const base: React.CSSProperties = {
      marginRight: 8,
      padding: '8px 12px',
      borderRadius: 10,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      cursor: 'pointer',
      fontWeight: 700,
      border: '1px solid',
      transition: 'transform .12s ease, background .12s ease, box-shadow .12s ease',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      zIndex: 10
    }
    const hoverTransform = hoverAdd ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)'
    const hoverShadow = hoverAdd ? '0 18px 42px rgba(2,6,23,0.36)' : (theme === 'light' ? '0 8px 28px rgba(3,7,18,0.06)' : '0 8px 28px rgba(3,7,18,0.3)')

    if (theme === 'light') {
      return { ...base, backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(0,0,0,0.08)', color: 'var(--text)', boxShadow: hoverShadow, transform: hoverTransform }
    }
    return { ...base, backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)', color: 'var(--text)', boxShadow: hoverShadow, transform: hoverTransform }
  }, [mounted, theme, hoverAdd])

  const modalOverlayStyle = useMemo(() => {
    if (!mounted) return undefined
    return {
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)',
      zIndex: 9999,
      padding: 24
    } as React.CSSProperties
  }, [mounted])

  const modalCardStyle = useMemo(() => {
    if (!mounted) return undefined
    if (theme === 'light') {
      return {
        width: 720,
        maxWidth: '100%',
        background: '#ffd3c4',
        color: '#081029',
        borderRadius: 14,
        padding: 20,
        boxShadow: '0 20px 60px rgba(4,8,20,0.12)',
        border: '1px solid rgba(0,0,0,0.06)'
      } as React.CSSProperties
    }
    return {
      width: 720,
      maxWidth: '100%',
      background: 'linear-gradient(180deg, rgba(10,14,30,0.95), rgba(12,18,36,0.95))',
      color: 'var(--text)',
      borderRadius: 14,
      padding: 20,
      boxShadow: '0 20px 60px rgba(2,6,23,0.7)',
      border: '1px solid rgba(255,255,255,0.04)'
    } as React.CSSProperties
  }, [mounted, theme])

  const closeBtnColor = theme === 'dark' ? '#fff' : '#081029'

  return (
    <div>
      <Head>
        <title>Short-flix — Mini</title>
        <meta name="description" content="Short-flix mini platform" />
      </Head>

      <main className="container fullscreen">
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 className="titleGradient">Short-flix</h1>
            <div className="subtitle">Mini platform</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="addButton"
              onClick={() => setShowAdd(true)}
              aria-expanded={showAdd}
              aria-controls="add-short-modal"
              title="Add Short"
              style={addButtonStyle}
              onMouseEnter={() => setHoverAdd(true)}
              onMouseLeave={() => setHoverAdd(false)}
              onMouseDown={() => setHoverAdd(true)}
              onMouseUp={() => setHoverAdd(false)}
            >
              <span className="addIcon" style={{ fontSize: 16 }}>➕</span>
              <span className="addLabel">Add Short</span>
            </button>

            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
        </header>

        <div className="controls-row">
          <div className="controls">
            <input aria-label="Search" placeholder="Search title or tags" value={q} onChange={e => setQ(e.target.value)} />
            <input aria-label="Filter by tag" placeholder="Filter by tag" value={tag} onChange={e => setTag(e.target.value)} />
            <button onClick={() => { setQ(''); setTag('') }}>Reset</button>
          </div>
        </div>

        {error && <div className="error">{error}</div>}
        {loading ? <div>Loading…</div> : <VideoGrid shorts={shorts} />}

        {showAdd && mounted && (
          <div id="add-short-modal" style={modalOverlayStyle} role="dialog" aria-modal="true" onClick={() => setShowAdd(false)}>
            <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <strong style={{ fontSize: 16 }}>Add Short</strong>
                <button
                  onClick={() => setShowAdd(false)}
                  style={{ border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer', color: closeBtnColor }}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <AddShortForm onAdded={onAddedShort} />
            </div>
          </div>
        )}

        {toast && (
          <div style={{
            position: 'fixed',
            left: '50%',
            top: 18,
            transform: 'translateX(-50%)',
            zIndex: 10000,
            padding: '12px 18px',
            borderRadius: 999,
            background: theme === 'light' ? 'linear-gradient(90deg,#333333,#111827)' : 'linear-gradient(90deg,#111827,#0b1224)',
            color: '#fff',
            boxShadow: '0 16px 40px rgba(2,6,23,0.6)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <span style={{ background: 'rgba(255,255,255,0.08)', padding: 6, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
            <span>Short Added</span>
          </div>
        )}
      </main>
    </div>
  )
}
