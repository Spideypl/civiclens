# CivicLens MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working CivicLens MVP — Vite/React frontend + Vercel serverless API that searches congressional bills, generates plain-English AI summaries, and presents three political perspectives.

**Architecture:** Monorepo with React (Vite) frontend at root and Node.js serverless functions under `/api/`. All Congress.gov and Claude API calls are proxied through serverless functions. Generated summaries are cached as JSON files on disk.

**Tech Stack:** React 19, React Router v7 (library mode), Vite, Tailwind CSS v3, Vitest, @testing-library/react, @anthropic-ai/sdk, Vercel CLI

---

## File Map

| File | Responsibility |
|---|---|
| `package.json` | Dependencies, scripts |
| `vite.config.js` | Build config + Vitest config |
| `tailwind.config.js` | Tailwind content paths |
| `postcss.config.js` | PostCSS for Tailwind |
| `vercel.json` | SPA rewrites |
| `index.html` | Vite entry point |
| `src/main.jsx` | React root mount |
| `src/App.jsx` | React Router routes |
| `src/index.css` | Tailwind directives + base styles |
| `src/test-setup.js` | jest-dom matchers |
| `src/utils/parseBillNumber.js` | Detect + parse bill number strings |
| `src/utils/parseBillNumber.test.js` | Unit tests |
| `src/pages/Home.jsx` | Search landing page |
| `src/pages/Results.jsx` | Keyword search results list |
| `src/pages/Bill.jsx` | Bill summary page (assembles all sections) |
| `src/components/SearchBar.jsx` | Search input with routing logic |
| `src/components/BillHeader.jsx` | Number, title, sponsor, status badge |
| `src/components/SummarySection.jsx` | Plain-English overview + breakdown |
| `src/components/KeyFactsCards.jsx` | Funding / agencies / who's impacted |
| `src/components/PerspectiveTabs.jsx` | Liberal / Conservative / Independent tabs |
| `src/components/VoteTracker.jsx` | Vote bar + party breakdown |
| `src/components/SearchBar.test.jsx` | SearchBar unit tests |
| `src/components/BillHeader.test.jsx` | BillHeader unit tests |
| `src/components/SummarySection.test.jsx` | SummarySection unit tests |
| `src/components/KeyFactsCards.test.jsx` | KeyFactsCards unit tests |
| `src/components/PerspectiveTabs.test.jsx` | PerspectiveTabs unit tests |
| `src/components/VoteTracker.test.jsx` | VoteTracker unit tests |
| `src/pages/Bill.test.jsx` | Bill page integration test |
| `api/cache.js` | Read/write JSON cache files |
| `api/cache.test.js` | Cache unit tests |
| `api/search.js` | `GET /api/search?q=` → Congress.gov |
| `api/search.test.js` | Search handler unit tests |
| `api/bill.js` | `GET /api/bill?congress=&type=&number=` |
| `api/bill.test.js` | Bill handler unit tests |
| `api/summary.js` | `GET /api/summary?id=` → cache → Claude |
| `api/summary.test.js` | Summary handler unit tests |
| `.env.example` | Required env var template |
| `.gitignore` | Ignores: node_modules, cache/, .env, dist/ |

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `vercel.json`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `src/index.css`
- Create: `src/test-setup.js`
- Create: `.env.example`
- Modify: `.gitignore`

- [ ] **Step 1: Install dependencies**

```bash
cd ~/civiclens
npm init -y
npm install react react-dom react-router-dom @anthropic-ai/sdk
npm install -D vite @vitejs/plugin-react tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
npx tailwindcss init -p
```

- [ ] **Step 2: Write `package.json` scripts section**

Open `package.json` and replace the `scripts` field with:

```json
"scripts": {
  "dev": "vercel dev",
  "dev:frontend": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 3: Write `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist' },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.js'],
    globals: true,
    exclude: ['api/**', 'node_modules/**']
  }
})
```

- [ ] **Step 4: Write `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

- [ ] **Step 5: Write `vercel.json`**

