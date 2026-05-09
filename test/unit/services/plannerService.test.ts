import { describe, expect, it, vi, beforeEach } from 'vitest'

const { mockCharStoreData, mockPlannedCharacterStore } = vi.hoisted(() => {
  const mockCharStoreData = {
    init: vi.fn(),
    setDone: vi.fn(),
    plannedCharacters: {} as Record<string, any>,
    restoreData: vi.fn(),
  }
  return {
    mockCharStoreData,
    mockPlannedCharacterStore: vi.fn(() => mockCharStoreData),
  }
})

const { mockWeaponStoreData, mockPlannedWeaponStore } = vi.hoisted(() => {
  const mockWeaponStoreData = {
    init: vi.fn(),
    setDone: vi.fn(),
    plannedWeapons: {} as Record<string, any>,
    restoreData: vi.fn(),
  }
  return {
    mockWeaponStoreData,
    mockPlannedWeaponStore: vi.fn(() => mockWeaponStoreData),
  }
})

const { mockInvStoreData, mockInventoryStore } = vi.hoisted(() => {
  const mockInvStoreData = {
    init: vi.fn(),
    inventoryItems: {} as Record<string, any>,
    decreaseTieredMaterial: vi.fn(),
    updateInventory: vi.fn(),
    restoreData: vi.fn(),
  }
  return {
    mockInventoryStore: vi.fn(() => mockInvStoreData),
    mockInvStoreData,
  }
})

const { mockNoteStoreData, mockNoteStore } = vi.hoisted(() => {
  const mockNoteStoreData = {
    init: vi.fn(),
    notes: {} as Record<string, any>,
    restoreData: vi.fn(),
  }
  return {
    mockNoteStore: vi.fn(() => mockNoteStoreData),
    mockNoteStoreData,
  }
})

const { mockAccordionStoreData, mockAccordionStore } = vi.hoisted(() => {
  const mockAccordionStoreData = {
    init: vi.fn(),
    accordions: {} as Record<string, any>,
    restoreData: vi.fn(),
  }
  return {
    mockAccordionStore: vi.fn(() => mockAccordionStoreData),
    mockAccordionStoreData,
  }
})

const mockGameInventoryItem = vi.hoisted(() => ({
  synthesizable_materials: {} as Record<string, any>,
}))

const mockDatetimeHelper = vi.hoisted(() => ({
  generateTimestamp: vi.fn(() => '2026-05-07T00:00:00'),
}))

const { mockDocument, mockElement } = vi.hoisted(() => {
  const mockElement = {
    setAttribute: vi.fn(),
    style: { display: '' },
    click: vi.fn(),
  }
  return {
    mockElement: mockElement as any,
    mockDocument: {
      createElement: vi.fn(() => mockElement),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
    } as any,
  }
})

vi.mock('@/stores/plannedCharacterStore', () => ({
  usePlannedCharacterStore: mockPlannedCharacterStore,
}))

vi.mock('@/stores/plannedWeaponStore', () => ({
  usePlannedWeaponStore: mockPlannedWeaponStore,
}))

vi.mock('@/stores/inventoryItemStore', () => ({
  useInventoryItemStore: mockInventoryStore,
}))

vi.mock('@/stores/noteStore', () => ({
  useNoteStore: mockNoteStore,
}))

vi.mock('@/stores/accordionStore', () => ({
  useAccordionStore: mockAccordionStore,
}))

vi.mock('@/data/game/inventoryItem/gameInventoryItem', () => ({
  get synthesizable_materials() { return mockGameInventoryItem.synthesizable_materials },
}))

vi.mock('@/libraries/datetimeHelper', () => ({
  generateTimestamp: mockDatetimeHelper.generateTimestamp,
}))

Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
})

import { setWeaponDone, setCharacterDone, downloadData, uploadData } from '@/services/plannerService'

