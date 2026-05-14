import { useState } from 'react'
import { BookOpen, ChevronDown, ChevronRight, Lightbulb, HelpCircle } from 'lucide-react'
import { useApiData } from '../hooks/useApiData'
import PageHeader from '../components/PageHeader'

const severityColor = { high: '#ef4444', medium: '#f59e0b', critical: '#dc2626', low: '#10b981' }
const levelBadge    = {
  beginner:     { color: '#10b981', label: 'BEGINNER' },
  intermediate: { color: '#f59e0b', label: 'INTERMEDIATE' },
  advanced:     { color: '#ef4444', label: 'ADVANCED' },
}

const TABS = [
  { id: 'threats',  label: '⚔️ Threats',  icon: BookOpen },
  { id: 'tips',     label: '💡 Tips',     icon: Lightbulb },
  { id: 'glossary', label: '📖 Glossary', icon: HelpCircle },
]

export default function EducationPage() {
  const { data: threatsData }  = useApiData('/education/threats',  'Failed to load threats')
  const { data: tipsData }     = useApiData('/education/tips',     'Failed to load tips')
  const { data: glossaryData } = useApiData('/education/glossary', 'Failed to load glossary')

  const threats  = threatsData?.threats   ?? []
  const tips     = tipsData?.tips         ?? []
  const glossary = glossaryData?.glossary ?? []

  const [tab, setTab]           = useState('threats')
  const [expanded, setExpanded] = useState(null)

  const tipCategories = [...new Set(tips.map(t => t.category))]

  return (
    <div className="space-y-6">
      <PageHeader title="SECURITY GUIDE" sub="Learn how attacks work and how to defend yourself" />

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(13,13,31,0.8)', border: '1px solid rgba(124,58,237,0.2)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
                  className="px-4 py-2 rounded-lg font-mono-gg text-xs transition-all"
                  style={{ background: tab === t.id ? 'rgba(124,58,237,0.3)' : 'transparent', color: tab === t.id ? '#a78bfa' : '#6b6b9e' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Threats */}
      {tab === 'threats' && (
        <div className="space-y-3">
          {threats.map(threat => (
            <div key={threat.id} className="gamer-card overflow-hidden">
              <button className="w-full p-5 flex items-center gap-4 text-left hover:bg-purple-900/5 transition-colors"
                      onClick={() => setExpanded(expanded === threat.id ? null : threat.id)}>
                <span className="text-3xl flex-shrink-0">{threat.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-display text-sm text-white">{threat.title}</span>
                    <span className="font-mono-gg text-xs px-2 py-0.5 rounded"
                          style={{ color: levelBadge[threat.level]?.color, background: `${levelBadge[threat.level]?.color}15`, border: `1px solid ${levelBadge[threat.level]?.color}30` }}>
                      {levelBadge[threat.level]?.label}
                    </span>
                    <span className="font-mono-gg text-xs px-2 py-0.5 rounded"
                          style={{ color: severityColor[threat.severity], background: `${severityColor[threat.severity]}15` }}>
                      {threat.severity?.toUpperCase()} RISK
                    </span>
                  </div>
                  <p className="font-mono-gg text-xs text-gray-400">{threat.summary}</p>
                </div>
                {expanded === threat.id
                  ? <ChevronDown size={16} className="text-purple-400 flex-shrink-0" />
                  : <ChevronRight size={16} className="text-gray-600 flex-shrink-0" />}
              </button>

              {expanded === threat.id && (
                <div className="px-5 pb-5 space-y-4" style={{ borderTop: '1px solid rgba(124,58,237,0.1)' }}>
                  <div className="pt-4">
                    <div className="font-display text-xs text-gray-400 mb-2 tracking-widest">HOW IT WORKS</div>
                    <p className="font-mono-gg text-sm text-gray-300 leading-relaxed">{threat.details}</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <div className="font-display text-xs text-yellow-400 mb-2 tracking-widest">REAL-WORLD EXAMPLE</div>
                    <p className="font-mono-gg text-xs text-gray-300 leading-relaxed">{threat.realExample}</p>
                  </div>
                  <div>
                    <div className="font-display text-xs text-green-400 mb-3 tracking-widest">HOW TO PROTECT YOURSELF</div>
                    <div className="space-y-2">
                      {threat.prevention?.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-green-400 flex-shrink-0 font-mono-gg text-xs mt-0.5">✓</span>
                          <span className="font-mono-gg text-xs text-gray-300">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      {tab === 'tips' && (
        <div className="space-y-5">
          {tipCategories.map(cat => (
            <div key={cat}>
              <div className="font-display text-xs text-purple-400 mb-3 tracking-widest">{cat.toUpperCase()}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tips.filter(t => t.category === cat).map((tip, i) => (
                  <div key={i} className="gamer-card p-4 flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">{tip.icon}</span>
                    <span className="font-mono-gg text-xs text-gray-300 leading-relaxed">{tip.tip}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Glossary */}
      {tab === 'glossary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {glossary.map((item, i) => (
            <div key={i} className="gamer-card p-4">
              <div className="font-display text-sm text-purple-300 mb-2">{item.term}</div>
              <p className="font-mono-gg text-xs text-gray-400 leading-relaxed">{item.definition}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
