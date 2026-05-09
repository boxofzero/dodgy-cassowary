// @ts-nocheck - Services have complex runtime logic requiring pragmatic typing
import { useInventoryItemStore } from '@/stores/inventoryItemStore'
import * as gameInventoryItem from '~/data/game/inventoryItem/gameInventoryItem'
import * as characterService from '@/services/characterService'
import * as weaponService from '@/services/weaponService'
import * as dbInventoryItem from '@/data/database/dbInventoryItem'
import * as objectHelper from '@/libraries/objectHelper'

interface ExpMaterialData {
  owned: number
  needed: number
  missing: number
  icon: string
  label: string
  synthesized?: number
  key?: string
}

const generateExpData = (
  expNeeded: number,
  ownedMaterials: any,
  expMaterialTypeStructure: any
): any => {
  const data: any = {}
  let expNeededCounting = expNeeded
  let expLeftover = 0
  const expDataSortedDesc = Object.entries(expMaterialTypeStructure).sort(
    (a: any, b: any) => b[1].exp_value - a[1].exp_value
  )

  for (const expData of expDataSortedDesc as any[]) {
    const expDataNeeded = Math.floor(expNeededCounting / expData[1].exp_value)
    expLeftover = expNeededCounting % expData[1].exp_value
    const owned = ownedMaterials[expData[0]]?.count || 0
    const needed = expDataNeeded || 0
    const missing = Math.max(needed - owned, 0)
    data[expData[0]] = {
      owned,
      needed,
      missing,
      icon: gameInventoryItem.allInventoryItems[expData[0]]?.icon,
      label: gameInventoryItem.allInventoryItems[expData[0]]?.label,
    }
    expNeededCounting = expLeftover
  }

  return data
}

