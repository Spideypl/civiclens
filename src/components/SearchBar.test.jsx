import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import SearchBar from './SearchBar.jsx'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockNavigate
}))

function renderSearchBar(initialValue = '') {
  return render(
    <MemoryRouter>
      <SearchBar initialValue={initialValue} />
    </MemoryRouter>
  )
}

describe('SearchBar', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders a search input and button', () => {
    renderSearchBar()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })

  it('navigates directly to bill page for an exact bill number', async () => {
    renderSearchBar()
    await userEvent.type(screen.getByRole('textbox'), 'H.R. 4521')
    await userEvent.click(screen.getByRole('button', { name: /search/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/bill/119/hr/4521')
  })

  it('navigates to results page for a keyword query', async () => {
    renderSearchBar()
    await userEvent.type(screen.getByRole('textbox'), 'semiconductor manufacturing')
    await userEvent.click(screen.getByRole('button', { name: /search/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/results?q=semiconductor+manufacturing&congress=119')
  })

  it('does nothing on empty submit', async () => {
    renderSearchBar()
    await userEvent.click(screen.getByRole('button', { name: /search/i }))
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('pre-populates input with initialValue', () => {
    renderSearchBar('H.R. 4521')
    expect(screen.getByRole('textbox')).toHaveValue('H.R. 4521')
  })
})
