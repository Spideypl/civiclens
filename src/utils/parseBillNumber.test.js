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
