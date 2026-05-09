import * as gameInventoryItem from '@/data/game/inventoryItem/gameInventoryItem'

export interface InventoryItemCount {
  count: number
}

export interface CategorizedInventoryItems {
  [key: string]: InventoryItemCount
}

export const boss_ascension_material: CategorizedInventoryItems = (() => {
  const data: CategorizedInventoryItems = {}
  Object.entries(gameInventoryItem.boss_ascension_material).forEach(([key, value]) => {
    data[key] = { count: 0 }
  })
  return data
})()

export const weekly_boss_skill_upgrade_material: CategorizedInventoryItems = (() => {
  const data: CategorizedInventoryItems = {}
  Object.entries(gameInventoryItem.weekly_boss_skill_upgrade_material).forEach(([key, value]) => {
    data[key] = { count: 0 }
  })
  return data
})()

export const resonator_exp_material: CategorizedInventoryItems = (() => {
  const data: CategorizedInventoryItems = {}
  Object.entries(gameInventoryItem.resonator_exp_material).forEach(([key, value]) => {
    data[key] = { count: 0 }
  })
  return data
})()

export const weapon_exp_material: CategorizedInventoryItems = (() => {
  const data: CategorizedInventoryItems = {}
  Object.entries(gameInventoryItem.weapon_exp_material).forEach(([key, value]) => {
    data[key] = { count: 0 }
  })
  return data
})()

export const enemy_drop_weapon_skill_material: CategorizedInventoryItems = (() => {
  const data: CategorizedInventoryItems = {}
  Object.entries(gameInventoryItem.enemy_drop_weapon_skill_material).forEach(([key, value]) => {
    data[key] = { count: 0 }
  })
  return data
})()

export const echo_development_material: CategorizedInventoryItems = (() => {
  const data: CategorizedInventoryItems = {}
  Object.entries(gameInventoryItem.echo_development_material).forEach(([key, value]) => {
    data[key] = { count: 0 }
  })
  return data
})()

export const forgery_weapon_skill_material: CategorizedInventoryItems = (() => {
  const data: CategorizedInventoryItems = {}
  Object.entries(gameInventoryItem.forgery_weapon_skill_material).forEach(([key, value]) => {
    data[key] = { count: 0 }
  })
  return data
})()

export const overworld_resource_ascension_material: CategorizedInventoryItems = (() => {
  const data: CategorizedInventoryItems = {}
  Object.entries(gameInventoryItem.overworld_resource_ascension_material).forEach(([key, value]) => {
    data[key] = { count: 0 }
  })
  return data
})()

export const credit: CategorizedInventoryItems = (() => {
  const data: CategorizedInventoryItems = {}
  Object.entries(gameInventoryItem.credit).forEach(([key, value]) => {
    data[key] = { count: 0 }
  })
  return data
})()

export interface CategorizedInventory {
  credit: CategorizedInventoryItems
  boss_ascension_material: CategorizedInventoryItems
  weekly_boss_skill_upgrade_material: CategorizedInventoryItems
  resonator_exp_material: CategorizedInventoryItems
  weapon_exp_material: CategorizedInventoryItems
  enemy_drop_weapon_skill_material: CategorizedInventoryItems
  echo_development_material: CategorizedInventoryItems
  forgery_weapon_skill_material: CategorizedInventoryItems
  overworld_resource_ascension_material: CategorizedInventoryItems
}

export const categorizedInventoryItems: CategorizedInventory = {
  credit,
  boss_ascension_material,
  weekly_boss_skill_upgrade_material,
  resonator_exp_material,
  weapon_exp_material,
  enemy_drop_weapon_skill_material,
  echo_development_material,
  forgery_weapon_skill_material,
  overworld_resource_ascension_material,
}

export const dbInventoryItems: CategorizedInventoryItems = {
  ...credit,
  ...resonator_exp_material,
  ...weapon_exp_material,
  ...echo_development_material,
  ...boss_ascension_material,
  ...weekly_boss_skill_upgrade_material,
  ...enemy_drop_weapon_skill_material,
  ...forgery_weapon_skill_material,
  ...overworld_resource_ascension_material,
}