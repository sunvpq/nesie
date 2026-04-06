import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { translations, type Lang } from '../i18n/translations'

interface LanguageContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType | null>(null)

function getInitialLang(): Lang {
  const saved = localStorage.getItem('nesie_lang')
  if (saved === 'kk' || saved === 'ru') return saved
  return 'ru'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang)

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang)
    localStorage.setItem('nesie_lang', newLang)
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      let str = translations[lang][key] ?? translations['ru'][key] ?? key
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          str = str.replace(`{${k}}`, String(v))
        }
      }
      return str
    },
    [lang],
  )

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
