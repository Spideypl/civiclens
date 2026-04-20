import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import parseBillNumber from '../utils/parseBillNumber.js'

const CURRENT_CONGRESS = 119

export default function SearchBar({ initialValue = '' }) {
  const [query, setQuery] = useState(initialValue)
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    const bill = parseBillNumber(trimmed)
    if (bill) {
      navigate(`/bill/${CURRENT_CONGRESS}/${bill.type}/${bill.number}`)
    } else {
      navigate(`/results?q=${encodeURIComponent(trimmed).replace(/%20/g, '+')}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-xl">
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
