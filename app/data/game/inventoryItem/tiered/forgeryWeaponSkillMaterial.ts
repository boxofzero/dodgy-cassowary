export interface ForgeryTieredItem {
  general_name: string
  name: string
  tier: number
  from: string | undefined
  to: string | undefined
  count: number | undefined
}

export const forgery_proper_data: ForgeryTieredItem[] = [
  { general_name: 'cadence', name: 'cadence_seed', tier: 1, from: undefined, to: 'cadence_bud', count: 3 },
  { general_name: 'cadence', name: 'cadence_bud', tier: 2, from: 'cadence_seed', to: 'cadence_leaf', count: 3 },
  { general_name: 'cadence', name: 'cadence_leaf', tier: 3, from: 'cadence_bud', to: 'cadence_blossom', count: 3 },
  { general_name: 'cadence', name: 'cadence_blossom', tier: 4, from: 'cadence_leaf', to: undefined, count: undefined },
  { general_name: 'phlogiston', name: 'impure_phlogiston', tier: 1, from: undefined, to: 'extracted_phlogiston', count: 3 },
  { general_name: 'phlogiston', name: 'extracted_phlogiston', tier: 2, from: 'impure_phlogiston', to: 'refined_phlogiston', count: 3 },
  { general_name: 'phlogiston', name: 'refined_phlogiston', tier: 3, from: 'extracted_phlogiston', to: 'flawless_phlogiston', count: 3 },
  { general_name: 'phlogiston', name: 'flawless_phlogiston', tier: 4, from: 'refined_phlogiston', to: undefined, count: undefined },
  { general_name: 'metallic_drip', name: 'inert_metallic_drip', tier: 1, from: undefined, to: 'reactive_metallic_drip', count: 3 },
  { general_name: 'metallic_drip', name: 'reactive_metallic_drip', tier: 2, from: 'inert_metallic_drip', to: 'polarized_metallic_drip', count: 3 },
  { general_name: 'metallic_drip', name: 'polarized_metallic_drip', tier: 3, from: 'reactive_metallic_drip', to: 'heterized_metallic_drip', count: 3 },
  { general_name: 'metallic_drip', name: 'heterized_metallic_drip', tier: 4, from: 'polarized_metallic_drip', to: undefined, count: undefined },
  { general_name: 'helix', name: 'lento_helix', tier: 1, from: undefined, to: 'adagio_helix', count: 3 },
  { general_name: 'helix', name: 'adagio_helix', tier: 2, from: 'lento_helix', to: 'andante_helix', count: 3 },
  { general_name: 'helix', name: 'andante_helix', tier: 3, from: 'adagio_helix', to: 'presto_helix', count: 3 },
  { general_name: 'helix', name: 'presto_helix', tier: 4, from: 'andante_helix', to: undefined, count: undefined },
  { general_name: 'waveworn_residue', name: 'waveworn_residue_210', tier: 1, from: undefined, to: 'waveworn_residue_226', count: 3 },
  { general_name: 'waveworn_residue', name: 'waveworn_residue_226', tier: 2, from: 'waveworn_residue_210', to: 'waveworn_residue_235', count: 3 },
  { general_name: 'waveworn_residue', name: 'waveworn_residue_235', tier: 3, from: 'waveworn_residue_226', to: 'waveworn_residue_239', count: 3 },
  { general_name: 'waveworn_residue', name: 'waveworn_residue_239', tier: 4, from: 'waveworn_residue_235', to: undefined, count: undefined },
]

export const tiered_forgery_weapon_skill_material_index_category = forgery_proper_data.reduce((acc, item) => {
  const { general_name, name, tier, to, count } = item
  if (!acc[general_name]) acc[general_name] = {}
  if (to) {
    acc[general_name][tier] = { name, synthesizable: { to: tier, count: count as number } }
  } else {
    acc[general_name][tier] = { name }
  }
  return acc
}, {} as Record<string, Record<number, { name: string; synthesizable?: { to: number; count: number } }>>)

export const tiered_forgery_weapon_skill_material_index_tier = forgery_proper_data.reduce((acc, item) => {
  acc[item.name] = item.tier
  return acc
}, {} as Record<string, number>)

export const tiered_forgery_weapon_skill_material_index_name = forgery_proper_data.reduce((acc, item) => {
  const { name, to, count, from } = item
  acc[name] = { to: to ?? undefined, cost: count ?? undefined }
  if (from) acc[name].from = from
  return acc
}, {} as Record<string, { to: string | undefined; cost: number | undefined; from?: string }>)