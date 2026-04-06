import { create } from 'zustand'

export interface User {
  id: number
  phone: string
  iin: string | null
  full_name: string | null
  is_pro: boolean
  pro_expires_at: string | null
  created_at: string
}

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: User | null
  isAuthenticated: boolean
  login: (token: string, refreshToken: string, user?: User) => void
  logout: () => void
  setUser: (user: User) => void
  updateUser: (partial: Partial<User>) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('nesie_token'),
  refreshToken: localStorage.getItem('nesie_refresh_token'),
  user: (() => {
    try {
      const stored = localStorage.getItem('nesie_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })(),
  isAuthenticated: !!localStorage.getItem('nesie_token'),

  login: (token, refreshToken, user) => {
    localStorage.setItem('nesie_token', token)
    localStorage.setItem('nesie_refresh_token', refreshToken)
    if (user) {
      localStorage.setItem('nesie_user', JSON.stringify(user))
    }
    set({
      token,
      refreshToken,
      user: user || null,
      isAuthenticated: true,
    })
  },

  logout: () => {
    localStorage.removeItem('nesie_token')
    localStorage.removeItem('nesie_refresh_token')
    localStorage.removeItem('nesie_user')
    set({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    })
  },

  setUser: (user) => {
    localStorage.setItem('nesie_user', JSON.stringify(user))
    set({ user })
  },

  updateUser: (partial) => {
    set((state) => {
      if (!state.user) return state
      const updated = { ...state.user, ...partial }
      localStorage.setItem('nesie_user', JSON.stringify(updated))
      return { user: updated }
    })
  },
}))
