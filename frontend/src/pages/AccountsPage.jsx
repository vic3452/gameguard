import { useEffect, useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Gamepad2, Plus, Trash2, Shield, AlertTriangle } from 'lucide-react'

const PLATFORMS = ['Steam', 'Epic Games', 'PlayStation', 'Xbox', 'Nintendo', 'Riot Games', 'Battle.net', 'Origin', 'Ubisoft Connect', 'GOG']
const PLATFORM_ICONS = { Steam: '🎮', 'Epic Games': '⚡', PlayStation: '🎯', Xbox: '🟢', Nintendo: '🔴', 'Riot Games': '⚔️', 'Battle.net': '💫', Origin: '🟠', 'Ubisoft Connect': '🔵', GOG: '🎲' }

const statusCfg = {
  secure:      { color: '#10b981', label: 'SECURE',      icon: '✓' },
  warning:     { color: '#f59e0b', label: 'WARNING',     icon: '⚠' },
  compromised: { color: '#ef4444', label: 'COMPROMISED', icon: '✗' },
  unknown:     { color: '#6b7280', label: 'UNKNOWN',     icon: '?' },
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ platform: 'Steam', username: '', notes: '' })
  const [saving, setSaving]     = useState(false)

  const load = () => {
    api.get('/accounts').then(r => setAccounts(r.data.accounts)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const add = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.post('/accounts', form)
      setAccounts(a => [...a, data.account])
      setShowForm(false)
      setForm({ platform: 'Steam', username: '', notes: '' })
      toast.success(`${data.account.platform} account linked!`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add account')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id, platform) => {
    if (!confirm(`Remove ${platform} account?`)) return
    await api.delete(`/accounts/${id}`)
    setAccounts(a => a.filter(x => x._id !== id))
    toast.success('Account removed')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl text-white tracking-wider">GAMING ACCOUNTS</h1>
          <p className="font-mono-gg text-gray-500 text-xs mt-1">Manage your linked gaming platforms</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary flex items-center gap-2">
          <Plus size={14} /> ADD ACCOUNT
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="gamer-card p-5 glow-border">
          <div className="font-display text-xs text-gray-400 mb-4 tracking-widest">LINK NEW PLATFORM</div>
          <form onSubmit={add} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="font-mono-gg text-purple-300 text-xs mb-1.5 block tracking-widest">PLATFORM</label>
              <select className="input-gamer" value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}>
                {PLATFORMS.map(p => <option key={p} value={p}>{PLATFORM_ICONS[p]} {p}</option>)}
              </select>
            </div>
            <div>
              <label className="font-mono-gg text-purple-300 text-xs mb-1.5 block tracking-widest">USERNAME / GAMERTAG</label>
              <input type="text" required minLength={2} maxLength={50}
                className="input-gamer" placeholder="YourUsername123"
                value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
            </div>
            <div>
              <label className="font-mono-gg text-purple-300 text-xs mb-1.5 block tracking-widest">NOTES (OPTIONAL)</label>
              <input type="text" maxLength={200}
                className="input-gamer" placeholder="Any notes..."
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="md:col-span-3 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'LINKING...' : 'LINK ACCOUNT'}</button>
              <button type="button" onClick={() => setShowForm(false)}
                      className="px-4 py-2 rounded-lg font-mono-gg text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <div className="font-mono-gg text-purple-400 animate-pulse text-sm">Loading accounts...</div>}

      {/* Accounts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(acc => {
          const st = statusCfg[acc.accountStatus] || statusCfg.unknown
          return (
            <div key={acc._id} className="gamer-card p-5" style={{ borderColor: `${st.color}33` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                       style={{ background: 'rgba(255,255,255,0.05)' }}>
                    {PLATFORM_ICONS[acc.platform] || '🎮'}
                  </div>
                  <div>
                    <div className="font-display text-xs text-white tracking-wider">{acc.platform}</div>
                    <div className="font-mono-gg text-xs text-gray-400">{acc.username}</div>
                  </div>
                </div>
                <button onClick={() => remove(acc._id, acc.platform)} className="text-gray-600 hover:text-red-400 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {acc.accountStatus === 'secure' ? <Shield size={12} style={{ color: st.color }} /> : <AlertTriangle size={12} style={{ color: st.color }} />}
                  <span className="font-mono-gg text-xs font-bold" style={{ color: st.color }}>{st.label}</span>
                </div>
                <div className="font-mono-gg text-xs text-gray-600">Risk: {acc.riskScore}/100</div>
              </div>

              {/* Risk bar */}
              <div className="mt-3 h-1 rounded-full bg-gray-800 overflow-hidden">
                <div className="h-full rounded-full transition-all"
                     style={{ width: `${acc.riskScore}%`, background: acc.riskScore > 60 ? '#ef4444' : acc.riskScore > 30 ? '#f59e0b' : '#10b981' }} />
              </div>

              {acc.notes && <p className="font-mono-gg text-xs text-gray-600 mt-3">{acc.notes}</p>}
            </div>
          )
        })}
      </div>

      {!loading && accounts.length === 0 && !showForm && (
        <div className="gamer-card p-16 text-center">
          <Gamepad2 size={40} className="mx-auto text-gray-700 mb-4" />
          <p className="font-display text-gray-400 text-sm tracking-wider mb-2">NO ACCOUNTS LINKED</p>
          <p className="font-mono-gg text-gray-600 text-xs mb-4">Add your gaming platforms to monitor them</p>
          <button onClick={() => setShowForm(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus size={14} /> LINK YOUR FIRST ACCOUNT
          </button>
        </div>
      )}
    </div>
  )
}
