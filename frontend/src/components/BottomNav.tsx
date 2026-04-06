import { useLocation, useNavigate } from 'react-router-dom'
import { Home, CreditCard, BarChart2, User } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'

const navKeys = [
  { path: '/home', key: 'nav.home', icon: Home },
  { path: '/loans', key: 'nav.loans', icon: CreditCard },
  { path: '/simulator', key: 'nav.simulator', icon: BarChart2 },
  { path: '/profile', key: 'nav.profile', icon: User },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { theme } = useTheme()

  const isDark = theme === 'dark'
  const accent = isDark ? '#AAFF00' : '#88CC00'
  const muted = isDark ? '#666' : '#888'

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        backgroundColor: isDark ? '#0A0A0A' : '#F5F5F5',
        borderTop: `1px solid ${isDark ? '#1F1F1F' : '#E5E5E5'}`,
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
      }}
    >
      <div className="flex max-w-5xl mx-auto">
        {navKeys.map(({ path, key, icon: Icon }) => {
          const isActive = location.pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors"
              style={{ color: isActive ? accent : muted }}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[11px] font-medium">{t(key)}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
