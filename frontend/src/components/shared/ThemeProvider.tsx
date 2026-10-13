import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ThemeContext, getPreferredTheme } from '../../lib/theme'
import type { Theme } from '../../lib/theme'

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, updateTheme] = useState<Theme>(() => {
    const existing = document.documentElement.dataset.theme
    if (existing === 'dark' || existing === 'light') return existing
    return getPreferredTheme()
  })

  function setTheme(next: Theme) {
    updateTheme(next)
    try { localStorage.setItem('ragify-theme', next) } catch { /* Keep working without storage. */ }
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#050A14' : '#F7F8FA')
  }, [theme])

  useEffect(() => {
    const syncPreference = (event: StorageEvent) => {
      if (event.key === 'ragify-theme') {
        const next = event.newValue === 'dark' || event.newValue === 'light' ? event.newValue : getPreferredTheme()
        updateTheme(next)
      }
    }
    window.addEventListener('storage', syncPreference)
    return () => window.removeEventListener('storage', syncPreference)
  }, [])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}
