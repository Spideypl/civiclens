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
