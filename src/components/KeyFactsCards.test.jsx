import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import KeyFactsCards from './KeyFactsCards.jsx'

const fakeKeyFacts = {
  funding: '$250 billion over 5 years',
  agencies: 'NSF, NIST, DOE, Commerce',
  whoIsImpacted: 'Semiconductor manufacturers, STEM students, defense contractors'
}

describe('KeyFactsCards', () => {
  it('renders the funding card', () => {
    render(<KeyFactsCards keyFacts={fakeKeyFacts} />)
    expect(screen.getByText('Total Funding')).toBeInTheDocument()
    expect(screen.getByText('$250 billion over 5 years')).toBeInTheDocument()
  })

  it('renders the agencies card', () => {
    render(<KeyFactsCards keyFacts={fakeKeyFacts} />)
    expect(screen.getByText('Agencies Affected')).toBeInTheDocument()
    expect(screen.getByText('NSF, NIST, DOE, Commerce')).toBeInTheDocument()
  })

  it('renders the who is impacted card', () => {
    render(<KeyFactsCards keyFacts={fakeKeyFacts} />)
    expect(screen.getByText("Who's Impacted")).toBeInTheDocument()
  })
})
