import Anthropic from '@anthropic-ai/sdk'
import { readCache, writeCache } from './cache.js'

const client = new Anthropic()

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
  const summariesRes = await fetch(
    `https://api.congress.gov/v3/bill/${congress}/${type}/${number}/summaries?format=json`,
    { headers }
  )
  if (summariesRes.ok) {
    const data = await summariesRes.json()
    const text = data.summaries?.[0]?.text
    if (text) return text
  }
  // Fallback: use bill title + latest action if no CRS summary available
  const billRes = await fetch(
    `https://api.congress.gov/v3/bill/${congress}/${type}/${number}?format=json`,
    { headers }
  )
  if (!billRes.ok) throw new Error('Could not fetch bill data')
  const billData = await billRes.json()
  return `${billData.bill.title}. Latest action: ${billData.bill.latestAction?.text || 'none'}`
}

async function callClaude(billText) {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: `Analyze this congressional bill:\n\n${billText}` }]
  })
  const block = message.content[0]
  if (!block || block.type !== 'text') throw new Error('Unexpected Claude response format')
  return block.text
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
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const rawText = await callClaude(billText)
      summary = JSON.parse(rawText)
      break
    } catch (err) {
      if (attempt === 1) {
        return res.status(502).json({ error: 'Summary generation failed' })
      }
      // Retry only on SyntaxError (malformed JSON from Claude); rethrow other errors on attempt 0
      if (!(err instanceof SyntaxError)) {
        return res.status(502).json({ error: 'Summary generation failed' })
      }
    }
  }

  writeCache(id, summary)
  res.json(summary)
}
