import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import SearchBar from '../components/SearchBar.jsx'

const CURRENT_CONGRESS = 119

export default function Results() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const navigate = useNavigate()

  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!q) { navigate('/'); return }
    setLoading(true)
    setError(null)
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(data => { setBills(data.bills || []); setLoading(false) })
      .catch(() => { setError('Search failed. Try again.'); setLoading(false) })
  }, [q])

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link to="/" className="text-blue-700 font-bold text-lg shrink-0">CivicLens</Link>
          <SearchBar initialValue={q} />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading && <p className="text-slate-500 text-sm">Searching...</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {!loading && !error && bills.length === 0 && (
          <p className="text-slate-500 text-sm">No bills found for "{q}".</p>
        )}
        {!loading && bills.length > 0 && (
          <ul className="space-y-3">
            {bills.map(bill => (
              <li key={`${bill.congress}-${bill.type}-${bill.number}`}>
                <Link
                  to={`/bill/${bill.congress || CURRENT_CONGRESS}/${bill.type}/${bill.number}`}
                  className="block bg-white border border-slate-200 rounded-lg p-4 hover:border-blue-400 transition-colors"
                >
                  <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                    {bill.type.toUpperCase()} {bill.number} · {bill.congress || CURRENT_CONGRESS}th Congress
                  </div>
                  <div className="text-sm font-medium text-slate-900 leading-snug">{bill.title}</div>
                  {bill.latestAction && (
                    <div className="text-xs text-slate-500 mt-1">{bill.latestAction}</div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
