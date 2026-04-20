import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'

const TEST_CACHE = path.join(os.tmpdir(), 'civiclens-summary-test')

const fakeSummary = {
  overview: 'This bill funds semiconductor manufacturing.',
  breakdown: [
    { label: 'What it does', text: 'Invests $250B in chip production.' },
    { label: 'Why now', text: 'Global chip shortage exposed vulnerabilities.' },
    { label: 'What changes', text: 'Tax credits for domestic chip factories.' }
  ],
  keyFacts: {
    funding: '$250 billion over 5 years',
    agencies: 'NSF, NIST, DOE',
    whoIsImpacted: 'Semiconductor manufacturers, STEM students'
  },
  perspectives: {
    liberal: 'Progressives view this as overdue investment...',
    conservative: 'Conservatives support the national security rationale...',
    independent: 'Analysts note this addresses a genuine supply chain gap...'
  }
}

describe('GET /api/summary', () => {
  beforeEach(() => {
    process.env.CACHE_DIR = TEST_CACHE
    process.env.CONGRESS_API_KEY = 'test-key'
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key'
    vi.stubGlobal('fetch', vi.fn())
    vi.resetModules()
  })

  afterEach(() => {
    if (fs.existsSync(TEST_CACHE)) fs.rmSync(TEST_CACHE, { recursive: true })
    vi.unstubAllGlobals()
    delete process.env.CACHE_DIR
  })

  it('returns 400 if id is missing', async () => {
    const { default: handler } = await import('./summary.js')
    const req = { query: {} }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'id is required' })
  })

  it('returns cached data without calling Claude or fetch', async () => {
    fs.mkdirSync(TEST_CACHE, { recursive: true })
    fs.writeFileSync(path.join(TEST_CACHE, '119-hr-4521.json'), JSON.stringify(fakeSummary))

    const { default: handler } = await import('./summary.js')
    const req = { query: { id: '119-hr-4521' } }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
    await handler(req, res)

    expect(fetch).not.toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith(fakeSummary)
  })

  it('returns 400 for malformed id (fewer than 3 parts)', async () => {
    const { default: handler } = await import('./summary.js')
    const req = { query: { id: 'badformat' } }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })
})
