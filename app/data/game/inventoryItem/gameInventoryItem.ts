import gameInventoryItemRawData from '@/data/game/raw/inventoryItem.json'

export interface InventoryItemRaw {
  [key: string]: any
}

export const boss_ascension_material: InventoryItemRaw = gameInventoryItemRawData.boss_ascension_material
export const weekly_boss_skill_upgrade_material: InventoryItemRaw = gameInventoryItemRawData.weekly_boss_skill_upgrade_material
export const resonator_exp_material: InventoryItemRaw = gameInventoryItemRawData.resonator_exp_material
export const weapon_exp_material: InventoryItemRaw = gameInventoryItemRawData.weapon_exp_material
export const enemy_drop_weapon_skill_material: InventoryItemRaw = gameInventoryItemRawData.enemy_drop_weapon_skill_material
export const echo_development_material: InventoryItemRaw = gameInventoryItemRawData.echo_development_material
export const forgery_weapon_skill_material: InventoryItemRaw = gameInventoryItemRawData.forgery_weapon_skill_material
export const overworld_resource_ascension_material: InventoryItemRaw = gameInventoryItemRawData.overworld_resource_ascension_material
export const credit: InventoryItemRaw = gameInventoryItemRawData.credit

export interface CategorizedItems {
  label?: string
  items: InventoryItemRaw
}

export const categorizedInventoryItems: Record<string, CategorizedItems> = {
  credit_and_exp: {
    label: 'Credit & EXP Material',
    items: {
      ...credit,
      ...weapon_exp_material,
      ...resonator_exp_material,
    },
  },
  boss_ascension_material: { items: boss_ascension_material },
  weekly_boss_skill_upgrade_material: { items: weekly_boss_skill_upgrade_material },
  enemy_drop_weapon_skill_material: { items: enemy_drop_weapon_skill_material },
  echo_development_material: { items: echo_development_material },
  forgery_weapon_skill_material: { items: forgery_weapon_skill_material },
  overworld_resource_ascension_material: { items: overworld_resource_ascension_material },
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type OmitEcho = Omit<typeof categorizedInventoryItems, 'echo_development_material'>

export const charWeaponOnlyCategorizedInventoryItems: OmitEcho = (({ echo_development_material: _a, ...omittedInventoryItems }) => omittedInventoryItems)(categorizedInventoryItems)

export const allInventoryItems: InventoryItemRaw = {
  ...credit,
  ...boss_ascension_material,
  ...weekly_boss_skill_upgrade_material,
  ...resonator_exp_material,
  ...weapon_exp_material,
  ...enemy_drop_weapon_skill_material,
  ...echo_development_material,
  ...forgery_weapon_skill_material,
  ...overworld_resource_ascension_material,
}

import * as gameInventoryItemsConfig from '~/data/game/inventoryItem/gameInventoryItemConfig'

export const tiered_materials_per_type = {
  ...gameInventoryItemsConfig.tiered_materials_per_type,
}

export const tier_index = {
  ...gameInventoryItemsConfig.tier_index,
}

export const synthesizable_materials = {
  ...gameInventoryItemsConfig.tiered_materials_all,
}

export const exp_data = {
  ...gameInventoryItemsConfig.exp_data,
}