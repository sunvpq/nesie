import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { useTheme } from '../../context/ThemeContext'

export default function Onboarding() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const bg = isDark ? '#0A0A0A' : '#F5F5F5'
  const cardBg = isDark ? '#111' : '#FFFFFF'
  const border = isDark ? '#1F1F1F' : '#E5E5E5'
  const accent = isDark ? '#AAFF00' : '#88CC00'
  const text = isDark ? '#FFFFFF' : '#0A0A0A'

  const slides = [
    {
      id: 1,
      title: t('onboarding.slide1.title'),
      description: t('onboarding.slide1.desc'),
      illustration: (
        <div className="flex items-center justify-center w-48 h-48 mx-auto">
          <svg viewBox="0 0 200 200" width="180" height="180">
            <circle cx="100" cy="100" r="80" fill="none" stroke={border} strokeWidth="4" />
            <circle
              cx="100" cy="100" r="80"
              fill="none"
              stroke={accent}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 80 * 0.78} ${2 * Math.PI * 80 * 0.22}`}
              transform="rotate(-90 100 100)"
            />
            <text x="100" y="95" textAnchor="middle" fill={text} fontSize="36" fontWeight="bold" fontFamily="Unbounded, sans-serif">714</text>
            <text x="100" y="120" textAnchor="middle" fill={accent} fontSize="12" fontFamily="Inter, sans-serif">{t('onboarding.good')}</text>
          </svg>
        </div>
      ),
    },
    {
      id: 2,
      title: t('onboarding.slide2.title'),
      description: t('onboarding.slide2.desc'),
      illustration: (
        <div className="w-full max-w-xs mx-auto space-y-2 px-2">
          {[
            { name: 'Kaspi Bank', amount: '320 000 ₸', type: t('onboarding.consumer') },
            { name: 'Halyk Bank', amount: '2 100 000 ₸', type: t('onboarding.auto') },
            { name: 'Home Credit', amount: '80 000 ₸', type: t('onboarding.consumer') },
          ].map((loan) => (
            <div
              key={loan.name}
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: text }}>{loan.name}</p>
                <p className="text-xs" style={{ color: '#666' }}>{loan.type}</p>
              </div>
              <p className="text-sm font-semibold" style={{ color: accent }}>{loan.amount}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 3,
      title: t('onboarding.slide3.title'),
      description: t('onboarding.slide3.desc'),
      illustration: (
        <div className="w-full max-w-xs mx-auto px-2">
          <div className="rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
            <p className="text-xs mb-4 text-center" style={{ color: '#666' }}>
              {t('onboarding.consumer')} · 500 000 ₸ · 24 {t('sim.monthsShort')}
            </p>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="text-center">
                <p className="text-xs" style={{ color: '#666' }}>{t('onboarding.before')}</p>
                <p className="text-3xl font-bold" style={{ color: accent, fontFamily: "'Unbounded', sans-serif" }}>714</p>
              </div>
              <div className="text-center">
                <p className="text-lg" style={{ color: isDark ? '#333' : '#AAA' }}>→</p>
                <p className="text-sm font-bold" style={{ color: '#FF3B3B', fontFamily: "'Unbounded', sans-serif" }}>−33</p>
              </div>
              <div className="text-center">
                <p className="text-xs" style={{ color: '#666' }}>{t('onboarding.after')}</p>
                <p className="text-3xl font-bold" style={{ color: '#FFB800', fontFamily: "'Unbounded', sans-serif" }}>681</p>
              </div>
            </div>
            <div
              className="rounded-xl px-3 py-2 text-center"
              style={{ backgroundColor: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.2)' }}
            >
              <span className="text-sm font-semibold" style={{ color: '#FFB800' }}>{t('onboarding.caution')}</span>
            </div>
          </div>
        </div>
      ),
    },
  ]

  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(1)
  const startX = useRef<number | null>(null)

  const goTo = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1)
    setCurrentSlide(index)
  }

  const next = () => {
    if (currentSlide < slides.length - 1) goTo(currentSlide + 1)
    else navigate('/auth/iin')
  }

  const handleTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return
    const diff = startX.current - e.changedTouches[0].clientX
    if (diff > 50 && currentSlide < slides.length - 1) goTo(currentSlide + 1)
    else if (diff < -50 && currentSlide > 0) goTo(currentSlide - 1)
    startX.current = null
  }

  const slide = slides[currentSlide]
  const isLast = currentSlide === slides.length - 1

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: bg }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex justify-end px-5 pt-5">
        <button onClick={() => navigate('/auth/iin')} className="text-sm py-1" style={{ color: '#666' }}>
          {t('onboarding.skip')}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 60 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full text-center"
            >
              <div className="mb-10">{slide.illustration}</div>
              <h2
                className="text-2xl font-bold mb-3 leading-tight"
                style={{ color: text, fontFamily: "'Unbounded', sans-serif", fontSize: 22 }}
              >
                {slide.title}
              </h2>
              <p className="text-base leading-relaxed max-w-sm mx-auto" style={{ color: '#666' }}>
                {slide.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="px-5 pb-10">
        <div className="max-w-sm mx-auto">
          <div className="flex justify-center gap-2 mb-8">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="rounded-full transition-all"
                style={{
                  width: i === currentSlide ? 24 : 8,
                  height: 8,
                  backgroundColor: i === currentSlide ? accent : border,
                }}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="w-full py-4 rounded-xl font-bold text-sm transition-transform active:scale-[0.98]"
            style={{
              backgroundColor: accent,
              color: '#0A0A0A',
              fontFamily: "'Unbounded', sans-serif",
            }}
          >
            {isLast ? t('onboarding.start') : t('onboarding.next')}
          </button>
        </div>
      </div>
    </div>
  )
}
