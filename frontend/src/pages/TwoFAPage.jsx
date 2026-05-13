import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Shield, KeyRound } from 'lucide-react'

export default function TwoFAPage() {
  const [code, setCode]       = useState('')
  const [loading, setLoading] = useState(false)
  const { login }             = useAuth()
  const navigate              = useNavigate()
  const userId                = sessionStorage.getItem('gg_2fa_uid')

  if (!userId) { navigate('/login'); return null }

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/verify-2fa', { token: code, userId })
      login(data.token, data.user)
      sessionStorage.removeItem('gg_2fa_uid')
      toast.success('Identity verified. Access granted.')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="relative z-10 w-full max-sm mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
               style={{ background: 'linear-gradient(135deg, #059669, #047857)', boxShadow: '0 0 40px rgba(16,185,129,0.4)' }}>
            <KeyRound size={24} color="white" />
          </div>
          <h1 className="font-display text-xl text-white tracking-widest">2FA VERIFICATION</h1>
          <p className="font-mono-gg text-green-400 text-xs mt-1">CHECK YOUR EMAIL FOR THE CODE</p>
        </div>

        <div className="gamer-card p-8" style={{ boxShadow: '0 0 0 1px rgba(16,185,129,0.3), 0 0 20px rgba(16,185,129,0.1)' }}>
          <form onSubmit={handle} className="space-y-5">
            <div>
              <label className="font-mono-gg text-green-300 text-xs mb-2 block tracking-widest">6-DIGIT CODE</label>
              <input
                type="text" inputMode="numeric" pattern="\d{6}" maxLength={6} required
                className="input-gamer text-center text-2xl tracking-[1rem]"
                style={{ borderColor: 'rgba(16,185,129,0.4)', letterSpacing: '0.8rem', fontFamily: 'Orbitron, monospace' }}
                placeholder="000000"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </div>
            <button type="submit" disabled={loading || code.length < 6} className="btn-primary w-full"
                    style={{ padding: '12px', background: 'linear-gradient(135deg, #059669, #047857)' }}>
              {loading ? 'VERIFYING...' : 'VERIFY IDENTITY'}
            </button>
          </form>
          <p className="font-mono-gg text-gray-600 text-xs text-center mt-4">Code expires in 10 minutes</p>
        </div>
      </div>
    </div>
  )
}
