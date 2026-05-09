import * as dbInventoryItem from '@/data/database/dbInventoryItem'
import { useStorage } from '@vueuse/core'
import * as gameInventoryItem from '@/data/game/inventoryItem/gameInventoryItem'

const inventoryRepo = () => {
  return useStorage('inventoryItems', dbInventoryItem.dbInventoryItems)
}

export const useInventoryItemStore = defineStore('inventoryItems', () => {
  const inventoryItems = ref({ ...dbInventoryItem.dbInventoryItems }) as any

  function init() {
    inventoryItems.value = inventoryRepo().value
  }

  function get(stuffKey: string): any {
    if (!Object.prototype.hasOwnProperty.call(inventoryItems.value, stuffKey)) {
      inventoryItems.value[stuffKey] = { count: 0 }
    }

    if (
      typeof inventoryItems.value[stuffKey] !== 'object' ||
      !Object.prototype.hasOwnProperty.call(inventoryItems.value[stuffKey], 'count')
    ) {
      inventoryItems.value[stuffKey] = { count: 0 }
    }

    return inventoryItems.value[stuffKey]
  }

  function updateInventory(stuffKey: string, value: number) {
    const getInventoryItemMaterial = get(stuffKey)
    getInventoryItemMaterial['count'] = parseInt(String(value))

    inventoryRepo().value = inventoryItems.value
  }

  function decreaseTieredMaterial(material: string, value: number) {
    if (!Object.keys(gameInventoryItem.synthesizable_materials).includes(material)) {
      return
    }
    let updatedValue = get(material).count - value
    if (updatedValue < 0) {
      updateInventory(material, 0)
      const lowerTierMaterial = (gameInventoryItem.synthesizable_materials as any)[material]?.from
      if (lowerTierMaterial !== undefined) {
        const synthesizedCost = (gameInventoryItem.synthesizable_materials as any)[lowerTierMaterial]?.cost
        decreaseTieredMaterial(lowerTierMaterial, Math.floor(synthesizedCost * updatedValue * -1))
      }
    } else {
      updateInventory(material, updatedValue)
    }
  }

  function restoreData(data: any) {
    inventoryItems.value = data
    inventoryRepo().value = inventoryItems.value
  }

  return {
    inventoryItems,
    init,
    get,
    updateInventory,
    decreaseTieredMaterial,
    restoreData,
  }
})