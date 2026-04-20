import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import BillHeader from './BillHeader.jsx'

const fakeBill = {
  congress: 119,
  type: 'hr',
  number: '4521',
  title: 'United States Innovation and Competition Act',
  sponsor: { name: 'Sen. Chuck Schumer', party: 'D', state: 'NY' },
  introducedDate: '2021-05-21',
  latestAction: 'Passed Senate'
}

describe('BillHeader', () => {
  it('renders bill number and congress', () => {
    render(<BillHeader bill={fakeBill} />)
    expect(screen.getByText(/H\.R\. 4521/i)).toBeInTheDocument()
    expect(screen.getByText(/119th Congress/i)).toBeInTheDocument()
  })

  it('renders the bill title', () => {
    render(<BillHeader bill={fakeBill} />)
    expect(screen.getByText('United States Innovation and Competition Act')).toBeInTheDocument()
  })

  it('renders sponsor info', () => {
    render(<BillHeader bill={fakeBill} />)
    expect(screen.getByText(/Sen. Chuck Schumer/i)).toBeInTheDocument()
  })

  it('renders the latest action as a status badge', () => {
    render(<BillHeader bill={fakeBill} />)
    expect(screen.getByText('Passed Senate')).toBeInTheDocument()
  })
})
