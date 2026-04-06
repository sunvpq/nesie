import { useState } from 'react'
import { motion } from 'framer-motion'
import type { SimCalcResult } from '../utils/simulatorCalc'
import { getScoreGrade } from '../utils/scoreUtils'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import { Check, AlertTriangle, X as XIcon, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'

interface SimulatorResultProps {
  result: SimCalcResult
  onExplainClick: () => void
  aiExplanation: string | null
  isLoadingAI: boolean
}

function formatTenge(amount: number): string {
  const formatted = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0')
  return `${formatted}\u00A0₸`
}

export default function SimulatorResult({ result, onExplainClick, aiExplanation, isLoadingAI }: SimulatorResultProps) {
  const { t, lang } = useLanguage()
  const { theme } = useTheme()
  const [showRecoveryDetail, setShowRecoveryDetail] = useState(false)

  const isDark = theme === 'dark'
  const bg = isDark ? '#111' : '#FFFFFF'
  const border = isDark ? '#1F1F1F' : '#E5E5E5'
  const accent = isDark ? '#AAFF00' : '#88CC00'
  const text = isDark ? '#FFFFFF' : '#0A0A0A'
  const muted = '#666'
  const dim = isDark ? '#333' : '#AAA'
  const subBg = isDark ? '#0A0A0A' : '#F5F5F5'

  const beforeGrade = getScoreGrade(result.currentScore, t)
  const afterGrade = getScoreGrade(result.projectedScore, t)
  const isNegative = result.scoreDelta < 0

  const verdictConfig = {
    recommend: {
      label: t('sim.recommend'),
      color: accent,
      bg: isDark ? 'rgba(170,255,0,0.08)' : 'rgba(136,204,0,0.08)',
      border: isDark ? 'rgba(170,255,0,0.2)' : 'rgba(136,204,0,0.2)',
    },
    caution: {
      label: t('sim.caution'),
      color: '#FFB800',
      bg: 'rgba(255,184,0,0.08)',
      border: 'rgba(255,184,0,0.2)',
    },
    decline: {
      label: t('sim.decline'),
      color: '#FF3B3B',
      bg: 'rgba(255,59,59,0.08)',
      border: 'rgba(255,59,59,0.2)',
    },
  }
  const vc = verdictConfig[result.verdict]

  // Breakdown labels
  const breakdownLabels: Record<string, Record<string, string>> = {
    ru: {
      inquiry: 'новый запрос в ПКБ',
      new_account: 'открытие нового кредита',
      dti: `DTI поднимется до ${Math.round(result.newDTI * 100)}%`,
      amount: `крупная сумма кредита (${formatTenge(result.totalPaid - result.overpayment)})`,
      type_micro: 'микрозайм — высокий риск',
      type_consumer: 'потребительский кредит',
      type_mortgage: 'ипотека (позитивно)',
    },
    kk: {
      inquiry: 'ПКБ-ға жаңа сұрау',
      new_account: 'жаңа несие ашу',
      dti: `DTI ${Math.round(result.newDTI * 100)}%-ға дейін көтеріледі`,
      amount: `үлкен несие сомасы (${formatTenge(result.totalPaid - result.overpayment)})`,
      type_micro: 'микроқарыз — жоғары тәуекел',
      type_consumer: 'тұтыну несиесі',
      type_mortgage: 'ипотека (оң)',
    },
  }
  const bl = breakdownLabels[lang] || breakdownLabels.ru

  function getBreakdownLabel(key: string): string {
    if (key === 'type') {
      const typeKey = `type_${result.breakdown.find(b => b.key === 'type') ? (
        result.projectedScore > result.currentScore ? 'mortgage' :
        result.breakdown.find(b => b.key === 'type')!.delta === -20 ? 'micro' :
        result.breakdown.find(b => b.key === 'type')!.delta === 5 ? 'mortgage' : 'consumer'
      ) : 'consumer'}`
      return bl[typeKey] || bl.type_consumer
    }
    return bl[key] || key
  }

  // Score bar percentage (300-850 range)
  const scoreRange = 850 - 300
  const beforePct = ((result.currentScore - 300) / scoreRange) * 100
  const afterPct = ((result.projectedScore - 300) / scoreRange) * 100

  // Recovery text
  const recoveryScore24m = Math.min(850, result.projectedScore + 24 * 3)
  const ruRecoveryText = `Ваш скор упадёт с ${result.currentScore} до ${result.projectedScore}. При своевременных платежах каждый месяц вы восстанавливаете ~3 пункта. Через ${result.recoveryMonths} месяцев скор вернётся к текущему уровню. Через 24 месяца (если не брать новых кредитов) скор может вырасти до ~${recoveryScore24m}.`
  const kkRecoveryText = `Сіздің скор ${result.currentScore}-ден ${result.projectedScore}-ге дейін түседі. Уақытылы төлемдер кезінде ай сайын ~3 ұпай қалпына келеді. ${result.recoveryMonths} айдан кейін скор қазіргі деңгейге оралады. 24 айдан кейін (жаңа несие алмасаңыз) скор ~${recoveryScore24m}-ге дейін көтерілуі мүмкін.`

  // Milestones
  const milestones = [
    {
      month: 0,
      score: result.projectedScore,
      label: lang === 'kk' ? 'Несие алғаннан кейін' : 'После оформления',
    },
    {
      month: result.recoveryMonths,
      score: result.currentScore,
      label: lang === 'kk' ? 'Қалпына келу' : 'Восстановление',
    },
    {
      month: 24,
      score: recoveryScore24m,
      label: lang === 'kk' ? 'Өсу әлеуеті' : 'Потенциал роста',
    },
  ]

  // Approval section labels
  const approvalLabels: Record<string, Record<string, string>> = {
    ru: {
      top: 'одобрят',
      mid: 'возможно одобрят',
      low: 'только МФО — высокий риск',
      rejected: 'высокая вероятность отказа',
      approvalTitle: 'Одобрение банков',
      approvalChance: 'Вероятность одобрения',
    },
    kk: {
      top: 'мақұлдайды',
      mid: 'мақұлдауы мүмкін',
      low: 'тек МФО — жоғары тәуекел',
      rejected: 'бас тарту ықтималдығы жоғары',
      approvalTitle: 'Банктердің мақұлдауы',
      approvalChance: 'Мақұлдау ықтималдығы',
    },
  }
  const al = approvalLabels[lang] || approvalLabels.ru

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mt-5 space-y-3"
    >
      {/* VERDICT BADGE */}
      <div
        className="rounded-2xl p-5"
        style={{ backgroundColor: vc.bg, border: `1px solid ${vc.border}` }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: vc.color }} />
          <span className="font-bold text-base" style={{ color: vc.color }}>
            {vc.label}
          </span>
        </div>
      </div>

      {/* SECTION A — Условия кредита */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: bg, border: `1px solid ${border}` }}>
        <h3 className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: muted }}>
          {lang === 'kk' ? 'Несие шарттары' : 'Условия кредита'}
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: isDark ? '#999' : '#666' }}>
              {lang === 'kk' ? 'Пайыздық мөлшерлеме' : 'Процентная ставка'}
            </span>
            <span className="font-semibold text-sm" style={{ color: text }}>
              {Math.round(result.annualRate * 100)}% {lang === 'kk' ? 'жылдық' : 'годовых'}
            </span>
          </div>
          <div className="h-px" style={{ backgroundColor: border }} />
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: isDark ? '#999' : '#666' }}>
              {t('sim.monthlyPayment')}
            </span>
            <span className="font-semibold text-sm" style={{ color: text }}>
              {formatTenge(result.monthlyPayment)}
            </span>
          </div>
          <div className="h-px" style={{ backgroundColor: border }} />
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: isDark ? '#999' : '#666' }}>
              {lang === 'kk' ? 'Жалпы төлем' : 'Общая выплата'}
            </span>
            <span className="font-semibold text-sm" style={{ color: text }}>
              {formatTenge(result.totalPaid)}
            </span>
          </div>
          <div className="h-px" style={{ backgroundColor: border }} />
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: isDark ? '#999' : '#666' }}>
              {lang === 'kk' ? 'Артық төлем' : 'Переплата'}
            </span>
            <span className="font-bold text-sm" style={{ color: result.overpayment > result.totalPaid * 0.3 ? '#FF3B3B' : '#FFB800' }}>
              {formatTenge(result.overpayment)}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION B — Влияние на скор */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: bg, border: `1px solid ${border}` }}>
        <h3 className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: muted }}>
          {t('sim.impactOnScore')}
        </h3>

        {/* Before / After */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex-1 text-center">
            <p className="text-xs mb-1.5" style={{ color: muted }}>{t('sim.before')}</p>
            <p
              className="text-4xl font-bold"
              style={{ color: beforeGrade.color, fontFamily: "'Unbounded', sans-serif" }}
            >
              {result.currentScore}
            </p>
            <p className="text-xs mt-1" style={{ color: beforeGrade.color }}>{beforeGrade.label}</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg" style={{ color: dim }}>→</span>
            <span
              className="text-sm font-bold"
              style={{
                color: isNegative ? '#FF3B3B' : accent,
                fontFamily: "'Unbounded', sans-serif",
              }}
            >
              {result.scoreDelta >= 0 ? `+${result.scoreDelta}` : result.scoreDelta}
            </span>
          </div>
          <div className="flex-1 text-center">
            <p className="text-xs mb-1.5" style={{ color: muted }}>{t('sim.after')}</p>
            <p
              className="text-4xl font-bold"
              style={{ color: afterGrade.color, fontFamily: "'Unbounded', sans-serif" }}
            >
              {result.projectedScore}
            </p>
            <p className="text-xs mt-1" style={{ color: afterGrade.color }}>{afterGrade.label}</p>
          </div>
        </div>

        {/* Score bar */}
        <div className="mb-5">
          <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? '#1A1A1A' : '#EEEEEE' }}>
            {/* Before marker */}
            <div
              className="absolute top-0 h-full rounded-full"
              style={{
                width: `${beforePct}%`,
                backgroundColor: isDark ? 'rgba(170,255,0,0.15)' : 'rgba(136,204,0,0.15)',
              }}
            />
            {/* After marker */}
            <div
              className="absolute top-0 h-full rounded-full"
              style={{
                width: `${afterPct}%`,
                backgroundColor: afterGrade.color,
                opacity: 0.6,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] mt-1" style={{ color: dim }}>
            <span>300</span>
            <span>850</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-2">
          {result.breakdown.map((item) => (
            <div key={item.key} className="flex items-center gap-2">
              <span
                className="text-xs font-bold w-12 text-right flex-shrink-0"
                style={{
                  color: item.delta < 0 ? '#FF3B3B' : accent,
                  fontFamily: "'Unbounded', sans-serif",
                }}
              >
                {item.delta > 0 ? `+${item.delta}` : item.delta}
              </span>
              <span className="text-xs" style={{ color: isDark ? '#999' : '#666' }}>
                {lang === 'kk' ? 'ұпай' : 'пунктов'}: {getBreakdownLabel(item.key)}
              </span>
            </div>
          ))}
          <div className="h-px mt-2" style={{ backgroundColor: border }} />
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold w-12 text-right flex-shrink-0"
              style={{
                color: result.scoreDelta < 0 ? '#FF3B3B' : accent,
                fontFamily: "'Unbounded', sans-serif",
              }}
            >
              {result.scoreDelta > 0 ? `+${result.scoreDelta}` : result.scoreDelta}
            </span>
            <span className="text-xs font-semibold" style={{ color: text }}>
              {lang === 'kk' ? 'ұпай барлығы' : 'пунктов итого'}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION C — Восстановление скора */}
      {result.recoveryMonths > 0 && (
        <div className="rounded-2xl p-5" style={{ backgroundColor: bg, border: `1px solid ${border}` }}>
          <button
            onClick={() => setShowRecoveryDetail(!showRecoveryDetail)}
            className="w-full flex items-center justify-between"
          >
            <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: muted }}>
              {lang === 'kk' ? 'Скорды қалпына келтіру' : 'Восстановление скора'}
            </h3>
            {showRecoveryDetail
              ? <ChevronUp size={16} color={muted} />
              : <ChevronDown size={16} color={muted} />
            }
          </button>

          {/* Mini timeline — always visible */}
          <div className="mt-4 flex items-start justify-between relative">
            {/* Line connecting milestones */}
            <div
              className="absolute top-3 left-[12%] right-[12%] h-px"
              style={{ backgroundColor: border }}
            />
            {milestones.map((m, i) => (
              <div key={i} className="flex flex-col items-center relative z-10 flex-1">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1.5"
                  style={{
                    backgroundColor: i === 0 ? (isDark ? '#1A1A1A' : '#EEEEEE') : i === 2 ? (isDark ? 'rgba(170,255,0,0.15)' : 'rgba(136,204,0,0.15)') : subBg,
                    color: i === 2 ? accent : isDark ? '#999' : '#666',
                    border: `1px solid ${i === 2 ? accent : border}`,
                  }}
                >
                  {m.month}
                </div>
                <p
                  className="text-sm font-bold"
                  style={{
                    color: i === 0 ? afterGrade.color : i === 2 ? accent : beforeGrade.color,
                    fontFamily: "'Unbounded', sans-serif",
                  }}
                >
                  {m.score}
                </p>
                <p className="text-[10px] text-center mt-0.5 max-w-[80px]" style={{ color: muted }}>
                  {m.label}
                </p>
              </div>
            ))}
          </div>

          {/* Expanded explanation */}
          {showRecoveryDetail && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-sm leading-relaxed mt-4 pt-4"
              style={{ color: isDark ? '#999' : '#666', borderTop: `1px solid ${border}` }}
            >
              {lang === 'kk' ? kkRecoveryText : ruRecoveryText}
            </motion.p>
          )}
        </div>
      )}

      {/* SECTION D — Одобрение банков */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: bg, border: `1px solid ${border}` }}>
        <h3 className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: muted }}>
          {al.approvalTitle}
        </h3>

        {/* Bank tiers */}
        <div className="space-y-3">
          {/* Top tier */}
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex-shrink-0">
              {result.approvalInfo.tier === 'top'
                ? <Check size={16} color={accent} strokeWidth={3} />
                : <XIcon size={16} color={dim} strokeWidth={2} />
              }
            </div>
            <div>
              <p className="text-sm" style={{ color: result.approvalInfo.tier === 'top' ? text : dim }}>
                Halyk, Kaspi, Forte
              </p>
              <p className="text-xs" style={{ color: result.approvalInfo.tier === 'top' ? accent : dim }}>
                {result.approvalInfo.tier === 'top' ? al.top : (lang === 'kk' ? 'скор ≥ 700 қажет' : 'нужен скор ≥ 700')}
              </p>
            </div>
          </div>

          {/* Mid tier */}
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex-shrink-0">
              {result.approvalInfo.tier === 'top' || result.approvalInfo.tier === 'mid'
                ? <AlertTriangle size={16} color="#FFB800" strokeWidth={2} />
                : <XIcon size={16} color={dim} strokeWidth={2} />
              }
            </div>
            <div>
              <p className="text-sm" style={{ color: (result.approvalInfo.tier === 'top' || result.approvalInfo.tier === 'mid') ? text : dim }}>
                Home Credit, {lang === 'kk' ? 'Еуразиялық' : 'Евразийский'}
              </p>
              <p className="text-xs" style={{ color: (result.approvalInfo.tier === 'top' || result.approvalInfo.tier === 'mid') ? '#FFB800' : dim }}>
                {(result.approvalInfo.tier === 'top' || result.approvalInfo.tier === 'mid') ? al.mid : (lang === 'kk' ? 'скор ≥ 600 қажет' : 'нужен скор ≥ 600')}
              </p>
            </div>
          </div>

          {/* Low tier */}
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex-shrink-0">
              {result.approvalInfo.tier !== 'rejected'
                ? <AlertTriangle size={16} color="#FF6B35" strokeWidth={2} />
                : <XIcon size={16} color="#FF3B3B" strokeWidth={2} />
              }
            </div>
            <div>
              <p className="text-sm" style={{ color: result.approvalInfo.tier !== 'rejected' ? text : dim }}>
                МФО Solva, МФО KMF
              </p>
              <p className="text-xs" style={{ color: result.approvalInfo.tier === 'rejected' ? '#FF3B3B' : '#FF6B35' }}>
                {result.approvalInfo.tier === 'rejected' ? al.rejected : al.low}
              </p>
            </div>
          </div>
        </div>

        {/* Approval probability */}
        <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${border}` }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs" style={{ color: muted }}>{al.approvalChance}</span>
            <span
              className="text-sm font-bold"
              style={{
                color: result.approvalInfo.chance >= 70 ? accent : result.approvalInfo.chance >= 40 ? '#FFB800' : '#FF3B3B',
                fontFamily: "'Unbounded', sans-serif",
              }}
            >
              {result.approvalInfo.chance}%
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? '#1A1A1A' : '#EEEEEE' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${result.approvalInfo.chance}%`,
                backgroundColor: result.approvalInfo.chance >= 70 ? accent : result.approvalInfo.chance >= 40 ? '#FFB800' : '#FF3B3B',
              }}
            />
          </div>
        </div>
      </div>

      {/* AI EXPLAIN BUTTON */}
      <button
        onClick={onExplainClick}
        disabled={isLoadingAI}
        className="w-full rounded-2xl p-4 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
        style={{
          backgroundColor: isDark ? 'rgba(170,255,0,0.06)' : 'rgba(136,204,0,0.06)',
          border: `1px solid ${isDark ? 'rgba(170,255,0,0.15)' : 'rgba(136,204,0,0.15)'}`,
          color: accent,
        }}
      >
        {isLoadingAI ? (
          <>
            <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: accent, borderTopColor: 'transparent' }} />
            <span className="text-sm font-medium">{lang === 'kk' ? 'Талдау жүргізілуде...' : 'Анализирую...'}</span>
          </>
        ) : (
          <>
            <Sparkles size={16} />
            <span className="text-sm font-semibold">
              {lang === 'kk' ? 'Толық түсіндіру' : 'Объяснить подробно'}
            </span>
          </>
        )}
      </button>

      {/* AI Explanation result */}
      {aiExplanation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5"
          style={{
            backgroundColor: isDark ? 'rgba(170,255,0,0.04)' : 'rgba(136,204,0,0.04)',
            border: `1px solid ${isDark ? 'rgba(170,255,0,0.1)' : 'rgba(136,204,0,0.1)'}`,
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} color={accent} />
            <span className="text-xs font-semibold" style={{ color: accent }}>
              {lang === 'kk' ? 'AI кеңесі' : 'AI-совет'}
            </span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: isDark ? '#CCC' : '#444' }}>
            {aiExplanation}
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
