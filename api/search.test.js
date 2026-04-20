import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from './search.js'

const mockReq = (query) => ({ query })
const mockRes = () => {
  const res = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

describe('GET /api/search', () => {
  beforeEach(() => {
    process.env.CONGRESS_API_KEY = 'test-key'
    vi.stubGlobal('fetch', vi.fn())
  })

  it('returns 400 if q is missing', async () => {
    const req = mockReq({})
    const res = mockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'q is required' })
  })

  it('returns formatted bills from Congress.gov', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        bills: [
          {
            congress: 119,
            type: 'HR',
            number: '4521',
            title: 'A bill about semiconductors',
            latestAction: { text: 'Passed Senate' },
            url: 'https://api.congress.gov/v3/bill/119/hr/4521'
          }
        ]
      })
    })
    const req = mockReq({ q: 'semiconductor' })
    const res = mockRes()
    await handler(req, res)
    expect(res.json).toHaveBeenCalledWith({
      bills: [
        {
          congress: 119,
          type: 'hr',
          number: '4521',
          title: 'A bill about semiconductors',
          latestAction: 'Passed Senate'
        }
      ]
    })
  })

  it('returns 502 if Congress.gov fails', async () => {
    fetch.mockResolvedValue({ ok: false, status: 500 })
    const req = mockReq({ q: 'anything' })
    const res = mockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(502)
    expect(res.json).toHaveBeenCalledWith({ error: 'Congress.gov request failed' })
  })

  it('returns 429 if Congress.gov rate limits', async () => {
    fetch.mockResolvedValue({ ok: false, status: 429 })
    const req = mockReq({ q: 'anything' })
    const res = mockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(429)
    expect(res.json).toHaveBeenCalledWith({ error: 'Too many requests — try again in a moment' })
  })
})
