export interface ExpMaterialConfig {
  exp_value: number
}

export interface ResonatorExpMaterial {
  basic_resonance_potion: ExpMaterialConfig
  medium_resonance_potion: ExpMaterialConfig
  advanced_resonance_potion: ExpMaterialConfig
  premium_resonance_potion: ExpMaterialConfig
}

export interface WeaponExpMaterial {
  basic_energy_core: ExpMaterialConfig
  medium_energy_core: ExpMaterialConfig
  advanced_energy_core: ExpMaterialConfig
  premium_energy_core: ExpMaterialConfig
}

import {
  tiered_enemy_drop_weapon_skill_material_index_category,
  tiered_enemy_drop_weapon_skill_material_index_name,
  tiered_enemy_drop_weapon_skill_material_index_tier,
} from '@/data/game/inventoryItem/tiered/enemyDropWeaponSkillMaterial'

import {
  tiered_forgery_weapon_skill_material_index_category,
  tiered_forgery_weapon_skill_material_index_name,
  tiered_forgery_weapon_skill_material_index_tier,
} from '@/data/game/inventoryItem/tiered/forgeryWeaponSkillMaterial'

import {
  tiered_char_exp_index_category,
  tiered_char_exp_index_name,
  tiered_char_exp_index_tier,
} from '@/data/game/inventoryItem/tiered/characterExp'

import {
  tiered_weap_exp_index_category,
  tiered_weap_exp_index_name,
  tiered_weap_exp_index_tier,
} from '@/data/game/inventoryItem/tiered/weaponExp'

export const resonator_exp_material: ResonatorExpMaterial = {
  basic_resonance_potion: { exp_value: 1000 },
  medium_resonance_potion: { exp_value: 3000 },
  advanced_resonance_potion: { exp_value: 8000 },
  premium_resonance_potion: { exp_value: 20000 },
}

export const weapon_exp_material: WeaponExpMaterial = {
  basic_energy_core: { exp_value: 1000 },
  medium_energy_core: { exp_value: 3000 },
  advanced_energy_core: { exp_value: 8000 },
  premium_energy_core: { exp_value: 20000 },
}

export const tier_index = {
  ...tiered_enemy_drop_weapon_skill_material_index_tier,
  ...tiered_forgery_weapon_skill_material_index_tier,
  ...tiered_char_exp_index_tier,
  ...tiered_weap_exp_index_tier,
}

export const tiered_materials_all = {
  ...tiered_enemy_drop_weapon_skill_material_index_name,
  ...tiered_forgery_weapon_skill_material_index_name,
  ...tiered_char_exp_index_name,
  ...tiered_weap_exp_index_name,
}

export const tiered_materials_per_type = {
  tiered_enemy_drop_weapon_skill_material:
    tiered_enemy_drop_weapon_skill_material_index_category,
  tiered_forgery_weapon_skill_material:
    tiered_forgery_weapon_skill_material_index_category,
  tiered_char_exp: tiered_char_exp_index_category,
  tiered_weap_exp: tiered_weap_exp_index_category,
}

export const tiered_forgery_weapon_skill_material = tiered_forgery_weapon_skill_material_index_category

export const exp_data = {
  weap_exp: weapon_exp_material,
  char_exp: resonator_exp_material,
}