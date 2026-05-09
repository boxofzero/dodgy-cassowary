import { describe, it, expect } from 'vitest'
import { generateTimestamp } from '../../../app/libraries/datetimeHelper'

describe('generateTimestamp', () => {
  it('should generate correct timestamp format', () => {
    const date = new Date('2024-01-15T10:30:45')
    const result = generateTimestamp(date)
    expect(result).toBe('20240115_103045')
  })

  it('should handle single digit month/day/hour/minute/second', () => {
    const date = new Date('2024-02-05T08:09:07')
    const result = generateTimestamp(date)
    expect(result).toBe('20240205_080907')
  })

  it('should handle end of year', () => {
    const date = new Date('2024-12-31T23:59:59')
    const result = generateTimestamp(date)
    expect(result).toBe('20241231_235959')
  })

  it('should handle midnight', () => {
    const date = new Date('2024-06-15T00:00:00')
    const result = generateTimestamp(date)
    expect(result).toBe('20240615_000000')
  })

  it('should handle different years', () => {
    const date = new Date('2023-05-20T14:25:30')
    const result = generateTimestamp(date)
    expect(result).toBe('20230520_142530')
  })
})
