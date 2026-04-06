import { useLocation, useNavigate } from 'react-router-dom'
import { Home, CreditCard, BarChart2, User } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'

const navKeys = [
  { path: '/home', key: 'nav.home', icon: Home },
  { path: '/loans', key: 'nav.loans', icon: CreditCard },
  { path: '/simulator', key: 'nav.simulator', icon: BarChart2 },
  { path: '/profile', key: 'nav.profile', icon: User },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { t } = useLanguage()
  const { theme } = useTheme()

  const isDark = theme === 'dark'
  const bg = isDark ? '#0A0A0A' : '#F5F5F5'
  const cardBg = isDark ? '#111' : '#FFFFFF'
  const border = isDark ? '#1F1F1F' : '#E5E5E5'
  const accent = isDark ? '#AAFF00' : '#88CC00'
  const muted = isDark ? '#666' : '#666'
  const text = isDark ? '#FFFFFF' : '#0A0A0A'

  const initials = user?.full_name
    ? user.full_name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: bg }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-40"
        style={{
          width: 240,
          backgroundColor: bg,
          borderRight: `1px solid ${border}`,
        }}
      >
        {/* Brand */}
        <div className="px-6 pt-8 pb-10">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: accent }}
            >
              <span
                className="text-sm font-bold"
                style={{ color: '#0A0A0A', fontFamily: "'Unbounded', sans-serif" }}
              >
                N
              </span>
            </div>
            <span
              className="text-lg font-bold"
              style={{ color: text, fontFamily: "'Unbounded', sans-serif" }}
            >
              Nesie
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3">
          {navKeys.map(({ path, key, icon: Icon }) => {
            const isActive = location.pathname === path
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-colors text-left"
                style={{
                  backgroundColor: isActive ? (isDark ? 'rgba(170,255,0,0.08)' : 'rgba(136,204,0,0.1)') : 'transparent',
                  color: isActive ? accent : muted,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = isDark ? '#111' : '#EEEEEE'
                    e.currentTarget.style.color = text
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = muted
                  }
                }}
              >
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="text-sm font-medium">{t(key)}</span>
              </button>
            )
          })}
        </nav>

        {/* User section */}
        <div className="px-4 pb-6" style={{ borderTop: `1px solid ${border}` }}>
          <div className="flex items-center gap-3 pt-5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: border, color: isDark ? '#999' : '#666' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: text }}>
                {user?.full_name || t('profile.user')}
              </p>
              <p className="text-[10px]" style={{ color: muted }}>v1.0.0</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-[240px] pb-20 lg:pb-0 min-h-screen">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          backgroundColor: bg,
          borderTop: `1px solid ${border}`,
          paddingBottom: 'env(safe-area-inset-bottom, 8px)',
        }}
      >
        <div className="flex">
          {navKeys.map(({ path, key, icon: Icon }) => {
            const isActive = location.pathname === path
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors"
                style={{ color: isActive ? accent : muted }}
              >
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="text-[10px] font-medium">{t(key)}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
