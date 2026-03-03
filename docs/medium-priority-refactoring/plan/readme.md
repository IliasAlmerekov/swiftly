# Implementation Plan: Medium Priority Refactoring

**Date:** 2026-03-03
**Design:** `docs/medium-priority-refactoring/design/`
**Research:** `docs/medium-priority-refactoring/research/medium-priority-refactoring.md`

---

## Summary

This plan consolidates three groups of duplicated code in the React SPA: (1) five files computing `isStaff` inline instead of calling the already-existing `useIsStaff()` hook; (2) `LoadingState` and `ErrorState` components duplicated between `features/users/components/` and inline in `TicketDetailPage.tsx`, resolved by creating canonical shared versions in `src/shared/components/`; (3) `useDashboardData` residing in `src/app/hooks/` instead of `src/features/dashboard/hooks/`. No API changes, no new TanStack Query keys, no MSW handler changes. Every phase is a pure file-level refactoring with zero behavioral change observable from outside the SPA.

---

## Phase Overview

| # | Phase Name | Layer | New Files | Modified Files | Deleted Files | Complexity |
|---|---|---|---|---|---|---|
| 1 | Shared LoadingState & ErrorState | Presentation | 3 | 0 | 0 | Low |
| 2 | TicketDetailPage full migration | Presentation | 0 | 1 | 0 | Low |
| 3 | isStaff consolidation — remaining pages | Presentation | 0 | 4 | 0 | Low |
| 4 | users/components cleanup | Presentation + Wiring | 0 | 2 | 2 | Low |
| 5 | ticketColumns STAFF_ROLES | Presentation | 0 | 1 | 0 | Low |
| 6 | Move useDashboardData | Application + Wiring | 1 | 3 | 1 | Low |

---

## Dependency Order

```
Phase 1 (shared components)
  └─▶ Phase 2 (TicketDetailPage — imports from shared)
  └─▶ Phase 4 (users cleanup — imports from shared)

Phase 3 (isStaff pages) — independent, can run after Phase 1 or in parallel
Phase 5 (ticketColumns) — independent, can run at any time
Phase 6 (useDashboardData move) — independent, can run at any time

REQUIRED ORDER:
  Phase 1 before Phase 2
  Phase 1 before Phase 4
  Phase 2 must complete before Phase 4 (TicketDetailPage no longer imports from users/components)
  Phases 3, 5, 6 have no inter-dependencies
```

---

## Conventions Confirmed from Research

- **Shared hooks:** `src/shared/hooks/{hookName}.ts` — confirmed, `useIsStaff.ts` lives there
- **Feature hooks:** `src/features/{name}/hooks/{hookName}.ts` — confirmed, `useGreeting.ts` in `features/dashboard/hooks/`
- **Feature barrel:** `src/features/{name}/index.ts` — confirmed for all features; all public exports go through this file
- **Shared components** (non-UI): placed directly in `src/shared/components/` — confirmed by `ErrorBoundary.tsx` at root of `shared/components/`
- **`useIsStaff()` return:** `{ isStaff, isAdmin, isSupport, isRoleReady, role }` — all fields available for destructuring
- **`STAFF_ROLES`:** `const STAFF_ROLES: UserRole[] = ['support1', 'admin']` at `src/shared/security/access-matrix.ts` line 24 — confirmed exported
- **Test render helper:** `render()` from `@/test/test-utils` — confirmed used throughout
- **No base classes** for React components — this project uses plain function components with no base class
- **No existing `src/shared/components/index.ts`** — must be created in Phase 1 as a barrel for the new shared components

---

## Quality Gates (all phases)

```bash
npm run type-check                    # zero TypeScript errors
npm run lint -- --max-warnings 0      # ESLint
npm run format:check                  # Prettier
npm run test:run                      # full Vitest suite — no regressions
npm run build                         # final gate after Phase 6
```
