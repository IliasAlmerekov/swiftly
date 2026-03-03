# Phase 4: users/components Cleanup

**Layer:** Presentation + Wiring
**Depends on:** Phase 1 (shared components exist), Phase 2 (TicketDetailPage no longer imports from users/components)
**Can be tested in isolation:** Yes

---

## Goal

Delete the feature-scoped `LoadingState.tsx` and `ErrorState.tsx` from `src/features/users/components/`, update the barrel `index.ts` to remove those exports, and update `UserProfile.tsx` to import from `@/shared/components` instead.

---

## Files to DELETE

### `src/features/users/components/LoadingState.tsx`

**Confirmed at:** research doc; `src/features/users/components/LoadingState.tsx`
**Action:** Delete the file entirely.
**Pre-condition:** Verify there are no remaining imports of this file in the codebase beyond `UserProfile.tsx` and `users/components/index.ts`. Run:
```
grep -rn "from.*users/components/LoadingState" src/
grep -rn "from.*users/components.*LoadingState" src/
```
Both must return zero results beyond the files being modified in this phase.

---

### `src/features/users/components/ErrorState.tsx`

**Confirmed at:** research doc; `src/features/users/components/ErrorState.tsx`
**Action:** Delete the file entirely.
**Pre-condition:** Verify no remaining consumers outside this phase's scope:
```
grep -rn "from.*users/components/ErrorState" src/
grep -rn "from.*users/components.*ErrorState" src/
```

---

## Files to MODIFY

### `src/features/users/components/index.ts`

**Current state (verified):**
```ts
export { default as UserCard } from './UserCard';
export { default as PersonalInformationSection } from './PersonalInformationSection';
export { default as LoadingState } from './LoadingState';         ← line 3 — REMOVE
export { default as ErrorState } from './ErrorState';            ← line 4 — REMOVE
export { UserSearchBar } from './UserSearchBar';
export { default as ManagerSelect } from './ManagerSelect';
export { default as VirtualizedManagerSelect } from './VirtualizedManagerSelect';
```

**Changes:**
1. **REMOVE** line 3: `export { default as LoadingState } from './LoadingState';`
2. **REMOVE** line 4: `export { default as ErrorState } from './ErrorState';`

**DO NOT CHANGE:**
- All other exports in the file

---

### `src/features/users/pages/UserProfile.tsx`

**Current state (verified line 5):**
```ts
import { UserCard, PersonalInformationSection, LoadingState, ErrorState } from '../components';
```

**Changes:**
1. **SPLIT** the import: remove `LoadingState` and `ErrorState` from the `../components` import
2. **ADD** new import for the shared versions:
   ```ts
   import { LoadingState, ErrorState } from '@/shared/components';
   ```

After the change, line 5 should read (keeping only what remains from `../components`):
```ts
import { UserCard, PersonalInformationSection } from '../components';
import { LoadingState, ErrorState } from '@/shared/components';
```

**DO NOT CHANGE:**
- All usages of `LoadingState` and `ErrorState` as JSX (component names unchanged)
- All usages of `UserCard` and `PersonalInformationSection`
- All other imports and state in `UserProfile.tsx`

---

## Tests for This Phase

No new test files. Verify:

| Verification | Command | Expected |
|---|---|---|
| LoadingState.tsx deleted | Check file does not exist | File absent |
| ErrorState.tsx deleted | Check file does not exist | File absent |
| No stale import of deleted files | `npm run type-check` | Zero TypeScript errors |
| UserProfile still renders | `npm run test:run` | No regressions |
| users barrel no longer exports deleted items | `grep "LoadingState" src/features/users/components/index.ts` | Zero results |

---

## Quality Gate

Before marking Phase 4 complete, ALL must pass:

- [ ] `npm run type-check` — zero TypeScript errors (deleted files have no remaining consumers)
- [ ] `npm run lint -- --max-warnings 0` — zero lint warnings
- [ ] `npm run format:check` — Prettier clean
- [ ] `npm run test:run` — full suite passes (no regressions)
- [ ] `src/features/users/components/LoadingState.tsx` does not exist
- [ ] `src/features/users/components/ErrorState.tsx` does not exist
- [ ] `grep "LoadingState" src/features/users/components/index.ts` returns zero results

---

## Human Review Checkpoint

Before proceeding to Phase 5, check:

- [ ] `UserProfile.tsx` imports `LoadingState` and `ErrorState` from `@/shared/components` (not from `../components`)?
- [ ] `UserProfile.tsx` still imports `UserCard` and `PersonalInformationSection` from `../components`?
- [ ] `users/components/index.ts` still exports `UserCard`, `PersonalInformationSection`, `UserSearchBar`, `ManagerSelect`, `VirtualizedManagerSelect`?
- [ ] No other file in the codebase imports `LoadingState` or `ErrorState` from `@/features/users`?
