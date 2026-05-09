# Image Linking — WIP Summary

**Date**: 2026-05-08
**Status**: WIP / being grilled

## Problem

Inventory items source icons from `https://raw.githubusercontent.com/boxofzero/ww-assets/`. User does NOT want to host image assets. When URL works → show normally. When broken → show fallback.

## Scope

Inventory items only. Characters/weapons deferred to separate session.

## Resolved Decisions

| # | Question | Decision |
|---|----------|----------|
| Q1 | Scope | Inventory items only |
| Q2 | Trigger | `onerror` on `<img>` |
| Q3 | Fallback visual | Initials avatar (option A) |
| Q4 | Click behavior fallback | Open Google Image Search in new tab |
| Q5 | Click behavior real image | No-op (no click) |
| Q6 | Tooltip | `"Search images for {label}"` |
| Q7 | Visual shape/size | Like current images (256×256, rounded square) |
| Q8 | Color algorithm | HSL, hash internal key for hue, fixed saturation/lightness |
| Q9 | Initials extraction | First letter of first 2 words, uppercase, max 2 chars |
| Q10 | Implementation | Composable `useImageFallback` returning reactive state |

## Open Questions

All resolved — see [ADR-0001](../../docs/adr/0001-image-linking-fallback.md).

## File Changes (anticipated)

- `app/composables/useImageFallback.ts` — new composable (DJB2 hash, initials, search URL, errored state)
- `app/components/inventoryItem/InventoryItemMaterialCard.vue` — use composable, add `v-if/v-else` for image vs fallback

## Design

### `useImageFallback` composable

```ts
// Input: itemKey, label, iconUrl
// Returns: { errored, initials, bgColor, searchUrl }
// - errored: true if onerror fired OR iconUrl is null/empty
// - initials: from label (first letter of first 2 words, uppercase)
// - bgColor: `hsl(${djb2Hash(itemKey) % 360}, 45%, 45%)`
// - searchUrl: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(label + ' Wuthering Waves')}`
```

### InventoryItemMaterialCard.vue changes

```html
<div class="relative">
  <img v-if="!errored && item.icon" ... @error="errored = true" />
  <a v-else :href="searchUrl" target="_blank" :title="'Search images for ' + label"
     class="block w-[256px] h-[256px] flex items-center justify-center text-white font-bold text-4xl border-b border-gray-800"
     :style="{ backgroundColor: bgColor }">
    {{ initials }}
  </a>
  <!-- overlay badges unchanged -->
</div>
```