```json
{
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

- [ ] **Step 6: Write `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CivicLens</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Write `src/main.jsx`**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 8: Write `src/App.jsx`**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Results from './pages/Results.jsx'
import Bill from './pages/Bill.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/results" element={<Results />} />
        <Route path="/bill/:congress/:type/:number" element={<Bill />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 9: Write `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-slate-50 text-slate-900 font-sans;
}
```

- [ ] **Step 10: Write `src/test-setup.js`**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 11: Write `.env.example`**

```
CONGRESS_API_KEY=your_congress_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
CACHE_DIR=
```

- [ ] **Step 12: Update `.gitignore`**

```
node_modules/
cache/
.env
.env.local
dist/
.superpowers/
```

- [ ] **Step 13: Verify Vite builds**

```bash
npm run build
```

Expected: `dist/` created with `index.html` and assets. No errors.

- [ ] **Step 14: Commit**

```bash
git add package.json package-lock.json vite.config.js tailwind.config.js postcss.config.js vercel.json index.html src/ .env.example .gitignore
git commit -m "feat: project scaffold — Vite, React, Tailwind, Vitest"
```

---

## Task 2: Cache Utility

**Files:**
- Create: `api/cache.js`
- Create: `api/cache.test.js`

- [ ] **Step 1: Write the failing test**

Create `api/cache.test.js`:

```js
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import { readCache, writeCache } from './cache.js'

const TEST_DIR = '/tmp/civiclens-test-cache'

describe('cache', () => {
  beforeEach(() => {
    process.env.CACHE_DIR = TEST_DIR
  })

  afterEach(() => {
    if (fs.existsSync(TEST_DIR)) fs.rmSync(TEST_DIR, { recursive: true })
    delete process.env.CACHE_DIR
  })

  it('returns null for a missing entry', () => {
    expect(readCache('119-hr-9999')).toBeNull()
  })

  it('reads back data that was written', () => {
    const data = { overview: 'test summary', breakdown: [] }
    writeCache('119-hr-1', data)
    expect(readCache('119-hr-1')).toEqual(data)
  })

  it('creates the cache directory if it does not exist', () => {
    writeCache('119-s-1', { overview: 'test' })
    expect(fs.existsSync(TEST_DIR)).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run api/cache.test.js
```

Expected: FAIL — `Cannot find module './cache.js'`

- [ ] **Step 3: Write `api/cache.js`**

```js
import fs from 'fs'
import path from 'path'

function getCacheDir() {
  return process.env.CACHE_DIR || (process.env.VERCEL ? '/tmp/civiclens-cache' : './cache')
}

export function readCache(id) {
  try {
    const content = fs.readFileSync(path.join(getCacheDir(), `${id}.json`), 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

export function writeCache(id, data) {
  const dir = getCacheDir()
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, `${id}.json`), JSON.stringify(data))
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run api/cache.test.js
```

Expected: PASS — 3 tests pass

- [ ] **Step 5: Commit**

```bash
git add api/cache.js api/cache.test.js
git commit -m "feat: disk-based cache utility for bill summaries"
```

---

## Task 3: `/api/search` — Congress.gov Bill Search

**Files:**
- Create: `api/search.js`
- Create: `api/search.test.js`

- [ ] **Step 1: Write the failing test**

Create `api/search.test.js`:

```js
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
    fetch.mockResolvedValue({ ok: false })
    const req = mockReq({ q: 'anything' })
    const res = mockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(502)
    expect(res.json).toHaveBeenCalledWith({ error: 'Congress.gov request failed' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run api/search.test.js
```

Expected: FAIL — `Cannot find module './search.js'`

- [ ] **Step 3: Write `api/search.js`**

```js
export default async function handler(req, res) {
  const { q } = req.query
  if (!q) return res.status(400).json({ error: 'q is required' })

  const url = `https://api.congress.gov/v3/bill?query=${encodeURIComponent(q)}&format=json&limit=20`
  const response = await fetch(url, {
    headers: { 'X-API-Key': process.env.CONGRESS_API_KEY }
  })

  if (response.status === 429) return res.status(429).json({ error: 'Too many requests — try again in a moment' })
  if (!response.ok) return res.status(502).json({ error: 'Congress.gov request failed' })

  const data = await response.json()
  const bills = (data.bills || []).map(bill => ({
    congress: bill.congress,
    type: bill.type.toLowerCase(),
    number: bill.number,
    title: bill.title,
    latestAction: bill.latestAction?.text || ''
  }))

  res.json({ bills })
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run api/search.test.js
```

Expected: PASS — 3 tests pass

- [ ] **Step 5: Commit**

```bash
git add api/search.js api/search.test.js
git commit -m "feat: /api/search proxies Congress.gov bill search"
```

---

## Task 4: `/api/bill` — Congress.gov Bill Detail

**Files:**
- Create: `api/bill.js`
- Create: `api/bill.test.js`

- [ ] **Step 1: Write the failing test**

Create `api/bill.test.js`:

```js
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
  })

  it('returns formatted bill data', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => fakeBillResponse })
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
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run api/bill.test.js
```

Expected: FAIL — `Cannot find module './bill.js'`

- [ ] **Step 3: Write `api/bill.js`**

```js
export default async function handler(req, res) {
  const { congress, type, number } = req.query
  if (!congress || !type || !number) {
    return res.status(400).json({ error: 'congress, type, and number are required' })
  }

  const url = `https://api.congress.gov/v3/bill/${congress}/${type}/${number}?format=json`
  const response = await fetch(url, {
    headers: { 'X-API-Key': process.env.CONGRESS_API_KEY }
  })

  if (response.status === 429) return res.status(429).json({ error: 'Too many requests — try again in a moment' })
  if (!response.ok) return res.status(404).json({ error: 'Bill not found' })

  const data = await response.json()
  const bill = data.bill

  // Attempt to fetch vote data from the first recorded vote URL if available
  let votes = null
  const recordedVotes = bill.recordedVotes || []
  if (recordedVotes.length > 0) {
    try {
      const voteRes = await fetch(recordedVotes[0].url + '?format=json', {
        headers: { 'X-API-Key': process.env.CONGRESS_API_KEY }
      })
      if (voteRes.ok) {
        const voteData = await voteRes.json()
        const vote = voteData.vote
        if (vote) {
          votes = {
            date: vote.date,
            question: vote.question,
            result: vote.result,
            totals: vote.totals || null,
            partyTotals: vote.partyTotals || null
          }
        }
      }
    } catch {
      // vote data unavailable — VoteTracker will be hidden
    }
  }

  res.json({
    congress: bill.congress,
    type: bill.type.toLowerCase(),
    number: bill.number,
    title: bill.title,
    sponsor: {
      name: bill.sponsors?.[0]?.fullName || '',
      party: bill.sponsors?.[0]?.party || '',
      state: bill.sponsors?.[0]?.state || ''
    },
    introducedDate: bill.introducedDate,
    latestAction: bill.latestAction?.text || '',
    votes
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run api/bill.test.js
```

Expected: PASS — 3 tests pass

- [ ] **Step 5: Commit**

```bash
git add api/bill.js api/bill.test.js
git commit -m "feat: /api/bill fetches bill detail and vote data from Congress.gov"
```

---

## Task 5: `/api/summary` — Cache + Claude Integration

**Files:**
- Create: `api/summary.js`
- Create: `api/summary.test.js`

- [ ] **Step 1: Write the failing test**

Create `api/summary.test.js`:

```js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'

const TEST_CACHE = '/tmp/civiclens-summary-test'

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
  })

  it('returns 400 if id is missing', async () => {
    const { default: handler } = await import('./summary.js')
    const req = { query: {} }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'id is required' })
  })

  it('returns cached data without calling Claude', async () => {
    // Pre-populate cache
    fs.mkdirSync(TEST_CACHE, { recursive: true })
    fs.writeFileSync(`${TEST_CACHE}/119-hr-4521.json`, JSON.stringify(fakeSummary))

    const { default: handler } = await import('./summary.js')
    const req = { query: { id: '119-hr-4521' } }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
    await handler(req, res)

    expect(fetch).not.toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith(fakeSummary)
  })

  it('returns 400 for malformed id', async () => {
    const { default: handler } = await import('./summary.js')
    const req = { query: { id: 'badformat' } }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run api/summary.test.js
```

Expected: FAIL — `Cannot find module './summary.js'`

- [ ] **Step 3: Write `api/summary.js`**

```js
import Anthropic from '@anthropic-ai/sdk'
import { readCache, writeCache } from './cache.js'

const SYSTEM_PROMPT = `You are a nonpartisan civic education tool. Given a congressional bill summary or description, generate a structured JSON analysis. Return ONLY valid JSON with no markdown fences or other text.

The JSON must match this exact schema:
{
  "overview": "1-2 sentence plain-English summary of what the bill does",
  "breakdown": [
    { "label": "What it does", "text": "explanation" },
    { "label": "Why now", "text": "explanation" },
    { "label": "What changes", "text": "explanation" }
  ],
  "keyFacts": {
    "funding": "dollar amount and purpose, or 'No direct funding' if none",
    "agencies": "comma-separated list of affected federal agencies",
    "whoIsImpacted": "description of groups or individuals affected"
  },
  "perspectives": {
    "liberal": "~100-word paragraph describing how progressives/liberals tend to view this bill. Balanced, non-inflammatory.",
    "conservative": "~100-word paragraph describing how conservatives/Republicans tend to view this bill. Balanced, non-inflammatory.",
    "independent": "~100-word paragraph with a centrist analysis of the bill's practical effects."
  }
}

Perspectives are interpretive framings, not endorsements. Use neutral, informative language.`

async function fetchBillText(congress, type, number) {
  const headers = { 'X-API-Key': process.env.CONGRESS_API_KEY }
  const summariesUrl = `https://api.congress.gov/v3/bill/${congress}/${type}/${number}/summaries?format=json`
  const summariesRes = await fetch(summariesUrl, { headers })
  if (summariesRes.ok) {
    const data = await summariesRes.json()
    const text = data.summaries?.[0]?.text
    if (text) return text
  }
  // Fallback: use bill title + latest action
  const billRes = await fetch(
    `https://api.congress.gov/v3/bill/${congress}/${type}/${number}?format=json`,
    { headers }
  )
  if (!billRes.ok) throw new Error('Could not fetch bill data')
  const billData = await billRes.json()
  return `${billData.bill.title}. Latest action: ${billData.bill.latestAction?.text || 'none'}`
}

async function callClaude(billText) {
  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: `Analyze this congressional bill:\n\n${billText}` }]
  })
  return JSON.parse(message.content[0].text)
}

