import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Shield, Eye, EyeOff, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const [form, setForm]         = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const { login }               = useAuth()
  const navigate                = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      if (data.requiresTwoFactor) {
        sessionStorage.setItem('gg_2fa_uid', data.userId)
        toast('Verification code sent to your email', { icon: '📧' })
        navigate('/2fa')
      } else {
        login(data.token, data.user)
        toast.success('Welcome back, ' + data.user.username)
        navigate('/')
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
               style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 0 40px rgba(124,58,237,0.5)' }}>
            <Shield size={28} color="white" />
          </div>
          <h1 className="font-display text-3xl text-white tracking-widest font-bold">GAMEGUARD</h1>
          <p className="font-mono-gg text-purple-400 text-sm mt-2">SECURE GAMING PROTECTION</p>
        </div>

        {/* Card */}
        <div className="gamer-card glow-border p-8">
          <div className="scan-line" />
          <h2 className="font-display text-lg text-white mb-6 tracking-wider">ACCESS TERMINAL</h2>

          <form onSubmit={handle} className="space-y-5">
            <div>
              <label className="font-mono-gg text-purple-300 text-xs mb-2 block tracking-widest">EMAIL</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500" />
                <input
                  type="email" required
                  className="input-gamer pl-9"
                  placeholder="agent@gameguard.io"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="font-mono-gg text-purple-300 text-xs mb-2 block tracking-widest">PASSWORD</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500" />
                <input
                  type={showPass ? 'text' : 'password'} required
                  className="input-gamer pl-9 pr-10"
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500 hover:text-purple-300">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2" style={{ padding: '12px' }}>
              {loading ? 'AUTHENTICATING...' : 'INITIATE LOGIN'}
            </button>
          </form>

          <p className="font-mono-gg text-gray-500 text-xs text-center mt-6">
            New agent?{' '}
            <Link to="/register" className="text-purple-400 hover:text-purple-300">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
