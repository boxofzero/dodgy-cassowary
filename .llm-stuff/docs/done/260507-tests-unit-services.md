# Lessons Learned: Unit Testing Services with Vitest

**Date**: 2026-05-07
**Task**: Unit tests for `app/services/` (6 source files, 60 test cases)
**Outcome**: 197 tests pass, 22 files, 0 failures

---

## 1. The Hoisting Mindset Shift

`vi.mock()` is not just a function call — it's a compiler directive. Vitest hoists ALL `vi.mock()` calls to the top of the file, before any `import` statements. This means:

- **Factory functions execute at hoist time**, before any test code runs.
- **Any variable referenced inside a mock factory MUST be `vi.hoisted()`**, or you get `ReferenceError: cannot access before initialization`.
- **The return value of `vi.mock()` factory is captured once**. If you mutate the source object later, the mutation may or may not propagate depending on the reference type.

Getting this wrong produces confusing errors: the module under test gets `undefined` for imported bindings, which triggers downstream `TypeError: Cannot read properties of undefined` at the import site — not at the mock site. Took several rounds of tracing to connect the symptom to the root cause.

## 2. Plain Object vs Getter in Mock Factories

This was the single most subtle bug. Consider:

```ts
const mockData = vi.hoisted(() => ({ field: {} }))
vi.mock('@/module', () => ({
  field: mockData.field,  // evaluated ONCE at hoist time
}))
```

The mock factory runs once. `mockData.field` resolves to the initial `{}` object. The module binds to this specific reference. When a test does `mockData.field = { newData: true }`, it **reassigns** `mockData.field` to a new object — but the module still points at the old `{}`.

**The fix**: Use a getter:

```ts
vi.mock('@/module', () => ({
  get field() { return mockData.field },
}))
```

Now every access to `field` on the module re-evaluates the getter, reading the latest value from `mockData.field`.

This matters for game data modules where tests need to SET UP specific data shapes per test. Store mocks typically work because they use factory functions (`vi.fn(() => ...)`) that re-evaluate on each call. But plain data exports need getters.

**Pattern recognition**: If the mock export is a function → fresh-object pattern works. If the mock export is a plain value → getter pattern required.

## 3. `vi.hoisted()` Destructuring Traps

The return value of `vi.hoisted()` and the destructuring syntax must match exactly:

```ts
// BROKEN: factory returns { generateTimestamp: fn }, destructure expects { mockDatetimeHelper }
const { mockDatetimeHelper } = vi.hoisted(() => ({
  generateTimestamp: vi.fn(),
}))
// mockDatetimeHelper is undefined!

// FIXED: factory returns matching key
const { mockDatetimeHelper } = vi.hoisted(() => ({
  mockDatetimeHelper: { generateTimestamp: vi.fn() },
}))

// OR: simpler direct assignment
const mockDatetimeHelper = vi.hoisted(() => ({
  generateTimestamp: vi.fn(),
}))
```

This is an easy mistake when refactoring — you add a wrapper object inside `vi.hoisted()` but forget to update the destructuring. The bug is silent until the mock factory tries to access `.synthesizable_materials` on `undefined`.

## 4. `document` Mocking Requires Care

When mocking `document` with `Object.defineProperty(global, 'document', ...)`, the mock object IS the document — not a wrapper. The mistake was:

```ts
const mockDocument = vi.hoisted(() => ({ createElement: vi.fn(), body: { ... } }))

// WRONG: mockDocument already IS the mock, not a container
Object.defineProperty(global, 'document', { value: mockDocument.mockDocument })

// RIGHT: use mockDocument directly
Object.defineProperty(global, 'document', { value: mockDocument })
```

This happens because the natural instinct is to add a `.mockDocument` nesting, but the variable name already serves that role.

## 5. Know Your Service's Runtime Path

Two tests failed because the test assumed the service called `store.init()` on all stores, but the service only initializes stores it mutates. `downloadData()` reads from all 5 stores but only calls `.init()` on the 3 stores whose data it may have previously written. Reading from a store doesn't require init in this codebase — the `useStorage` persistence handles hydration.

**Lesson**: Don't write tests based on assumptions. Read the actual service code to see what it does. Tests that assert behavior not in the code are just dead code that will fail.

## 6. The `mora` Case: When Tests Reveal Missing Behavior

One test expected `mora` to be accumulated by `getMaterialsFromLevelListStatList`, but the service only had `['weap_exp', 'char_exp', 'shell_credit']` in its special pass-through list. `mora` was silently dropped.

Three options:
- Remove the test (acknowledge `mora` isn't in the data)
- Change the test to use `shell_credit` (but that's already tested)
- Add `'mora'` to the special list (fixes the gap)

Chose option 3. The test exposed a genuine gap — if `mora` ever appears in level material data, it should pass through. Adding it costs nothing and makes the code more robust.

**Lesson**: Sometimes the test knows better than the code. Don't blindly change tests to match code behavior — evaluate whether the code is missing a case.

## 7. Debugging Strategy for Mock Failures

When a `vi.mock()` causes a suite-level crash (zero tests collected):

1. **Look at the "Caused by" line** in the error. It points to the specific expression in the mock factory that threw.
2. **Check what `vi.hoisted()` returns**. The hoisted value propagates to the mock factory. If it's `undefined`, the factory crashes.
3. **Check module import path alignment**. The path in `vi.mock()` must match the import path used by the service under test. `@/foo` vs `~/foo` both resolve in this project, but they're different mock entries.
4. **Check getter vs plain object**. For mutable test data, getters are required.

## 8. What Worked Well

- **Mutable container pattern** (`{ current: {} }`) — clean and reliable for store mocks. Using `mockPlannedCharacters.current = { char1: data }` in test setup and `mockPlannedCharacters.current = {}` in `beforeEach` works.
- **Shared reference for inventoryService** — the service calls `init()` then reads `inventoryItems` from the same store instance across multiple calls in one function. A single mock object that accumulates mutations naturally matches this pattern.
- **`vi.hoisted()` for mock variables** — without it, mock factories can't access any shared state. Once the hoisting mental model clicks, the pattern is straightforward.
- **Concurrent mock setup**: Setting up 5+ store mocks and 3+ data mocks in parallel at the top of the test file. It's verbose but explicit — no magic.

## 9. What I'd Do Differently

- **Start with getters by default** for any mock that exports plain data (not functions). Saves debugging time later when a test needs to set up data differently.
- **Name `vi.hoisted()` variables consistently** — use `mockXxx` for values that go into mock factories, reserve `mockXxxData` for container objects.
- **Test one service at a time** — trying to fix all 5 test files simultaneously created debugging context thrash. Fixing one completely before moving to the next is faster.
- **Verify mock export names against service imports** before writing test bodies. A silent `undefined` import wastes more time than the verification takes.

## 10. Tools Context-Saving Notes

The `context-mode` sandbox was used extensively for grep/search operations (finding import names, checking game data shapes, searching for `mora` references). Key patterns:

- `grep -r '"pattern"' --include='*.json' app/data/game/` via `ctx_execute` — fast data exploration
- `ctx_batch_execute` for running each test file + getting output in one shot
- Writing Fix Scripts (JS sandbox) for counting test cases per file — avoids reading every test file into context

The biggest context saver: running the test suite ONCE and analyzing the error output programmatically, rather than reading source files blindly.
