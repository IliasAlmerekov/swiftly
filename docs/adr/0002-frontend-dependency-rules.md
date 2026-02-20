# ADR-0002: Frontend Dependency Rules and Feature Public API

## Context

The frontend currently has direct imports across feature boundaries and deep imports from `app` into feature internals. This increases coupling and makes safe refactoring harder.

For Stage 1 (architectural baseline), we need explicit dependency rules, one public API convention for each feature, and a migration checklist for current violations.

## Decision

### 1. Target layers

Dependency direction is fixed to:

`shared -> features -> app`

Allowed usage:

- `shared`: can depend only on `shared`.
- `features`: can depend on `shared`.
- `app`: can depend on `features` and `shared`.

### 2. Forbidden directions

The following dependencies are prohibited:

- `shared -> features`
- `features -> app`
- `featureA -> featureB`

### 3. Feature public API format

Each feature must expose a single external entry point:

- `src/features/<feature>/index.ts`

Rules:

- External consumers (`app`, other features, shared modules) can import only from `@/features/<feature>`.
- Deep imports to feature internals are forbidden, for example `@/features/<feature>/pages/...` or `@/features/<feature>/api/...`.
- Internal modules inside the same feature should use relative imports.

## Migration checklist (current violating files)

Baseline captured on 2026-02-20 from import scan:

- `rg -n "@/features/" src/app src/features src/shared --glob "*.ts" --glob "*.tsx"`

### A. `app` deep-imports feature internals

- [ ] `src/app/router.tsx`:
  - replace `@/features/auth/pages/LoginPage` with `@/features/auth`
  - replace `@/features/auth/pages/RegisterPage` with `@/features/auth`
  - replace `@/features/dashboard/pages/DashboardPage` with `@/features/dashboard`
  - replace `@/features/tickets/pages/TicketDetailPage` with `@/features/tickets`
  - replace `@/features/users/pages/UserProfile` with `@/features/users`

### B. Cross-feature dependencies (`featureA -> featureB`)

- [ ] `src/features/dashboard/components/DashboardTabContent.tsx`
- [ ] `src/features/dashboard/components/RecentTickets.tsx`
- [ ] `src/features/dashboard/components/UserTicketCard.tsx`
- [ ] `src/features/dashboard/components/ViewSupportStatus.tsx`
- [ ] `src/features/dashboard/components/charts/AnalyticsChart.tsx`
- [ ] `src/features/dashboard/components/charts/TicketStatusChart.tsx`
- [ ] `src/features/dashboard/components/charts/TicketsOfMonth.tsx`
- [ ] `src/features/dashboard/components/charts/UserTicketStats.tsx`

Required action for each file above:

- move composition to `app` layer, or
- expose required contract through stable shared abstractions and remove direct `feature -> feature` imports.

### C. `shared -> features`

- [x] No violations found in current baseline scan.

## Definition of Done (Stage 1: Architectural Baseline)

Stage 1 is done when all items below are true:

- [ ] This ADR is approved and merged.
- [ ] Layer model and forbidden dependency directions are explicitly documented (this ADR).
- [ ] Feature public API rule (`index.ts` as single external entry point) is documented (this ADR).
- [ ] Current violating files are listed with migration actions (this ADR checklist).
- [ ] Reproducible scan commands are documented and can be rerun by the team.

Out of scope for Stage 1:

- actual code migration and import rewrites (handled in next stage).

## Alternatives

- Keep current implicit conventions and fix violations ad hoc.
- Allow cross-feature imports with manual review only.

These were rejected because they do not provide enforceable, predictable architectural boundaries.

## Consequences

Positive:

- Lower coupling between modules.
- Safer refactoring and clearer ownership per layer.
- A clear migration backlog for Stage 2.

Trade-offs:

- Some existing compositions must move to `app` or be redesigned through shared contracts.
- Short-term overhead to migrate existing imports.
