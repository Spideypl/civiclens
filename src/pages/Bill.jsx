import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import BillHeader from '../components/BillHeader.jsx'
import SummarySection from '../components/SummarySection.jsx'
import KeyFactsCards from '../components/KeyFactsCards.jsx'
import PerspectiveTabs from '../components/PerspectiveTabs.jsx'
import VoteTracker from '../components/VoteTracker.jsx'
import SearchBar from '../components/SearchBar.jsx'

export default function Bill() {
  const { congress, type, number } = useParams()

  const [bill, setBill] = useState(null)
  const [summary, setSummary] = useState(null)
  const [billError, setBillError] = useState(null)
  const [summaryError, setSummaryError] = useState(null)
  const [loadingBill, setLoadingBill] = useState(true)
  const [loadingSummary, setLoadingSummary] = useState(true)

  useEffect(() => {
    setLoadingBill(true)
    setBillError(null)
    fetch(`/api/bill?congress=${congress}&type=${type}&number=${number}`)
      .then(r => r.json().then(data => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (ok) setBill(data)
        else setBillError(data.error || 'Bill not found')
      })
      .catch(() => setBillError('Failed to load bill'))
      .finally(() => setLoadingBill(false))
  }, [congress, type, number])

  useEffect(() => {
    setLoadingSummary(true)
    setSummaryError(null)
    fetch(`/api/summary?id=${congress}-${type}-${number}`)
      .then(r => r.json().then(data => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (ok) setSummary(data)
        else setSummaryError('Summary unavailable')
      })
      .catch(() => setSummaryError('Summary unavailable'))
      .finally(() => setLoadingSummary(false))
  }, [congress, type, number])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link to="/" className="text-blue-700 font-bold text-lg shrink-0">CivicLens</Link>
          <SearchBar />
        </div>
      </header>

      {loadingBill && (
        <div className="max-w-3xl mx-auto px-4 py-8 text-sm text-slate-400">Loading bill...</div>
      )}

      {billError && (
        <div className="max-w-3xl mx-auto px-4 py-8">
          <p className="text-red-600 text-sm">{billError}</p>
          <Link to="/" className="text-blue-600 text-sm mt-2 inline-block">← Back to search</Link>
        </div>
      )}

      {!loadingBill && bill && (
        <>
          <BillHeader bill={bill} />
          <VoteTracker votes={bill.votes} />

          {loadingSummary && (
            <div className="bg-white border-b border-slate-200 px-4 py-8">
              <div className="max-w-3xl mx-auto text-sm text-slate-400">Generating summary...</div>
            </div>
          )}

          {summaryError && (
            <div className="bg-white border-b border-slate-200 px-4 py-5">
              <div className="max-w-3xl mx-auto text-sm text-red-500">{summaryError}</div>
            </div>
          )}

          {!loadingSummary && summary && (
            <>
              <SummarySection summary={summary} />
              <KeyFactsCards keyFacts={summary.keyFacts} />
              <PerspectiveTabs perspectives={summary.perspectives} />
            </>
          )}
        </>
      )}
    </div>
  )
}
