# C4 Containers — Medium Priority Refactoring

**Date:** 2026-03-03
**Note:** This refactoring is entirely within the React SPA. No new containers, no infrastructure changes.

---

## Containers Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│  React SPA (Vite 7 / React 19 / TypeScript 5.9)                  │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  src/shared/                                                 │  │
│  │    hooks/useIsStaff.ts         ← MODIFIED (gains consumers) │  │
│  │    components/LoadingState.tsx ← NEW                        │  │
│  │    components/ErrorState.tsx   ← NEW                        │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  src/features/dashboard/                                     │  │
│  │    hooks/useDashboardData.ts   ← NEW (moved from app/hooks) │  │
│  │    index.ts                    ← MODIFIED (adds export)     │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  src/features/tickets/ + src/features/users/                 │  │
│  │    (multiple pages/components) ← MODIFIED (use shared)      │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  src/app/hooks/                                              │  │
│  │    useDashboardData.ts         ← DELETED                    │  │
│  └─────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  Test Environment                                                  │
│  MSW v2 (mock service worker)    ← no new handlers needed        │
│  Vitest + Testing Library        ← new tests for shared comps    │
└──────────────────────────────────────────────────────────────────┘
```

## Container Inventory

| Container | Status | Change |
|---|---|---|
| React SPA (Vite/React 19) | Existing | Internal files modified — no container-level change |
| Helpdesk Backend | Existing | **Not touched** |
| MSW (test env) | Existing | No new handlers needed (no new API calls) |
| Redis / BullMQ / S3 | N/A | Not involved |
