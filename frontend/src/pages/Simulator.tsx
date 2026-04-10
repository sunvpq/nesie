import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import SimulatorResultComponent from '../components/SimulatorResult'
import { simulateCredit, type LoanType, type SimCalcResult } from '../utils/simulatorCalc'
import { useScoreStore } from '../store/scoreStore'
import { formatMoney, clamp } from '../utils/formatters'
import { BarChart2 } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'

function amountToTiyn(tenge: number) {
  return Math.round(tenge * 100)
}

export default function Simulator() {
  const { t, lang } = useLanguage()
  const { theme } = useTheme()
  const { scoreData, loanData } = useScoreStore()

  const isDark = theme === 'dark'
  const bg = isDark ? '#0A0A0A' : '#F5F5F5'
  const cardBg = isDark ? '#111' : '#FFFFFF'
  const border = isDark ? '#1F1F1F' : '#E5E5E5'
  const accent = isDark ? '#AAFF00' : '#88CC00'
  const text = isDark ? '#FFFFFF' : '#0A0A0A'
  const muted = '#666'

  const LOAN_TYPES: { key: LoanType; label: string }[] = [
    { key: 'consumer', label: t('sim.consumer') },
    { key: 'auto', label: t('sim.auto') },
    { key: 'mortgage', label: t('sim.mortgage') },
    { key: 'micro', label: t('sim.micro') },
  ]

  const [loanType, setLoanType] = useState<LoanType>('consumer')
  const [amountTenge, setAmountTenge] = useState(500000)
  const [termMonths, setTermMonths] = useState(24)
  const [incomeTenge, setIncomeTenge] = useState(200000)
  const [incomeInput, setIncomeInput] = useState('200000')

  // AI state
  const [aiExplanation, setAiExplanation] = useState<string | null>(null)
  const [isLoadingAI, setIsLoadingAI] = useState(false)

  // Current user data from store
  const currentScore = scoreData?.score ?? 650
  const currentMonthlyPayments = loanData
    ? Math.round(loanData.total_monthly / 100) // tiyn to tenge
    : 0

  // Reactive calculation — recalculates on every input change
  const calcResult: SimCalcResult | null = useMemo(() => {
    if (incomeTenge <= 0) return null
    return simulateCredit(
      { amount: amountTenge, termMonths, loanType, monthlyIncome: incomeTenge },
      { currentScore, currentMonthlyPayments },
    )
  }, [amountTenge, termMonths, loanType, incomeTenge, currentScore, currentMonthlyPayments])

  const amountLog = Math.log10(amountTenge / 1000)
  const handleAmountSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const logVal = parseFloat(e.target.value)
    const tenge = Math.round(Math.pow(10, logVal) * 1000)
    setAmountTenge(clamp(tenge, 50000, 10000000))
    setAiExplanation(null)
  }

  const getTermLabel = (months: number) => {
    if (months === 1) return `${months} ${t('sim.month1')}`
    if (months < 5) return `${months} ${t('sim.months24')}`
    return `${months} ${t('sim.months')}`
  }

  const handleExplainClick = useCallback(async () => {
    if (!calcResult || isLoadingAI) return
    setIsLoadingAI(true)
    setAiExplanation(null)

    const fmt = (n: number) => n.toLocaleString('ru-RU') + ' ₸'

    const loanNamesRu: Record<LoanType, string> = {
      consumer: 'потребительский кредит',
      auto: 'автокредит',
      mortgage: 'ипотеку',
      micro: 'микрозайм',
    }
    const loanNamesKk: Record<LoanType, string> = {
      consumer: 'тұтыну несиесін',
      auto: 'автонесиені',
      mortgage: 'ипотеканы',
      micro: 'микроқарызды',
    }
    const loanName = lang === 'kk' ? loanNamesKk[loanType] : loanNamesRu[loanType]
    const dtiPct = (calcResult.newDTI * 100).toFixed(0)
    const ratePct = (calcResult.annualRate * 100).toFixed(0)

    let explanation: string
    if (calcResult.verdict === 'decline') {
      explanation = lang === 'kk'
        ? `Қазір ${loanName} алу — қауіпті. Сіздің скорыңыз ${calcResult.projectedScore} балға дейін түседі, ал қарыз жүктемесі табысыңыздың ${dtiPct}%-ын құрайды — бұл сыни деңгей. Банктердің көпшілігі 60%-дан жоғары жүктемеде бас тартады. Артық төлем ${fmt(calcResult.overpayment)} құрайды. Алдымен бар несиелердің бірін жабуды ұсынамын — бұл скорды көтеріп, жүктемені азайтады.`
        : `Брать ${loanName} сейчас — рискованно. Ваш скор упадёт до ${calcResult.projectedScore} пунктов, а долговая нагрузка составит ${dtiPct}% от дохода — это критический уровень. Большинство банков отказывают при нагрузке выше 60%. Переплата составит ${fmt(calcResult.overpayment)}. Рекомендую сначала закрыть один из текущих кредитов — это поднимет скор и снизит нагрузку.`
    } else if (calcResult.verdict === 'caution') {
      explanation = lang === 'kk'
        ? `Бұл сомаға ${loanName} алуға болады, бірақ сақ болу керек. Скор ${calcResult.projectedScore} балға дейін түседі, ай сайынғы төлем ${fmt(calcResult.monthlyPayment)} құрайды. Қарыз жүктемесі ${dtiPct}%-ға дейін көтеріледі — бұл қолайлы, бірақ шекке жақын. Бүкіл мерзімге артық төлем: ${fmt(calcResult.overpayment)}. Табысыңыз тұрақты болса — алуға болады, бірақ одан кейін кем дегенде бір жыл жаңа несие алмаған жөн.`
        : `${loanName[0].toUpperCase() + loanName.slice(1)} на эту сумму возможен, но с осторожностью. Скор снизится до ${calcResult.projectedScore} пунктов, ежемесячный платёж составит ${fmt(calcResult.monthlyPayment)}. Долговая нагрузка поднимется до ${dtiPct}% — это приемлемо, но близко к границе. Переплата за весь срок: ${fmt(calcResult.overpayment)}. Если доход стабильный — можно брать, но новых кредитов после этого лучше не добавлять минимум год.`
    } else {
      explanation = lang === 'kk'
        ? `Жақсы шешім. Сіздің скорыңызбен банк ${loanName} жылдық ${ratePct}% мөлшерлемемен мақұлдайды. Ай сайынғы төлем — ${fmt(calcResult.monthlyPayment)}, бұл қолайлы жүктеме. Скор уақытша ${calcResult.projectedScore}-ге дейін түседі, бірақ 8-10 ай уақтылы төлемдерден кейін қалпына келеді. Жалпы артық төлем ${fmt(calcResult.overpayment)} — бұл несие түрі үшін қалыпты көрсеткіш.`
        : `Хорошее решение. При вашем скоре банк одобрит ${loanName} под ${ratePct}% годовых. Ежемесячный платёж — ${fmt(calcResult.monthlyPayment)}, это комфортная нагрузка. Скор временно снизится до ${calcResult.projectedScore}, но через 8-10 месяцев своевременных платежей вернётся к текущему уровню. Общая переплата составит ${fmt(calcResult.overpayment)} — для данного типа кредита это нормальный показатель.`
    }

    // Simulate loading delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, 1500))
    setAiExplanation(explanation)
    setIsLoadingAI(false)
  }, [calcResult, isLoadingAI, loanType, lang])

  return (
    <div className="min-h-screen" style={{ backgroundColor: bg }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 px-5 lg:px-8 pt-10 lg:pt-12 pb-4">
          <BarChart2 size={20} color={accent} />
          <h1
            className="text-xl font-bold"
            style={{ color: text, fontFamily: "'Unbounded', sans-serif", fontSize: 20 }}
          >
            {t('sim.title')}
          </h1>
        </div>

        <div className="px-4 lg:px-8">
          {/* Current score indicator */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 mb-4 flex items-center justify-between"
            style={{
              backgroundColor: isDark ? 'rgba(170,255,0,0.04)' : 'rgba(136,204,0,0.04)',
              border: `1px solid ${isDark ? 'rgba(170,255,0,0.1)' : 'rgba(136,204,0,0.1)'}`,
            }}
          >
            <span className="text-xs" style={{ color: muted }}>
              {lang === 'kk' ? 'Ағымдағы скор' : 'Текущий скор'}
            </span>
            <span
              className="text-lg font-bold"
              style={{ color: accent, fontFamily: "'Unbounded', sans-serif" }}
            >
              {currentScore}
            </span>
          </motion.div>

          {/* Loan type */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
            <p className="text-xs mb-2 ml-1" style={{ color: '#666' }}>{t('sim.loanType')}</p>
            <div className="grid grid-cols-2 gap-2">
              {LOAN_TYPES.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => { setLoanType(key); setAiExplanation(null) }}
                  className="py-3.5 px-4 rounded-xl text-sm font-medium transition-all text-left"
                  style={{
                    backgroundColor: loanType === key ? accent : cardBg,
                    color: loanType === key ? '#0A0A0A' : isDark ? '#999' : '#666',
                    border: loanType === key ? `1px solid ${accent}` : `1px solid ${border}`,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Amount */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl p-5 mb-3"
            style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs" style={{ color: '#666' }}>{t('sim.loanAmount')}</p>
              <p className="font-semibold" style={{ color: text }}>{formatMoney(amountToTiyn(amountTenge))}</p>
            </div>
            <input
              type="range"
              min={Math.log10(50)}
              max={Math.log10(10000)}
              step={0.01}
              value={amountLog}
              onChange={handleAmountSlider}
              className="w-full"
            />
            <div className="flex justify-between text-xs mt-1.5" style={{ color: '#666' }}>
              <span>50 000 ₸</span>
              <span>10 000 000 ₸</span>
            </div>
          </motion.div>

          {/* Term */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-5 mb-3"
            style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs" style={{ color: '#666' }}>{t('sim.term')}</p>
              <p className="font-semibold" style={{ color: text }}>{getTermLabel(termMonths)}</p>
            </div>
            <input
              type="range"
              min={3}
              max={120}
              step={1}
              value={termMonths}
              onChange={(e) => { setTermMonths(parseInt(e.target.value)); setAiExplanation(null) }}
              className="w-full"
            />
            <div className="flex justify-between text-xs mt-1.5" style={{ color: '#666' }}>
              <span>3 {t('sim.monthsShort')}</span>
              <span>10 {t('sim.years')}</span>
            </div>
          </motion.div>

          {/* Income */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-4"
          >
            <p className="text-xs mb-2 ml-1" style={{ color: '#666' }}>{t('sim.monthlyIncome')}</p>
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-3.5"
              style={{
                backgroundColor: cardBg,
                border: incomeTenge > 0
                  ? `1px solid ${isDark ? 'rgba(170,255,0,0.2)' : 'rgba(136,204,0,0.2)'}`
                  : `1px solid ${border}`,
              }}
            >
              <input
                type="tel"
                inputMode="numeric"
                placeholder="200 000"
                value={incomeInput}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '')
                  setIncomeInput(raw)
                  setIncomeTenge(parseInt(raw) || 0)
                  setAiExplanation(null)
                }}
                className="flex-1 bg-transparent outline-none font-medium"
                style={{ color: text, caretColor: accent }}
              />
              <span style={{ color: '#666' }} className="font-medium">₸</span>
            </div>
            {incomeTenge <= 0 && (
              <p className="text-xs mt-1.5 ml-1" style={{ color: '#FF3B3B' }}>
                {t('sim.specifyIncome')}
              </p>
            )}
          </motion.div>

          {/* Live result */}
          {calcResult && (
            <SimulatorResultComponent
              result={calcResult}
              onExplainClick={handleExplainClick}
              aiExplanation={aiExplanation}
              isLoadingAI={isLoadingAI}
            />
          )}

          {/* Spacer */}
          <div className="h-8" />
        </div>
      </div>
    </div>
  )
}