describe('plannerService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCharStoreData.plannedCharacters = {}
    mockWeaponStoreData.plannedWeapons = {}
    mockInvStoreData.inventoryItems = {}
  })

  describe('setWeaponDone', () => {
    it('calls init on stores', () => {
      const weapon = { name: 'testWeapon' }
      setWeaponDone(weapon, {})

      expect(mockWeaponStoreData.init).toHaveBeenCalled()
      expect(mockInvStoreData.init).toHaveBeenCalled()
    })

    it('calls setDone on plannedWeaponStore with weapon name', () => {
      const weapon = { name: 'testWeapon' }
      setWeaponDone(weapon, {})

      expect(mockWeaponStoreData.setDone).toHaveBeenCalledWith('testWeapon')
    })

    it('calls setInventoryItemDone with loaded materials', () => {
      const weapon = { name: 'testWeapon' }
      const loadedMaterials = {
        mora: { needed: 100, owned: 50 },
      }

      setWeaponDone(weapon, loadedMaterials)

      expect(mockInvStoreData.updateInventory).toHaveBeenCalledWith('mora', expect.any(Number))
    })

    it('uses decreaseTieredMaterial for synthesizable materials', () => {
      mockGameInventoryItem.synthesizable_materials = { refined_ore: { from: 'raw_ore' } }
      const weapon = { name: 'testWeapon' }
      const loadedMaterials = {
        refined_ore: { needed: 10, owned: 5 },
      }

      setWeaponDone(weapon, loadedMaterials)

      expect(mockInvStoreData.decreaseTieredMaterial).toHaveBeenCalledWith('refined_ore', 10)
    })
  })

  describe('setCharacterDone', () => {
    it('calls init on stores', () => {
      const character = { name: 'testChar' }
      setCharacterDone(character, {})

      expect(mockCharStoreData.init).toHaveBeenCalled()
      expect(mockInvStoreData.init).toHaveBeenCalled()
    })

    it('calls setDone on plannedCharacterStore with character name', () => {
      const character = { name: 'testChar' }
      setCharacterDone(character, {})

      expect(mockCharStoreData.setDone).toHaveBeenCalledWith('testChar')
    })

    it('calls setInventoryItemDone with loaded materials', () => {
      const character = { name: 'testChar' }
      const loadedMaterials = {
        mora: { needed: 100, owned: 50 },
      }

      setCharacterDone(character, loadedMaterials)

      expect(mockInvStoreData.updateInventory).toHaveBeenCalledWith('mora', expect.any(Number))
    })
  })

  describe('downloadData', () => {
    it('calls init on data stores', () => {
      downloadData()

      expect(mockCharStoreData.init).toHaveBeenCalled()
      expect(mockInvStoreData.init).toHaveBeenCalled()
      expect(mockWeaponStoreData.init).toHaveBeenCalled()
    })

    it('creates download link with correct data', () => {
      mockCharStoreData.plannedCharacters = { char1: { name: 'Char1' } }
      mockWeaponStoreData.plannedWeapons = { weap1: { name: 'Weap1' } }
      mockInvStoreData.inventoryItems = { mora: { count: 100 } }
      mockNoteStoreData.notes = { note1: 'hello' }
      mockAccordionStoreData.accordions = { group1: { open: true } }

      downloadData()

      expect(mockDocument.createElement).toHaveBeenCalledWith('a')
      expect(mockElement.setAttribute).toHaveBeenCalledWith(
        'download',
        'dodgy-cassowary_planner_data_2026-05-07T00:00:00.json'
      )
      expect(mockElement.click).toHaveBeenCalled()
    })

    it('generates timestamp for filename', () => {
      downloadData()

      expect(mockDatetimeHelper.generateTimestamp).toHaveBeenCalled()
    })
  })

  describe('uploadData', () => {
    it('calls init on all stores', () => {
      uploadData({})

      expect(mockCharStoreData.init).toHaveBeenCalled()
      expect(mockInvStoreData.init).toHaveBeenCalled()
      expect(mockWeaponStoreData.init).toHaveBeenCalled()
      expect(mockNoteStoreData.init).toHaveBeenCalled()
      expect(mockAccordionStoreData.init).toHaveBeenCalled()
    })

    it('restores plannedCharacters when provided', () => {
      uploadData({ plannedCharacters: { char1: { name: 'Char1' } } })

      expect(mockCharStoreData.restoreData).toHaveBeenCalledWith({ char1: { name: 'Char1' } })
    })

    it('restores plannedWeapons when provided', () => {
      uploadData({ plannedWeapons: { weap1: { name: 'Weap1' } } })

      expect(mockWeaponStoreData.restoreData).toHaveBeenCalledWith({ weap1: { name: 'Weap1' } })
    })

    it('restores inventoryItems when provided', () => {
      uploadData({ inventoryItems: { mora: { count: 100 } } })

      expect(mockInvStoreData.restoreData).toHaveBeenCalledWith({ mora: { count: 100 } })
    })

    it('restores notes when provided', () => {
      uploadData({ notes: { note1: 'hello' } })

      expect(mockNoteStoreData.restoreData).toHaveBeenCalledWith({ note1: 'hello' })
    })

    it('restores accordions when provided', () => {
      uploadData({ accordions: { group1: { open: true } } })

      expect(mockAccordionStoreData.restoreData).toHaveBeenCalledWith({ group1: { open: true } })
    })

    it('returns array of successfully restored keys', () => {
      const result = uploadData({
        plannedCharacters: {},
        plannedWeapons: {},
        inventoryItems: {},
        notes: {},
      })

      expect(result).toEqual(['plannedCharacters', 'plannedWeapons', 'inventoryItems', 'notes'])
    })

    it('skips undefined keys', () => {
      const result = uploadData({ plannedCharacters: undefined })

      expect(result).toEqual([])
    })
  })
})
