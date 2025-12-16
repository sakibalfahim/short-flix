// components/VideoCard.tsx
import { useEffect, useRef, useState } from 'react'
import styles from '../styles/Home.module.css'

type Short = {
  id: number
  videoUrl: string
  title: string
  tags: string[]
}

export default function VideoCard({ short }: { short: Short }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [liked, setLiked] = useState(false)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('short-flix-likes') || '{}'
      const obj = JSON.parse(stored) as Record<string, boolean>
      setLiked(Boolean(obj[short.id]))
    } catch {
      setLiked(false)
    }
  }, [short.id])

  function toggleLike() {
    try {
      const stored = localStorage.getItem('short-flix-likes') || '{}'
      const obj = JSON.parse(stored) as Record<string, boolean>
      if (obj[short.id]) delete obj[short.id]
      else obj[short.id] = true
      localStorage.setItem('short-flix-likes', JSON.stringify(obj))
      setLiked(Boolean(obj[short.id]))
    } catch {
      // ignore
    }
  }

  async function handleMouseEnter() {
    setHovering(true)
    const v = videoRef.current
    if (!v) return
    try {
      v.muted = true
      v.playsInline = true
      const p = v.play()
      if (p && typeof p.then === 'function') await p.catch(()=>{})
    } catch {}
  }

  function handleMouseLeave() {
    setHovering(false)
    const v = videoRef.current
    if (!v) return
    try {
      v.pause()
    } catch {}
  }

  return (
    <article id={`short-${short.id}`} className={styles.card} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className={styles.videoWrap}>
        <video
          ref={videoRef}
          src={short.videoUrl}
          controls
          preload="metadata"
          className={styles.video}
        />
        <div aria-hidden className={`${styles.hoverHint} ${hovering ? styles.hovering : ''}`}>
          ▶
        </div>
      </div>

      <div className={styles.meta}>
        <h3 className={styles.title}>{short.title}</h3>
        <div className={styles.tags}>
          {short.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
        </div>
        <div className={styles.actions}>
          <button className={styles.likeBtn} onClick={toggleLike} aria-pressed={liked}>
            {liked ? '♥ Liked' : '♡ Like'}
          </button>
        </div>
      </div>
    </article>
  )
}
