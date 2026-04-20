function Card({ label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className="text-sm font-semibold text-slate-800 leading-snug">{value}</div>
    </div>
  )
}

export default function KeyFactsCards({ keyFacts }) {
  return (
    <div className="bg-slate-50 border-b border-slate-200 px-4 py-5">
      <div className="max-w-3xl mx-auto">
        <div className="text-xs text-slate-400 uppercase tracking-wide mb-3">Key Facts</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card label="Total Funding" value={keyFacts.funding} />
          <Card label="Agencies Affected" value={keyFacts.agencies} />
          <Card label="Who's Impacted" value={keyFacts.whoIsImpacted} />
        </div>
      </div>
    </div>
  )
}
