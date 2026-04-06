import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PaywallModal from '../components/PaywallModal'
import { useAuthStore } from '../store/authStore'
import { useScoreStore } from '../store/scoreStore'
import { formatPhone } from '../utils/formatters'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import {
  Bell, Globe, FileText, Share2, Star,
  LogOut, ChevronRight, Sun, Moon, Palette,
} from 'lucide-react'

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { clearAll } = useScoreStore()
  const { lang, setLang, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const [showPaywall, setShowPaywall] = useState(false)

  const isDark = theme === 'dark'
  const bg = isDark ? '#0A0A0A' : '#F5F5F5'
  const cardBg = isDark ? '#111' : '#FFFFFF'
  const border = isDark ? '#1F1F1F' : '#E5E5E5'
  const accent = isDark ? '#AAFF00' : '#88CC00'
  const text = isDark ? '#FFFFFF' : '#0A0A0A'
  const muted = '#666'
  const dim = isDark ? '#333' : '#AAA'
  const iconBg = isDark ? '#0A0A0A' : '#F0F0F0'
  const toggleInactiveBg = isDark ? '#1F1F1F' : '#E5E5E5'
  const toggleInactiveText = isDark ? '#666' : '#999'

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.phone?.slice(-2) ?? '??'

  const handleLogout = () => {
    clearAll()
    logout()
    navigate('/auth/phone')
  }

  const settingsItems = [
    {
      icon: Bell,
      label: t('profile.notifications'),
      sublabel: t('profile.notificationsSub'),
      action: () => {},
    },
    {
      icon: Globe,
      label: t('profile.language'),
      sublabel: lang === 'ru' ? t('profile.russian') : t('profile.kazakh'),
      action: () => setLang(lang === 'ru' ? 'kk' : 'ru'),
      trailing: (
        <div className="flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setLang('ru') }}
            className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
            style={{
              backgroundColor: lang === 'ru' ? accent : toggleInactiveBg,
              color: lang === 'ru' ? '#0A0A0A' : toggleInactiveText,
            }}
          >
            RU
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setLang('kk') }}
            className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
            style={{
              backgroundColor: lang === 'kk' ? accent : toggleInactiveBg,
              color: lang === 'kk' ? '#0A0A0A' : toggleInactiveText,
            }}
          >
            KZ
          </button>
        </div>
      ),
    },
    {
      icon: Palette,
      label: t('profile.theme'),
      sublabel: t('profile.themeSub'),
      action: toggleTheme,
      trailing: (
        <button
          onClick={(e) => { e.stopPropagation(); toggleTheme() }}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
          style={{ backgroundColor: isDark ? '#1F1F1F' : '#E5E5E5' }}
        >
          {isDark ? <Moon size={16} color="#AAFF00" /> : <Sun size={16} color="#88CC00" />}
        </button>
      ),
    },
    {
      icon: FileText,
      label: t('profile.downloadReport'),
      sublabel: t('profile.downloadReportSub'),
      action: () => setShowPaywall(true),
      isPro: true,
    },
    {
      icon: Share2,
      label: t('profile.referral'),
      sublabel: t('profile.referralSub'),
      action: () => {
        if (navigator.share) {
          navigator.share({
            title: 'Nesie',
            text: t('profile.referralShare'),
            url: 'https://nesie.kz',
          })
        }
      },
    },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: bg }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="px-5 lg:px-8 pt-10 lg:pt-12 pb-4">
          <h1
            className="text-xl font-bold"
            style={{ color: text, fontFamily: "'Unbounded', sans-serif", fontSize: 20 }}
          >
            {t('profile.title')}
          </h1>
        </div>

        <div className="px-4 lg:px-8">
          {/* User card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 mb-4"
            style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                style={{
                  backgroundColor: accent,
                  color: '#0A0A0A',
                  fontFamily: "'Unbounded', sans-serif",
                }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg truncate" style={{ color: text }}>
                  {user?.full_name || t('profile.user')}
                </p>
                <p className="text-sm" style={{ color: muted }}>
                  {formatPhone(user?.phone || '')}
                </p>
                {user?.iin && (
                  <p className="text-xs mt-0.5" style={{ color: dim }}>
                    {lang === 'kk' ? 'ЖСН' : 'ИИН'}: {user.iin.slice(0, 4)}••••{user.iin.slice(-4)}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Subscription card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl p-5 mb-4"
            style={{
              backgroundColor: cardBg,
              border: user?.is_pro
                ? `1px solid ${isDark ? 'rgba(170,255,0,0.3)' : 'rgba(136,204,0,0.3)'}`
                : `1px solid ${border}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star
                  size={18}
                  color={user?.is_pro ? accent : muted}
                  fill={user?.is_pro ? accent : 'none'}
                />
                <div>
                  <p className="font-semibold text-sm" style={{ color: text }}>
                    {user?.is_pro ? 'Nesie Pro' : t('profile.freePlan')}
                  </p>
                  <p className="text-xs" style={{ color: muted }}>
                    {user?.is_pro ? t('profile.allFeatures') : t('profile.upgradeForAccess')}
                  </p>
                </div>
              </div>
              {!user?.is_pro && (
                <button
                  onClick={() => setShowPaywall(true)}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold"
                  style={{
                    backgroundColor: accent,
                    color: '#0A0A0A',
                    fontFamily: "'Unbounded', sans-serif",
                  }}
                >
                  Pro
                </button>
              )}
            </div>

            {!user?.is_pro && (
              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${border}` }}>
                <p className="text-xs text-center" style={{ color: muted }}>
                  {t('profile.inviteFriend')}{' '}
                  <span className="font-medium" style={{ color: accent }}>
                    {t('profile.oneMonthFree')}
                  </span>
                </p>
              </div>
            )}
          </motion.div>

          {/* Settings */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl overflow-hidden mb-4"
            style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}
          >
            {settingsItems.map(({ icon: Icon, label, sublabel, action, trailing, isPro }, index) => (
              <button
                key={label}
                onClick={action}
                className="w-full flex items-center gap-3 px-5 py-4 transition-colors"
                style={{
                  borderBottom: index < settingsItems.length - 1
                    ? `1px solid ${border}`
                    : 'none',
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: iconBg }}
                >
                  <Icon size={18} color={muted} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium" style={{ color: text }}>{label}</p>
                    {isPro && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-md font-bold"
                        style={{
                          backgroundColor: isDark ? 'rgba(170,255,0,0.12)' : 'rgba(136,204,0,0.12)',
                          color: accent,
                        }}
                      >
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: muted }}>{sublabel}</p>
                </div>
                {trailing || <ChevronRight size={16} color={dim} />}
              </button>
            ))}
          </motion.div>

          {/* Sign out */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl transition-all active:scale-[0.98]"
            style={{ backgroundColor: cardBg, color: '#FF3B3B', border: `1px solid ${border}` }}
          >
            <LogOut size={18} />
            <span className="font-semibold text-sm">{t('profile.logout')}</span>
          </motion.button>

          <p className="text-xs text-center mt-5 pb-6" style={{ color: dim }}>Nesie v1.0.0</p>
        </div>
      </div>

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  )
}
