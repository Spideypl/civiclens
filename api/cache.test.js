import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { readCache, writeCache } from './cache.js'

const TEST_DIR = path.join(os.tmpdir(), 'civiclens-test-cache')

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
