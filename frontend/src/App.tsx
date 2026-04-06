import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import PhoneInput from './pages/Auth/PhoneInput'
import OTPVerify from './pages/Auth/OTPVerify'
import Onboarding from './pages/Auth/Onboarding'
import IINInput from './pages/Auth/IINInput'
import Home from './pages/Home'
import Loans from './pages/Loans'
import Simulator from './pages/Simulator'
import Profile from './pages/Profile'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) {
    return <Navigate to="/auth/phone" replace />
  }
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) {
    return <Navigate to="/home" replace />
  }
  return <>{children}</>
}

export default function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/home" replace />
            ) : (
              <Navigate to="/auth/phone" replace />
            )
          }
        />

        {/* Auth routes — no sidebar/nav */}
        <Route
          path="/auth/phone"
          element={
            <PublicRoute>
              <PhoneInput />
            </PublicRoute>
          }
        />
        <Route path="/auth/otp" element={<OTPVerify />} />
        <Route path="/auth/onboarding" element={<Onboarding />} />
        <Route path="/auth/iin" element={<IINInput />} />

        {/* Protected routes — wrapped in Layout (sidebar + bottom nav) */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Layout><Home /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/loans"
          element={
            <ProtectedRoute>
              <Layout><Loans /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/simulator"
          element={
            <ProtectedRoute>
              <Layout><Simulator /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout><Profile /></Layout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
