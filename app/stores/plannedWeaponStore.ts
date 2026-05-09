import { useStorage } from '@vueuse/core'
import * as dbPlannedWeapon from '@/data/database/dbPlannedWeapon'
import * as gameWeapon from '@/data/game/gameWeapon'
import * as objectHelper from '@/libraries/objectHelper'

const plannedWeaponsRepo = () => {
  return useStorage('plannedWeapons', {})
}

export const usePlannedWeaponStore = defineStore('plannedWeapons', () => {
  const plannedWeapons = ref({}) as any

  function init() {
    plannedWeapons.value = plannedWeaponsRepo().value
  }

  function storeToStorage() {
    plannedWeaponsRepo().value = plannedWeapons.value
  }

  function getOrInitEntry(weaponName: string): any {
    if (Object.prototype.hasOwnProperty.call(plannedWeapons.value, weaponName)) {
      return plannedWeapons.value[weaponName]
    }
    return { ...dbPlannedWeapon.weapon }
  }

  function getWeapons(weaponNames: string[]): any {
    const weapons: any = {}
    for (const weaponName of weaponNames) {
      weapons[weaponName] = getOrInitEntry(weaponName)
    }
    return weapons
  }

  function upsert(weaponName: string, weapon: any) {
    if (!Object.prototype.hasOwnProperty.call(plannedWeapons.value, weaponName)) {
      plannedWeapons.value[weaponName] = {}
      plannedWeapons.value[weaponName]['created_at'] = new Date().toISOString()
    }
    plannedWeapons.value[weaponName]['updated_at'] = new Date().toISOString()

    plannedWeapons.value[weaponName] = Object.assign(
      {},
      plannedWeapons.value[weaponName],
      objectHelper.omit(weapon, 'name')
    )

    storeToStorage()
  }

  function setDone(weaponName: string) {
    const weapon = plannedWeapons.value[weaponName]
    if (weapon === undefined) {
      return
    }

    plannedWeapons.value = objectHelper.omit(plannedWeapons.value, weaponName)
    storeToStorage()
  }

  function isWeaponDone(weaponName: string): boolean {
    const weapon = plannedWeapons.value[weaponName]
    if (weapon === undefined) {
      return true
    }

    if (weapon['weap_target_level'] !== undefined) {
      const levels = (gameWeapon.weaponLevellingMaterialsCount as any)[5].map((v: any) => v.level)
      const target = levels.indexOf(weapon['weap_target_level'])
      const current = levels.indexOf(weapon['weap_current_level'])
      if (target > current) {
        return false
      }
    }

    return true
  }

  function getAllActivePlannedWeapons() {
    const activeWeapons: any = { ...plannedWeapons.value }
    for (const weapon in activeWeapons) {
      if (isWeaponDone(weapon)) {
        delete activeWeapons[weapon]
      }
    }
    return activeWeapons
  }

  function restoreData(data: any) {
    plannedWeapons.value = data
    storeToStorage()
  }

  return {
    plannedWeapons,
    init,
    getOrInitEntry,
    getWeapons,
    upsert,
    setDone,
    isWeaponDone,
    getAllActivePlannedWeapons,
    restoreData,
  }
})