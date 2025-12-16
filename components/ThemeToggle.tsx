// components/ThemeToggle.tsx
import { useEffect, useState } from 'react'

export default function ThemeToggle({ theme, setTheme }: { theme: 'light' | 'dark'; setTheme: (t: 'light' | 'dark') => void }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isLight = theme === 'light'

  if (!mounted) {
    return (
      <button
        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 6, fontSize: 20 }}
        aria-hidden="true"
      >
        <span style={{ display: 'inline-block', width: 22, height: 18 }} />
      </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(isLight ? 'dark' : 'light')}
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} theme`}
      title={`Switch to ${isLight ? 'dark' : 'light'} theme`}
      style={{
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        padding: 6,
        fontSize: 20,
        lineHeight: 1,
      }}
    >
      {isLight ? '🌙' : '☀️'}
    </button>
  )
}
