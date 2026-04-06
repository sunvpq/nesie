import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

const darkVars: Record<string, string> = {
  '--color-bg': '#0A0A0A',
  '--color-card': '#111111',
  '--color-border': '#1F1F1F',
  '--color-accent': '#AAFF00',
  '--color-text': '#FFFFFF',
  '--color-text-muted': '#666666',
  '--color-text-dim': '#333333',
  '--color-text-secondary': '#999999',
  '--color-danger': '#FF3B3B',
  '--color-warning': '#FFB800',
}

const lightVars: Record<string, string> = {
  '--color-bg': '#F5F5F5',
  '--color-card': '#FFFFFF',
  '--color-border': '#E5E5E5',
  '--color-accent': '#88CC00',
  '--color-text': '#0A0A0A',
  '--color-text-muted': '#666666',
  '--color-text-dim': '#AAAAAA',
  '--color-text-secondary': '#555555',
  '--color-danger': '#FF3B3B',
  '--color-warning': '#FFB800',
}

function getInitialTheme(): Theme {
  const saved = localStorage.getItem('nesie_theme')
  if (saved === 'light' || saved === 'dark') return saved
  return 'dark'
}

function applyTheme(theme: Theme) {
  const vars = theme === 'dark' ? darkVars : lightVars
  const root = document.documentElement
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value)
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Apply on mount
  useEffect(() => {
    applyTheme(theme)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('nesie_theme', next)
      return next
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
