# Tiered Inventory Item Border — WIP Summary

**Date**: 2026-05-08
**Status**: WIP / being grilled

## Problem

Inventory items that belong to a tiered synthesis chain (enemy drops, forgery mats, weapon/character EXP) look identical to non-tiered items. User cannot distinguish item rarity at a glance.

## Scope

`InventoryItemMaterialCard.vue` only. Border on image container div. Header/footer excluded. Works with or without the in-progress image-fallback WIP.

## Resolved Decisions

| # | Question | Decision |
|---|----------|----------|
| Q1 | Tier lookup mechanism | New `tiered_material_index_tier` utility, aggregated in `gameInventoryItemConfig` as `tier_index` |
| Q2 | Border location | Image container `<div class="relative">` — survives image-linking fallback |
| Q3 | Colors | T4=yellow-500, T3=purple-500, T2=blue-500, T1=green-500, non-tiered=gray-500 |
| Q4 | Thickness | `border-b-2` (2px bottom) |
| Q5 | Component data access | Card imports `tier_index` directly via `gameInventoryItem` |
| Q6 | Header/footer scope | Excluded — image container only |
| Q7 | Existing img border | Removed `border-gray-800 border-b` from `<img>` (replaced by parent div) |

## Open Questions

All resolved.

## File Changes (anticipated)

- `app/data/game/inventoryItem/utilities.ts` — add `tiered_material_index_tier` function
- `app/data/game/inventoryItem/tiered/enemyDropWeaponSkillMaterial.ts` — export `tiered_enemy_drop_weapon_skill_material_index_tier`
- `app/data/game/inventoryItem/tiered/forgeryWeaponSkillMaterial.ts` — export `tiered_forgery_weapon_skill_material_index_tier`
- `app/data/game/inventoryItem/tiered/characterExp.ts` — export `tiered_char_exp_index_tier`
- `app/data/game/inventoryItem/tiered/weaponExp.ts` — export `tiered_weap_exp_index_tier`
- `app/data/game/inventoryItem/gameInventoryItemConfig.ts` — combine into `tier_index`
- `app/data/game/inventoryItem/gameInventoryItem.ts` — re-export `tier_index`
- `app/components/inventoryItem/InventoryItemMaterialCard.vue` — import `tier_index`, computed for border class, remove `border-gray-800 border-b` from img

## Design

### Data flow

```
proper_data[] (has tier) 
  → tiered_material_index_tier() (new utility)
  → tiered_*_index_tier export per file
  → gameInventoryItemConfig.ts aggregates into tier_index: Record<string, number>
  → gameInventoryItem.ts re-exports
  → InventoryItemMaterialCard.vue imports and uses in computed
```

### TierBorderColor computed

```ts
const tierBorderMap = {
  4: 'border-yellow-500',
  3: 'border-purple-500',
  2: 'border-blue-500',
  1: 'border-green-500',
}

const borderColor = computed(() => {
  const tier = gameInventoryItem.tier_index[props.index]
  return tier ? tierBorderMap[tier] : 'border-gray-500'
})
```

### HTML changes

```html
<!-- Before -->
<div class="relative">
  <img class="border-gray-800 border-b object-cover" ... />
  ...
</div>

<!-- After -->
<div class="relative" :class="borderColor">
  <img class="object-cover" ... />
  ...
</div>
```
