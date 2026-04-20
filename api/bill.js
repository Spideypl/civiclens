export default async function handler(req, res) {
  const { congress, type, number } = req.query
  if (!congress || !type || !number) {
    return res.status(400).json({ error: 'congress, type, and number are required' })
  }

  let response
  try {
    const url = `https://api.congress.gov/v3/bill/${congress}/${type}/${number}?format=json`
    response = await fetch(url, {
      headers: { 'X-API-Key': process.env.CONGRESS_API_KEY }
    })
  } catch {
    return res.status(502).json({ error: 'Congress.gov request failed' })
  }

  if (response.status === 429) return res.status(429).json({ error: 'Too many requests — try again in a moment' })
  if (!response.ok) return res.status(404).json({ error: 'Bill not found' })

  const data = await response.json()
  const bill = data.bill

  // Attempt to fetch vote data from the first recorded vote URL if available
  let votes = null
  const recordedVotes = bill.recordedVotes || []
  if (recordedVotes.length > 0) {
    try {
      const voteUrl = new URL(recordedVotes[0].url)
      voteUrl.searchParams.set('format', 'json')
      const voteRes = await fetch(voteUrl.toString(), {
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
            totals: vote.totals ?? null,
            partyTotals: vote.partyTotals ?? null
          }
        }
      }
    } catch {
      // vote data unavailable — VoteTracker will be hidden
    }
  }

  res.json({
    congress: bill.congress,
    type: bill.type?.toLowerCase() ?? '',
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
