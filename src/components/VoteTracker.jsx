export default function VoteTracker({ votes }) {
  if (!votes?.totals) return null

  const { yea, nay, notVoting } = votes.totals
  const total = yea + nay + (notVoting || 0)
  const yeaPct = total > 0 ? (yea / total) * 100 : 50

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-5">
      <div className="max-w-3xl mx-auto">
        <div className="text-xs text-slate-400 uppercase tracking-wide mb-3">
          Vote — {votes.date} · {votes.question}
        </div>
        <div className="flex h-7 rounded overflow-hidden mb-2">
          <div
            className="bg-green-600 flex items-center justify-center text-white text-xs font-semibold"
            style={{ width: `${yeaPct}%` }}
          >
            {yea} Yea
          </div>
          <div
            className="bg-red-600 flex items-center justify-center text-white text-xs font-semibold"
            style={{ width: `${100 - yeaPct}%` }}
          >
            {nay} Nay
          </div>
        </div>
        {votes.partyTotals?.length > 0 && (
          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            {votes.partyTotals.map(p => (
              <span key={p.party}>
                <span className="font-semibold text-slate-700">
                  {p.party === 'D' ? 'Democrats' : p.party === 'R' ? 'Republicans' : p.party}:
                </span>{' '}
                {p.yea} yea / {p.nay} nay
              </span>
            ))}
            {notVoting > 0 && <span>Not voting: {notVoting}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
