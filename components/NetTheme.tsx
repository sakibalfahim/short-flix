// components/NetTheme.tsx
'use client'
import { useEffect, useRef } from 'react'

/**
 * NetTheme.tsx — particle-net background (full-file replacement)
 * - Runs only on client
 * - Injects a canvas into <html> and keeps it behind UI
 * - Nodes ATTRACT to pointer (not repel)
 * - Respects prefers-reduced-motion
 * - Canvas class matches CSS (.particle-web-canvas)
 */

type NodeT = { x: number; y: number; vx: number; vy: number; ox: number; oy: number }

function prefersReducedMotion(): boolean {
  try {
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

function htmlIsDark(): boolean {
  try {
    const html = document.documentElement
    if (html && html.getAttribute('data-theme') === 'dark') return true
    const ls = localStorage.getItem('shortflix-theme')
    if (ls === 'dark') return true
  } catch {}
  return false
}

export default function NetTheme(): JSX.Element | null {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const nodesRef = useRef<NodeT[]>([])
  const pointerRef = useRef<{ x: number; y: number } | null>(null)
  const activeRef = useRef<boolean>(false)
  const roRef = useRef<ResizeObserver | null>(null)
  const moRef = useRef<MutationObserver | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return
    if (prefersReducedMotion()) return

    // helpers inside effect to keep hook stable
    function computeNodeCount(w: number, h: number) {
      const areaK = (w * h) / (1280 * 720)
      return Math.round(Math.min(48, Math.max(18, 24 * areaK)))
    }

    function initNodes(width: number, height: number) {
      const N = computeNodeCount(width, height)
      const nodes: NodeT[] = []
      for (let i = 0; i < N; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        nodes.push({
          x, y, ox: x, oy: y,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3
        })
      }
      nodesRef.current = nodes
    }

    function resizeCanvas(canvas: HTMLCanvasElement) {
      const dpr = Math.max(1, window.devicePixelRatio || 1)
      const vw = Math.max(320, Math.ceil(window.innerWidth))
      const vh = Math.max(240, Math.ceil(window.innerHeight))
      canvas.style.width = `${vw}px`
      canvas.style.height = `${vh}px`
      canvas.width = Math.round(vw * dpr)
      canvas.height = Math.round(vh * dpr)
      initNodes(canvas.width / dpr, canvas.height / dpr)
    }

    function step() {
      const canvas = canvasRef.current
      if (!canvas || !activeRef.current) {
        rafRef.current = null
        return
      }
      const ctx = canvas.getContext('2d', { alpha: true })
      if (!ctx) { rafRef.current = requestAnimationFrame(step); return }

      const dpr = Math.max(1, window.devicePixelRatio || 1)
      const W = canvas.width / dpr
      const H = canvas.height / dpr

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const nodes = nodesRef.current
      const t = performance.now() * 0.00004
      const windX = Math.cos(t * 0.8) * 0.06
      const windY = Math.sin(t * 0.65) * 0.05
      const p = pointerRef.current

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        // spring to origin
        n.vx += (n.ox - n.x) * 0.01
        n.vy += (n.oy - n.y) * 0.01
        // wind
        n.vx += windX * 0.06
        n.vy += windY * 0.06
        // damping & jitter
        n.vx *= 0.93
        n.vy *= 0.93
        n.vx += (Math.random() - 0.5) * 0.04
        n.vy += (Math.random() - 0.5) * 0.04

        // attraction: nodes move toward pointer (positive attraction)
        if (p) {
          const dx = p.x - n.x, dy = p.y - n.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001
          const radius = Math.max(120, Math.min(380, Math.max(W, H) * 0.18))
          if (dist < radius * 1.6) {
            const attraction = (1 - dist / (radius * 1.6)) * 0.95
            n.vx += (dx / dist) * attraction * 0.95
            n.vy += (dy / dist) * attraction * 0.95
          }
        }

        // integrate
        n.x += n.vx
        n.y += n.vy

        // soft wrap
        if (n.x < -40) n.x = W + 40
        if (n.x > W + 40) n.x = -40
        if (n.y < -40) n.y = H + 40
        if (n.y > H + 40) n.y = -40
      }

      // draw
      ctx.save()
      ctx.scale(dpr, dpr)
      ctx.lineCap = 'round'

      const MAX_LINK_DIST = Math.max(120, Math.min(260, Math.max(W, H) * 0.12))
      const BASE_ALPHA = 0.18
      const kNeighbors = 3

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        const dists: { idx: number; d: number }[] = []
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue
          const b = nodes[j]
          const dx = a.x - b.x, dy = a.y - b.y
          dists.push({ idx: j, d: dx * dx + dy * dy })
        }
        dists.sort((p, q) => p.d - q.d)
        for (let nidx = 0; nidx < Math.min(kNeighbors, dists.length); nidx++) {
          const nb = nodes[dists[nidx].idx]
          const dist = Math.sqrt(dists[nidx].d)
          if (dist > MAX_LINK_DIST) continue
          let alpha = Math.max(0, BASE_ALPHA - (dist / MAX_LINK_DIST) * 0.12)
          if (p) {
            const midx = (a.x + nb.x) / 2, midy = (a.y + nb.y) / 2
            const pd = Math.hypot(p.x - midx, p.y - midy)
            alpha += Math.max(0, 0.42 - pd / Math.max(W, H))
          }
          alpha = Math.min(0.95, alpha)
          ctx.beginPath()
          ctx.strokeStyle = `rgba(170,200,255,${alpha.toFixed(3)})`
          ctx.lineWidth = Math.max(0.35, 1 - dist / Math.max(W, H))
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(nb.x, nb.y)
          ctx.stroke()
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        const pd = p ? Math.hypot(n.x - p.x, n.y - p.y) : Infinity
        const inf = Math.max(0, 1 - pd / (Math.max(W, H) * 0.25))
        const r = 1.2 + inf * 2.8
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 3)
        grad.addColorStop(0, `rgba(210,235,255,${Math.min(0.98, 0.35 + inf * 0.65)})`)
        grad.addColorStop(1, `rgba(120,140,160,0)`)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
      rafRef.current = requestAnimationFrame(step)
    }

    // setup: append canvas to <html>
    const root = document.documentElement
    // avoid duplicating canvas if hot-reload re-runs effect
    const existing = root.querySelector('.particle-web-canvas') as HTMLCanvasElement | null
    if (existing) {
      canvasRef.current = existing
    } else {
      const canvas = document.createElement('canvas')
      canvas.setAttribute('aria-hidden', 'true')
      canvas.className = 'particle-web-canvas' // <-- match CSS
      canvas.style.position = 'fixed'
      canvas.style.inset = '0'
      canvas.style.pointerEvents = 'none'
      canvas.style.zIndex = '0'
      canvas.style.opacity = '1'
      canvas.style.display = 'block'
      canvasRef.current = canvas
      root.appendChild(canvas)
    }

    const canvas = canvasRef.current!
    resizeCanvas(canvas)

    // pointer handling (throttled)
    let last = 0
    function onPointer(e: PointerEvent) {
      const now = performance.now()
      if (now - last < 12) return
      last = now
      const rect = canvas.getBoundingClientRect()
      pointerRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    function onLeave() { pointerRef.current = null }

    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerleave', onLeave)

    const ro = new ResizeObserver(() => { const c = canvasRef.current; if (c) resizeCanvas(c) })
    ro.observe(document.documentElement); roRef.current = ro

    moRef.current = new MutationObserver(() => {
      const dark = htmlIsDark()
      if (dark && !activeRef.current) {
        activeRef.current = true
        if (!rafRef.current) rafRef.current = requestAnimationFrame(step)
      } else if (!dark && activeRef.current) {
        activeRef.current = false
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
        const c = canvasRef.current
        if (c) { const ctx = c.getContext('2d'); if (ctx) ctx.clearRect(0, 0, c.width, c.height) }
      }
    })
    moRef.current.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    // start only if dark initially
    activeRef.current = htmlIsDark()
    if (activeRef.current && !rafRef.current) rafRef.current = requestAnimationFrame(step)

    // cleanup
    return () => {
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerleave', onLeave)
      try { if (roRef.current) roRef.current.disconnect() } catch {}
      try { if (moRef.current) moRef.current.disconnect() } catch {}
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      // keep canvas element for HMR but clear drawing and detach if we created it now
      try { if (canvasRef.current && canvasRef.current.parentElement === root) root.removeChild(canvasRef.current) } catch {}
      rafRef.current = null
      canvasRef.current = null
    }
    // effect intentionally run once
  }, [])

  return null
}
