import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { sendOTP } from '../../api/auth'
import { useLanguage } from '../../context/LanguageContext'
import { useTheme } from '../../context/ThemeContext'

export default function PhoneInput() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const bg = isDark ? '#0A0A0A' : '#F5F5F5'
  const cardBg = isDark ? '#111' : '#FFFFFF'
  const border = isDark ? '#1F1F1F' : '#E5E5E5'
  const accent = isDark ? '#AAFF00' : '#88CC00'
  const text = isDark ? '#FFFFFF' : '#0A0A0A'
  const inputBg = isDark ? '#0A0A0A' : '#F5F5F5'

  const [digits, setDigits] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const phone = `+7${digits}`
  const isValid = digits.length === 10 && /^\d{10}$/.test(digits)

  const handleDigitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10)
    setDigits(raw)
    setError('')
  }

  const formatDisplay = (d: string) => {
    const p1 = d.slice(0, 3)
    const p2 = d.slice(3, 6)
    const p3 = d.slice(6, 8)
    const p4 = d.slice(8, 10)
    let result = p1
    if (p2) result += ' ' + p2
    if (p3) result += ' ' + p3
    if (p4) result += ' ' + p4
    return result
  }

  const handleSubmit = async () => {
    if (!isValid) {
      setError(t('auth.invalidPhone'))
      return
    }
    setIsLoading(true)
    setError('')
    try {
      await sendOTP(phone)
      sessionStorage.setItem('nesie_phone', phone)
      navigate('/auth/otp')
    } catch (err: any) {
      setError(err?.response?.data?.detail || t('auth.sendFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) handleSubmit()
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: bg }}>
      <div className="flex flex-col items-center pt-20 pb-10 px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: accent }}
            >
              <span className="font-bold text-base" style={{ color: '#0A0A0A', fontFamily: "'Unbounded', sans-serif" }}>
                N
              </span>
            </div>
            <span className="text-2xl font-bold" style={{ color: text, fontFamily: "'Unbounded', sans-serif" }}>
              Nesie
            </span>
          </div>
          <p className="text-sm" style={{ color: '#666' }}>{t('auth.creditRatingControl')}</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="flex-1 flex flex-col px-4"
      >
        <div className="w-full max-w-sm mx-auto">
          <div className="rounded-2xl p-6" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
            <h1
              className="text-xl font-bold mb-1"
              style={{ color: text, fontFamily: "'Unbounded', sans-serif", fontSize: 18 }}
            >
              {t('auth.login')}
            </h1>
            <p className="text-sm mb-6" style={{ color: '#666' }}>{t('auth.enterPhone')}</p>

            <div className="mb-5">
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-4 transition-colors cursor-text"
                style={{
                  backgroundColor: inputBg,
                  border: error
                    ? '1px solid rgba(255,59,59,0.5)'
                    : digits.length > 0
                    ? `1px solid ${isDark ? 'rgba(170,255,0,0.3)' : 'rgba(136,204,0,0.3)'}`
                    : `1px solid ${border}`,
                }}
                onClick={() => inputRef.current?.focus()}
              >
                <span className="font-semibold text-lg select-none" style={{ color: text }}>+7</span>
                <div className="w-px h-5" style={{ backgroundColor: border }} />
                <input
                  ref={inputRef}
                  type="tel"
                  inputMode="numeric"
                  placeholder={t('auth.phonePlaceholder')}
                  value={formatDisplay(digits)}
                  onChange={handleDigitsChange}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent outline-none text-lg font-medium"
                  style={{ color: text, caretColor: accent }}
                  autoFocus
                />
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs mt-2 ml-1"
                  style={{ color: '#FF3B3B' }}
                >
                  {error}
                </motion.p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isValid || isLoading}
              className="w-full py-4 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-40"
              style={{
                backgroundColor: isValid && !isLoading ? accent : (isDark ? '#1F1F1F' : '#E5E5E5'),
                color: isValid && !isLoading ? '#0A0A0A' : '#666',
                fontFamily: "'Unbounded', sans-serif",
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {t('auth.sending')}
                </span>
              ) : (
                t('auth.getCode')
              )}
            </button>
          </div>
        </div>
      </motion.div>

      <p className="text-center text-xs px-8 py-8" style={{ color: isDark ? '#333' : '#AAA' }}>
        {t('auth.terms')}{' '}
        <span style={{ color: accent }}>{t('auth.termsLink')}</span>
      </p>
    </div>
  )
}
