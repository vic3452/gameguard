// AlertsPage.jsx
import { useEffect, useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Bell, CheckCheck, Trash2, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export function AlertsPage() {
  const [alerts, setAlerts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal]     = useState(0)

  const load = () => {
    setLoading(true)
    api.get('/alerts?limit=30')
      .then(r => { setAlerts(r.data.alerts); setTotal(r.data.total) })
      .catch(() => toast.error('Failed to load alerts'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const markAll = async () => {
    await api.patch('/alerts/read-all')
    setAlerts(a => a.map(x => ({ ...x, read: true })))
    toast.success('All alerts marked as read')
  }

  const del = async (id) => {
    await api.delete(`/alerts/${id}`)
    setAlerts(a => a.filter(x => x._id !== id))
  }

  const severityIcon = { low: '🟢', medium: '🟡', high: '🔴', critical: '💀' }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl text-white tracking-wider">SECURITY ALERTS</h1>
          <p className="font-mono-gg text-gray-500 text-xs mt-1">{total} total alerts</p>
        </div>
        <div className="flex gap-2">
          <button onClick={markAll} className="flex items-center gap-2 px-3 py-2 rounded-lg font-mono-gg text-xs text-green-400 hover:bg-green-900/20 transition-colors">
            <CheckCheck size={14} /> Mark all read
          </button>
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg font-mono-gg text-xs text-purple-400 hover:bg-purple-900/20 transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {loading && <div className="font-mono-gg text-purple-400 animate-pulse text-sm">Loading alerts...</div>}

      <div className="space-y-3">
        {alerts.map(alert => (
          <div key={alert._id}
               className={`gamer-card p-4 transition-opacity ${alert.read ? 'opacity-50' : ''}`}
               style={{ borderColor: alert.read ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.3)' }}>
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{severityIcon[alert.severity]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`badge-${alert.severity} text-xs px-2 py-0.5 rounded font-mono-gg`}>{alert.severity?.toUpperCase()}</span>
                  {!alert.read && <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />}
                </div>
                <h3 className="font-mono-gg text-sm text-white mb-1">{alert.title}</h3>
                <p className="font-mono-gg text-xs text-gray-400">{alert.message}</p>
                {alert.metadata?.ip && (
                  <div className="mt-2 font-mono-gg text-xs text-gray-600">IP: {alert.metadata.ip}</div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className="font-mono-gg text-xs text-gray-600">
                  {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                </span>
                <button onClick={() => del(alert._id)} className="text-gray-600 hover:text-red-400 transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {!loading && alerts.length === 0 && (
          <div className="gamer-card p-12 text-center">
            <Bell size={32} className="mx-auto text-gray-700 mb-3" />
            <p className="font-mono-gg text-gray-500">No alerts. Your account is clean ✓</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AlertsPage
