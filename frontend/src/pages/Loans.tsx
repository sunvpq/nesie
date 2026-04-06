import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import LoanCard from '../components/LoanCard'
import { getLoans, syncLoans } from '../api/loans'
import { useScoreStore } from '../store/scoreStore'
import { useAuthStore } from '../store/authStore'
import { formatMoney } from '../utils/formatters'
import { RefreshCw, ChevronLeft, AlertCircle, CreditCard } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'

export default function Loans() {
  const navigate = useNavigate()
  const { loanData, setLoanData, isLoadingLoans, setLoadingLoans } = useScoreStore()
  const { user } = useAuthStore()
  const { t } = useLanguage()
  const { theme } = useTheme()
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState('')

  const isDark = theme === 'dark'
  const bg = isDark ? '#0A0A0A' : '#F5F5F5'
  const cardBg = isDark ? '#111' : '#FFFFFF'
  const border = isDark ? '#1F1F1F' : '#E5E5E5'
  const accent = isDark ? '#AAFF00' : '#88CC00'
  const text = isDark ? '#FFFFFF' : '#0A0A0A'

  const loadLoans = async () => {
    setLoadingLoans(true)
    setError('')
    try {
      const data = await getLoans()
      setLoanData(data)
    } catch {
      setError(t('loans.failedToLoad'))
    } finally {
      setLoadingLoans(false)
    }
  }

  const handleSync = async () => {
    if (!user?.iin) {
      navigate('/auth/iin')
      return
    }
    setSyncing(true)
    try {
      const data = await syncLoans()
      setLoanData(data)
    } catch (err: any) {
      setError(err?.response?.data?.detail || t('loans.syncError'))
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    loadLoans()
  }, [])

  const loans = loanData?.loans ?? []
  const totalBalance = loanData?.total_balance ?? 0
  const totalMonthly = loanData?.total_monthly ?? 0
  const dti = loanData?.dti

  const dtiPercent = dti !== null && dti !== undefined ? dti * 100 : null
  const dtiColor =
    dtiPercent === null ? '#666'
    : dtiPercent < 30 ? accent
    : dtiPercent < 50 ? '#FFB800'
    : '#FF3B3B'

  return (
    <div className="min-h-screen" style={{ backgroundColor: bg }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between px-5 lg:px-8 pt-10 lg:pt-12 pb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/home')} className="p-1 lg:hidden">
              <ChevronLeft size={22} color="#666" />
            </button>
            <h1
              className="text-xl font-bold"
              style={{ color: text, fontFamily: "'Unbounded', sans-serif", fontSize: 20 }}
            >
              {t('loans.title')}
            </h1>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing || isLoadingLoans}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ backgroundColor: cardBg, color: accent, border: `1px solid ${border}` }}
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {t('loans.refresh')}
          </button>
        </div>

        <div className="px-4 lg:px-8">
          {loans.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-5 mb-4"
              style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}
            >
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs mb-1" style={{ color: '#666' }}>{t('loans.totalDebt')}</p>
                  <p className="font-semibold text-sm" style={{ color: text }}>{formatMoney(totalBalance)}</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: '#666' }}>{t('loans.perMonth')}</p>
                  <p className="font-semibold text-sm" style={{ color: text }}>{formatMoney(totalMonthly)}</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: '#666' }}>{t('loans.dti')}</p>
                  <p className="font-semibold text-sm" style={{ color: dtiColor }}>
                    {dtiPercent !== null ? `${Math.round(dtiPercent)}%` : '—'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <div
              className="flex items-center gap-2 p-4 rounded-xl mb-3"
              style={{ backgroundColor: 'rgba(255,59,59,0.08)', border: '1px solid rgba(255,59,59,0.2)' }}
            >
              <AlertCircle size={16} color="#FF3B3B" />
              <p className="text-sm" style={{ color: '#FF3B3B' }}>{error}</p>
            </div>
          )}

          {isLoadingLoans && (
            <div className="flex items-center justify-center py-16">
              <div
                className="w-8 h-8 border-2 rounded-full animate-spin"
                style={{ borderColor: accent, borderTopColor: 'transparent' }}
              />
            </div>
          )}

          {!isLoadingLoans && loans.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              {loans.map((loan, index) => (
                <motion.div
                  key={loan.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <LoanCard loan={loan} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {!isLoadingLoans && loans.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}
              >
                <CreditCard size={28} color="#666" />
              </div>
              <p
                className="font-bold text-base mb-2"
                style={{ color: text, fontFamily: "'Unbounded', sans-serif", fontSize: 15 }}
              >
                {t('loans.noActiveLoans')}
              </p>
              <p className="text-sm text-center mb-6" style={{ color: '#666' }}>
                {user?.iin ? t('loans.pressRefresh') : t('loans.enterIINForLoans')}
              </p>
              {!user?.iin && (
                <button
                  onClick={() => navigate('/auth/iin')}
                  className="px-6 py-3 rounded-xl font-bold text-sm"
                  style={{
                    backgroundColor: accent,
                    color: '#0A0A0A',
                    fontFamily: "'Unbounded', sans-serif",
                  }}
                >
                  {t('home.connectPKB')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
