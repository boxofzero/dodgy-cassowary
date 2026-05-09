import * as gameInventoryItem from '~/data/game/inventoryItem/gameInventoryItem'
import * as gameCharacters from '~/data/game/gameCharacter'

export const getLevelRangeDiff = (
  arrayData: any[],
  currentLevel: string,
  targetLevel: string
): any[] => {
  const currentLevelIndex = arrayData.findIndex((arr: any) => arr.level == currentLevel)
  const targetLevelIndex = arrayData.findIndex((arr: any) => arr.level == targetLevel)

  return arrayData
    .slice(0, targetLevelIndex + 1)
    .filter((item: any) => !arrayData.slice(0, currentLevelIndex).includes(item))
    .slice(1)
}

export const isTieredMaterialType = (material: string): boolean => {
  return Object.keys(gameInventoryItem.tiered_materials_per_type).includes(material)
}

export const getMaterialsFromLevelListStatList = (
  name: string,
  statsToFarm: any,
  gameDataList: any = gameCharacters.characters
): Record<string, number> => {
  const materials: Record<string, number> = {}

  for (const stat in statsToFarm) {
    for (const level of statsToFarm[stat]) {
      for (const materialType in level.materials) {
        if (['weap_exp', 'char_exp', 'shell_credit', 'mora'].includes(materialType)) {
          materials[materialType] =
            (materials[materialType] ?? 0) +
            (level.materials?.[materialType] ?? 0)
          continue
        }

        const materialName = gameDataList[name]?.[materialType]
        if (isTieredMaterialType(materialType)) {
          const tierData: any = gameInventoryItem.tiered_materials_per_type
          for (const tier in level.materials[materialType]) {
            const tieredMaterialName =
              tierData[materialType]?.[materialName]?.[tier]?.name
            if (tieredMaterialName) {
              materials[tieredMaterialName] =
                (materials[tieredMaterialName] ?? 0) +
                (level.materials?.[materialType]?.[tier] ?? 0)
            }
          }
          continue
        }

        if (materialName) {
          materials[materialName] =
            (materials[materialName] ?? 0) +
            (level.materials?.[materialType] ?? 0)
        }
      }
    }
  }

  return materials
}