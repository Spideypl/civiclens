import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import VoteTracker from './VoteTracker.jsx'

const fakeVotes = {
  date: '2021-06-08',
  question: 'On Passage',
  totals: { yea: 68, nay: 32, notVoting: 0 },
  partyTotals: [
    { party: 'D', yea: 48, nay: 2 },
    { party: 'R', yea: 19, nay: 30 }
  ]
}

describe('VoteTracker', () => {
  it('renders yea and nay counts', () => {
    render(<VoteTracker votes={fakeVotes} />)
    expect(screen.getByText(/68/)).toBeInTheDocument()
    expect(screen.getByText(/32/)).toBeInTheDocument()
  })

  it('renders party breakdown', () => {
    render(<VoteTracker votes={fakeVotes} />)
    expect(screen.getByText(/Democrats/i)).toBeInTheDocument()
    expect(screen.getByText(/Republicans/i)).toBeInTheDocument()
  })

  it('renders nothing when votes is null', () => {
    const { container } = render(<VoteTracker votes={null} />)
    expect(container.firstChild).toBeNull()
  })
})
