import type { ScoreFactor } from '../api/score'
import { getImpactColor, getFactorLabel } from '../utils/scoreUtils'
import { formatPercent } from '../utils/formatters'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'

interface FactorCardProps {
  factor: ScoreFactor
}

export default function FactorCard({ factor }: FactorCardProps) {
  const { t } = useLanguage()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const color = getImpactColor(factor.impact)
  const label = getFactorLabel(factor.key, t)

  const formatValue = () => {
    if (factor.key === 'utilization' || factor.key === 'payment_history') {
      return formatPercent(factor.value)
    }
    return factor.value.toString()
  }

  return (
    <div
      className="flex items-start gap-3 p-4 rounded-2xl mb-2"
      style={{
        backgroundColor: isDark ? '#111' : '#FFFFFF',
        border: `1px solid ${isDark ? '#1F1F1F' : '#E5E5E5'}`,
      }}
    >
      <div className="flex-shrink-0 mt-1.5">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-sm" style={{ color: isDark ? '#fff' : '#0A0A0A' }}>{label}</p>
          <p className="font-semibold text-sm flex-shrink-0" style={{ color }}>{formatValue()}</p>
        </div>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: '#666' }}>
          {factor.description_ru}
        </p>
      </div>
    </div>
  )
}
