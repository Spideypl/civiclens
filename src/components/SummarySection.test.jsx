import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SummarySection from './SummarySection.jsx'

const fakeSummary = {
  overview: 'This bill invests $250B in semiconductor manufacturing.',
  breakdown: [
    { label: 'What it does', text: 'Funds chip factories in the U.S.' },
    { label: 'Why now', text: 'Global chip shortage exposed vulnerabilities.' },
    { label: 'What changes', text: 'Tax credits for domestic chip production.' }
  ]
}

describe('SummarySection', () => {
  it('renders the overview text', () => {
    render(<SummarySection summary={fakeSummary} />)
    expect(screen.getByText('This bill invests $250B in semiconductor manufacturing.')).toBeInTheDocument()
  })

  it('renders all breakdown labels and texts', () => {
    render(<SummarySection summary={fakeSummary} />)
    expect(screen.getByText('What it does')).toBeInTheDocument()
    expect(screen.getByText('Why now')).toBeInTheDocument()
    expect(screen.getByText('What changes')).toBeInTheDocument()
    expect(screen.getByText('Funds chip factories in the U.S.')).toBeInTheDocument()
  })
})
