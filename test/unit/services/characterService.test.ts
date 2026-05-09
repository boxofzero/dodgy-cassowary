import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockPlannedCharacters = vi.hoisted(() => ({ current: {} as Record<string, any> }))
const mockGetCharactersFn = vi.hoisted(() => vi.fn())
const mockGetLevelRangeDiff = vi.hoisted(() => vi.fn(() => []))
const mockGetMaterialsFromLevelListStatList = vi.hoisted(() => vi.fn(() => ({})))

vi.mock('@/stores/plannedCharacterStore', () => ({
  usePlannedCharacterStore: vi.fn(() => ({
    init: vi.fn(),
    plannedCharacters: mockPlannedCharacters.current,
    getCharacters: mockGetCharactersFn,
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

vi.mock('@/data/game/gameCharacter', () => ({
  charLevellingMaterialsCount: vi.fn(() => []),
  passiveSkills: ['passive_skill_1'],
  passiveSkillLevellingMaterialsCount: { passive_skill_1: {} },
  activeSkills: ['basic_attack', 'resonance_skill'],
  activeSkillLevellingMaterialsCount: {},
}))

import { getCharacterNeededMaterials, getAllCharactersNeededMaterials, getCharactersNeededMaterials } from '@/services/characterService'

describe('characterService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPlannedCharacters.current = {}
    mockGetLevelRangeDiff.mockReturnValue([])
    mockGetMaterialsFromLevelListStatList.mockReturnValue({})
  })

  describe('getCharacterNeededMaterials', () => {
    it('returns empty object when character not found', () => {
      const result = getCharacterNeededMaterials('nonexistent')
      expect(result).toEqual({})
    })

    it('calls getLevelRangeDiff with correct args', () => {
      mockPlannedCharacters.current['testChar'] = {
        char_current_level: '1',
        char_target_level: '50',
      }

      getCharacterNeededMaterials('testChar')

      expect(mockGetLevelRangeDiff).toHaveBeenCalledWith(
        expect.anything(), '1', '50'
      )
    })

    it('returns materials from getMaterialsFromLevelListStatList', () => {
      mockPlannedCharacters.current['testChar'] = {
        char_current_level: '1',
        char_target_level: '50',
      }
      mockGetMaterialsFromLevelListStatList.mockReturnValue({ mora: 100 })

      const result = getCharacterNeededMaterials('testChar')

      expect(result).toEqual({ mora: 100 })
    })

    it('uses default level 1 when not set', () => {
      mockPlannedCharacters.current['testChar'] = {}

      getCharacterNeededMaterials('testChar')

      expect(mockGetLevelRangeDiff).toHaveBeenCalledWith(
        expect.anything(), '1', '1'
      )
    })
  })

  describe('getAllCharactersNeededMaterials', () => {
    it('returns empty object when no characters', () => {
      const result = getAllCharactersNeededMaterials()
      expect(result).toEqual({})
    })

    it('returns empty object when null', () => {
      mockPlannedCharacters.current = null as any
      const result = getAllCharactersNeededMaterials()
      expect(result).toEqual({})
    })
  })

  describe('getCharactersNeededMaterials', () => {
    it('returns empty object when no match', () => {
      mockGetCharactersFn.mockReturnValue({})
      const result = getCharactersNeededMaterials(['nonexistent'])
      expect(result).toEqual({})
    })

    it('returns empty object when null', () => {
      mockGetCharactersFn.mockReturnValue(null)
      const result = getCharactersNeededMaterials(['char1'])
      expect(result).toEqual({})
    })

    it('combines materials from multiple characters', () => {
      mockGetCharactersFn.mockReturnValue({
        char1: {},
        char2: {},
      })
      mockPlannedCharacters.current = {
        char1: {},
        char2: {},
      }
      mockGetMaterialsFromLevelListStatList
        .mockReturnValueOnce({ mora: 100 })
        .mockReturnValueOnce({ mora: 100 })

      const result = getCharactersNeededMaterials(['char1', 'char2'])

      expect(result).toEqual({ mora: 200 })
    })
  })
})
