import { describe, expect, it, vi, beforeEach } from 'vitest'

const { mockGameInventoryItem } = vi.hoisted(() => ({
  mockGameInventoryItem: {
    tiered_materials_per_type: {} as Record<string, any>,
    synthesizable_materials: {} as Record<string, any>,
    allInventoryItems: {} as Record<string, any>,
  },
}))

vi.mock('~/data/game/inventoryItem/gameInventoryItem', () => ({
  get tiered_materials_per_type() { return mockGameInventoryItem.tiered_materials_per_type },
  get synthesizable_materials() { return mockGameInventoryItem.synthesizable_materials },
  get allInventoryItems() { return mockGameInventoryItem.allInventoryItems },
}))

const mockGameCharacters = vi.hoisted(() => ({
  characters: {} as Record<string, any>,
}))

vi.mock('~/data/game/gameCharacter', () => mockGameCharacters)

import { getLevelRangeDiff, isTieredMaterialType, getMaterialsFromLevelListStatList } from '@/services/planner/utilities'

describe('planner/utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGameInventoryItem.tiered_materials_per_type = {}
  })

  describe('getLevelRangeDiff', () => {
    it('returns empty array when current and target are same', () => {
      const arrayData = [
        { level: '1', materials: {} },
        { level: '50', materials: {} },
      ]
      const result = getLevelRangeDiff(arrayData, '1', '1')
      expect(result).toEqual([])
    })

    it('returns levels between current and target (exclusive of current)', () => {
      const arrayData = [
        { level: '1', materials: {} },
        { level: '50', materials: { mora: 100 } },
        { level: '50A', materials: { mora: 200 } },
        { level: '60', materials: { mora: 300 } },
      ]
      const result = getLevelRangeDiff(arrayData, '1', '60')
      expect(result).toEqual([
        { level: '50', materials: { mora: 100 } },
        { level: '50A', materials: { mora: 200 } },
        { level: '60', materials: { mora: 300 } },
      ])
    })

    it('returns range when current level is in middle', () => {
      const arrayData = [
        { level: '1', materials: {} },
        { level: '50', materials: { mora: 100 } },
        { level: '60', materials: { mora: 200 } },
      ]
      const result = getLevelRangeDiff(arrayData, '50', '60')
      expect(result).toEqual([
        { level: '60', materials: { mora: 200 } },
      ])
    })

    it('returns empty when target level not found', () => {
      const arrayData = [{ level: '1' }, { level: '50' }]
      const result = getLevelRangeDiff(arrayData, '1', '999')
      expect(result).toEqual([])
    })

    it('returns empty when current level not found', () => {
      const arrayData = [{ level: '1' }, { level: '50' }]
      const result = getLevelRangeDiff(arrayData, '999', '50')
      expect(result).toEqual([])
    })

    it('handles ascending levels correctly', () => {
      const arrayData = [
        { level: '1' },
        { level: '50' },
        { level: '50A' },
        { level: '60' },
      ]
      const result = getLevelRangeDiff(arrayData, '50', '60')
      expect(result.length).toBe(2)
      expect(result[0].level).toBe('50A')
      expect(result[1].level).toBe('60')
    })
  })

  describe('isTieredMaterialType', () => {
    it('returns true for tiered material types', () => {
      mockGameInventoryItem.tiered_materials_per_type = {
        weapon_primary: { iron_sword: {} },
        character_primary: { iron_ore: {} },
      }

      expect(isTieredMaterialType('weapon_primary')).toBe(true)
      expect(isTieredMaterialType('character_primary')).toBe(true)
    })

    it('returns false for non-tiered material types', () => {
      mockGameInventoryItem.tiered_materials_per_type = {
        weapon_primary: {},
      }

      expect(isTieredMaterialType('mora')).toBe(false)
      expect(isTieredMaterialType('exp')).toBe(false)
    })

    it('returns false for empty tiered_materials_per_type', () => {
      mockGameInventoryItem.tiered_materials_per_type = {}

      expect(isTieredMaterialType('any_material')).toBe(false)
    })
  })

  describe('getMaterialsFromLevelListStatList', () => {
    beforeEach(() => {
      mockGameCharacters.characters = {}
    })

    it('returns empty object when statsToFarm is empty', () => {
      const result = getMaterialsFromLevelListStatList('testChar', {}, {})
      expect(result).toEqual({})
    })

    it('accumulates mora and exp materials', () => {
      const statsToFarm = {
        charLevel: [
          { level: '50', materials: { mora: 100, char_exp: 500 } },
          { level: '60', materials: { mora: 200, char_exp: 1000 } },
        ],
      }

      const result = getMaterialsFromLevelListStatList('testChar', statsToFarm, {})

      expect(result).toEqual({
        mora: 300,
        char_exp: 1500,
      })
    })

    it('uses gameDataList for material name lookup', () => {
      const statsToFarm = {
        weaponLevel: [
          { level: '50', materials: { weapon_primary: { tier1: 5 } } },
        ],
      }
      const gameDataList = {
        testWeapon: { weapon_primary: 'iron_sword' },
      }
      mockGameInventoryItem.tiered_materials_per_type = {
        weapon_primary: {
          iron_sword: {
            tier1: { name: 'iron_sword_t1' },
          },
        },
      }

      const result = getMaterialsFromLevelListStatList('testWeapon', statsToFarm, gameDataList)

      expect(result).toEqual({
        iron_sword_t1: 5,
      })
    })

    it('handles non-tiered materials with material name lookup', () => {
      const statsToFarm = {
        charLevel: [
          { level: '50', materials: { character_primary: 10 } },
        ],
      }
      const gameDataList = {
        testChar: { character_primary: 'iron_ore' },
      }

      const result = getMaterialsFromLevelListStatList('testChar', statsToFarm, gameDataList)

      expect(result).toEqual({
        iron_ore: 10,
      })
    })

    it('skips materials without material name', () => {
      const statsToFarm = {
        charLevel: [
          { level: '50', materials: { unknown_material: 10 } },
        ],
      }
      const gameDataList = {
        testChar: {},
      }

      const result = getMaterialsFromLevelListStatList('testChar', statsToFarm, gameDataList)

      expect(result).toEqual({})
    })

    it('defaults to empty object when gameDataList not provided', () => {
      const statsToFarm = {
        charLevel: [{ level: '50', materials: { mora: 100 } }],
      }

      const result = getMaterialsFromLevelListStatList('testChar', statsToFarm)

      expect(result).toEqual({ mora: 100 })
    })

    it('handles shell_credit as special material type', () => {
      const statsToFarm = {
        charLevel: [
          { level: '50', materials: { shell_credit: 500 } },
        ],
      }

      const result = getMaterialsFromLevelListStatList('testChar', statsToFarm, {})

      expect(result).toEqual({ shell_credit: 500 })
    })
  })
})
