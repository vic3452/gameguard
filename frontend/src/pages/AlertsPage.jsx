import api from '../lib/api'
import toast from 'react-hot-toast'
import { Bell, CheckCheck, Trash2, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useApiData } from '../hooks/useApiData'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'

const severityIcon = { low: '🟢', medium: '🟡', high: '🔴', critical: '💀' }

export default function AlertsPage() {
  const { data, loading, reload } = useApiData('/alerts?limit=30', 'Failed to load alerts')
  const alerts = data?.alerts ?? []
  const total  = data?.total  ?? 0

  const markAll = async () => {
    try {
      await api.patch('/alerts/read-all')
      reload()
      toast.success('All alerts marked as read')
    } catch {
      toast.error('Failed to mark alerts as read')
    }
  }

  const del = async (id) => {
    try {
      await api.delete(`/alerts/${id}`)
      reload()
    } catch {
      toast.error('Failed to delete alert')
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="SECURITY ALERTS"
        sub={`${total} total alerts`}
        action={
          <div className="flex gap-2">
            <button onClick={markAll} className="flex items-center gap-2 px-3 py-2 rounded-lg font-mono-gg text-xs text-green-400 hover:bg-green-900/20 transition-colors">
              <CheckCheck size={14} /> Mark all read
            </button>
            <button onClick={reload} className="flex items-center gap-2 px-3 py-2 rounded-lg font-mono-gg text-xs text-purple-400 hover:bg-purple-900/20 transition-colors">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        }
      />

      {loading && <Spinner text="Loading alerts..." />}

      <div className="space-y-3">
        {alerts.map(alert => (
          <div key={alert._id}
               className={`gamer-card p-4 transition-opacity ${alert.read ? 'opacity-50' : ''}`}
               style={{ borderColor: alert.read ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.3)' }}>
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{severityIcon[alert.severity]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`badge-${alert.severity} text-xs px-2 py-0.5 rounded font-mono-gg`}>
                    {alert.severity?.toUpperCase()}
                  </span>
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
          <EmptyState icon={Bell} sub="No alerts. Your account is clean ✓" />
        )}
      </div>
    </div>
  )
}
