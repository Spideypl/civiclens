function formatBillLabel(type, number) {
  const labels = { hr: 'H.R.', s: 'S.', hres: 'H.Res.', sres: 'S.Res.', hjres: 'H.J.Res.', sjres: 'S.J.Res.' }
  return `${labels[type] || type.toUpperCase()} ${number}`
}

export default function BillHeader({ bill }) {
  return (
    <div className="bg-white border-b border-slate-200 px-4 py-5">
      <div className="max-w-3xl mx-auto">
        <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
          {formatBillLabel(bill.type, bill.number)} · {bill.congress}th Congress
        </div>
        <h1 className="text-xl font-bold text-slate-900 leading-snug mb-2">{bill.title}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          {bill.sponsor?.name && <span>Sponsor: {bill.sponsor.name} ({bill.sponsor.party}-{bill.sponsor.state})</span>}
          {bill.introducedDate && <span>Introduced: {bill.introducedDate}</span>}
          {bill.latestAction && (
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              {bill.latestAction}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
