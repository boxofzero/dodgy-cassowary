// @ts-nocheck - Services have complex runtime logic requiring pragmatic typing
import { usePlannedCharacterStore } from '@/stores/plannedCharacterStore'
import { useInventoryItemStore } from '@/stores/inventoryItemStore'
import { getLevelRangeDiff, getMaterialsFromLevelListStatList } from '@/services/planner/utilities'
import * as gameCharacters from '@/data/game/gameCharacter'

export const getCharacterNeededMaterials = (characterName: string): any => {
  usePlannedCharacterStore().init()
  useInventoryItemStore().init()

  const plannedCharacters = usePlannedCharacterStore().plannedCharacters as any
  const plannedCharacter = plannedCharacters[characterName]
  if (!plannedCharacter) return {}

  const currentLevel = plannedCharacter.char_current_level ?? '1'
  const targetLevel = plannedCharacter.char_target_level ?? '1'

  const levelsToFarm = {
    charLevel: getLevelRangeDiff(
      gameCharacters.charLevellingMaterialsCount(characterName),
      currentLevel,
      targetLevel
    ),
  }

  const activeSkillsToFarm = getActiveSkillsToFarm(plannedCharacter)
  const passiveSkillsToFarm = getPassiveSkillsToFarm(plannedCharacter)

  const materialsNeeded = getMaterialsFromLevelListStatList(characterName, {
    ...levelsToFarm,
    ...activeSkillsToFarm,
    ...passiveSkillsToFarm,
  })

  return materialsNeeded
}

const getPassiveSkillsToFarm = (plannedCharacter: any): any => {
  const passiveSkillsToFarm: any = {}
  const passiveSkills = gameCharacters.passiveSkills
  for (const skill of passiveSkills) {
    if (plannedCharacter[skill] === true) {
      passiveSkillsToFarm[skill] = [gameCharacters.passiveSkillLevellingMaterialsCount[skill]]
    }
  }
  return passiveSkillsToFarm
}

const getActiveSkillsToFarm = (plannedCharacter: any): any => {
  const activeSkills: any = {}
  const skills = gameCharacters.activeSkills
  for (const skill of skills) {
    activeSkills[skill] = getLevelRangeDiff(
      gameCharacters.activeSkillLevellingMaterialsCount,
      plannedCharacter[skill + '_current_level'] || '1',
      plannedCharacter[skill + '_target_level'] || '1'
    )
  }
  return activeSkills
}

export const getAllCharactersNeededMaterials = (): any => {
  usePlannedCharacterStore().init()
  const characters = usePlannedCharacterStore().plannedCharacters as any
  if (!characters) return {}
  const keys = Object.keys(characters)
  if (!keys.length) return {}
  return getCharactersNeededMaterials(keys)
}

export const getCharactersNeededMaterials = (characterNames: string[]): any => {
  usePlannedCharacterStore().init()
  const characters = usePlannedCharacterStore().getCharacters(characterNames) as any
  if (!characters) return {}

  const combinedNeededMaterials: any = {}
  for (const characterName in characters) {
    const characterMaterials = getCharacterNeededMaterials(characterName)
    for (const materialType in characterMaterials) {
      if (combinedNeededMaterials[materialType] === undefined) {
        combinedNeededMaterials[materialType] = characterMaterials[materialType]
      } else {
        combinedNeededMaterials[materialType] += characterMaterials[materialType]
      }
    }
  }

  return combinedNeededMaterials
}