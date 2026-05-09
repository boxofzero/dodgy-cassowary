import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockPlannedWeapons = vi.hoisted(() => ({ current: {} as Record<string, any> }))
const mockGetWeaponsFn = vi.hoisted(() => vi.fn())
const mockGetLevelRangeDiff = vi.hoisted(() => vi.fn(() => []))
const mockGetMaterialsFromLevelListStatList = vi.hoisted(() => vi.fn(() => ({})))

vi.mock('@/stores/plannedWeaponStore', () => ({
  usePlannedWeaponStore: vi.fn(() => ({
    init: vi.fn(),
    plannedWeapons: mockPlannedWeapons.current,
    getWeapons: mockGetWeaponsFn,
  })),
}))

vi.mock('@/stores/inventoryItemStore', () => ({
  useInventoryItemStore: vi.fn(() => ({
    init: vi.fn(),
    inventoryItems: {},
  })),
}))

vi.mock('@/services/planner/utilities', () => ({
  getLevelRangeDiff: mockGetLevelRangeDiff,
  getMaterialsFromLevelListStatList: mockGetMaterialsFromLevelListStatList,
}))

vi.mock('~/data/game/gameWeapon', () => ({
  weapons: {},
  weaponLevellingMaterialsCount: {},
}))

import { getWeaponNeededMaterials, getAllWeaponsNeededMaterials, getWeaponsNeededMaterials } from '@/services/weaponService'
import * as gameWeapons from '~/data/game/gameWeapon'

describe('weaponService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPlannedWeapons.current = {}
    mockGetLevelRangeDiff.mockReturnValue([])
    mockGetMaterialsFromLevelListStatList.mockReturnValue({})
    gameWeapons.weapons = {}
    gameWeapons.weaponLevellingMaterialsCount = {}
  })

  describe('getWeaponNeededMaterials', () => {
    it('returns empty object when weapon not found', () => {
      const result = getWeaponNeededMaterials('nonexistent')
      expect(result).toEqual({})
    })

    it('calls getLevelRangeDiff with correct args', () => {
      mockPlannedWeapons.current['testWeapon'] = {
        weap_current_level: '1',
        weap_target_level: '50',
      }
      gameWeapons.weapons['testWeapon'] = { rarity: '4star' }
      gameWeapons.weaponLevellingMaterialsCount['4star'] = [{ level: '1' }, { level: '50' }]

      getWeaponNeededMaterials('testWeapon')

      expect(mockGetLevelRangeDiff).toHaveBeenCalledWith(
        expect.anything(), '1', '50'
      )
    })

    it('returns materials from getMaterialsFromLevelListStatList', () => {
      mockPlannedWeapons.current['testWeapon'] = {
        weap_current_level: '1',
        weap_target_level: '50',
      }
      gameWeapons.weapons['testWeapon'] = { rarity: '4star' }
      mockGetMaterialsFromLevelListStatList.mockReturnValue({ iron_ore: 50, mora: 100 })

      const result = getWeaponNeededMaterials('testWeapon')

      expect(result).toEqual({ iron_ore: 50, mora: 100 })
    })

    it('uses default level 1 when not set', () => {
      mockPlannedWeapons.current['testWeapon'] = {}
      gameWeapons.weapons['testWeapon'] = { rarity: '4star' }

      getWeaponNeededMaterials('testWeapon')

      expect(mockGetLevelRangeDiff).toHaveBeenCalledWith(
        expect.anything(), '1', '1'
      )
    })
  })

  describe('getAllWeaponsNeededMaterials', () => {
    it('returns empty object when no weapons', () => {
      mockPlannedWeapons.current = {}
      const result = getAllWeaponsNeededMaterials()
      expect(result).toEqual({})
    })

    it('returns combined materials for all weapons', () => {
      mockPlannedWeapons.current = {
        weap1: { name: 'weap1' },
        weap2: { name: 'weap2' },
      }
      mockGetWeaponsFn.mockReturnValue({
        weap1: { weap_current_level: '1', weap_target_level: '50' },
        weap2: { weap_current_level: '1', weap_target_level: '50' },
      })
      mockGetMaterialsFromLevelListStatList
        .mockReturnValueOnce({ iron_ore: 100 })
        .mockReturnValueOnce({ iron_ore: 100 })

      const result = getAllWeaponsNeededMaterials()

      expect(result).toEqual({ iron_ore: 200 })
    })
  })

  describe('getWeaponsNeededMaterials', () => {
    it('returns empty object when no match', () => {
      mockGetWeaponsFn.mockReturnValue({})
      const result = getWeaponsNeededMaterials(['nonexistent'])
      expect(result).toEqual({})
    })

    it('combines materials from multiple weapons', () => {
      mockPlannedWeapons.current = {
        weap1: {},
        weap2: {},
      }
      mockGetWeaponsFn.mockReturnValue({
        weap1: {},
        weap2: {},
      })
      mockGetMaterialsFromLevelListStatList
        .mockReturnValueOnce({ mora: 100 })
        .mockReturnValueOnce({ mora: 100 })

      const result = getWeaponsNeededMaterials(['weap1', 'weap2'])

      expect(result).toEqual({ mora: 200 })
    })
  })
})
