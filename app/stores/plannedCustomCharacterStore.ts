import { useStorage } from '@vueuse/core'
import * as dbPlannedCustomCharacter from '@/data/database/dbPlannedCustomCharacter'
import * as objectHelper from '@/libraries/objectHelper'

const plannedCustomCharactersRepo = () => {
  return useStorage('plannedCustomCharacters', {})
}

export const usePlannedCustomCharacterStore = defineStore('plannedCustomCharacters', () => {
  const plannedCustomCharacters = ref({}) as any

  function init() {
    plannedCustomCharacters.value = plannedCustomCharactersRepo().value
  }

  function storeToStorage() {
    plannedCustomCharactersRepo().value = plannedCustomCharacters.value
  }

  function getOrInitEntry(characterName: string): any {
    if (Object.prototype.hasOwnProperty.call(plannedCustomCharacters.value, characterName)) {
      return plannedCustomCharacters.value[characterName]
    }
    return { ...dbPlannedCustomCharacter.customCharacter }
  }

  function getCustomCharacters(characterNames: string[]): any {
    const characters: any = {}
    for (const characterName of characterNames) {
      characters[characterName] = getOrInitEntry(characterName)
    }
    return characters
  }

  function upsert(characterName: string, character: any) {
    if (!Object.prototype.hasOwnProperty.call(plannedCustomCharacters.value, characterName)) {
      plannedCustomCharacters.value[characterName] = {}
      plannedCustomCharacters.value[characterName]['created_at'] = new Date().toISOString()
    }
    plannedCustomCharacters.value[characterName]['updated_at'] = new Date().toISOString()

    plannedCustomCharacters.value[characterName] = Object.assign(
      {},
      plannedCustomCharacters.value[characterName],
      objectHelper.omit(character, 'name')
    )

    storeToStorage()
  }

  function remove(characterName: string) {
    plannedCustomCharacters.value = objectHelper.omit(plannedCustomCharacters.value, characterName)
    storeToStorage()
  }

  function getAll() {
    return plannedCustomCharacters.value
  }

  function restoreData(data: any) {
    plannedCustomCharacters.value = data
    storeToStorage()
  }

  return {
    plannedCustomCharacters,
    init,
    getOrInitEntry,
    getCustomCharacters,
    upsert,
    remove,
    getAll,
    restoreData,
  }
})