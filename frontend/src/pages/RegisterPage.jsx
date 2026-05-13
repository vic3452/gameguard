import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Shield, Eye, EyeOff, User, Mail, Lock } from 'lucide-react'

const strengthLabel = (p) => {
  let s = 0
  if (p.length >= 8) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[@$!%*?&^#]/.test(p)) s++
  if (p.length >= 12) s++
  return ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][s] || ''
}
const strengthColor = { Weak: '#ef4444', Fair: '#f59e0b', Good: '#3b82f6', Strong: '#10b981', 'Very Strong': '#00ff88' }

export default function RegisterPage() {
  const [form, setForm]         = useState({ username: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const navigate                = useNavigate()

  const strength = strengthLabel(form.password)

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      localStorage.setItem('gg_token', data.token)
      localStorage.setItem('gg_user', JSON.stringify(data.user))
      toast.success('Account created! Welcome to GAMEGUARD.')
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.details?.[0] || err.response?.data?.error || 'Registration failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
               style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 0 40px rgba(124,58,237,0.5)' }}>
            <Shield size={24} color="white" />
          </div>
          <h1 className="font-display text-2xl text-white tracking-widest">GAMEGUARD</h1>
          <p className="font-mono-gg text-purple-400 text-xs mt-1">ENROLL NEW AGENT</p>
        </div>

        <div className="gamer-card glow-border p-8">
          <div className="scan-line" />
          <h2 className="font-display text-base text-white mb-6 tracking-wider">CREATE ACCOUNT</h2>

          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="font-mono-gg text-purple-300 text-xs mb-2 block tracking-widest">CALLSIGN</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500" />
                <input type="text" required minLength={3} maxLength={30}
                  className="input-gamer pl-9"
                  placeholder="YourGamertag"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="font-mono-gg text-purple-300 text-xs mb-2 block tracking-widest">EMAIL</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500" />
                <input type="email" required
                  className="input-gamer pl-9"
                  placeholder="agent@gameguard.io"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="font-mono-gg text-purple-300 text-xs mb-2 block tracking-widest">PASSWORD</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500" />
                <input type={showPass ? 'text' : 'password'} required
                  className="input-gamer pl-9 pr-10"
                  placeholder="Min 8 chars, 1 upper, 1 number, 1 symbol"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500 hover:text-purple-300">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full bg-gray-800 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-300"
                           style={{ width: `${(['','Weak','Fair','Good','Strong','Very Strong'].indexOf(strength)) * 20}%`, background: strengthColor[strength] || '#ef4444' }} />
                    </div>
                    <span className="font-mono-gg text-xs" style={{ color: strengthColor[strength] || '#ef4444' }}>{strength}</span>
                  </div>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2" style={{ padding: '12px' }}>
              {loading ? 'CREATING ACCOUNT...' : 'ENROLL AGENT'}
            </button>
          </form>

          <p className="font-mono-gg text-gray-500 text-xs text-center mt-5">
            Already enrolled?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
