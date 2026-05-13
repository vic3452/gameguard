import { useEffect, useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Activity, RefreshCw, Shield, AlertTriangle, TrendingUp, Key } from 'lucide-react'

const BreakdownBar = ({ label, score, max, color, icon: Icon }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon size={13} style={{ color }} />
        <span className="font-mono-gg text-xs text-gray-300">{label}</span>
      </div>
      <span className="font-mono-gg text-xs" style={{ color }}>{score}/{max} pts</span>
    </div>
    <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700"
           style={{ width: `${(score / max) * 100}%`, background: color }} />
    </div>
  </div>
)

export default function RiskPage() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get('/risk-score')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load risk score'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  if (loading) return <div className="font-mono-gg text-purple-400 animate-pulse text-sm pt-8">Calculating risk score...</div>
  if (!data) return null

  const { score, level, breakdown, tips } = data
  const levelCfg = {
    LOW:    { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  msg: 'Your account is well-protected. Keep up the good work!' },
    MEDIUM: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)',  msg: 'Some security improvements are recommended.' },
    HIGH:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)',   msg: 'Your account has significant security vulnerabilities. Act now.' },
  }[level] || {}

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl text-white tracking-wider">RISK SCORE ENGINE</h1>
          <p className="font-mono-gg text-gray-500 text-xs mt-1">Dynamic security assessment</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
          <RefreshCw size={14} /> <span className="font-mono-gg text-xs">RECALCULATE</span>
        </button>
      </div>

      {/* Main score display */}
      <div className="gamer-card p-8 text-center" style={{ borderColor: levelCfg.border, background: `linear-gradient(135deg, #0d0d1f, ${levelCfg.bg})` }}>
        <div className="font-mono-gg text-xs text-gray-400 mb-6 tracking-widest">OVERALL RISK SCORE</div>
        <div className="relative inline-block mb-6">
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle cx="90" cy="90" r="75" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
            <circle cx="90" cy="90" r="75" fill="none" stroke={levelCfg.color} strokeWidth="12"
                    strokeDasharray={`${(score / 100) * 471} 471`}
                    strokeLinecap="round" strokeDashoffset="118"
                    style={{ filter: `drop-shadow(0 0 10px ${levelCfg.color})`, transform: 'rotate(-90deg)', transformOrigin: '90px 90px', transition: 'stroke-dasharray 1s ease' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-5xl font-bold" style={{ color: levelCfg.color }}>{score}</span>
            <span className="font-mono-gg text-sm text-gray-400">/ 100</span>
          </div>
        </div>
        <div className="font-display text-xl font-bold tracking-widest mb-2" style={{ color: levelCfg.color }}>{level} RISK</div>
        <p className="font-mono-gg text-sm text-gray-400">{levelCfg.msg}</p>
      </div>

      {/* Breakdown */}
      <div className="gamer-card p-6">
        <div className="font-display text-xs text-gray-400 mb-5 tracking-widest">SCORE BREAKDOWN</div>
        <div className="space-y-5">
          <BreakdownBar label="Password Security" score={breakdown.password} max={20} color={breakdown.password > 12 ? '#ef4444' : '#10b981'} icon={Key} />
          <BreakdownBar label="Two-Factor Authentication" score={breakdown.twoFA} max={25} color={breakdown.twoFA > 0 ? '#ef4444' : '#10b981'} icon={Shield} />
          <BreakdownBar label="Recent Suspicious Events" score={breakdown.recentEvents} max={40} color={breakdown.recentEvents > 20 ? '#ef4444' : breakdown.recentEvents > 5 ? '#f59e0b' : '#10b981'} icon={AlertTriangle} />
          <BreakdownBar label="Login Health (Failed Attempts)" score={breakdown.loginHealth} max={15} color={breakdown.loginHealth > 9 ? '#ef4444' : breakdown.loginHealth > 3 ? '#f59e0b' : '#10b981'} icon={TrendingUp} />
        </div>
        <div className="mt-4 pt-4 border-t border-purple-900/20 flex items-center justify-between">
          <span className="font-mono-gg text-sm text-gray-300">Total Risk Score</span>
          <span className="font-display text-lg font-bold" style={{ color: levelCfg.color }}>{score}/100</span>
        </div>
        <p className="font-mono-gg text-xs text-gray-600 mt-2">
          Higher scores = higher risk. Aim for 0–25 (LOW).
        </p>
      </div>

      {/* Tips */}
      {tips?.length > 0 && (
        <div className="gamer-card p-5">
          <div className="font-display text-xs text-gray-400 mb-4 tracking-widest">RECOMMENDATIONS</div>
          <div className="space-y-3">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg"
                   style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
                <span className="text-purple-400 mt-0.5">→</span>
                <span className="font-mono-gg text-xs text-gray-300">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
