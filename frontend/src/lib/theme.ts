import { createContext, useContext } from 'react'

export type Theme = 'light' | 'dark'

export function getPreferredTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const saved = window.localStorage.getItem('ragify-theme')
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const ThemeContext = createContext<{ theme: Theme; setTheme: (theme: Theme) => void } | null>(null)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('Theme controls must be inside ThemeProvider.')
  return context
}
