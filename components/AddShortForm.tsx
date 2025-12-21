// components/AddShortForm.tsx
import { useEffect, useRef, useState } from 'react'

type ShortItem = { id: number; videoUrl: string; title: string; tags: string[] }
// onAdded parameter renamed to _item to avoid unused-var lint warnings in type positions
type Props = { onAdded: (_item: ShortItem) => void }

/**
 * Deterministic floating-label AddShortForm
 * - Idle top is computed from constants so every label is pixel-centered inside its input
 * - Floating uses a transform (GPU) for smooth animation
 * - Self-contained inline styles to avoid external CSS coupling for the component
 */
export default function AddShortForm({ onAdded }: Props) {
  const [videoUrl, setVideoUrl] = useState('')
  const [title, setTitle] = useState('')
  const [tagsRaw, setTagsRaw] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [focused, setFocused] = useState<{ [k: string]: boolean }>({})
  const [canPreview, setCanPreview] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const mountedRef = useRef(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    mountedRef.current = true
    try {
      const t = document.documentElement.getAttribute('data-theme')
      if (t === 'light' || t === 'dark') setTheme(t)
    } catch {}
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    setPreviewError(null)
    if (!videoUrl.trim()) {
      setCanPreview(false)
      return
    }
    const u = videoUrl.trim()
    const isLikelyVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(u)
    setCanPreview(Boolean(isLikelyVideo))
  }, [videoUrl])

  function parseTags(raw: string) {
    return raw.split(',').map(s => s.trim()).filter(Boolean)
  }
  function isValidUrl(u: string) {
    try {
      const p = new URL(u)
      return p.protocol === 'http:' || p.protocol === 'https:'
    } catch {
      return false
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    const trimmedUrl = videoUrl.trim()
    const trimmedTitle = title.trim()
    const tags = parseTags(tagsRaw)
    if (!trimmedUrl || !trimmedTitle) {
      setError('Video URL and Title are required.')
      return
    }
    if (!isValidUrl(trimmedUrl)) {
      setError('Please enter a valid URL (http/https).')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/shorts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: trimmedUrl, title: trimmedTitle, tags })
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error((j && (j as any).error) || `Server returned ${res.status}`)
      }
      const created = await res.json()
      setSuccess('Short Added')
      setVideoUrl('')
      setTitle('')
      setTagsRaw('')
      onAdded(created)
      setTimeout(() => setSuccess(null), 1200)
    } catch (err: any) {
      setError(err?.message || 'Failed to add short')
    } finally {
      setLoading(false)
    }
  }

  function onPreviewLoaded() { setPreviewError(null) }
  function onPreviewError() { setPreviewError('Preview failed to load') }

  // ---------- layout constants (single source of truth) ----------
  const INPUT_HEIGHT = 44 // px
  const INPUT_PADDING = 12 // px
  const WRAPPER_PADDING_TOP = 16 // px
  const LABEL_IDLE_FONT = 13 // px
  const LABEL_FLOAT_FONT = 12 // px

  // ⭐ PERFECT optical centering
  const LABEL_NUDGE = -4 // <-- micro nudge to visually centre

  const contentHeight = INPUT_HEIGHT - 2 * INPUT_PADDING
  const idleTopPx = Math.round(
    WRAPPER_PADDING_TOP +
      INPUT_PADDING +
      (contentHeight - LABEL_IDLE_FONT) / 2 +
      LABEL_NUDGE
  )

  const FLOAT_TRANSLATE_PX = -28

  const borderColor = theme === 'light' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)'
  const inputBg = theme === 'light' ? '#ffd3c4' : 'rgba(255,255,255,0.02)'
  const mutedColor = 'var(--muted)'

  const fieldWrap: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 12,
    paddingTop: WRAPPER_PADDING_TOP
  }

  const inputBase: React.CSSProperties = {
    width: '100%',
    height: INPUT_HEIGHT,
    padding: `${INPUT_PADDING}px`,
    borderRadius: 10,
    border: `1px solid ${borderColor}`,
    background: inputBg,
    color: 'inherit',
    outline: 'none',
    fontSize: 14,
    boxSizing: 'border-box',
    transition: 'box-shadow .12s ease, border-color .12s ease, background .12s ease'
  }

  function getLabelStyle(active: boolean): React.CSSProperties {
    return {
      position: 'absolute',
      left: 12,
      top: `${idleTopPx}px`,
      transform: active ? `translateY(${FLOAT_TRANSLATE_PX}px) scale(0.92)` : 'translateY(0) scale(1)',
      fontSize: `${active ? LABEL_FLOAT_FONT : LABEL_IDLE_FONT}px`,
      color: active ? 'var(--text)' : mutedColor,
      transition: 'transform 220ms cubic-bezier(0.2,0.8,0.2,1), font-size 140ms ease, color 120ms linear',
      pointerEvents: 'none',
      zIndex: 6,
      padding: '0 6px',
      background: active ? inputBg : 'transparent',
      whiteSpace: 'nowrap',
      willChange: 'transform'
    }
  }

  const inputFocusStyle = {
    boxShadow: theme === 'light' ? '0 6px 18px rgba(184,92,246,0.12)' : '0 6px 18px rgba(59,130,246,0.14)',
    borderColor: theme === 'light' ? 'rgba(184,92,246,0.6)' : 'rgba(59,130,246,0.6)'
  }

  const ctaGradient = theme === 'light' ? 'linear-gradient(90deg,#ff7a88,#b85cf6)' : 'linear-gradient(90deg,#3B82F6,#06B6D4)'
  const ctaStyle: React.CSSProperties = {
    padding: '10px 14px',
    borderRadius: 10,
    border: 'none',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
    background: ctaGradient,
    boxShadow: '0 10px 30px rgba(2,6,23,0.18)'
  }

  const resetBtnStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: 10,
    border: `1px solid ${borderColor}`,
    background: 'transparent',
    color: 'var(--text)',
    cursor: 'pointer'
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }} aria-live="polite">
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 420px', minWidth: 260 }}>
          {/* VIDEO URL */}
          <div style={fieldWrap}>
            <label htmlFor="videoUrl" style={getLabelStyle(Boolean(focused['videoUrl'] || videoUrl))}>Video URL</label>
            <input
              id="videoUrl"
              type="url"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              onFocus={() => setFocused(s => ({ ...s, videoUrl: true }))}
              onBlur={() => setFocused(s => ({ ...s, videoUrl: false }))}
              style={{
                ...inputBase,
                ...(focused['videoUrl'] ? inputFocusStyle : {})
              }}
              placeholder=""
              required
            />
            <div style={{ fontSize: 12, color: mutedColor, marginTop: 6 }}>
              Tip: paste a direct mp4 URL (sample: sample-5s.mp4). Tags optional.
            </div>
          </div>

          {/* TITLE */}
          <div style={fieldWrap}>
            <label htmlFor="title" style={getLabelStyle(Boolean(focused['title'] || title))}>Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onFocus={() => setFocused(s => ({ ...s, title: true }))}
              onBlur={() => setFocused(s => ({ ...s, title: false }))}
              style={{
                ...inputBase,
                ...(focused['title'] ? inputFocusStyle : {})
              }}
              placeholder=""
              required
            />
          </div>

          {/* TAGS */}
          <div style={fieldWrap}>
            <label htmlFor="tags" style={getLabelStyle(Boolean(focused['tags'] || tagsRaw))}>Tags (comma separated)</label>
            <input
              id="tags"
              type="text"
              value={tagsRaw}
              onChange={e => setTagsRaw(e.target.value)}
              onFocus={() => setFocused(s => ({ ...s, tags: true }))}
              onBlur={() => setFocused(s => ({ ...s, tags: false }))}
              style={{
                ...inputBase,
                ...(focused['tags'] ? inputFocusStyle : {})
              }}
              placeholder=""
            />
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button type="submit" disabled={loading} style={ctaStyle}>
                {loading ? 'Adding…' : 'Add Short'}
              </button>
              <button type="button" onClick={() => { setVideoUrl(''); setTitle(''); setTagsRaw(''); setError(null); }} style={resetBtnStyle}>
                Reset
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {error && <div role="alert" style={{ color: '#ffd7d7', background: '#5f1d1d', padding: '6px 10px', borderRadius: 8, fontWeight: 700 }}>{error}</div>}
              {success && <div role="status" style={{ color: '#e6fff6', background: '#064e3b', padding: '6px 10px', borderRadius: 8, fontWeight: 700 }}>{success}</div>}
            </div>
          </div>
        </div>

        {/* Preview card */}
        <div style={{
          width: 300,
          minWidth: 220,
          borderRadius: 12,
          overflow: 'hidden',
          background: theme === 'light' ? 'rgba(0,0,0,0.02)' : 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
          border: `1px solid ${borderColor}`,
          padding: 10,
          boxSizing: 'border-box'
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Preview</div>

          <div style={{ width: '100%', height: 170, background: 'rgba(0,0,0,0.06)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {canPreview ? (
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                muted
                playsInline
                preload="metadata"
                onLoadedMetadata={onPreviewLoaded}
                onError={onPreviewError}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }}
              />
            ) : (
              <div style={{ color: mutedColor, padding: 12, textAlign: 'center' }}>
                {videoUrl ? 'Preview is not available/Invalid URL' : 'Enter a direct mp4/webm/ogg URL to preview here'}
              </div>
            )}
          </div>

          <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 12, color: mutedColor }}>
              {previewError ? previewError : canPreview ? 'Playable preview' : 'No preview'}
            </div>
            <div style={{ fontSize: 12, color: mutedColor }}>
              {title ? title : 'No title'}
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
