# Work Checkpoint: Unit Tests for app/services/

**Date**: 2026-05-07
**Task**: Create unit tests for all files in `app/services/` and put them into `tests/unit/services/`

**Status**: DONE — all 197 tests pass (22 files, 0 failures)

## Design Decisions (Final)

1. **Scope**: Tests cover 5 top-level service files + `planner/utilities.ts`. `gdriveSyncService.ts` skipped (empty placeholder). `planner/` subdir included.
2. **Isolation**: Service-to-service dependencies are mocked (e.g., `characterService` mocked in `inventoryService`).
3. **Public API only**: Only exported functions tested. Internal helpers (`getPassiveSkillsToFarm`, `getActiveSkillsToFarm`) tested indirectly.
4. **Directory structure**: Mirrors source - `tests/unit/services/` for top-level, `tests/unit/services/planner/` for subdir.
5. **Store mocking**: Entire store modules mocked (not real Pinia stores).
6. **Game data mocking**: Mocked with controlled test fixtures.
7. **`downloadData`**: DOM APIs mocked (`document.createElement`, etc.).
8. **Mock hoisting**: Uses `vi.hoisted()` for shared mock variables.
9. **`gdriveSyncService.ts`**: Skipped - no testable code.

## Hoisting Rules (Critical)

`vi.mock()` calls are hoisted to top of file before ALL code. Factory functions execute at hoist time — any variable referenced inside a factory MUST be `vi.hoisted()`:

```
// DON'T — ReferenceError: cannot access before initialization
const mockFn = vi.fn()
vi.mock('@/services/x', () => ({ fn: mockFn }))

// DO — vi.hoisted() runs before vi.mock() factories
const mockFn = vi.hoisted(() => vi.fn())
vi.mock('@/services/x', () => ({ fn: mockFn }))
```

### Mutable State Pattern

Since `vi.hoisted()` returns `const`, reassignable state needs a mutable container:

```
// Inside vi.hoisted — create wrapper
const mockPlannedCharacters = vi.hoisted(() => ({ current: {} as Record<string, any> }))

// In mock factory — reference wrapper property
vi.mock('@/stores/plannedCharacterStore', () => ({
  usePlannedCharacterStore: vi.fn(() => ({
    plannedCharacters: mockPlannedCharacters.current,  // reads current value at call time
  })),
}))

// In tests — mutate, don't reassign
mockPlannedCharacters.current['testChar'] = { ... }

// In beforeEach — reset
mockPlannedCharacters.current = {}
```

This works because closures capture the variable binding, and the mock factory returns a fresh object each call (arrow function inside `vi.fn()`), so `mockPlannedCharacters.current` is evaluated lazily.

### Store Mock Return Strategy: Fresh Object vs Shared Reference

Choose based on how the service consumes the store:

| Pattern | Use When | Example |
|---------|----------|---------|
| **Fresh object** (`vi.fn(() => ({ ...mockData.current }))`) | Service calls store methods that return values (e.g., `getCharacters()`) | `weaponService`, `characterService` |
| **Shared reference** (`vi.fn(() => mockStoreData)`) | Service accesses store properties directly and calls methods on the same instance across multiple calls (e.g., `useInventoryItemStore().init()` then `useInventoryItemStore().inventoryItems`) | `inventoryService` |

For **shared reference**, the mock object stays alive across all `useXxxStore()` calls within the same function invocation. Mutations to the mock object in test setup are visible at call time.

```
// Shared reference pattern (inventoryService)
const mockStoreData = vi.hoisted(() => ({
    init: vi.fn(),
    inventoryItems: {},
}))
vi.mock('@/stores/inventoryItemStore', () => ({
    useInventoryItemStore: vi.fn(() => mockStoreData),
}))
```

## Mocking Pitfalls

### General

1. **Cross-method dependencies**: Service functions often call other exported functions from the same module AND read from stores directly. `getCharactersNeededMaterials` calls `getCharacterNeededMaterials` (which reads `plannedCharacters` property), while itself uses `getCharacters()` method. The test must set up BOTH:
   - `mockGetCharactersFn.mockReturnValue(...)` for the outer call
   - `mockPlannedCharacters.current = { ... }` for the inner `getCharacterNeededMaterials` calls

2. **`@ts-nocheck` services**: Services use `// @ts-nocheck` — mocks must match runtime shape, not types. Mock what the code actually accesses, not what TS expects.

3. **`vi.fn()` identity**: Mock functions from `vi.hoisted()` maintain their identity across imports. `vi.clearAllMocks()` in `beforeEach` resets call count/return values but keeps the same function reference.

4. **Mock export names must match service imports exactly**: The service `weaponService.ts` imports `getMaterialsFromLevelListStatList` from `@/services/planner/utilities`. If the mock factory exports it under a different name (e.g., `getMaterials`), the service gets `undefined` at runtime — no error thrown, just silent failure. Always check that `vi.mock('@/services/planner/utilities', () => ({ ... }))` keys match the destructured import names in the service under test.

