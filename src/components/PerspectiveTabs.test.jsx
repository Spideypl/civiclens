import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PerspectiveTabs from './PerspectiveTabs.jsx'

const fakePerspectives = {
  liberal: 'Progressives view this as an overdue investment in communities long excluded...',
  conservative: 'Conservatives support the national security rationale for domestic production...',
  independent: 'Analysts note this addresses a genuine supply chain vulnerability...'
}

describe('PerspectiveTabs', () => {
  it('shows the Liberal tab content by default', () => {
    render(<PerspectiveTabs perspectives={fakePerspectives} />)
    expect(screen.getByText(fakePerspectives.liberal)).toBeInTheDocument()
  })

  it('switches to Conservative tab on click', async () => {
    render(<PerspectiveTabs perspectives={fakePerspectives} />)
    await userEvent.click(screen.getByRole('button', { name: /conservative/i }))
    expect(screen.getByText(fakePerspectives.conservative)).toBeInTheDocument()
  })

  it('switches to Independent tab on click', async () => {
    render(<PerspectiveTabs perspectives={fakePerspectives} />)
    await userEvent.click(screen.getByRole('button', { name: /independent/i }))
    expect(screen.getByText(fakePerspectives.independent)).toBeInTheDocument()
  })

  it('shows the AI disclaimer label', () => {
    render(<PerspectiveTabs perspectives={fakePerspectives} />)
    expect(screen.getByText(/AI-generated interpretations/i)).toBeInTheDocument()
  })
})
