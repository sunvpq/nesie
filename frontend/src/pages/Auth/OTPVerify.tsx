import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { verifyOTP, sendOTP } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import { formatPhone } from '../../utils/formatters'
import { ChevronLeft } from 'lucide-react'
import client from '../../api/client'
import { useLanguage } from '../../context/LanguageContext'
import { useTheme } from '../../context/ThemeContext'

const OTP_LENGTH = 6

export default function OTPVerify() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { t } = useLanguage()
  const { theme } = useTheme()
  const phone = sessionStorage.getItem('nesie_phone') || ''

  const isDark = theme === 'dark'
  const bg = isDark ? '#0A0A0A' : '#F5F5F5'
  const cardBg = isDark ? '#111' : '#FFFFFF'
  const border = isDark ? '#1F1F1F' : '#E5E5E5'
  const accent = isDark ? '#AAFF00' : '#88CC00'
  const text = isDark ? '#FFFFFF' : '#0A0A0A'

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(45)
  const [canResend, setCanResend] = useState(false)

  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (!phone) { navigate('/auth/phone'); return }
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleChange = (index: number, value: string) => {
    setError('')
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, OTP_LENGTH)
      const newOtp = [...otp]
      for (let i = 0; i < pasted.length; i++) newOtp[i] = pasted[i]
      setOtp(newOtp)
      const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1)
      inputRefs.current[nextIndex]?.focus()
      if (pasted.length === OTP_LENGTH) submitOtp(newOtp.join(''))
      return
    }
    const digit = value.replace(/\D/g, '')
    if (!digit && value !== '') return
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus()
    if (digit && index === OTP_LENGTH - 1) {
      const fullOtp = newOtp.join('')
      if (fullOtp.length === OTP_LENGTH) submitOtp(fullOtp)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp]
        newOtp[index - 1] = ''
        setOtp(newOtp)
        inputRefs.current[index - 1]?.focus()
      } else {
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
      }
    }
  }

  const submitOtp = async (code: string) => {
    setIsLoading(true)
    setError('')
    try {
      const data = await verifyOTP(phone, code)
      login(data.access_token, data.refresh_token)
      try {
        const resp = await client.get('/user/me')
        login(data.access_token, data.refresh_token, resp.data)
      } catch {}
      if (data.is_new_user) navigate('/auth/onboarding')
      else navigate('/home')
    } catch (err: any) {
      setError(err?.response?.data?.detail || t('auth.wrongCode'))
      setOtp(Array(OTP_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    try {
      await sendOTP(phone)
      setCountdown(45)
      setCanResend(false)
      setOtp(Array(OTP_LENGTH).fill(''))
      setError('')
      inputRefs.current[0]?.focus()
    } catch {
      setError(t('auth.sendCodeFailed'))
    }
  }

  const handleConfirm = () => {
    const code = otp.join('')
    if (code.length === OTP_LENGTH) submitOtp(code)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: bg }}>
      <div className="p-4">
        <button
          onClick={() => navigate('/auth/phone')}
          className="flex items-center gap-1 py-2"
          style={{ color: '#666' }}
        >
          <ChevronLeft size={20} />
          <span className="text-sm">{t('auth.back')}</span>
        </button>
      </div>

      <div className="flex-1 px-4 pt-4 flex flex-col">
        <div className="w-full max-w-sm mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1
              className="text-xl font-bold mb-2"
              style={{ color: text, fontFamily: "'Unbounded', sans-serif", fontSize: 20 }}
            >
              {t('auth.enterCode')}
            </h1>
            <p className="text-sm mb-10" style={{ color: '#666' }}>
              {t('auth.codeSentTo')}{' '}
              <span className="font-medium" style={{ color: text }}>{formatPhone(phone)}</span>
            </p>

            <div className="flex gap-3 justify-center mb-8">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="tel"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onFocus={(e) => e.target.select()}
                  className="text-center text-2xl font-bold rounded-xl outline-none transition-all"
                  style={{
                    width: 56,
                    height: 64,
                    backgroundColor: cardBg,
                    color: text,
                    caretColor: accent,
                    fontFamily: "'Unbounded', sans-serif",
                    border: isLoading
                      ? `1px solid ${border}`
                      : error
                      ? '1px solid rgba(255,59,59,0.5)'
                      : digit
                      ? `1px solid ${accent}`
                      : `1px solid ${border}`,
                    opacity: isLoading ? 0.5 : 1,
                  }}
                  disabled={isLoading}
                />
              ))}
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-center mb-5"
                style={{ color: '#FF3B3B' }}
              >
                {error}
              </motion.p>
            )}

            <button
              onClick={handleConfirm}
              disabled={otp.join('').length !== OTP_LENGTH || isLoading}
              className="w-full py-4 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-40"
              style={{
                backgroundColor: otp.join('').length === OTP_LENGTH ? accent : (isDark ? '#1F1F1F' : '#E5E5E5'),
                color: otp.join('').length === OTP_LENGTH ? '#0A0A0A' : '#666',
                fontFamily: "'Unbounded', sans-serif",
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {t('auth.checking')}
                </span>
              ) : (
                t('auth.confirm')
              )}
            </button>

            <div className="text-center mt-6">
              {canResend ? (
                <button onClick={handleResend} className="text-sm font-medium" style={{ color: accent }}>
                  {t('auth.resend')}
                </button>
              ) : (
                <p className="text-sm" style={{ color: '#666' }}>
                  {t('auth.resendIn')}{' '}
                  <span className="font-medium" style={{ color: text }}>{countdown}с</span>
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
