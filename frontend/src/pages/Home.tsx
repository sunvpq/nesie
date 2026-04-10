import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ScoreRing, { AnimatedScore } from '../components/ScoreRing'
import FactorCard from '../components/FactorCard'
import { getCurrentScore } from '../api/score'
import { getLoans } from '../api/loans'
import { useScoreStore } from '../store/scoreStore'
import { useAuthStore } from '../store/authStore'
import { getScoreGrade } from '../utils/scoreUtils'
import { formatMoney, formatDate } from '../utils/formatters'
import { RefreshCw, ChevronRight, TrendingUp } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'

export default function Home() {
  const navigate = useNavigate()
  const { scoreData, loanData, setScoreData, setLoanData, isLoadingScore, setLoadingScore } =
    useScoreStore()
  const { user } = useAuthStore()
  const { t } = useLanguage()
  const { theme } = useTheme()

  const isDark = theme === 'dark'
  const bg = isDark ? '#0A0A0A' : '#F5F5F5'
  const cardBg = isDark ? '#111' : '#FFFFFF'
  const border = isDark ? '#1F1F1F' : '#E5E5E5'
  const accent = isDark ? '#AAFF00' : '#88CC00'
  const text = isDark ? '#FFFFFF' : '#0A0A0A'
  const muted = '#666'
  const dim = isDark ? '#333' : '#AAA'

  const loadData = async () => {
    setLoadingScore(true)
    try {
      const [score, loans] = await Promise.all([getCurrentScore(), getLoans()])
      setScoreData(score)
      setLoanData(loans)
    } catch (err) {
      console.error('Failed to load data', err)
    } finally {
      setLoadingScore(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const score = scoreData?.score ?? 0
  const grade = getScoreGrade(score, t)
  const delta = scoreData?.delta ?? 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: bg }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 lg:px-8 pt-10 lg:pt-12 pb-6">
          <div>
            <p className="text-sm" style={{ color: muted }}>
              {user?.full_name
                ? t('home.greetingName', { name: user.full_name.split(' ')[0] })
                : t('home.greeting')}
            </p>
            <h1
              className="text-2xl font-bold mt-1"
              style={{ color: text, fontFamily: "'Unbounded', sans-serif", fontSize: 22 }}
            >
              {t('home.title')}
            </h1>
          </div>
          <button
            onClick={loadData}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
            style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}
          >
            <RefreshCw
              size={16}
              color={muted}
              className={isLoadingScore ? 'animate-spin' : ''}
            />
          </button>
        </div>

        <div className="px-4 lg:px-8">
          {/* Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl p-6 lg:p-8 mb-4"
            style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}
          >
            {isLoadingScore && !scoreData ? (
              <div className="flex flex-col items-center py-10">
                <div
                  className="w-[240px] h-[240px] rounded-full flex items-center justify-center animate-pulse"
                  style={{ border: `4px solid ${border}` }}
                >
                  <span className="text-sm" style={{ color: muted }}>{t('home.loading')}</span>
                </div>
              </div>
            ) : !scoreData ? (
              <div className="flex flex-col items-center py-10 text-center">
                <div
                  className="w-[200px] h-[200px] rounded-full flex items-center justify-center mb-6"
                  style={{ border: `4px dashed ${border}` }}
                >
                  <TrendingUp size={48} color={dim} strokeWidth={1.5} />
                </div>
                <p
                  className="font-bold text-lg mb-2"
                  style={{ color: text, fontFamily: "'Unbounded', sans-serif", fontSize: 16 }}
                >
                  {t('home.scoreNotLoaded')}
                </p>
                <p className="text-sm max-w-xs leading-relaxed" style={{ color: muted }}>
                  {t('home.enterIIN')}
                </p>
                {!user?.iin && (
                  <button
                    onClick={() => navigate('/auth/iin')}
                    className="mt-6 px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.97]"
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
            ) : (
              <>
                <div className="flex items-center justify-center mb-5">
                  <ScoreRing score={score} animated size={260}>
                    <div className="flex flex-col items-center">
                      <AnimatedScore score={score} color={grade.color} fontSize={80} />
                      <p className="text-sm font-semibold mt-2" style={{ color: grade.color }}>
                        {grade.label}
                      </p>
                    </div>
                  </ScoreRing>
                </div>
                <div className="flex items-center justify-center gap-5">
                  <span
                    className="text-sm font-semibold"
                    style={{
                      color: delta >= 0 ? accent : '#FF3B3B',
                      fontFamily: "'Unbounded', sans-serif",
                      fontSize: 13,
                    }}
                  >
                    {delta >= 0 ? '↑' : '↓'} {delta >= 0 ? '+' : ''}{delta} {t('home.perMonth')}
                  </span>
                  <span className="text-xs" style={{ color: dim }}>
                    {t('home.updated')} {formatDate(scoreData.fetched_at)}
                  </span>
                </div>
              </>
            )}
          </motion.div>

          {/* Debt summary strip */}
          {loanData && loanData.loan_count > 0 && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              onClick={() => navigate('/loans')}
              className="w-full rounded-2xl p-5 mb-4 flex items-center justify-between"
              style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}
            >
              <div className="flex gap-6">
                <div className="text-left">
                  <p className="text-xs mb-1" style={{ color: muted }}>{t('home.monthly')}</p>
                  <p className="font-semibold" style={{ color: text }}>
                    {formatMoney(loanData.total_monthly)}
                  </p>
                </div>
                <div className="w-px" style={{ backgroundColor: border }} />
                <div className="text-left">
                  <p className="text-xs mb-1" style={{ color: muted }}>{t('home.remaining')}</p>
                  <p className="font-semibold" style={{ color: text }}>
                    {formatMoney(loanData.total_balance)}
                  </p>
                </div>
                <div className="w-px" style={{ backgroundColor: border }} />
                <div className="text-left">
                  <p className="text-xs mb-1" style={{ color: muted }}>{t('home.loansCount')}</p>
                  <p className="font-semibold" style={{ color: text }}>{loanData.loan_count}</p>
                </div>
              </div>
              <ChevronRight size={18} color={muted} />
            </motion.button>
          )}

          {/* No IIN banner */}
          {!user?.iin && scoreData && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() => navigate('/auth/iin')}
              className="w-full rounded-2xl p-5 mb-4 text-left"
              style={{
                backgroundColor: isDark ? 'rgba(170,255,0,0.05)' : 'rgba(136,204,0,0.05)',
                border: isDark ? '1px solid rgba(170,255,0,0.15)' : '1px solid rgba(136,204,0,0.15)',
              }}
            >
              <p className="font-semibold text-sm" style={{ color: accent }}>
                {t('home.connectPKBBanner')}
              </p>
              <p className="text-xs mt-1" style={{ color: muted }}>
                {t('home.enterIINForData')}
              </p>
            </motion.button>
          )}

          {/* Score factors */}
          {scoreData && scoreData.factors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mb-4"
            >
              <h2
                className="font-semibold text-sm mb-3 px-1"
                style={{ color: text, fontFamily: "'Unbounded', sans-serif" }}
              >
                {t('home.whatAffects')}
              </h2>
              {scoreData.factors.map((factor) => (
                <FactorCard key={factor.key} factor={factor} />
              ))}
            </motion.div>
          )}

        </div>
      </div>
    </div>
  )
}
