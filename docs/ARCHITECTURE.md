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

## Anti-Patterns

- God services
- Anemic domain with logic in controllers
- Over-abstraction with single implementation
