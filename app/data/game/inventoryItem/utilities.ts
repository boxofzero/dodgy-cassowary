export interface TieredMaterialItem {
  general_name: string
  name: string
  tier: number
  from: string | undefined
  to: string | undefined
  count: number | undefined
}

export interface SynthesizableInfo {
  to: number
  count: number
}

export interface TieredMaterialCategoryEntry {
  name: string
  synthesizable?: SynthesizableInfo
}

export interface TieredMaterialNameEntry {
  to: string | undefined
  cost: number | undefined
  from?: string
}

export const tiered_material_index_category = (
  proper_data: TieredMaterialItem[]
): Record<string, Record<number, TieredMaterialCategoryEntry>> => {
  return proper_data.reduce((acc, item) => {
    const { general_name, name, tier, to, count } = item
    if (!acc[general_name]) {
      acc[general_name] = {}
    }
    if (to) {
      acc[general_name][tier] = {
        name,
        synthesizable: {
          to: tier,
          count: count as number,
        },
      }
    } else {
      acc[general_name][tier] = {
        name,
      }
    }
    return acc
  }, {} as Record<string, Record<number, TieredMaterialCategoryEntry>>)
}

export const tiered_material_index_tier = (
  proper_data: TieredMaterialItem[]
): Record<string, number> => {
  return proper_data.reduce((acc, item) => {
    acc[item.name] = item.tier
    return acc
  }, {} as Record<string, number>)
}

export const tiered_material_index_name = (
  proper_data: TieredMaterialItem[]
): Record<string, TieredMaterialNameEntry> => {
  return proper_data.reduce((acc, item) => {
    const { name, to, count, from } = item
    acc[name] = {
      to: to ?? undefined,
      cost: count ?? undefined,
    }
    if (from) {
      acc[name].from = from
    }
    return acc
  }, {} as Record<string, TieredMaterialNameEntry>)
}