export const getOwnedNeededMaterialsResponseData = (neededMaterials: any): any => {
  const responseData: any = {}
  useInventoryItemStore().init()
  const ownedMaterials = useInventoryItemStore().inventoryItems as any
  if (!ownedMaterials || ownedMaterials.length == 0) {
    return {}
  }

  for (const materialType in neededMaterials) {
    if (['weap_exp', 'char_exp'].includes(materialType)) {
      const exp = generateExpData(
        neededMaterials[materialType],
        ownedMaterials,
        (gameInventoryItem.exp_data as any)[materialType]
      )
      Object.assign(responseData, exp)
      continue
    }

    if (Object.keys(gameInventoryItem.synthesizable_materials).includes(materialType)) {
      let iterateMaterialType: string | null = materialType
      while (iterateMaterialType) {
        if (neededMaterials[iterateMaterialType] === undefined) {
          responseData[iterateMaterialType] = {
            owned: ownedMaterials[iterateMaterialType]?.count || 0,
            needed: neededMaterials[iterateMaterialType] || 0,
            missing: 0,
            icon: gameInventoryItem.allInventoryItems[iterateMaterialType]?.icon,
            label: gameInventoryItem.allInventoryItems[iterateMaterialType]?.label,
          }
        }
        iterateMaterialType = (gameInventoryItem.synthesizable_materials as any)[iterateMaterialType]?.from || null
      }
    }

    const owned = ownedMaterials[materialType]?.count || 0
    const needed = neededMaterials[materialType] || 0
    const missing = Math.max(needed - owned, 0)
    responseData[materialType] = {
      owned,
      needed,
      missing,
      icon: gameInventoryItem.allInventoryItems[materialType]?.icon,
      label: gameInventoryItem.allInventoryItems[materialType]?.label,
    }
  }

  const allInventoryItems = dbInventoryItem.dbInventoryItems
  const responseDataSorted: any = {}
  const synthesizedList: any = {}
  for (const materialType in allInventoryItems) {
    if (responseData[materialType] === undefined) {
      continue
    }
    responseDataSorted[materialType] = responseData[materialType]
    responseDataSorted[materialType].key =
      materialType + '_' + (responseDataSorted[materialType].owned || 0) + '_' + (responseDataSorted[materialType].needed || 0)

    if (!Object.keys(gameInventoryItem.synthesizable_materials).includes(materialType)) {
      continue
    }

    const diff = responseData[materialType].owned - responseData[materialType].needed
    const synthesizableData: any = (gameInventoryItem.synthesizable_materials as any)[materialType]
    if (synthesizableData?.to) {
      const syntesizedMaterial = synthesizedList[materialType] || 0
      synthesizedList[synthesizableData.to] = Math.floor((syntesizedMaterial + diff) / (synthesizableData.cost || 1))
      if (synthesizedList[synthesizableData.to] < 0) {
        synthesizedList[synthesizableData.to] = 0
      }
    }

    responseDataSorted[materialType].synthesized = synthesizedList[materialType] || 0

    if (synthesizableData?.to && responseData[synthesizableData.to]) {
      continue
    }

    let highestTierNeededRecheckedMaterial: string | null = null

    let recheckedMaterial: string | null = materialType
    while (recheckedMaterial) {
      const synData: any = (gameInventoryItem.synthesizable_materials as any)[recheckedMaterial]
      const upperTierRecheckedMaterial = synData?.to || null
      const lowerTierRecheckedMaterial = synData?.from || null

      if (!lowerTierRecheckedMaterial) {
        break
      }

      if (
        !highestTierNeededRecheckedMaterial &&
        (!responseDataSorted[upperTierRecheckedMaterial!] ||
          responseDataSorted[upperTierRecheckedMaterial!].needed <= 0)
      ) {
        highestTierNeededRecheckedMaterial = recheckedMaterial
        responseDataSorted[recheckedMaterial].synthesized = Math.min(
          responseDataSorted[recheckedMaterial].synthesized || 0,
          responseDataSorted[recheckedMaterial].needed - responseDataSorted[recheckedMaterial].owned
        )
        if (responseDataSorted[recheckedMaterial].synthesized! < 0) {
          responseDataSorted[recheckedMaterial].synthesized = 0
        }
      } else if (upperTierRecheckedMaterial) {
        const synCost = synData?.cost || 1
        const synthesizedNeededForHigherTier = Math.floor(
          (responseDataSorted[upperTierRecheckedMaterial]?.synthesized || 0) * synCost
        )

        const calibrateSyntesizedNeed =
          responseDataSorted[recheckedMaterial].needed +
          synthesizedNeededForHigherTier -
          responseDataSorted[recheckedMaterial].owned

        if (calibrateSyntesizedNeed < 0) {
          responseDataSorted[recheckedMaterial].synthesized = 0
        } else {
          const currentSynth = responseDataSorted[recheckedMaterial].synthesized || 0
          if (currentSynth >= calibrateSyntesizedNeed) {
            responseDataSorted[recheckedMaterial].synthesized = calibrateSyntesizedNeed
          }
        }

        if ((responseDataSorted[recheckedMaterial].synthesized || 0) < 0) {
          responseDataSorted[recheckedMaterial].synthesized = 0
        }
      }

      responseDataSorted[recheckedMaterial].missing = Math.max(
        responseDataSorted[recheckedMaterial].needed -
          (responseDataSorted[recheckedMaterial].owned + (responseDataSorted[recheckedMaterial].synthesized || 0)),
        0
      )

      recheckedMaterial = lowerTierRecheckedMaterial
    }
  }

  return responseDataSorted
}

export const getAllMaterialsResponseData = (): any => {
  const characterMaterials = characterService.getAllCharactersNeededMaterials()
  const weaponMaterials = weaponService.getAllWeaponsNeededMaterials()
  const combinedMaterials = objectHelper.mergeWithSum(weaponMaterials, characterMaterials)

  const ownedNeededMaterialsData = getOwnedNeededMaterialsResponseData(combinedMaterials)

  useInventoryItemStore().init()
  const ownedMaterials = useInventoryItemStore().inventoryItems as any
  if (!ownedMaterials || ownedMaterials.length == 0) {
    return {}
  }

  const allInventoryItems = dbInventoryItem.dbInventoryItems
  const responseData: any = {}
  for (const materialType in allInventoryItems) {
    if (ownedNeededMaterialsData[materialType]) {
      responseData[materialType] = ownedNeededMaterialsData[materialType]
      continue
    }

    responseData[materialType] = {
      owned: ownedMaterials[materialType]?.count || 0,
      needed: 0,
      missing: 0,
      icon: gameInventoryItem.allInventoryItems[materialType]?.icon,
      label: gameInventoryItem.allInventoryItems[materialType]?.label,
    }
  }

  return responseData
}