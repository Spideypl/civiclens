import SearchBar from '../components/SearchBar.jsx'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-slate-50">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">CivicLens</h1>
        <p className="text-slate-500 text-lg">Plain-English summaries of U.S. congressional bills</p>
      </div>
      <SearchBar />
      <p className="mt-4 text-xs text-slate-400">
        Try a bill number like "H.R. 4521" or search by keyword like "healthcare"
      </p>
    </main>
  )
}
