export default function SummarySection({ summary }) {
  return (
    <div className="bg-white border-b border-slate-200 px-4 py-5">
      <div className="max-w-3xl mx-auto">
        <div className="text-xs text-slate-400 uppercase tracking-wide mb-3">Plain-English Summary</div>
        <p className="text-sm font-semibold text-slate-900 leading-relaxed mb-4">{summary.overview}</p>
        <div className="space-y-3">
          {summary.breakdown.map(item => (
            <div key={item.label}>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{item.label}</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">: </span>
              <span className="text-sm text-slate-700">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
