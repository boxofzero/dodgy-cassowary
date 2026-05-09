// @ts-nocheck - Services have complex runtime logic requiring pragmatic typing
import { usePlannedWeaponStore } from '@/stores/plannedWeaponStore'
import { useInventoryItemStore } from '@/stores/inventoryItemStore'
import { getLevelRangeDiff, getMaterialsFromLevelListStatList } from '@/services/planner/utilities'
import * as gameWeapons from '~/data/game/gameWeapon'

export const getWeaponNeededMaterials = (weaponName: string): any => {
  usePlannedWeaponStore().init()
  useInventoryItemStore().init()

  const plannedWeapons = usePlannedWeaponStore().plannedWeapons as any
  const plannedWeapon = plannedWeapons[weaponName]
  if (!plannedWeapon) return {}

  const currentLevel = plannedWeapon.weap_current_level ?? '1'
  const targetLevel = plannedWeapon.weap_target_level ?? '1'

  const weapons = gameWeapons.weapons as any
  const weaponRarity = weapons[weaponName]?.rarity

  const levelsToFarm = {
    weaponLevel: getLevelRangeDiff(
      (gameWeapons.weaponLevellingMaterialsCount as any)[weaponRarity] || [],
      currentLevel,
      targetLevel
    ),
  }

  const materialsNeeded = getMaterialsFromLevelListStatList(
    weaponName,
    levelsToFarm,
    gameWeapons.weapons
  )

  return materialsNeeded
}

export const getAllWeaponsNeededMaterials = (): any => {
  usePlannedWeaponStore().init()
  const weapons = usePlannedWeaponStore().plannedWeapons as any
  if (!weapons) return {}
  const keys = Object.keys(weapons)
  if (!keys.length) return {}
  return getWeaponsNeededMaterials(keys)
}

export const getWeaponsNeededMaterials = (weaponNames: string[]): any => {
  usePlannedWeaponStore().init()
  const weapons = usePlannedWeaponStore().getWeapons(weaponNames) as any
  if (!weapons) return {}

  const combinedNeededMaterials: any = {}
  for (const weaponName in weapons) {
    const weaponMaterials = getWeaponNeededMaterials(weaponName)
    for (const materialType in weaponMaterials) {
      if (combinedNeededMaterials[materialType] === undefined) {
        combinedNeededMaterials[materialType] = weaponMaterials[materialType]
      } else {
        combinedNeededMaterials[materialType] += weaponMaterials[materialType]
      }
    }
  }

  return combinedNeededMaterials
}