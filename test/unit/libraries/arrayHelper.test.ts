import { describe, it, expect } from 'vitest'
import { orderBy } from '../../../app/libraries/arrayHelper'

describe('orderBy', () => {
  interface TestItem {
    name: string
    age: number
    score: number
  }

  const testData: TestItem[] = [
    { name: 'Charlie', age: 30, score: 85 },
    { name: 'Alice', age: 25, score: 95 },
    { name: 'Bob', age: 25, score: 90 },
    { name: 'David', age: 35, score: 80 },
  ]

  it('should sort by single key ascending by default', () => {
    const result = orderBy(testData, ['name'])
    expect(result.map((i) => i.name)).toEqual(['Alice', 'Bob', 'Charlie', 'David'])
  })

  it('should sort by single key descending', () => {
    const result = orderBy(testData, ['name'], ['desc'])
    expect(result.map((i) => i.name)).toEqual(['David', 'Charlie', 'Bob', 'Alice'])
  })

  it('should sort by multiple keys', () => {
    const result = orderBy(testData, ['age', 'score'])
    expect(result.map((i) => i.name)).toEqual(['Bob', 'Alice', 'Charlie', 'David'])
  })

  it('should sort by multiple keys with different orders', () => {
    const result = orderBy(testData, ['age', 'score'], ['asc', 'desc'])
    expect(result.map((i) => i.name)).toEqual(['Alice', 'Bob', 'Charlie', 'David'])
  })

  it('should handle empty array', () => {
    const result = orderBy([], ['name'])
    expect(result).toEqual([])
  })

  it('should not mutate original array', () => {
    const original = [...testData]
    orderBy(testData, ['name'])
    expect(testData).toEqual(original)
  })

  it('should handle numeric values', () => {
    const result = orderBy(testData, ['age'])
    expect(result.map((i) => i.age)).toEqual([25, 25, 30, 35])
  })

  it('should handle equal values', () => {
    const data = [
      { id: 1, val: 10 },
      { id: 2, val: 10 },
      { id: 3, val: 5 },
    ]
    const result = orderBy(data, ['val'])
    expect(result.map((i) => i.id)).toEqual([3, 1, 2])
  })
})
