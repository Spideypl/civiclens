import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import parseBillNumber from '../utils/parseBillNumber.js'

const CONGRESSES = [119, 118, 117, 116, 115]
const CURRENT_CONGRESS = 119

export default function SearchBar({ initialValue = '', defaultCongress = CURRENT_CONGRESS }) {
  const [query, setQuery] = useState(initialValue)
  const [congress, setCongress] = useState(defaultCongress)
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    const bill = parseBillNumber(trimmed)
    if (bill) {
      navigate(`/bill/${congress}/${bill.type}/${bill.number}`)
    } else {
      navigate(`/results?q=${encodeURIComponent(trimmed).replace(/%20/g, '+')}&congress=${congress}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-xl">
      <select
        value={congress}
        onChange={e => setCongress(Number(e.target.value))}
        className="px-2 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
        aria-label="Congress session"
      >
        {CONGRESSES.map(c => (
          <option key={c} value={c}>
            {c}th{c === CURRENT_CONGRESS ? ' ★' : ''}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder='Search bills — try "H.R. 4521" or "climate"'
        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="px-5 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
      >
        Search
      </button>
    </form>
  )
}
