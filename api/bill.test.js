import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from './bill.js'

const mockReq = (query) => ({ query })
const mockRes = () => {
  const res = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

const fakeBillResponse = {
  bill: {
    congress: 119,
    type: 'HR',
    number: '4521',
    title: 'United States Innovation and Competition Act',
    sponsors: [{ fullName: 'Sen. Chuck Schumer', party: 'D', state: 'NY' }],
    introducedDate: '2021-05-21',
    latestAction: { text: 'Passed Senate' },
    recordedVotes: []
  }
}

describe('GET /api/bill', () => {
  beforeEach(() => {
    process.env.CONGRESS_API_KEY = 'test-key'
    vi.stubGlobal('fetch', vi.fn())
  })

  it('returns 400 if congress, type, or number is missing', async () => {
    const req = mockReq({ congress: '119', type: 'hr' })
    const res = mockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'congress, type, and number are required' })
  })

  it('returns formatted bill data', async () => {
    fetch.mockResolvedValue({ ok: true, status: 200, json: async () => fakeBillResponse })
    const req = mockReq({ congress: '119', type: 'hr', number: '4521' })
    const res = mockRes()
    await handler(req, res)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        congress: 119,
        type: 'hr',
        number: '4521',
        title: 'United States Innovation and Competition Act',
        sponsor: { name: 'Sen. Chuck Schumer', party: 'D', state: 'NY' },
        introducedDate: '2021-05-21',
        latestAction: 'Passed Senate',
        votes: null
      })
    )
  })

  it('returns 404 if bill not found', async () => {
    fetch.mockResolvedValue({ ok: false, status: 404 })
    const req = mockReq({ congress: '119', type: 'hr', number: '9999' })
    const res = mockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ error: 'Bill not found' })
  })

  it('returns 429 if Congress.gov rate limits', async () => {
    fetch.mockResolvedValue({ ok: false, status: 429 })
    const req = mockReq({ congress: '119', type: 'hr', number: '4521' })
    const res = mockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(429)
    expect(res.json).toHaveBeenCalledWith({ error: 'Too many requests — try again in a moment' })
  })

  it('returns 502 if fetch throws a network error', async () => {
    fetch.mockRejectedValue(new Error('network failure'))
    const req = mockReq({ congress: '119', type: 'hr', number: '4521' })
    const res = mockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(502)
  })
})
