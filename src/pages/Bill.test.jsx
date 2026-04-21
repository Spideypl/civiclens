import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Bill from './Bill.jsx'

const fakeBill = {
  congress: 119, type: 'hr', number: '4521',
  title: 'United States Innovation and Competition Act',
  sponsor: { name: 'Sen. Chuck Schumer', party: 'D', state: 'NY' },
  introducedDate: '2021-05-21',
  latestAction: 'Passed Senate',
  votes: null
}

const fakeSummary = {
  overview: 'This bill funds semiconductor manufacturing.',
  breakdown: [{ label: 'What it does', text: 'Invests in chip production.' }],
  keyFacts: { funding: '$250B', agencies: 'NSF', whoIsImpacted: 'Manufacturers' },
  perspectives: { liberal: 'Liberal view.', conservative: 'Conservative view.', independent: 'Independent view.' }
}

function renderBillPage() {
  return render(
    <MemoryRouter initialEntries={['/bill/119/hr/4521']}>
      <Routes>
        <Route path="/bill/:congress/:type/:number" element={<Bill />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Bill page', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url) => {
      if (url.includes('/api/bill')) return Promise.resolve({ ok: true, json: async () => fakeBill })
      if (url.includes('/api/summary')) return Promise.resolve({ ok: true, json: async () => fakeSummary })
      return Promise.reject(new Error('unknown url'))
    }))
  })

  it('renders bill title after loading', async () => {
    renderBillPage()
    await waitFor(() => {
      expect(screen.getByText('United States Innovation and Competition Act')).toBeInTheDocument()
    })
  })

  it('renders the AI summary overview', async () => {
    renderBillPage()
    await waitFor(() => {
      expect(screen.getByText('This bill funds semiconductor manufacturing.')).toBeInTheDocument()
    })
  })

  it('shows "Bill not found" when bill fetch returns 404', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/api/bill')) return Promise.resolve({ ok: false, status: 404, json: async () => ({ error: 'Bill not found' }) })
      return Promise.resolve({ ok: true, json: async () => fakeSummary })
    })
    renderBillPage()
    await waitFor(() => {
      expect(screen.getByText(/bill not found/i)).toBeInTheDocument()
    })
  })

  it('shows "Summary unavailable" but still renders bill header when summary fails', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/api/bill')) return Promise.resolve({ ok: true, json: async () => fakeBill })
      if (url.includes('/api/summary')) return Promise.resolve({ ok: false, json: async () => ({ error: 'Summary generation failed' }) })
      return Promise.reject(new Error('unknown'))
    })
    renderBillPage()
    await waitFor(() => {
      expect(screen.getByText('United States Innovation and Competition Act')).toBeInTheDocument()
      expect(screen.getByText(/summary unavailable/i)).toBeInTheDocument()
    })
  })
})
