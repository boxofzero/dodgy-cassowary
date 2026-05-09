import { useStorage } from '@vueuse/core'
import * as dbPlannedCharacter from '@/data/database/dbPlannedCharacter'
import * as gameCharacter from '@/data/game/gameCharacter'
import * as objectHelper from '@/libraries/objectHelper'

const plannedCharactersRepo = () => {
  return useStorage('plannedCharacters', {})
}

export const usePlannedCharacterStore = defineStore('plannedCharacters', () => {
  const plannedCharacters = ref({}) as any

  function init() {
    plannedCharacters.value = plannedCharactersRepo().value
  }

  function storeToStorage() {
    plannedCharactersRepo().value = plannedCharacters.value
  }

  function getOrInitEntry(characterName: string): any {
    if (Object.prototype.hasOwnProperty.call(plannedCharacters.value, characterName)) {
      return plannedCharacters.value[characterName]
    }
    return { ...dbPlannedCharacter.character }
  }

  function getCharacters(characterNames: string[]): any {
    const characters: any = {}
    for (const characterName of characterNames) {
      characters[characterName] = getOrInitEntry(characterName)
    }
    return characters
  }

  function upsert(characterName: string, character: any) {
    if (!Object.prototype.hasOwnProperty.call(plannedCharacters.value, characterName)) {
      plannedCharacters.value[characterName] = {}
      plannedCharacters.value[characterName]['created_at'] = new Date().toISOString()
    }
    plannedCharacters.value[characterName]['updated_at'] = new Date().toISOString()

    plannedCharacters.value[characterName] = Object.assign(
      {},
      plannedCharacters.value[characterName],
      objectHelper.omit(character, 'name')
    )

    storeToStorage()
  }

  function setDone(characterName: string) {
    const character = plannedCharacters.value[characterName]
    if (character === undefined) {
      return
    }

    plannedCharacters.value = objectHelper.omit(plannedCharacters.value, characterName)
    storeToStorage()
  }

  function isCharacterDone(characterName: string): boolean {
    const character = plannedCharacters.value[characterName]
    if (character === undefined) {
      return true
    }

    for (const activeSkill of dbPlannedCharacter.characterStructure.active_skills) {
      if (activeSkill === 'char') {
        if (character[activeSkill + '_target_level'] !== undefined) {
          const levels = gameCharacter.charLevellingMaterialsCount(characterName).map((v: any) => v.level)
          const target = levels.indexOf(character[activeSkill + '_target_level'])
          const current = levels.indexOf(character[activeSkill + '_current_level'])
          if (target > current) {
            return false
          }
        }
        continue
      }

      if (character[activeSkill + '_target_level'] !== undefined) {
        if (character[activeSkill + '_target_level'] > character[activeSkill + '_current_level']) {
          return false
        }
      }
    }

    for (const passiveSkill of dbPlannedCharacter.characterStructure.passive_skills) {
      if (character[passiveSkill] === true) {
        return false
      }
    }
    return true
  }

  function getAllActivePlannedCharacters() {
    const activeCharacters: any = { ...plannedCharacters.value }
    for (const character in activeCharacters) {
      if (isCharacterDone(character)) {
        delete activeCharacters[character]
      }
    }
    return activeCharacters
  }

  function restoreData(data: any) {
    plannedCharacters.value = data
    storeToStorage()
  }

  return {
    plannedCharacters,
    init,
    getOrInitEntry,
    getCharacters,
    upsert,
    setDone,
    isCharacterDone,
    getAllActivePlannedCharacters,
    restoreData,
  }
})