export default async function handler(req, res) {
  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'id is required' })

  const parts = id.split('-')
  if (parts.length < 3) return res.status(400).json({ error: 'id must be in format {congress}-{type}-{number}' })

  const [congress, type, ...rest] = parts
  const number = rest.join('-')

  const cached = readCache(id)
  if (cached) return res.json(cached)

  let billText
  try {
    billText = await fetchBillText(congress, type, number)
  } catch {
    return res.status(502).json({ error: 'Could not fetch bill data from Congress.gov' })
  }

  let summary
  try {
    summary = await callClaude(billText)
  } catch {
    try {
      summary = await callClaude(billText)
    } catch {
      return res.status(502).json({ error: 'Summary generation failed' })
    }
  }

  writeCache(id, summary)
  res.json(summary)
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run api/summary.test.js
```

Expected: PASS — 3 tests pass

- [ ] **Step 5: Commit**

```bash
git add api/summary.js api/summary.test.js
git commit -m "feat: /api/summary generates and caches Claude bill analysis"
```

---

## Task 6: Bill Number Parser Utility

**Files:**
- Create: `src/utils/parseBillNumber.js`
- Create: `src/utils/parseBillNumber.test.js`

- [ ] **Step 1: Write the failing test**

Create `src/utils/parseBillNumber.test.js`:

```js
import { describe, it, expect } from 'vitest'
import parseBillNumber from './parseBillNumber.js'

