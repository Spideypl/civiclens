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
