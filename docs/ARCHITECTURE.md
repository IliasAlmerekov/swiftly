# Architecture Guidelines

## Default Architecture

- Modular Monolith
- Clear separation of concerns:
  - Domain (pure business logic)
  - Application / Use Cases
  - Adapters (HTTP, DB, CLI)
  - Infrastructure (frameworks, vendors)

## Layer Rules

- Dependencies point inward only
- Domain has NO framework or IO dependencies
- Controllers are thin (no business logic)

## Frontend Import Rules

- Layer direction: `shared -> features -> app`
- Forbidden: `shared -> features`, `shared -> app`, `features -> app`, `featureA -> featureB`
- Feature public API: import feature modules only via `src/features/<feature>/index.ts` (`@/features/<feature>`)

Allowed import examples:

- `src/features/tickets/...` -> `@/shared/...`
- `src/app/router.tsx` -> `@/features/auth`

Forbidden import examples:

- `src/shared/...` -> `@/features/tickets`
- `src/shared/...` -> `@/app/router`
- `src/features/dashboard/...` -> `@/app/router`
- `src/features/dashboard/...` -> `@/features/tickets/api`

## When to Introduce More Complexity

Introduce microservices ONLY if:

- Independent deployment is required
- Independent scaling is required
- Teams are organizationally independent
- Operational cost is justified

## Patterns

- Prefer composition over inheritance
- Prefer explicit over implicit behavior
- Prefer data-in / data-out functions

## React Architecture Rules

- Treat components as pure functions of props/state/context; keep side effects out of render.
- Keep state as close as possible to where it is used; avoid duplicated/derived state storage.
- Effects are for syncing with external systems only (network, DOM APIs, subscriptions, timers).
- Prefer feature-level public APIs and keep cross-feature coupling one-directional through shared contracts.

## UI State Boundaries

- Separate server state, UI state, and domain rules; do not mix transport concerns into presentation components.
- Keep routing, auth guards, and access checks explicit at app boundaries, not hidden in low-level UI primitives.

## Anti-Patterns

- God services
- Anemic domain with logic in controllers
- Over-abstraction with single implementation
