import { useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Gamepad2, Plus, Trash2, Shield, AlertTriangle } from 'lucide-react'
import { useApiData } from '../hooks/useApiData'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'

const PLATFORMS    = ['Steam', 'Epic Games', 'PlayStation', 'Xbox', 'Nintendo', 'Riot Games', 'Battle.net', 'Origin', 'Ubisoft Connect', 'GOG']
const PLATFORM_ICONS = { Steam: '🎮', 'Epic Games': '⚡', PlayStation: '🎯', Xbox: '🟢', Nintendo: '🔴', 'Riot Games': '⚔️', 'Battle.net': '💫', Origin: '🟠', 'Ubisoft Connect': '🔵', GOG: '🎲' }

const statusCfg = {
  secure:      { color: '#10b981', label: 'SECURE',      icon: Shield },
  warning:     { color: '#f59e0b', label: 'WARNING',     icon: AlertTriangle },
  compromised: { color: '#ef4444', label: 'COMPROMISED', icon: AlertTriangle },
  unknown:     { color: '#6b7280', label: 'UNKNOWN',     icon: AlertTriangle },
}

export default function AccountsPage() {
  const { data, loading, reload } = useApiData('/accounts', 'Failed to load accounts')
  const accounts = data?.accounts ?? []

  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ platform: 'Steam', username: '', notes: '' })
  const [saving, setSaving]     = useState(false)

  const add = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/accounts', form)
      reload()
      setShowForm(false)
      setForm({ platform: 'Steam', username: '', notes: '' })
      toast.success(`${form.platform} account linked!`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add account')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id, platform) => {
    if (!confirm(`Remove ${platform} account?`)) return
    try {
      await api.delete(`/accounts/${id}`)
      reload()
      toast.success('Account removed')
    } catch {
      toast.error('Failed to remove account')
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="GAMING ACCOUNTS"
        sub="Manage your linked gaming platforms"
        action={
          <button onClick={() => setShowForm(s => !s)} className="btn-primary flex items-center gap-2">
            <Plus size={14} /> ADD ACCOUNT
          </button>
        }
      />

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
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'LINKING...' : 'LINK ACCOUNT'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                      className="px-4 py-2 rounded-lg font-mono-gg text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <Spinner text="Loading accounts..." />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(acc => {
          const st    = statusCfg[acc.accountStatus] || statusCfg.unknown
          const StIcon = st.icon
          return (
            <div key={acc._id} className="gamer-card p-5" style={{ borderColor: `${st.color}33` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-white/5">
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
                  <StIcon size={12} style={{ color: st.color }} />
                  <span className="font-mono-gg text-xs font-bold" style={{ color: st.color }}>{st.label}</span>
                </div>
                <div className="font-mono-gg text-xs text-gray-600">Risk: {acc.riskScore}/100</div>
              </div>

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
        <EmptyState
          icon={Gamepad2}
          title="NO ACCOUNTS LINKED"
          sub="Add your gaming platforms to monitor them"
          action={
            <button onClick={() => setShowForm(true)} className="btn-primary inline-flex items-center gap-2">
              <Plus size={14} /> LINK YOUR FIRST ACCOUNT
            </button>
          }
        />
      )}
    </div>
  )
}
