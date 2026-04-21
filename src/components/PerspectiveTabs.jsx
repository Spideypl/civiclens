import { useState } from 'react'

const TABS = [
  { key: 'liberal', label: 'Liberal', activeClass: 'bg-blue-700 text-white', borderClass: 'border-blue-700' },
  { key: 'conservative', label: 'Conservative', activeClass: 'bg-red-700 text-white', borderClass: 'border-red-700' },
  { key: 'independent', label: 'Independent', activeClass: 'bg-slate-600 text-white', borderClass: 'border-slate-600' }
]

export default function PerspectiveTabs({ perspectives }) {
  const [active, setActive] = useState('liberal')
  const activeTab = TABS.find(t => t.key === active)

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-5">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="text-xs text-slate-400 uppercase tracking-wide">Political Perspectives</div>
          <div className="text-xs text-slate-400 italic">AI-generated interpretations — not endorsements</div>
        </div>
        <div className="flex gap-2 mb-4">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`px-4 py-1.5 rounded text-xs font-medium transition-colors border ${
                active === tab.key
                  ? `${tab.activeClass} ${tab.borderClass}`
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <p
          className={`text-sm text-slate-700 leading-relaxed border-l-4 pl-4 py-2 bg-slate-50 rounded-r ${activeTab?.borderClass}`}
        >
          {perspectives[active]}
        </p>
      </div>
    </div>
  )
}
