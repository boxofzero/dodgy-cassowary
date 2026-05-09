import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { transactionViewOptions, categories, types, MAX_STAMINA } from '../../../app/libraries/constants'

describe('constants', () => {
  describe('transactionViewOptions', () => {
    it('should export correct values', () => {
      expect(transactionViewOptions).toEqual(['Yearly', 'Monthly', 'Daily'])
    })
  })

  describe('categories', () => {
    it('should export correct values', () => {
      expect(categories).toEqual(['Food', 'Housing', 'Car', 'Entertainment'])
    })
  })

  describe('types', () => {
    it('should export correct values', () => {
      expect(types).toEqual(['Income', 'Expense', 'Saving', 'Investment'])
    })
  })

  describe('MAX_STAMINA', () => {
    it('should be 240', () => {
      expect(MAX_STAMINA).toBe(240)
    })
  })
})
