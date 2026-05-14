import { Link } from 'react-router-dom'
import { Shield, AlertTriangle, Clock, Gamepad2, Wifi, Monitor, RefreshCw } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatDistanceToNow } from 'date-fns'
import { useApiData } from '../hooks/useApiData'
import Spinner from '../components/Spinner'
import PageHeader from '../components/PageHeader'

const PLATFORM_COLORS = {
  Steam: '#00adee', 'Epic Games': '#2D4F2F', PlayStation: '#003087', Xbox: '#107C10',
  'Riot Games': '#D32936', 'Battle.net': '#0074E0', Nintendo: '#E60012',
  Origin: '#F56C2D', 'Ubisoft Connect': '#0070FF', GOG: '#86328A',
}

const RiskBadge = ({ level, score }) => {
  const cfg = {
    LOW:    { color: '#10b981', label: 'LOW RISK' },
    MEDIUM: { color: '#f59e0b', label: 'MEDIUM RISK' },
    HIGH:   { color: '#ef4444', label: 'HIGH RISK' },
  }[level] || { color: '#7c3aed', label: 'UNKNOWN' }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative mb-4">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
          <circle cx="70" cy="70" r="60" fill="none" stroke={cfg.color} strokeWidth="10"
                  strokeDasharray={`${(score / 100) * 377} 377`} strokeLinecap="round" strokeDashoffset="94"
                  style={{ filter: `drop-shadow(0 0 8px ${cfg.color})`, transform: 'rotate(-90deg)', transformOrigin: '70px 70px' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-bold" style={{ color: cfg.color }}>{score}</span>
          <span className="font-mono-gg text-xs text-gray-400">/100</span>
        </div>
      </div>
      <span className="font-display text-sm font-bold tracking-widest" style={{ color: cfg.color }}>{cfg.label}</span>
    </div>
  )
}

const StatCard = ({ icon: Icon, label, value, sub, color = '#7c3aed' }) => (
  <div className="gamer-card p-4">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}22` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <span className="font-mono-gg text-xs text-gray-400 tracking-wider">{label}</span>
    </div>
    <div className="font-display text-2xl font-bold text-white">{value}</div>
    {sub && <div className="font-mono-gg text-xs text-gray-500 mt-1">{sub}</div>}
  </div>
)

const SeverityDot = ({ severity }) => {
  const colors = { info: '#10b981', warning: '#f59e0b', critical: '#ef4444' }
  return <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: colors[severity] || '#6b7280' }} />
}

export default function DashboardPage() {
  const { data, loading, reload } = useApiData('/dashboard', 'Failed to load dashboard')

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner text="LOADING SECURITY DATA..." />
    </div>
  )
  if (!data) return null

  const days = [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const dayNum = d.getDate(); const month = d.getMonth() + 1
    const matching = data.activityByDay?.filter(a => a._id.day === dayNum && a._id.month === month) || []
    return {
      day:     `${month}/${dayNum}`,
      success: matching.find(a => a._id.event === 'LOGIN_SUCCESS')?.count || 0,
      failed:  matching.find(a => a._id.event === 'LOGIN_FAILED')?.count  || 0,
    }
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="SECURITY DASHBOARD"
        sub="Real-time account protection overview"
        action={
          <button onClick={reload} className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
            <RefreshCw size={14} />
            <span className="font-mono-gg text-xs">REFRESH</span>
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={AlertTriangle} label="UNREAD ALERTS"   value={data.unreadAlerts}            color="#f59e0b" sub="Requires attention" />
        <StatCard icon={Gamepad2}      label="LINKED ACCOUNTS" value={data.accounts?.length || 0}   color="#7c3aed" sub="Gaming platforms" />
        <StatCard icon={Monitor}       label="ACTIVE SESSIONS" value={data.activeSessions?.length || 0} color="#00e5ff" sub="Live connections" />
        <StatCard icon={Wifi}          label="2FA STATUS"
          value={data.user?.twoFactorEnabled ? 'ON' : 'OFF'}
          color={data.user?.twoFactorEnabled ? '#10b981' : '#ef4444'}
          sub={data.user?.twoFactorEnabled ? 'Protected' : 'At risk'} />
      </div>

      {/* Risk + Recent logins */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="gamer-card p-6" style={{ background: 'linear-gradient(135deg, rgba(13,13,31,0.95), rgba(20,10,40,0.95))' }}>
          <div className="font-display text-xs text-gray-400 mb-4 tracking-widest">RISK SCORE</div>
          <RiskBadge level={data.risk?.level} score={data.risk?.score || 0} />
          {data.risk?.tips?.[0] && (
            <div className="mt-4 p-3 rounded-lg text-xs font-mono-gg text-yellow-400"
                 style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              💡 {data.risk.tips[0]}
            </div>
          )}
        </div>

        <div className="gamer-card p-5 lg:col-span-2">
          <div className="font-display text-xs text-gray-400 mb-4 tracking-widest">RECENT LOGIN ACTIVITY</div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.recentLogins?.length === 0 && (
              <p className="font-mono-gg text-gray-600 text-xs">No login activity yet.</p>
            )}
            {data.recentLogins?.map((log, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02]">
                <SeverityDot severity={log.severity} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono-gg text-xs ${log.event === 'LOGIN_FAILED' ? 'text-red-400' : 'text-green-400'}`}>
                      {log.event === 'LOGIN_FAILED' ? '✗ FAILED' : '✓ SUCCESS'}
                    </span>
                    <span className="font-mono-gg text-xs text-gray-500">{log.ip}</span>
                  </div>
                  <div className="font-mono-gg text-xs text-gray-600 truncate">{log.browser} · {log.os}</div>
                </div>
                <span className="font-mono-gg text-xs text-gray-600 flex-shrink-0">
                  <Clock size={10} className="inline mr-1" />
                  {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity chart */}
      <div className="gamer-card p-5">
        <div className="font-display text-xs text-gray-400 mb-5 tracking-widest">LOGIN ACTIVITY — LAST 7 DAYS</div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={days} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gSuccess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gFailed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="day" tick={{ fill: '#4b4b7a', fontSize: 11, fontFamily: 'Share Tech Mono' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#4b4b7a', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#0d0d1f', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8, fontFamily: 'Share Tech Mono', fontSize: 12 }} />
            <Area type="monotone" dataKey="success" stroke="#10b981" fill="url(#gSuccess)" strokeWidth={2} name="Successful" />
            <Area type="monotone" dataKey="failed"  stroke="#ef4444" fill="url(#gFailed)"  strokeWidth={2} name="Failed" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Accounts + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="gamer-card p-5">
          <div className="font-display text-xs text-gray-400 mb-4 tracking-widest">LINKED GAMING ACCOUNTS</div>
          {data.accounts?.length === 0 && (
            <p className="font-mono-gg text-gray-600 text-xs">
              No accounts linked yet.{' '}
              <Link to="/accounts" className="text-purple-400 hover:underline">Add one →</Link>
            </p>
          )}
          <div className="space-y-2">
            {data.accounts?.map(acc => (
              <div key={acc._id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-display text-xs font-bold"
                     style={{ background: `${PLATFORM_COLORS[acc.platform] || '#7c3aed'}22`, color: PLATFORM_COLORS[acc.platform] || '#7c3aed' }}>
                  {acc.platform.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-mono-gg text-xs text-white truncate">{acc.username}</div>
                  <div className="font-mono-gg text-xs text-gray-500">{acc.platform}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded font-mono-gg font-bold badge-${acc.accountStatus === 'secure' ? 'low' : acc.accountStatus === 'warning' ? 'medium' : 'high'}`}>
                  {acc.accountStatus?.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="gamer-card p-5">
          <div className="font-display text-xs text-gray-400 mb-4 tracking-widest">RECENT ALERTS</div>
          {data.alerts?.length === 0 && (
            <p className="font-mono-gg text-gray-600 text-xs">No unread alerts. All clear! ✓</p>
          )}
          <div className="space-y-2">
            {data.alerts?.map(alert => (
              <div key={alert._id} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded font-mono-gg badge-${alert.severity}`}>
                    {alert.severity?.toUpperCase()}
                  </span>
                  <span className="font-mono-gg text-xs text-gray-300 truncate">{alert.title}</span>
                </div>
                <p className="font-mono-gg text-xs text-gray-500 line-clamp-2">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