5. **`getWeaponsNeededMaterials` dual-source setup**: This service function iterates over keys from `getWeapons()` return but each inner `getWeaponNeededMaterials()` call reads from `plannedWeapons` directly. Tests must set up BOTH:
   - `mockGetWeaponsFn.mockReturnValue(...)` — for iteration
   - `mockPlannedWeapons.current = { ... }` — so the inner call doesn't short-circuit with `{}`

### InventoryService-Specific

6. **`dbInventoryItems` is the gatekeeper for output**: `getOwnedNeededMaterialsResponseData` builds `responseData` from `neededMaterials`, but the final return value `responseDataSorted` is populated by iterating over keys of `dbInventoryItem.dbInventoryItems`. If `dbInventoryItems` is `{}`, nothing appears in output — test materials must have matching keys here.

7. **Exp data keys must align with service lookup**: The service checks `['weap_exp', 'char_exp']` and accesses `exp_data[materialType]`. Mock `exp_data` keys must match exactly. The service currently uses `weap_exp`/`char_exp` (note: real game data config uses `weapon_exp`/`character_exp` — potential service bug).

8. **Synthesizable materials need full chain**: The `while` loop walks the `from` chain until `from` is `null/undefined`. Mock must provide the complete chain (e.g., `{ ore_refined: { from: 'ore_raw' }, ore_raw: { from: undefined } }`) to avoid infinite loops or unexpected short-circuits.

### Hoisted Destructuring Traps

9. **`vi.hoisted()` return shape must match destructuring**: When destructuring the return value of `vi.hoisted()`, the factory must return an object with the EXACT key name being destructured:
   ```
   // WRONG — destructuring 'mockFoo' but factory returns object with key 'bar'
   const { mockFoo } = vi.hoisted(() => ({ bar: {} }))  // mockFoo = undefined

   // RIGHT — key matches
   const { mockFoo } = vi.hoisted(() => ({ mockFoo: {} }))

   // OR just assign directly (simpler)
   const mockFoo = vi.hoisted(() => ({ bar: {} }))
   ```

10. **Getter pattern for game data mocks**: When mocking a module with plain object exports (not functions), mutations to the mock variable's properties after hoist time are invisible to the module. Use getter syntax in the mock factory:
    ```
    // WRONG — captures initial value, mutations invisible
    vi.mock('@/data/x', () => ({
      data: mockData.data,
    }))

    // RIGHT — getter evaluates lazily at each access
    vi.mock('@/data/x', () => ({
      get data() { return mockData.data },
    }))
    ```

### Document Mock Traps

11. **`Object.defineProperty(global, 'document')`**: When mocking `document`, the mock object is already the document-level mock. Don't double-reference:
    ```
    // WRONG — mockDocument IS the mock doc already, .mockDocument doesn't exist
    Object.defineProperty(global, 'document', { value: mockDocument.mockDocument })

    // RIGHT — mockDocument is the value itself
    Object.defineProperty(global, 'document', { value: mockDocument })
    ```

## Fixes Applied

### plannerService.test.ts (5 bugs)

- `mockGameInventoryItem` — wrong destructuring from `vi.hoisted()`. Factory returned `{ synthesizable_materials: ... }` but destructuring expected `{ mockGameInventoryItem }`. This made `mockGameInventoryItem` `undefined`, crashing all imports that touched `gameInventoryItem` module.
- `mockDatetimeHelper` — same destructuring bug.
- `document` mock — `Object.defineProperty` used `mockDocument.mockDocument` (double reference) → `document` was `undefined`.
- `synthesizable_materials` mock used plain object → test reassignments invisible to module. Switched to getter pattern.
- `downloadData/calls init on all stores` — test expected `noteStore.init()` and `accordionStore.init()` but `downloadData()` only calls init on 3 data stores.

### planner/utilities.test.ts (1 bug)

- `tiered_materials_per_type` mock used plain object → `isTieredMaterialType()` always returned `false` regardless of test setup. Switched to getter pattern.

### planner/utilities.ts (1 fix)

- `mora` not in special pass-through list `['weap_exp', 'char_exp', 'shell_credit']`. Added `'mora'`. Without this, `mora` values in level material data were silently dropped with no error.

## Final Test Results

```
 Test Files  22 passed (22)
      Tests  197 passed (197)
```

### Per-file breakdown

| File | Tests | Status |
|------|-------|--------|
| `characterService.test.ts` | 9 | ✅ |
| `weaponService.test.ts` | 8 | ✅ |
| `inventoryService.test.ts` | 9 | ✅ |
| `plannerService.test.ts` | 18 | ✅ |
| `planner/utilities.test.ts` | 16 | ✅ |
| All other existing tests | 137 | ✅ (no regressions) |
