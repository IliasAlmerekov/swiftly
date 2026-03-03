# Phase 1: Shared LoadingState & ErrorState Components

**Layer:** Presentation
**Depends on:** none
**Can be tested in isolation:** Yes — pure presentational components, no external dependencies

---

## Goal

Create two canonical shared components (`LoadingState`, `ErrorState`) in `src/shared/components/` and a barrel `index.ts` that exports them, so downstream phases can import via `@/shared/components`.

---

## Files to CREATE

### `src/shared/components/LoadingState.tsx`

**Type:** React function component (named export)
**Purpose:** Reusable loading indicator with optional message, replaces both the users feature-scoped version and the inline definition in TicketDetailPage.

Props interface (see `07_data_models.md`):

```
interface LoadingStateProps {
  message?: string   // optional — component renders its own default when absent
}
```

Visual behaviour:

- Full-flex centered container (`flex flex-1 items-center justify-center`)
- Animated spinning border circle using `border-primary` Tailwind token (consistent with users feature version)
- Message text below spinner; when `message` is absent use a sensible default (e.g. `"Loading..."`)

Reference: `.claude/design/medium-priority-refactoring/07_data_models.md` — section 2

---

### `src/shared/components/ErrorState.tsx`

**Type:** React function component (named export)
**Purpose:** Reusable error display with optional dismiss action, replaces both the users feature-scoped version and the inline definition in TicketDetailPage.

Props interface (see `07_data_models.md`):

```
interface ErrorStateProps {
  message: string           // required
  onClose?: () => void      // optional — close button rendered ONLY when provided
}
```

Visual behaviour:

- Flex centered container (consistent with TicketDetailPage inline variant: `flex flex-1 items-center justify-center`)
- Error message in destructive color using Tailwind semantic token (`text-destructive` or `text-red-500`) — **use semantic token** (`text-destructive`) consistent with design system
- When `onClose` is provided: render a dismiss/close button that calls `onClose`
- When `onClose` is absent: no dismiss button rendered

Reference: `.claude/design/medium-priority-refactoring/07_data_models.md` — section 3
Reference: `.claude/design/medium-priority-refactoring/09_adr.md` — ADR-002

---

### `src/shared/components/index.ts`

**Type:** Barrel export file
**Purpose:** Provides a single import point `@/shared/components` for non-UI shared components. Created fresh (confirmed: file does not currently exist).

Must export:

```
export { LoadingState } from './LoadingState';
export { ErrorState } from './ErrorState';
```

**DO NOT re-export anything from `shared/components/ui/`** — those are shadcn components managed separately.

---

## Files to MODIFY

None in this phase.

---

## Tests for This Phase

### `src/shared/components/LoadingState.test.tsx`

Render helper: `render()` from `@/test/test-utils`

| Test case                           | Input                                           | Expected                                           |
| ----------------------------------- | ----------------------------------------------- | -------------------------------------------------- |
| Renders with explicit message       | `<LoadingState message="Loading tickets..." />` | Text "Loading tickets..." is visible in DOM        |
| Renders with default message        | `<LoadingState />` (no props)                   | Default message text visible (not empty, not null) |
| Renders a spinner/loading indicator | `<LoadingState />`                              | A visual loading element is present in DOM         |

### `src/shared/components/ErrorState.test.tsx`

Render helper: `render()` from `@/test/test-utils`

| Test case                                  | Input                                                                          | Expected                                   |
| ------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------ |
| Renders error message                      | `<ErrorState message="Something went wrong" />`                                | Text "Something went wrong" visible in DOM |
| Renders close button when onClose provided | `<ErrorState message="err" onClose={mockFn} />`                                | A dismiss/close button visible in DOM      |
| Calls onClose when close button clicked    | `<ErrorState message="err" onClose={mockFn} />` + userEvent.click(closeButton) | `mockFn` called exactly once               |
| No close button when onClose absent        | `<ErrorState message="err" />`                                                 | No button element in DOM                   |

---

## Quality Gate

Before marking Phase 1 complete, ALL must pass:

- [ ] `npm run type-check` — zero TypeScript errors
- [ ] `npm run lint -- --max-warnings 0` — zero lint warnings
- [ ] `npm run format:check` — Prettier clean
- [ ] `npx vitest run src/shared/components/LoadingState.test.tsx` — all tests pass
- [ ] `npx vitest run src/shared/components/ErrorState.test.tsx` — all tests pass
- [ ] Import `LoadingState` and `ErrorState` via `@/shared/components` resolves correctly (TypeScript)

---

## Human Review Checkpoint

Before proceeding to Phase 2, check:

- [ ] `LoadingState` default message is a non-empty string?
- [ ] `ErrorState` uses semantic Tailwind color token (`text-destructive`), not hardcoded `text-red-500`?
- [ ] `onClose` button is absent from DOM when `onClose` prop is not passed?
- [ ] `src/shared/components/index.ts` does NOT re-export anything from `ui/`?
- [ ] Both components use named exports (not default exports)?
