import type { Loan } from '../api/loans'
import { formatMoney, formatDate, formatLoanType, getDaysUntil } from '../utils/formatters'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'

interface LoanCardProps {
  loan: Loan
  onClick?: () => void
}

export default function LoanCard({ loan, onClick }: LoanCardProps) {
  const { t } = useLanguage()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const bg = isDark ? '#111' : '#FFFFFF'
  const border = isDark ? '#1F1F1F' : '#E5E5E5'
  const accent = isDark ? '#AAFF00' : '#88CC00'
  const text = isDark ? '#FFFFFF' : '#0A0A0A'

  const daysUntil = loan.next_payment_date ? getDaysUntil(loan.next_payment_date) : null
  const isUrgent = daysUntil !== null && daysUntil <= 3
  const isOverdue = loan.is_overdue || (daysUntil !== null && daysUntil < 0)

  const paidPercent = Math.round(
    ((loan.original_amount - loan.remaining_balance) / loan.original_amount) * 100
  )

  return (
    <div
      onClick={onClick}
      className="rounded-2xl p-5 mb-3 cursor-pointer transition-all active:scale-[0.99]"
      style={{
        backgroundColor: bg,
        border: isOverdue
          ? '1px solid rgba(255,59,59,0.4)'
          : isUrgent
          ? '1px solid rgba(255,184,0,0.4)'
          : `1px solid ${border}`,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-semibold text-base" style={{ color: text }}>{loan.lender_name}</p>
          <span
            className="text-xs px-2.5 py-0.5 rounded-full mt-1.5 inline-block font-medium"
            style={{ backgroundColor: border, color: isDark ? '#999' : '#666' }}
          >
            {formatLoanType(loan.loan_type)}
          </span>
        </div>
        {isOverdue && (
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ backgroundColor: 'rgba(255,59,59,0.15)', color: '#FF3B3B' }}
          >
            {t('loans.overdue')}
          </span>
        )}
        {isUrgent && !isOverdue && (
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ backgroundColor: 'rgba(255,184,0,0.15)', color: '#FFB800' }}
          >
            {daysUntil === 0 ? t('loans.today') : t('loans.daysLeft', { days: daysUntil! })}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs mb-1" style={{ color: '#666' }}>{t('loans.balance')}</p>
          <p className="font-semibold text-sm" style={{ color: text }}>{formatMoney(loan.remaining_balance)}</p>
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: '#666' }}>{t('loans.monthlyPayment')}</p>
          <p className="font-semibold text-sm" style={{ color: text }}>{formatMoney(loan.monthly_payment)}</p>
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: '#666' }}>{t('loans.payment')}</p>
          <p
            className="font-semibold text-sm"
            style={{
              color: isOverdue ? '#FF3B3B' : isUrgent ? '#FFB800' : text,
            }}
          >
            {loan.next_payment_date ? formatDate(loan.next_payment_date) : '—'}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1.5" style={{ color: '#666' }}>
          <span>{t('loans.repaid')}</span>
          <span style={{ color: isDark ? '#999' : '#666' }}>{paidPercent}%</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: border }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${paidPercent}%`, backgroundColor: accent }}
          />
        </div>
      </div>
    </div>
  )
}
