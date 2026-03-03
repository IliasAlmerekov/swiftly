# API Contracts — Medium Priority Refactoring

**Date:** 2026-03-03

---

## No API Changes

This refactoring is **purely internal to the React SPA**.

- Zero new API endpoints
- Zero modified API endpoints
- Zero deleted API endpoints
- Zero changes to request/response shapes
- Zero changes to CSRF token flow
- Zero changes to authentication headers

All existing API contracts in `src/shared/api/contracts.ts` remain untouched.

All TanStack Query keys used by `useDashboardData` remain unchanged:
- `['dashboard', 'user-tickets']`
- `['dashboard', 'all-tickets']`
- `['dashboard', 'tickets-today']`
- `['dashboard', 'support-users']`
- `['dashboard', 'user-ticket-stats']`
- `['dashboard', 'ai-stats']`
- `['dashboard', 'monthly-ticket-stats']`

## MSW Handlers

No new MSW handlers are required. All existing handlers in `src/test/mocks/handlers/` remain unchanged.
