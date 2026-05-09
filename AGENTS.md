# Cassowary - Agent Instructions

## Commands

```bash
pnpm install      # Install dependencies (requires pnpm 11.0.9, Node 24)
pnpm run dev      # Dev server on http://localhost:8104
pnpm run build    # Build for production
pnpm run generate # Static export for GitHub Pages
pnpm test         # Run Vitest unit tests
pnpm test <file>  # Run specific test file
```

## Architecture

- **Frontend**: Nuxt 4 (SSR disabled, SPA only), Vue 3.5, Tailwind CSS 4
- **State**: Pinia stores with `@vueuse/core` `useStorage` (LocalStorage persistence)
- **Testing**: Vitest (unit), Playwright (e2e)

### Key Directories

- `app/stores/` - Pinia stores (plannedCharacter, plannedWeapon, plannedCustomCharacter, inventoryItem, stamina, note, accordion)
- `app/services/` - Business logic (plannerService, characterService, weaponService, inventoryService)
- `app/data/` - Database schemas, form configs, game data
- `app/pages/` - Nuxt pages (characters, weapons, custom, inventoryItems, stamina, settings)
- `app/components/` - Vue components
- `app/composables/` - Reusable composable functions

### Patterns

**Store Pattern**: Each domain has a Pinia store using `useStorage` for persistence. Methods: `init()`, `getOrInitEntry()`, `upsert()`, `setDone()`, `restoreData()`.

**Page Pattern**: Select from dropdown → set current/target levels → calculate materials → mark done.

**Level System**: `1`, `50`, `50A`, `60`, `60A`, `70`, `70A`, `80`, `80A`, `90` (A = Ascended).

## Quirks

- Mixed `.ts` and `.js` files (stores use `.ts`, some data/form files use `.js`)
- Services use `// @ts-nocheck` due to complex runtime logic
- URL hash navigation: `/characters#characterName`
- Accordion state (order, open/close) persisted per group key
- Material synthesis has tiered cascading logic
- No ESLint/Prettier configured
- GitHub Pages deployment requires: `NUXT_APP_BASE_URL=/cassowary/ pnpx nuxt build --preset github_pages`

## Constraints

- All data stored in browser LocalStorage only (no backend)
- Manual inventory input (no game API integration)
- Project is unmaintained (per README)
