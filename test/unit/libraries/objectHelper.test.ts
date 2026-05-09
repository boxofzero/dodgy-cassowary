import { describe, it, expect } from 'vitest'
import { has, mergeWithSum, pickBy, omit } from '../../../app/libraries/objectHelper'

describe('has', () => {
  it('should return false for null/undefined', () => {
    expect(has(null, 'key')).toBe(false)
    expect(has(undefined, 'key')).toBe(false)
  })

  it('should return true for existing key', () => {
    expect(has({ a: 1 }, 'a')).toBe(true)
  })

  it('should return false for non-existing key', () => {
    expect(has({ a: 1 }, 'b')).toBe(false)
  })

  it('should handle nested keys with dot notation', () => {
    const obj = { a: { b: { c: 1 } } }
    expect(has(obj, 'a.b.c')).toBe(true)
    expect(has(obj, 'a.b.d')).toBe(false)
  })

  it('should handle partial nested path', () => {
    const obj = { a: { b: 1 } }
    expect(has(obj, 'a.b')).toBe(true)
    expect(has(obj, 'a.c')).toBe(false)
  })
})

describe('mergeWithSum', () => {
  it('should merge and sum two objects', () => {
    const result = mergeWithSum({ a: 1, b: 2 }, { b: 3, c: 4 })
    expect(result).toEqual({ a: 1, b: 5, c: 4 })
  })

  it('should handle multiple objects', () => {
    const result = mergeWithSum({ a: 1 }, { b: 2 }, { a: 3, c: 5 })
    expect(result).toEqual({ a: 4, b: 2, c: 5 })
  })

  it('should handle empty objects', () => {
    const result = mergeWithSum({}, {})
    expect(result).toEqual({})
  })

  it('should handle zero values', () => {
    const result = mergeWithSum({ a: 0 }, { a: 1 })
    expect(result).toEqual({ a: 1 })
  })

  it('should handle undefined values', () => {
    const result = mergeWithSum({ a: 1 }, { a: undefined as any })
    expect(result).toEqual({ a: 1 })
  })

  it('should return new object without mutating inputs', () => {
    const obj1 = { a: 1 }
    const obj2 = { b: 2 }
    const result = mergeWithSum(obj1, obj2)
    expect(obj1).toEqual({ a: 1 })
    expect(obj2).toEqual({ b: 2 })
    expect(result).not.toBe(obj1)
    expect(result).not.toBe(obj2)
  })
})

describe('pickBy', () => {
  it('should pick keys based on predicate', () => {
    const obj = { a: 1, b: 0, c: 3, d: null }
    const result = pickBy(obj, (val) => val != null && val > 0)
    expect(result).toEqual({ a: 1, c: 3 })
  })

  it('should return empty object when no matches', () => {
    const obj = { a: 0, b: false }
    const result = pickBy(obj, (val) => val === true)
    expect(result).toEqual({})
  })

  it('should pass key to predicate', () => {
    const obj = { a1: 1, b2: 2, c3: 3 }
    const result = pickBy(obj, (_, key) => key.startsWith('a'))
    expect(result).toEqual({ a1: 1 })
  })

  it('should handle empty object', () => {
    const result = pickBy({}, () => true)
    expect(result).toEqual({})
  })
})

describe('omit', () => {
  it('should omit specified keys', () => {
    const obj = { a: 1, b: 2, c: 3, d: 4 }
    const result = omit(obj, 'b', 'd')
    expect(result).toEqual({ a: 1, c: 3 })
  })

  it('should handle non-existing keys', () => {
    const obj = { a: 1, b: 2 }
    const result = omit(obj, 'c', 'd')
    expect(result).toEqual({ a: 1, b: 2 })
  })

  it('should return empty object when all keys omitted', () => {
    const obj = { a: 1, b: 2 }
    const result = omit(obj, 'a', 'b')
    expect(result).toEqual({})
  })

  it('should handle empty keys to omit', () => {
    const obj = { a: 1, b: 2 }
    const result = omit(obj)
    expect(result).toEqual({ a: 1, b: 2 })
  })

  it('should not mutate original object', () => {
    const obj = { a: 1, b: 2 }
    omit(obj, 'a')
    expect(obj).toEqual({ a: 1, b: 2 })
  })
})
