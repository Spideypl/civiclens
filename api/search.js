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
