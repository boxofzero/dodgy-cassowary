import { usePlannedCharacterStore } from '@/stores/plannedCharacterStore'
import { usePlannedWeaponStore } from '@/stores/plannedWeaponStore'
import { useInventoryItemStore } from '@/stores/inventoryItemStore'
import { useNoteStore } from '@/stores/noteStore'
import { useAccordionStore } from '@/stores/accordionStore'

import * as gameInventoryItem from '@/data/game/inventoryItem/gameInventoryItem'
import * as datetimeHelper from '@/libraries/datetimeHelper'

interface LoadedMaterial {
  needed: number
  owned: number
}

export const setWeaponDone = (weapon: any, loadedMaterials: Record<string, LoadedMaterial>) => {
  usePlannedWeaponStore().init()
  useInventoryItemStore().init()
  usePlannedWeaponStore().setDone(weapon.name)
  setInventoryItemDone(loadedMaterials)
}

export const setCharacterDone = (character: any, loadedMaterials: Record<string, LoadedMaterial>) => {
  usePlannedCharacterStore().init()
  useInventoryItemStore().init()
  usePlannedCharacterStore().setDone(character.name)
  setInventoryItemDone(loadedMaterials)
}

const setInventoryItemDone = (loadedMaterials: Record<string, LoadedMaterial>) => {
  Object.entries(loadedMaterials).forEach(([material, materialData]) => {
    if (Object.keys(gameInventoryItem.synthesizable_materials).includes(material)) {
      useInventoryItemStore().decreaseTieredMaterial(material, (materialData as any).needed)
    } else {
      let updatedValue = (materialData as any).owned - (materialData as any).needed
      if (updatedValue < 0) {
        updatedValue = 0
      }
      useInventoryItemStore().updateInventory(material, updatedValue)
    }
  })
}

export const downloadData = () => {
  usePlannedCharacterStore().init()
  useInventoryItemStore().init()
  usePlannedWeaponStore().init()

  const data: Record<string, any> = {}
  data['plannedCharacters'] = usePlannedCharacterStore().plannedCharacters
  data['plannedWeapons'] = usePlannedWeaponStore().plannedWeapons
  data['inventoryItems'] = useInventoryItemStore().inventoryItems
  data['notes'] = useNoteStore().notes
  data['accordions'] = useAccordionStore().accordions

  const text = JSON.stringify(data)
  const timestamp = datetimeHelper.generateTimestamp(new Date())
  const filename = 'cassowary_planner_data_' + timestamp + '.json'
  const element = document.createElement('a')
  element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text))
  element.setAttribute('download', filename)

  element.style.display = 'none'
  document.body.appendChild(element)

  element.click()
  document.body.removeChild(element)
}

export const uploadData = (uploadedData: Record<string, any>) => {
  usePlannedCharacterStore().init()
  useInventoryItemStore().init()
  usePlannedWeaponStore().init()
  useNoteStore().init()
  useAccordionStore().init()

  const success: string[] = []
  if (uploadedData['plannedCharacters'] !== undefined) {
    usePlannedCharacterStore().restoreData(uploadedData['plannedCharacters'])
    success.push('plannedCharacters')
  }

  if (uploadedData['plannedWeapons'] !== undefined) {
    usePlannedWeaponStore().restoreData(uploadedData['plannedWeapons'])
    success.push('plannedWeapons')
  }

  if (uploadedData['inventoryItems'] !== undefined) {
    useInventoryItemStore().restoreData(uploadedData['inventoryItems'])
    success.push('inventoryItems')
  }

  if (uploadedData['notes'] !== undefined) {
    useNoteStore().restoreData(uploadedData['notes'])
    success.push('notes')
  }

  if (uploadedData['accordions'] !== undefined) {
    useAccordionStore().restoreData(uploadedData['accordions'])
  }

  return success
}