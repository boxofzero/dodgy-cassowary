import { describe, expect, it } from 'vitest'
import { exp_data } from '@/data/game/inventoryItem/gameInventoryItemConfig'

describe('gameInventoryItemConfig', () => {
  describe('exp_data', () => {
    it('has weap_exp key (matches material type from game data)', () => {
      expect(exp_data).toHaveProperty('weap_exp')
    })

    it('has char_exp key (matches material type from game data)', () => {
      expect(exp_data).toHaveProperty('char_exp')
    })

    it('weap_exp has exp_value entries', () => {
      const entries = Object.values(exp_data.weap_exp)
      expect(entries.length).toBeGreaterThan(0)
      entries.forEach(entry => {
        expect(entry).toHaveProperty('exp_value')
        expect(typeof entry.exp_value).toBe('number')
      })
    })

    it('char_exp has exp_value entries', () => {
      const entries = Object.values(exp_data.char_exp)
      expect(entries.length).toBeGreaterThan(0)
      entries.forEach(entry => {
        expect(entry).toHaveProperty('exp_value')
        expect(typeof entry.exp_value).toBe('number')
      })
    })
  })
})
