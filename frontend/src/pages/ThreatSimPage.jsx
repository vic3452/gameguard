import { useEffect, useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Sword, Play, AlertTriangle, CheckCircle, Shield } from 'lucide-react'

const TYPE_ICONS = {
  'brute-force':          { icon: '🔨', color: '#ef4444' },
  'phishing':             { icon: '🎣', color: '#f59e0b' },
  'credential-stuffing':  { icon: '🗂️', color: '#dc2626' },
  'session-hijacking':    { icon: '🍪', color: '#f59e0b' },
  'firefox-hijacking':    { icon: '🦊', color: '#ea580c' },
}

const OUTCOME_COLOR = {
  'BLOCKED': '#10b981',
  'DETECTED': '#f59e0b',
}

export default function ThreatSimPage() {
  const [simulations, setSimulations] = useState([])
  const [result, setResult]           = useState(null)
  const [running, setRunning]         = useState(null)
  const [stepIndex, setStepIndex]     = useState(-1)

  useEffect(() => {
    api.get('/threats').then(r => setSimulations(r.data.simulations))
  }, [])

  const run = async (type) => {
    setRunning(type)
    setResult(null)
    setStepIndex(-1)
    try {
      const { data } = await api.post(`/threats/${type}/run`)
      // Animate steps one by one
      setResult(data)
      for (let i = 0; i < data.steps.length; i++) {
        await new Promise(r => setTimeout(r, data.steps[i].time || 800))
        setStepIndex(i)
      }
    } catch {
      toast.error('Simulation failed')
    } finally {
      setRunning(null)
    }
  }

  const stepColor = { info: '#7c3aed', warning: '#f59e0b', critical: '#ef4444', success: '#10b981' }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl text-white tracking-wider">THREAT SIMULATOR</h1>
        <p className="font-mono-gg text-gray-500 text-xs mt-1">
          Simulate real attacks in a safe, controlled environment to understand how they work
        </p>
      </div>

      {/* Warning banner */}
      <div className="p-4 rounded-lg flex items-start gap-3"
           style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
        <AlertTriangle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-mono-gg text-xs text-yellow-300 font-bold mb-1">SIMULATION MODE — EDUCATIONAL ONLY</p>
          <p className="font-mono-gg text-xs text-yellow-600">
            These simulations are completely safe. No real attacks are performed. All outcomes are simulated for educational purposes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulation list */}
        <div className="space-y-3">
          <div className="font-display text-xs text-gray-400 tracking-widest">AVAILABLE SIMULATIONS</div>
          {simulations.map(sim => {
            const cfg = TYPE_ICONS[sim.id] || { icon: '⚡', color: '#7c3aed' }
            const isRunning = running === sim.id
            return (
              <div key={sim.id} className={`gamer-card p-5 cursor-pointer transition-all ${isRunning ? 'glow-border' : ''}`}
                   style={{ borderColor: isRunning ? cfg.color : undefined }}>
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">{cfg.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display text-sm text-white">{sim.name}</span>
                      <span className="font-mono-gg text-xs px-2 py-0.5 rounded"
                            style={{ color: sim.riskLevel === 'CRITICAL' ? '#dc2626' : '#f59e0b',
                                     background: sim.riskLevel === 'CRITICAL' ? 'rgba(220,38,38,0.1)' : 'rgba(245,158,11,0.1)',
                                     border: `1px solid ${sim.riskLevel === 'CRITICAL' ? 'rgba(220,38,38,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                        {sim.riskLevel}
                      </span>
                    </div>
                    <p className="font-mono-gg text-xs text-gray-500 mb-3">{sim.description}</p>
                    <button onClick={() => run(sim.id)} disabled={!!running} className="btn-primary flex items-center gap-2 text-xs"
                            style={{ padding: '7px 14px', opacity: running && !isRunning ? 0.5 : 1 }}>
                      <Play size={12} /> {isRunning ? 'SIMULATING...' : 'RUN SIMULATION'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Results panel */}
        <div>
          {!result && !running && (
            <div className="gamer-card p-12 text-center h-full flex flex-col items-center justify-center">
              <Sword size={36} className="text-gray-700 mb-4" />
              <p className="font-display text-gray-500 text-sm tracking-wider">SELECT A SIMULATION</p>
              <p className="font-mono-gg text-gray-700 text-xs mt-2">Choose an attack type to simulate</p>
            </div>
          )}

          {(result || running) && (
            <div className="gamer-card p-5 space-y-4">
              <div className="font-display text-xs text-gray-400 tracking-widest">SIMULATION OUTPUT</div>

              {/* Steps */}
              <div className="space-y-2">
                {result?.steps.map((step, i) => (
                  <div key={i}
                       className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-500 ${i <= stepIndex ? 'opacity-100' : 'opacity-0'}`}
                       style={{ background: `${stepColor[step.type] || '#7c3aed'}11`, borderLeft: `2px solid ${stepColor[step.type] || '#7c3aed'}` }}>
                    <span className="font-mono-gg text-xs" style={{ color: stepColor[step.type] }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-mono-gg text-xs text-gray-300">{step.message}</span>
                  </div>
                ))}
              </div>

              {/* Outcome */}
              {result && stepIndex >= (result.steps.length - 1) && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-lg" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle size={14} className="text-green-400" />
                      <span className="font-display text-xs text-green-400 tracking-wider">OUTCOME</span>
                    </div>
                    <span className="font-mono-gg text-sm text-white">{result.outcome}</span>
                  </div>

                  <div>
                    <div className="font-display text-xs text-gray-400 mb-3 tracking-widest flex items-center gap-2">
                      <Shield size={12} /> RECOMMENDATIONS
                    </div>
                    <div className="space-y-2">
                      {result.recommendations?.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2 font-mono-gg text-xs text-gray-300">
                          <span className="text-purple-400 flex-shrink-0">→</span>
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
