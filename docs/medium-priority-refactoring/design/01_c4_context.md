# C4 Context — Medium Priority Refactoring

**Date:** 2026-03-03
**Scope:** Pure frontend refactoring — no backend changes, no new API endpoints, no new containers.

---

## System Context Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        React SPA                                  │
│                    (swiflty-helpdesk)                             │
│                                                                    │
│   ┌──────────────────┐       ┌───────────────────────────────┐   │
│   │  Browser User    │──────▶│     Helpdesk Backend           │   │
│   │  (authenticated) │       │  (REST API — NOT MODIFIED)    │   │
│   └──────────────────┘       └───────────────────────────────┘   │
│                                                                    │
│   ┌──────────────────┐                                            │
│   │  Developer / CI  │                                            │
│   │  (Vitest, ESLint,│                                            │
│   │   TypeScript)    │                                            │
│   └──────────────────┘                                            │
└──────────────────────────────────────────────────────────────────┘
```

## Context Participants

| Participant | Role in This Refactoring |
|---|---|
| Browser User (any role) | Receives no visible UI change. Staff role resolution becomes internally consistent; no functional difference is observable externally. |
| Helpdesk Backend | **Not touched.** Zero API endpoint changes. All existing API contracts are preserved. |
| Developer / CI pipeline | Primary beneficiary. Eliminates 5 duplicated role-check patterns, 2 divergent loading/error component implementations, and 1 misplaced hook. |

## Scope Boundaries

**IN scope:**
- `src/shared/hooks/useIsStaff.ts` — gains consumers
- `src/shared/components/` — gains `LoadingState.tsx`, `ErrorState.tsx`
- `src/features/dashboard/hooks/` — gains `useDashboardData.ts` (moved)
- All files importing inline `isStaff` logic — updated to use hook
- `src/app/hooks/useDashboardData.ts` — deleted after move

**OUT of scope:**
- Backend API — untouched
- shadcn/ui components (`shared/components/ui/`) — untouched
- Auth logic, CSRF, routing — untouched
- Any feature other than tickets, users, dashboard (as listed above)
