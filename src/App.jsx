import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Results from './pages/Results.jsx'
import Bill from './pages/Bill.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/results" element={<Results />} />
        <Route path="/bill/:congress/:type/:number" element={<Bill />} />
      </Routes>
    </BrowserRouter>
  )
}
