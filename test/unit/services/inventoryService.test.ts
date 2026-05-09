import { describe, expect, it, vi, beforeEach } from 'vitest'

const { mockStoreData } = vi.hoisted(() => {
  const mockStoreData = {
    init: vi.fn(),
    inventoryItems: {},
  }
  return { mockStoreData }
})

vi.mock('@/stores/inventoryItemStore', () => ({
  useInventoryItemStore: vi.fn(() => mockStoreData),
}))

vi.mock('@/services/characterService', () => ({
  getAllCharactersNeededMaterials: vi.fn(() => ({})),
}))

vi.mock('@/services/weaponService', () => ({
  getAllWeaponsNeededMaterials: vi.fn(() => ({})),
}))

vi.mock('~/data/game/inventoryItem/gameInventoryItem', () => ({
  allInventoryItems: {
    mora: { icon: '/icons/mora.png', label: 'Mora' },
    basic_energy_core: { icon: '/icons/basic_energy.png', label: 'Basic Energy Core' },
    medium_energy_core: { icon: '/icons/medium_energy.png', label: 'Medium Energy Core' },
    advanced_energy_core: { icon: '/icons/advanced_energy.png', label: 'Advanced Energy Core' },
    premium_energy_core: { icon: '/icons/premium_energy.png', label: 'Premium Energy Core' },
    basic_resonance_potion: { icon: '/icons/basic_potion.png', label: 'Basic Resonance Potion' },
    medium_resonance_potion: { icon: '/icons/medium_potion.png', label: 'Medium Resonance Potion' },
    advanced_resonance_potion: { icon: '/icons/advanced_potion.png', label: 'Advanced Resonance Potion' },
    premium_resonance_potion: { icon: '/icons/premium_potion.png', label: 'Premium Resonance Potion' },
    ore_raw: { icon: '/icons/ore_raw.png', label: 'Raw Ore' },
    ore_refined: { icon: '/icons/ore_refined.png', label: 'Refined Ore' },
    item1: { icon: '/icons/item1.png', label: 'Item 1' },
    item2: { icon: '/icons/item2.png', label: 'Item 2' },
  },
  exp_data: {
    weap_exp: {
      basic_energy_core: { exp_value: 1000 },
      medium_energy_core: { exp_value: 3000 },
      advanced_energy_core: { exp_value: 8000 },
      premium_energy_core: { exp_value: 20000 },
    },
    char_exp: {
      basic_resonance_potion: { exp_value: 1000 },
      medium_resonance_potion: { exp_value: 3000 },
      advanced_resonance_potion: { exp_value: 8000 },
      premium_resonance_potion: { exp_value: 20000 },
    },
  },
  synthesizable_materials: {
    ore_refined: { from: 'ore_raw', to: undefined, cost: 3 },
    ore_raw: { from: undefined, to: 'ore_refined', cost: undefined },
  },
  tiered_materials_per_type: {},
}))

vi.mock('@/data/database/dbInventoryItem', () => ({
  dbInventoryItems: {
    mora: { count: 0 },
    basic_energy_core: { count: 0 },
    medium_energy_core: { count: 0 },
    advanced_energy_core: { count: 0 },
    premium_energy_core: { count: 0 },
    basic_resonance_potion: { count: 0 },
    medium_resonance_potion: { count: 0 },
    advanced_resonance_potion: { count: 0 },
    premium_resonance_potion: { count: 0 },
    ore_raw: { count: 0 },
    ore_refined: { count: 0 },
    item1: { count: 0 },
    item2: { count: 0 },
  },
}))

vi.mock('@/libraries/objectHelper', () => ({
  mergeWithSum: vi.fn((a, b) => {
    const result = { ...a }
    for (const key in b) {
      result[key] = (result[key] || 0) + b[key]
    }
    return result
  }),
}))

import { getOwnedNeededMaterialsResponseData, getAllMaterialsResponseData } from '@/services/inventoryService'

describe('inventoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStoreData.inventoryItems = {}
  })

  describe('getOwnedNeededMaterialsResponseData', () => {
    it('returns empty object when no inventory items', () => {
      mockStoreData.inventoryItems = null
      const result = getOwnedNeededMaterialsResponseData({ mora: 100 })
      expect(result).toEqual({})
    })

    it('returns empty object when inventory items length is 0', () => {
      mockStoreData.inventoryItems = []
      const result = getOwnedNeededMaterialsResponseData({ mora: 100 })
      expect(result).toEqual({})
    })

    it('returns material with owned, needed, missing for regular materials', () => {
      mockStoreData.inventoryItems = {
        mora: { count: 50 },
      }

      const result = getOwnedNeededMaterialsResponseData({ mora: 100 })

      expect(result.mora).toMatchObject({
        owned: 50,
        needed: 100,
        missing: 50,
      })
    })

    it('calculates missing as 0 when owned >= needed', () => {
      mockStoreData.inventoryItems = {
        mora: { count: 150 },
      }

      const result = getOwnedNeededMaterialsResponseData({ mora: 100 })

      expect(result.mora.missing).toBe(0)
    })

    it('generates exp data for weap_exp', () => {
      const result = getOwnedNeededMaterialsResponseData({ weap_exp: 250 })

      expect(result.basic_energy_core).toBeDefined()
    })

    it('generates exp data for char_exp', () => {
      const result = getOwnedNeededMaterialsResponseData({ char_exp: 100 })

      expect(result.basic_resonance_potion).toBeDefined()
    })

    it('handles synthesizable materials with from chain', () => {
      const result = getOwnedNeededMaterialsResponseData({ ore_refined: 10 })

      expect(result.ore_refined).toBeDefined()
      expect(result.ore_raw).toBeDefined()
    })
  })

  describe('getAllMaterialsResponseData', () => {
    it('returns empty object when no inventory items', () => {
      mockStoreData.inventoryItems = null
      const result = getAllMaterialsResponseData()
      expect(result).toEqual({})
    })

    it('returns all inventory items with owned data when no materials needed', () => {
      mockStoreData.inventoryItems = {
        item1: { count: 10 },
        item2: { count: 20 },
      }

      const result = getAllMaterialsResponseData()

      expect(result.item1.owned).toBe(10)
      expect(result.item1.needed).toBe(0)
      expect(result.item1.missing).toBe(0)
    })
  })
})
