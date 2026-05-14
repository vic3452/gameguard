import { useState, useEffect, useCallback } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { ScrollText, Filter } from 'lucide-react'
import { format } from 'date-fns'
import Spinner from '../components/Spinner'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'

const EVENT_COLORS = {
  LOGIN_SUCCESS:        { color: '#10b981', label: '✓ Login Success' },
  LOGIN_FAILED:         { color: '#ef4444', label: '✗ Login Failed' },
  LOGOUT:               { color: '#6b7280', label: '→ Logout' },
  REGISTER:             { color: '#7c3aed', label: '+ Register' },
  PASSWORD_CHANGE:      { color: '#f59e0b', label: '🔑 Password Changed' },
  '2FA_ENABLED':        { color: '#10b981', label: '🔒 2FA Enabled' },
  '2FA_DISABLED':       { color: '#ef4444', label: '⚠ 2FA Disabled' },
  '2FA_VERIFIED':       { color: '#10b981', label: '✓ 2FA Verified' },
  ACCOUNT_LOCKED:       { color: '#dc2626', label: '🔒 Account Locked' },
  SUSPICIOUS_IP:        { color: '#f59e0b', label: '⚠ Suspicious IP' },
  SUSPICIOUS_DEVICE:    { color: '#f59e0b', label: '💻 New Device' },
  BRUTE_FORCE_DETECTED: { color: '#dc2626', label: '💥 Brute Force' },
  CONCURRENT_SESSION:   { color: '#f59e0b', label: '🔄 Concurrent Session' },
  ACCOUNT_ADDED:        { color: '#7c3aed', label: '🎮 Account Added' },
  ACCOUNT_REMOVED:      { color: '#6b7280', label: '🎮 Account Removed' },
}

const LIMIT = 20

export default function LogsPage() {
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState({ event: '', severity: '' })
  const [page, setPage]       = useState(1)
  const [total, setTotal]     = useState(0)

  const load = useCallback((pg = 1) => {
    setLoading(true)
    const params = new URLSearchParams({ page: pg, limit: LIMIT })
    if (filter.event)    params.set('event', filter.event)
    if (filter.severity) params.set('severity', filter.severity)
    api.get(`/logs?${params}`)
      .then(r => { setLogs(r.data.logs); setTotal(r.data.total); setPage(pg) })
      .catch(() => toast.error('Failed to load logs'))
      .finally(() => setLoading(false))
  }, [filter])

  useEffect(() => { load(1) }, [load])

  const severityColor = { info: '#10b981', warning: '#f59e0b', critical: '#ef4444' }

  return (
    <div className="space-y-5">
      <PageHeader title="ACTIVITY LOGS" sub={`${total} total entries`} />

      {/* Filters */}
      <div className="gamer-card p-4 flex items-center gap-4 flex-wrap">
        <Filter size={14} className="text-purple-400" />
        <select className="input-gamer w-auto text-xs py-1.5"
          value={filter.event} onChange={e => setFilter(f => ({ ...f, event: e.target.value }))}>
          <option value="">All Events</option>
          {Object.keys(EVENT_COLORS).map(k => (
            <option key={k} value={k}>{EVENT_COLORS[k].label}</option>
          ))}
        </select>
        <select className="input-gamer w-auto text-xs py-1.5"
          value={filter.severity} onChange={e => setFilter(f => ({ ...f, severity: e.target.value }))}>
          <option value="">All Severity</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {loading && <Spinner text="Loading logs..." />}

      <div className="gamer-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(124,58,237,0.15)' }}>
                {['EVENT', 'SEVERITY', 'IP ADDRESS', 'DEVICE', 'TIMESTAMP'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-display text-xs text-gray-500 tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => {
                const evCfg = EVENT_COLORS[log.event] || { color: '#6b7280', label: log.event }
                return (
                  <tr key={log._id || i} className="border-b border-purple-900/10 hover:bg-purple-900/5 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono-gg text-xs" style={{ color: evCfg.color }}>{evCfg.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono-gg text-xs" style={{ color: severityColor[log.severity] || '#6b7280' }}>
                        {log.severity?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono-gg text-xs text-gray-400">{log.ip || '—'}</td>
                    <td className="px-4 py-3 font-mono-gg text-xs text-gray-500 max-w-xs truncate">
                      {log.browser ? `${log.browser} / ${log.os}` : '—'}
                    </td>
                    <td className="px-4 py-3 font-mono-gg text-xs text-gray-600">
                      {log.createdAt ? format(new Date(log.createdAt), 'MMM d, HH:mm:ss') : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!loading && logs.length === 0 && (
            <EmptyState icon={ScrollText} sub="No logs found for selected filters." />
          )}
        </div>
      </div>

      {total > LIMIT && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => load(page - 1)} disabled={page === 1}
                  className="btn-primary text-xs disabled:opacity-30" style={{ padding: '6px 14px' }}>
            ← PREV
          </button>
          <span className="font-mono-gg text-xs text-gray-400">
            Page {page} of {Math.ceil(total / LIMIT)}
          </span>
          <button onClick={() => load(page + 1)} disabled={page >= Math.ceil(total / LIMIT)}
                  className="btn-primary text-xs disabled:opacity-30" style={{ padding: '6px 14px' }}>
            NEXT →
          </button>
        </div>
      )}
    </div>
  )
}
