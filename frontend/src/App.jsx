import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TwoFAPage from './pages/TwoFAPage'
import DashboardPage from './pages/DashboardPage'
import AlertsPage from './pages/AlertsPage'
import LogsPage from './pages/LogsPage'
import AccountsPage from './pages/AccountsPage'
import ThreatSimPage from './pages/ThreatSimPage'
import EducationPage from './pages/EducationPage'
import RiskPage from './pages/RiskPage'
import Layout from './components/Layout'

const Protected = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-void">
      <div className="text-center">
        <div className="font-display text-plasma text-2xl tracking-widest mb-4 animate-pulse">GAMEGUARD</div>
        <div className="font-mono-gg text-purple-400 text-sm">INITIALIZING SECURITY PROTOCOLS...</div>
      </div>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      {/* Background Neon Blobs */}
      <div className="glow-blob w-[500px] h-[500px] bg-purple-600 top-[-100px] left-[-100px]" style={{ animationDelay: '0s' }}></div>
      <div className="glow-blob w-[400px] h-[400px] bg-blue-600 bottom-[-50px] right-[-50px]" style={{ animationDelay: '-5s' }}></div>
      <div className="glow-blob w-[300px] h-[300px] bg-indigo-500 top-[40%] right-[10%]" style={{ animationDelay: '-2s' }}></div>

      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#0d0d1f', color: '#e0e0ff', border: '1px solid rgba(124,58,237,0.3)', fontFamily: 'Share Tech Mono, monospace', fontSize: '13px' },
          }}
        />
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/2fa"      element={<TwoFAPage />} />
          <Route path="/" element={<Protected><Layout /></Protected>}>
            <Route index                element={<DashboardPage />} />
            <Route path="alerts"        element={<AlertsPage />} />
            <Route path="logs"          element={<LogsPage />} />
            <Route path="accounts"      element={<AccountsPage />} />
            <Route path="threats"       element={<ThreatSimPage />} />
            <Route path="education"     element={<EducationPage />} />
            <Route path="risk"          element={<RiskPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
