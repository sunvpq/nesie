import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  featureName?: string
}

const BENEFIT_KEYS = [
  'paywall.benefit1',
  'paywall.benefit2',
  'paywall.benefit3',
  'paywall.benefit4',
  'paywall.benefit5',
  'paywall.benefit6',
]

export default function PaywallModal({ isOpen, onClose, featureName }: PaywallModalProps) {
  const { t } = useLanguage()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const bg = isDark ? '#111' : '#FFFFFF'
  const border = isDark ? '#1F1F1F' : '#E5E5E5'
  const accent = isDark ? '#AAFF00' : '#88CC00'
  const text = isDark ? '#FFFFFF' : '#0A0A0A'
  const cardBg = isDark ? '#0A0A0A' : '#F5F5F5'

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md rounded-2xl overflow-hidden"
            style={{ backgroundColor: bg, border: `1px solid ${border}` }}
          >
            <div className="flex items-center justify-between p-6 pb-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: accent }}
                >
                  <span
                    className="font-bold text-sm"
                    style={{ color: '#0A0A0A', fontFamily: "'Unbounded', sans-serif" }}
                  >
                    N
                  </span>
                </div>
                <div>
                  <p
                    className="font-bold text-lg"
                    style={{ color: text, fontFamily: "'Unbounded', sans-serif" }}
                  >
                    Nesie Pro
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ backgroundColor: border, color: '#666' }}
              >
                <X size={16} />
              </button>
            </div>

            {featureName && (
              <div
                className="mx-6 mt-5 p-3 rounded-xl"
                style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}
              >
                <p className="text-sm text-center" style={{ color: isDark ? '#999' : '#666' }}>
                  <span className="font-medium" style={{ color: text }}>{featureName}</span> {t('paywall.proFeature')}
                </p>
              </div>
            )}

            <div className="px-6 pt-6 pb-2 text-center">
              <p
                className="text-4xl font-bold"
                style={{ color: text, fontFamily: "'Unbounded', sans-serif" }}
              >
                990 ₸
              </p>
              <p className="text-sm mt-1" style={{ color: '#666' }}>{t('paywall.perMonth')}</p>
            </div>

            <div className="px-6 py-4">
              <div className="space-y-3">
                {BENEFIT_KEYS.map((key) => (
                  <div key={key} className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: isDark ? 'rgba(170,255,0,0.12)' : 'rgba(136,204,0,0.12)' }}
                    >
                      <Check size={12} color={accent} strokeWidth={3} />
                    </div>
                    <p className="text-sm" style={{ color: isDark ? '#999' : '#666' }}>{t(key)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 pb-6 pt-2">
              <button
                className="w-full py-4 rounded-xl font-bold text-base transition-transform active:scale-[0.98]"
                style={{
                  backgroundColor: accent,
                  color: '#0A0A0A',
                  fontFamily: "'Unbounded', sans-serif",
                  fontSize: 14,
                }}
                onClick={() => alert(t('paywall.payment'))}
              >
                {t('paywall.connectPro')}
              </button>
              <p className="text-xs text-center mt-3" style={{ color: isDark ? '#333' : '#AAA' }}>
                {t('paywall.cancel')}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
