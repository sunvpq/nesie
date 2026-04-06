import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import client from '../../api/client'
import { useAuthStore } from '../../store/authStore'
import { ShieldCheck, ChevronLeft } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useTheme } from '../../context/ThemeContext'

export default function IINInput() {
  const navigate = useNavigate()
  const { updateUser } = useAuthStore()
  const { t } = useLanguage()
  const { theme } = useTheme()

  const isDark = theme === 'dark'
  const bg = isDark ? '#0A0A0A' : '#F5F5F5'
  const cardBg = isDark ? '#111' : '#FFFFFF'
  const border = isDark ? '#1F1F1F' : '#E5E5E5'
  const accent = isDark ? '#AAFF00' : '#88CC00'
  const text = isDark ? '#FFFFFF' : '#0A0A0A'

  const [iin, setIin] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isValid = iin.length === 12 && /^\d{12}$/.test(iin)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 12)
    setIin(raw)
    setError('')
  }

  const handleSubmit = async () => {
    if (!isValid) {
      setError(t('auth.iinError'))
      return
    }
    setIsLoading(true)
    setError('')
    try {
      await client.post('/user/iin', { iin })
      updateUser({ iin })
      navigate('/home')
    } catch (err: any) {
      setError(err?.response?.data?.detail || t('auth.iinBindFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: bg }}>
      <div className="p-4">
        <button
          onClick={() => navigate('/auth/onboarding')}
          className="flex items-center gap-1 py-2"
          style={{ color: '#666' }}
        >
          <ChevronLeft size={20} />
          <span className="text-sm">{t('auth.back')}</span>
        </button>
      </div>

      <div className="flex-1 px-4 pt-2">
        <div className="w-full max-w-sm mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
              style={{ backgroundColor: accent }}
            >
              <ShieldCheck size={24} color="#0A0A0A" />
            </div>

            <h1
              className="text-xl font-bold mb-2"
              style={{ color: text, fontFamily: "'Unbounded', sans-serif", fontSize: 20 }}
            >
              {t('auth.connectPKB')}
            </h1>
            <p className="text-sm mb-1" style={{ color: '#666' }}>{t('auth.iinNeeded')}</p>
            <p className="text-xs mb-8" style={{ color: isDark ? '#333' : '#AAA' }}>{t('auth.iinPrivacy')}</p>

            <div className="mb-4">
              <label className="block text-xs mb-2 ml-1" style={{ color: '#666' }}>{t('auth.iinLabel')}</label>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="000000000000"
                value={iin}
                onChange={handleChange}
                onKeyDown={(e) => e.key === 'Enter' && isValid && handleSubmit()}
                className="w-full px-4 py-4 rounded-xl text-lg font-medium tracking-widest outline-none transition-colors"
                style={{
                  backgroundColor: cardBg,
                  color: text,
                  caretColor: accent,
                  border: error
                    ? '1px solid rgba(255,59,59,0.5)'
                    : iin.length > 0
                    ? `1px solid ${isDark ? 'rgba(170,255,0,0.3)' : 'rgba(136,204,0,0.3)'}`
                    : `1px solid ${border}`,
                }}
                autoFocus
              />
              {iin.length > 0 && (
                <div className="flex gap-1 mt-2.5">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 h-0.5 rounded-full transition-colors"
                      style={{ backgroundColor: i < iin.length ? accent : border }}
                    />
                  ))}
                </div>
              )}
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs mt-2 ml-1"
                  style={{ color: '#FF3B3B' }}
                >
                  {error}
                </motion.p>
              )}
            </div>

            <div
              className="rounded-xl p-4 mb-6 flex gap-3"
              style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}
            >
              <ShieldCheck size={16} color={accent} className="flex-shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed" style={{ color: '#666' }}>{t('auth.iinSecurity')}</p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isValid || isLoading}
              className="w-full py-4 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-40 mb-3"
              style={{
                backgroundColor: isValid ? accent : (isDark ? '#1F1F1F' : '#E5E5E5'),
                color: isValid ? '#0A0A0A' : '#666',
                fontFamily: "'Unbounded', sans-serif",
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {t('auth.connecting')}
                </span>
              ) : (
                t('auth.connectPKB')
              )}
            </button>

            <button
              onClick={() => navigate('/home')}
              className="w-full py-3 text-sm"
              style={{ color: '#666' }}
            >
              {t('auth.skipForNow')}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
