# Fix Broken Tests — WIP Summary

**Date**: 2025-05-09
**Status**: Draft

## Problem

Two test failures across the suite:

1. **E2E test (`tests/e2e/app.test.ts`)**: Build crash with `TypeError: MagicString is not a constructor` in `@vue/compiler-sfc` when compiling `nuxt-root.vue`. Likely caused by `"vite": "npm:rolldown-vite@latest"` override in `package.json` (added in commit `a440af8`).

2. **All tests (unit + e2e)**: Runtime error during app initialization — `TypeError: window.localStorage?.setItem is not a function` emitted by `@nuxtjs/color-mode` plugin (in `setPreferenceToStorage`). Tests still pass but the plugin errors on startup.

## Scope

**In scope:**
- Fix the `MagicString` build crash so the E2E test can run
- Fix the `localStorage.setItem` runtime error so tests initialize cleanly
- Verify all unit tests (22 files, 200 tests) continue to pass
- Verify E2E test passes after fixes
- Verify `pnpm run dev` and `pnpm run build` still work (rolldown-vite was experimental)

**Out of scope:**
- Adding new tests beyond existing ones
- Production build pipeline beyond verification
- Refactoring `@nuxtjs/color-mode` beyond what's needed for test hygiene

## Resolved Decisions

| # | Question | Decision |
|---|----------|----------|
| Q1 | Are both errors the same root cause? | Unknown — test by removing rolldown-vite first, then reassess. |

## Open Questions

- Does removing the rolldown-vite override fix both errors, or only MagicString?
- If localStorage error persists: is it a happy-dom version issue, a Nuxt test-utils issue, or something else?
- If removing rolldown-vite breaks dev/build, what's the fallback? (lock to a specific rolldown-vite version? Upgrade @vue/compiler-sfc?)
- The `@nuxtjs/color-mode` plugin accesses `localStorage.setItem` at init — should it be stubbed in test setup, or fixed at source?

## File Changes (anticipated)

| File | Change |
|------|--------|
| `package.json` | Remove `pnpm.overrides.vite` (rolldown-vite) |
| `pnpm-lock.yaml` | Regenerate with `pnpm install` |
| `vitest.config.ts` | Possibly add `setupFiles` if localStorage mock is needed |

## Design

1. Remove `"vite": "npm:rolldown-vite@latest"` from `package.json` `pnpm.overrides`
2. `rm pnpm-lock.yaml && pnpm install` to regenerate lockfile with standard Vite
3. Run `pnpm test` — check if MagicString AND localStorage errors are both resolved
4. If localStorage error persists:
   - Investigate root cause (happy-dom vs Nuxt test-utils vs rolldown artifact)
   - If needed, add `vitest.config.ts` `setupFiles` with a targeted fix (understand *why* before patching)
5. Run `pnpm run dev` — verify dev server starts on `localhost:8104`
6. Run `pnpm run build` — verify production build succeeds
7. If removing rolldown-vite breaks dev/build, revert and explore alternatives:
   - Pin rolldown-vite to a specific version
   - Upgrade `@vue/compiler-sfc` to a compatible version
   - Configure Vitest to skip E2E test as last resort
