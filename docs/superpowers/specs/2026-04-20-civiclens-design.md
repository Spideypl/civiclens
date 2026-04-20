# CivicLens — MVP Design Spec
*Date: 2026-04-20*

## Overview

CivicLens is a web app that turns long U.S. congressional bills into plain-English summaries with multi-perspective political framing. The goal is nonpartisan civic accessibility — no agenda, no ads.

---

## Architecture

**Stack:**
- Frontend: React (Vite)
- Backend: Node.js serverless functions (Vercel API routes)
- AI: Anthropic Claude API (`claude-sonnet-4-20250514`) with prompt caching
- Bill data: Congress.gov public API
- Hosting: Vercel (monorepo)
- Caching: JSON files on disk (`/tmp/civiclens-cache` on Vercel, `./cache` in dev)

**Deployment model:** Monorepo — React frontend at root, serverless functions under `/api/`. One `vercel.json`, deployed together.

---

## File Structure

```
civiclens/
├── src/
│   ├── components/
│   │   ├── SearchBar.jsx         # Search input with bill-number detection
│   │   ├── BillHeader.jsx        # Number, title, sponsor, status badge
│   │   ├── SummarySection.jsx    # Plain-English overview + breakdown
│   │   ├── KeyFactsCards.jsx     # Funding / agencies / who's impacted
│   │   ├── PerspectiveTabs.jsx   # Liberal / Conservative / Independent tabs
│   │   └── VoteTracker.jsx       # Vote bar + party breakdown
│   ├── pages/
│   │   ├── Home.jsx              # Search page
│   │   ├── Results.jsx           # Keyword search results list
│   │   └── Bill.jsx              # Bill summary page
│   ├── App.jsx                   # React Router routes
│   └── main.jsx
├── api/
│   ├── search.js                 # GET /api/search?q=
│   ├── bill.js                   # GET /api/bill?congress=&type=&number=
│   └── summary.js                # GET /api/summary?id=
├── cache/                        # Local dev cache (gitignored)
├── public/
├── index.html
├── vite.config.js
├── vercel.json
└── package.json
```

---

## Routing

| Route | Page | Notes |
|---|---|---|
| `/` | `Home.jsx` | Search input |
| `/results?q={query}` | `Results.jsx` | Keyword search results list |
| `/bill/:congress/:type/:number` | `Bill.jsx` | e.g. `/bill/119/hr/4521` |

**Search logic (client-side):**
- Regex detects exact bill number patterns: `H.R. 4521`, `S. 12`, `H.Res. 100`, etc.
- Match → navigate directly to `/bill/:congress/:type/:number` (congress defaults to current: 119)
- No match → navigate to `/results?q={query}`

---

## API Endpoints

| Endpoint | Params | Source | Cached |
|---|---|---|---|
| `GET /api/search` | `q` | Congress.gov `/bill?query=` | No |
| `GET /api/bill` | `congress`, `type`, `number` | Congress.gov `/bill/{congress}/{type}/{number}` | No |
| `GET /api/summary` | `id` (e.g. `119-hr-4521`) | Claude API | Yes |

---

## Data Flow

### Search
1. User types → `SearchBar` regex-tests for bill number pattern
2. Match → parse type + number → navigate to bill page directly
3. No match → `/results?q=` → call `/api/search` → Congress.gov → display results list

### Bill Page Load
1. `Bill.jsx` mounts → parallel fetch:
   - `/api/bill` — Congress.gov metadata + vote data (renders header + vote tracker)
   - `/api/summary` — Claude-generated content (renders summary, key facts, perspectives)
2. Bill metadata renders fast; AI summary shows loading state until resolved

### `/api/summary` Internals
1. Check cache at `{CACHE_DIR}/{id}.json`
2. Cache hit → return immediately
3. Cache miss → fetch bill summary from Congress.gov `/bill/{congress}/{type}/{number}/summaries` (CRS summary text; fall back to title + latest action if no summary available) → call Claude → parse JSON → write cache → return

---

## Claude API Integration

**Model:** `claude-sonnet-4-20250514`

**Prompt caching:** System prompt uses `cache_control: { type: "ephemeral" }`. Only the bill text changes per call — the long instruction prompt is cached, reducing cost and latency on repeat calls.

**One call per bill generates:**
```json
{
  "overview": "string — 1-2 sentence plain-English summary",
  "breakdown": [
    { "label": "string", "text": "string" }
    // 2-3 items, e.g. "What it does" / "Why now" / "What changes"
  ],
  "keyFacts": {
    "funding": "string",
    "agencies": "string",
    "whoIsImpacted": "string"
  },
  "perspectives": {
    "liberal": "string — ~100-word paragraph framing",
    "conservative": "string — ~100-word paragraph framing",
    "independent": "string — ~100-word paragraph framing"
  }
}
```

**Editorial principle:** Perspective paragraphs are clearly labeled "AI-generated interpretations — not endorsements." Language must be balanced and non-inflammatory across all three tabs.

---

## Caching

- **Cache key:** bill ID string, e.g. `119-hr-4521`
- **Cache location:** `process.env.CACHE_DIR` → defaults to `/tmp/civiclens-cache` if `process.env.VERCEL` is set, otherwise `./cache`
- **TTL:** None for MVP — bills don't change materially once summarized
- **Invalidation:** Manual (delete the file)
- **Cold-start behavior:** Vercel `/tmp` is ephemeral — a cold function instance re-calls Claude. Acceptable for MVP traffic.

---

## Environment Variables

```
CONGRESS_API_KEY=     # from api.congress.gov (free registration)
ANTHROPIC_API_KEY=    # from console.anthropic.com
CACHE_DIR=            # optional override (defaults applied in code)
```

---

## Bill Summary Page Sections

1. **Bill Header** — bill number, full title, sponsor name/party/state, introduced date, current status badge
2. **Plain-English Summary** — short overview + 2-3 labeled breakdown items (What it does / Why now / What changes)
3. **Key Facts Cards** — three cards: Total Funding, Agencies Affected, Who's Impacted
4. **Political Perspectives** — tabbed section (Liberal / Conservative / Independent), each a ~100-word paragraph. Disclaimer label: "AI-generated interpretations — not endorsements"
5. **Vote Tracker** — horizontal bar showing Yea/Nay totals + party breakdown (Democrats / Republicans / Not voting). Hidden if no vote data available.

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Bill not found on Congress.gov | "Bill not found" state on Bill page |
| Congress.gov rate limit | User-facing "Try again in a moment" message |
| Claude returns malformed JSON | Retry once; if still fails, show "Summary unavailable" with bill metadata still visible |
| No vote data available | Hide VoteTracker section gracefully |

---

## Mobile Responsiveness

All pages are mobile-responsive. Key considerations:
- Key Facts cards stack vertically on small screens
- Perspective tabs remain horizontal (scrollable if needed)
- Vote bar remains full-width
- Search bar prominent on Home page

---

## Out of Scope (MVP)

- User accounts / saved bills
- Email alerts for bill status changes
- Full bill text display
- Historical congress sessions (defaults to current: 119th)
- Persistent cache (Vercel KV) — can be added post-MVP