describe('parseBillNumber', () => {
  it('parses H.R. 4521', () => {
    expect(parseBillNumber('H.R. 4521')).toEqual({ type: 'hr', number: '4521' })
  })

  it('parses HR4521 (no punctuation)', () => {
    expect(parseBillNumber('HR4521')).toEqual({ type: 'hr', number: '4521' })
  })

  it('parses S. 12', () => {
    expect(parseBillNumber('S. 12')).toEqual({ type: 's', number: '12' })
  })

  it('parses H.Res. 100', () => {
    expect(parseBillNumber('H.Res. 100')).toEqual({ type: 'hres', number: '100' })
  })

  it('parses S.Res. 50', () => {
    expect(parseBillNumber('S.Res. 50')).toEqual({ type: 'sres', number: '50' })
  })

  it('parses H.J.Res. 200', () => {
    expect(parseBillNumber('H.J.Res. 200')).toEqual({ type: 'hjres', number: '200' })
  })

  it('parses S.J.Res. 300', () => {
    expect(parseBillNumber('S.J.Res. 300')).toEqual({ type: 'sjres', number: '300' })
  })

  it('returns null for a keyword query', () => {
    expect(parseBillNumber('semiconductor manufacturing')).toBeNull()
  })

  it('returns null for an empty string', () => {
    expect(parseBillNumber('')).toBeNull()
  })

  it('is case-insensitive', () => {
    expect(parseBillNumber('h.r. 4521')).toEqual({ type: 'hr', number: '4521' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/utils/parseBillNumber.test.js
```

Expected: FAIL — `Cannot find module './parseBillNumber.js'`

- [ ] **Step 3: Write `src/utils/parseBillNumber.js`**

```js
const TYPE_MAP = {
  HJRES: 'hjres',
  SJRES: 'sjres',
  HRES: 'hres',
  SRES: 'sres',
  HR: 'hr',
  S: 's'
}

export default function parseBillNumber(input) {
  if (!input) return null
  const normalized = input.trim()
    .replace(/\.\s*/g, '')
    .replace(/\s+/g, '')
    .toUpperCase()
  const match = normalized.match(/^(HJRES|SJRES|HRES|SRES|HR|S)(\d+)$/)
  if (!match) return null
  return { type: TYPE_MAP[match[1]], number: match[2] }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/utils/parseBillNumber.test.js
```

Expected: PASS — 10 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/utils/parseBillNumber.js src/utils/parseBillNumber.test.js
git commit -m "feat: bill number parser for direct-to-bill search routing"
```

---

## Task 7: SearchBar Component & Home Page

**Files:**
- Create: `src/components/SearchBar.jsx`
- Create: `src/components/SearchBar.test.jsx`
- Create: `src/pages/Home.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/SearchBar.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
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
    expect(mockNavigate).toHaveBeenCalledWith('/results?q=semiconductor+manufacturing')
  })

  it('does nothing on empty submit', async () => {
    renderSearchBar()
    await userEvent.click(screen.getByRole('button', { name: /search/i }))
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/SearchBar.test.jsx
```

Expected: FAIL — `Cannot find module './SearchBar.jsx'`

- [ ] **Step 3: Write `src/components/SearchBar.jsx`**

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import parseBillNumber from '../utils/parseBillNumber.js'

const CURRENT_CONGRESS = 119

export default function SearchBar({ initialValue = '' }) {
  const [query, setQuery] = useState(initialValue)
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    const bill = parseBillNumber(trimmed)
    if (bill) {
      navigate(`/bill/${CURRENT_CONGRESS}/${bill.type}/${bill.number}`)
    } else {
      navigate(`/results?q=${encodeURIComponent(trimmed).replace(/%20/g, '+')}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-xl">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder='Search bills — try "H.R. 4521" or "climate"'
        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="px-5 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
      >
        Search
      </button>
    </form>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/components/SearchBar.test.jsx
```

Expected: PASS — 4 tests pass

- [ ] **Step 5: Write `src/pages/Home.jsx`**

```jsx
import SearchBar from '../components/SearchBar.jsx'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-slate-50">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">CivicLens</h1>
        <p className="text-slate-500 text-lg">Plain-English summaries of U.S. congressional bills</p>
      </div>
      <SearchBar />
      <p className="mt-4 text-xs text-slate-400">
        Try a bill number like "H.R. 4521" or search by keyword like "healthcare"
      </p>
    </main>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/SearchBar.jsx src/components/SearchBar.test.jsx src/pages/Home.jsx
git commit -m "feat: SearchBar with bill-number detection and Home page"
```

---

## Task 8: Results Page

**Files:**
- Create: `src/pages/Results.jsx`

- [ ] **Step 1: Write `src/pages/Results.jsx`**

No test for this page — it is a straightforward fetch-and-render, and the underlying logic (search, navigation) is already tested in Task 7.

```jsx
import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import SearchBar from '../components/SearchBar.jsx'

const CURRENT_CONGRESS = 119

export default function Results() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const navigate = useNavigate()

  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!q) { navigate('/'); return }
    setLoading(true)
    setError(null)
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(data => { setBills(data.bills || []); setLoading(false) })
      .catch(() => { setError('Search failed. Try again.'); setLoading(false) })
  }, [q])

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link to="/" className="text-blue-700 font-bold text-lg shrink-0">CivicLens</Link>
          <SearchBar initialValue={q} />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading && <p className="text-slate-500 text-sm">Searching...</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {!loading && !error && bills.length === 0 && (
          <p className="text-slate-500 text-sm">No bills found for "{q}".</p>
        )}
        {!loading && bills.length > 0 && (
          <ul className="space-y-3">
            {bills.map(bill => (
              <li key={`${bill.congress}-${bill.type}-${bill.number}`}>
                <Link
                  to={`/bill/${bill.congress || CURRENT_CONGRESS}/${bill.type}/${bill.number}`}
                  className="block bg-white border border-slate-200 rounded-lg p-4 hover:border-blue-400 transition-colors"
                >
                  <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                    {bill.type.toUpperCase()} {bill.number} · {bill.congress || CURRENT_CONGRESS}th Congress
                  </div>
                  <div className="text-sm font-medium text-slate-900 leading-snug">{bill.title}</div>
                  {bill.latestAction && (
                    <div className="text-xs text-slate-500 mt-1">{bill.latestAction}</div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Results.jsx
git commit -m "feat: Results page renders Congress.gov keyword search results"
```

---

## Task 9: BillHeader & VoteTracker Components

**Files:**
- Create: `src/components/BillHeader.jsx`
- Create: `src/components/BillHeader.test.jsx`
- Create: `src/components/VoteTracker.jsx`
- Create: `src/components/VoteTracker.test.jsx`

- [ ] **Step 1: Write the failing BillHeader test**

Create `src/components/BillHeader.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Run BillHeader test to verify it fails**

```bash
npx vitest run src/components/BillHeader.test.jsx
```

Expected: FAIL — `Cannot find module './BillHeader.jsx'`

- [ ] **Step 3: Write `src/components/BillHeader.jsx`**

```jsx
function formatBillLabel(type, number) {
  const labels = { hr: 'H.R.', s: 'S.', hres: 'H.Res.', sres: 'S.Res.', hjres: 'H.J.Res.', sjres: 'S.J.Res.' }
  return `${labels[type] || type.toUpperCase()} ${number}`
}

export default function BillHeader({ bill }) {
  return (
    <div className="bg-white border-b border-slate-200 px-4 py-5">
      <div className="max-w-3xl mx-auto">
        <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
          {formatBillLabel(bill.type, bill.number)} · {bill.congress}th Congress
        </div>
        <h1 className="text-xl font-bold text-slate-900 leading-snug mb-2">{bill.title}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          {bill.sponsor?.name && <span>Sponsor: {bill.sponsor.name} ({bill.sponsor.party}-{bill.sponsor.state})</span>}
          {bill.introducedDate && <span>Introduced: {bill.introducedDate}</span>}
          {bill.latestAction && (
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              {bill.latestAction}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run BillHeader test to verify it passes**

```bash
npx vitest run src/components/BillHeader.test.jsx
```

Expected: PASS — 4 tests pass

- [ ] **Step 5: Write the failing VoteTracker test**

Create `src/components/VoteTracker.test.jsx`:

```jsx
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
```

- [ ] **Step 6: Run VoteTracker test to verify it fails**

```bash
npx vitest run src/components/VoteTracker.test.jsx
```

Expected: FAIL — `Cannot find module './VoteTracker.jsx'`

- [ ] **Step 7: Write `src/components/VoteTracker.jsx`**

```jsx
export default function VoteTracker({ votes }) {
  if (!votes?.totals) return null

  const { yea, nay, notVoting } = votes.totals
  const total = yea + nay + (notVoting || 0)
  const yeaPct = total > 0 ? (yea / total) * 100 : 50

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-5">
      <div className="max-w-3xl mx-auto">
        <div className="text-xs text-slate-400 uppercase tracking-wide mb-3">
          Vote — {votes.date} · {votes.question}
        </div>
        <div className="flex h-7 rounded overflow-hidden mb-2">
          <div
            className="bg-green-600 flex items-center justify-center text-white text-xs font-semibold"
            style={{ width: `${yeaPct}%` }}
          >
            {yea} Yea
          </div>
          <div
            className="bg-red-600 flex items-center justify-center text-white text-xs font-semibold"
            style={{ width: `${100 - yeaPct}%` }}
          >
            {nay} Nay
          </div>
        </div>
        {votes.partyTotals?.length > 0 && (
          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            {votes.partyTotals.map(p => (
              <span key={p.party}>
                <span className="font-semibold text-slate-700">
                  {p.party === 'D' ? 'Democrats' : p.party === 'R' ? 'Republicans' : p.party}:
                </span>{' '}
                {p.yea} yea / {p.nay} nay
              </span>
            ))}
            {notVoting > 0 && <span>Not voting: {notVoting}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Run VoteTracker test to verify it passes**

```bash
npx vitest run src/components/VoteTracker.test.jsx
```

Expected: PASS — 3 tests pass

- [ ] **Step 9: Commit**

```bash
git add src/components/BillHeader.jsx src/components/BillHeader.test.jsx src/components/VoteTracker.jsx src/components/VoteTracker.test.jsx
git commit -m "feat: BillHeader and VoteTracker components"
```

---

## Task 10: SummarySection & KeyFactsCards Components

**Files:**
- Create: `src/components/SummarySection.jsx`
- Create: `src/components/SummarySection.test.jsx`
- Create: `src/components/KeyFactsCards.jsx`
- Create: `src/components/KeyFactsCards.test.jsx`

- [ ] **Step 1: Write the failing SummarySection test**

Create `src/components/SummarySection.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Run SummarySection test to verify it fails**

```bash
npx vitest run src/components/SummarySection.test.jsx
```

Expected: FAIL — `Cannot find module './SummarySection.jsx'`

- [ ] **Step 3: Write `src/components/SummarySection.jsx`**

```jsx
export default function SummarySection({ summary }) {
  return (
    <div className="bg-white border-b border-slate-200 px-4 py-5">
      <div className="max-w-3xl mx-auto">
        <div className="text-xs text-slate-400 uppercase tracking-wide mb-3">Plain-English Summary</div>
        <p className="text-sm font-semibold text-slate-900 leading-relaxed mb-4">{summary.overview}</p>
        <div className="space-y-3">
          {summary.breakdown.map(item => (
            <div key={item.label}>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{item.label}: </span>
              <span className="text-sm text-slate-700">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run SummarySection test to verify it passes**

```bash
npx vitest run src/components/SummarySection.test.jsx
```

Expected: PASS — 2 tests pass

- [ ] **Step 5: Write the failing KeyFactsCards test**

Create `src/components/KeyFactsCards.test.jsx`:

```jsx
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
```

- [ ] **Step 6: Run KeyFactsCards test to verify it fails**

```bash
npx vitest run src/components/KeyFactsCards.test.jsx
```

Expected: FAIL — `Cannot find module './KeyFactsCards.jsx'`

- [ ] **Step 7: Write `src/components/KeyFactsCards.jsx`**

```jsx
function Card({ label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className="text-sm font-semibold text-slate-800 leading-snug">{value}</div>
    </div>
  )
}

export default function KeyFactsCards({ keyFacts }) {
  return (
    <div className="bg-slate-50 border-b border-slate-200 px-4 py-5">
      <div className="max-w-3xl mx-auto">
        <div className="text-xs text-slate-400 uppercase tracking-wide mb-3">Key Facts</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card label="Total Funding" value={keyFacts.funding} />
          <Card label="Agencies Affected" value={keyFacts.agencies} />
          <Card label="Who's Impacted" value={keyFacts.whoIsImpacted} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Run KeyFactsCards test to verify it passes**

```bash
npx vitest run src/components/KeyFactsCards.test.jsx
```

Expected: PASS — 3 tests pass

- [ ] **Step 9: Commit**

```bash
git add src/components/SummarySection.jsx src/components/SummarySection.test.jsx src/components/KeyFactsCards.jsx src/components/KeyFactsCards.test.jsx
git commit -m "feat: SummarySection and KeyFactsCards components"
```

---

## Task 11: PerspectiveTabs Component

**Files:**
- Create: `src/components/PerspectiveTabs.jsx`
- Create: `src/components/PerspectiveTabs.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/PerspectiveTabs.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/PerspectiveTabs.test.jsx
```

Expected: FAIL — `Cannot find module './PerspectiveTabs.jsx'`

- [ ] **Step 3: Write `src/components/PerspectiveTabs.jsx`**

```jsx
import { useState } from 'react'

const TABS = [
  { key: 'liberal', label: 'Liberal', activeClass: 'bg-blue-700 text-white', borderClass: 'border-blue-700' },
  { key: 'conservative', label: 'Conservative', activeClass: 'bg-red-700 text-white', borderClass: 'border-red-700' },
  { key: 'independent', label: 'Independent', activeClass: 'bg-slate-600 text-white', borderClass: 'border-slate-600' }
]

export default function PerspectiveTabs({ perspectives }) {
  const [active, setActive] = useState('liberal')
  const activeTab = TABS.find(t => t.key === active)

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-5">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="text-xs text-slate-400 uppercase tracking-wide">Political Perspectives</div>
          <div className="text-xs text-slate-400 italic">AI-generated interpretations — not endorsements</div>
        </div>
        <div className="flex gap-2 mb-4">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`px-4 py-1.5 rounded text-xs font-medium transition-colors border ${
                active === tab.key
                  ? `${tab.activeClass} ${tab.borderClass}`
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <p
          className={`text-sm text-slate-700 leading-relaxed border-l-4 pl-4 py-2 bg-slate-50 rounded-r ${activeTab?.borderClass}`}
        >
          {perspectives[active]}
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/components/PerspectiveTabs.test.jsx
```

Expected: PASS — 4 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/components/PerspectiveTabs.jsx src/components/PerspectiveTabs.test.jsx
git commit -m "feat: PerspectiveTabs with Liberal/Conservative/Independent views and AI disclaimer"
```

---

## Task 12: Bill Page — Assembles All Components

**Files:**
- Create: `src/pages/Bill.jsx`
- Create: `src/pages/Bill.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/pages/Bill.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/pages/Bill.test.jsx
```

Expected: FAIL — `Cannot find module './Bill.jsx'`

- [ ] **Step 3: Write `src/pages/Bill.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import BillHeader from '../components/BillHeader.jsx'
import SummarySection from '../components/SummarySection.jsx'
import KeyFactsCards from '../components/KeyFactsCards.jsx'
import PerspectiveTabs from '../components/PerspectiveTabs.jsx'
import VoteTracker from '../components/VoteTracker.jsx'
import SearchBar from '../components/SearchBar.jsx'

export default function Bill() {
  const { congress, type, number } = useParams()

  const [bill, setBill] = useState(null)
  const [summary, setSummary] = useState(null)
  const [billError, setBillError] = useState(null)
  const [summaryError, setSummaryError] = useState(null)
  const [loadingBill, setLoadingBill] = useState(true)
  const [loadingSummary, setLoadingSummary] = useState(true)

  useEffect(() => {
    setLoadingBill(true)
    setBillError(null)
    fetch(`/api/bill?congress=${congress}&type=${type}&number=${number}`)
      .then(r => r.json().then(data => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (ok) setBill(data)
        else setBillError(data.error || 'Bill not found')  // passes through 429 "try again" message
      })
      .catch(() => setBillError('Failed to load bill'))
      .finally(() => setLoadingBill(false))
  }, [congress, type, number])

  useEffect(() => {
    setLoadingSummary(true)
    setSummaryError(null)
    fetch(`/api/summary?id=${congress}-${type}-${number}`)
      .then(r => r.json().then(data => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (ok) setSummary(data)
        else setSummaryError(data.error || 'Summary unavailable')
      })
      .catch(() => setSummaryError('Summary unavailable'))
      .finally(() => setLoadingSummary(false))
  }, [congress, type, number])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link to="/" className="text-blue-700 font-bold text-lg shrink-0">CivicLens</Link>
          <SearchBar />
        </div>
      </header>

      {loadingBill && (
        <div className="max-w-3xl mx-auto px-4 py-8 text-sm text-slate-400">Loading bill...</div>
      )}

      {billError && (
        <div className="max-w-3xl mx-auto px-4 py-8">
          <p className="text-red-600 text-sm">{billError}</p>
          <Link to="/" className="text-blue-600 text-sm mt-2 inline-block">← Back to search</Link>
        </div>
      )}

      {!loadingBill && bill && (
        <>
          <BillHeader bill={bill} />
          <VoteTracker votes={bill.votes} />

          {loadingSummary && (
            <div className="bg-white border-b border-slate-200 px-4 py-8">
              <div className="max-w-3xl mx-auto text-sm text-slate-400">Generating summary...</div>
            </div>
          )}

          {summaryError && (
            <div className="bg-white border-b border-slate-200 px-4 py-5">
              <div className="max-w-3xl mx-auto text-sm text-red-500">{summaryError}</div>
            </div>
          )}

          {!loadingSummary && summary && (
            <>
              <SummarySection summary={summary} />
              <KeyFactsCards keyFacts={summary.keyFacts} />
              <PerspectiveTabs perspectives={summary.perspectives} />
            </>
          )}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/pages/Bill.test.jsx
```

Expected: PASS — 4 tests pass

- [ ] **Step 5: Run the full test suite**

```bash
npm test
```

Expected: All tests pass. Note: `api/` tests run via `npx vitest run api/` separately if needed.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Bill.jsx src/pages/Bill.test.jsx
git commit -m "feat: Bill page assembles all components with parallel fetch and error states"
```

---

## Task 13: End-to-End Smoke Test with Vercel Dev

**Files:** No new files — this is a manual verification step.

- [ ] **Step 1: Create a `.env` file from the example**

```bash
cp .env.example .env
```

Open `.env` and fill in your real keys:
```
CONGRESS_API_KEY=<your key from api.congress.gov>
ANTHROPIC_API_KEY=<your key from console.anthropic.com>
```

- [ ] **Step 2: Install the Vercel CLI if needed**

```bash
npm install -g vercel
```

- [ ] **Step 3: Start the dev server**

```bash
npm run dev
```

Vercel CLI will start the frontend and API functions together. Expected output includes a local URL like `http://localhost:3000`.

- [ ] **Step 4: Smoke test the search flow**

Open `http://localhost:3000` in a browser.

1. Type `H.R. 4521` and submit → should navigate directly to `/bill/119/hr/4521`
2. Type `climate` and submit → should navigate to `/results?q=climate` and show a list of bills
3. Click a bill from the results list → should navigate to its bill page

- [ ] **Step 5: Smoke test the bill summary page**

On the bill page (`/bill/119/hr/4521`):

1. Bill header (number, title, sponsor) renders immediately
2. "Generating summary..." appears briefly, then the summary renders
3. All three tabs (Liberal, Conservative, Independent) are clickable and show different paragraphs
4. If vote data is available, the vote bar renders

- [ ] **Step 6: Verify the cache**

After the first visit to any bill page:

```bash
ls ./cache/
```

Expected: A file like `119-hr-4521.json` exists. Reload the bill page — the summary should load instantly (no Claude call).

- [ ] **Step 7: Run the full test suite one final time**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 8: Final commit**

```bash
git add .
git commit -m "feat: CivicLens MVP complete — bill search, AI summaries, political perspectives"
```
