# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-02-24

### Added

- Release readiness checklist: `docs/release-checklist.md`.
- Automated performance budget gate: `scripts/check-perf-budget.mjs` (`npm run perf:budget`).
- Shared observability hook for runtime error reporting: `src/shared/lib/observability.ts`.
- New tests for boundary/observability behavior:
  - `src/shared/components/ErrorBoundary.test.tsx`
  - `src/shared/lib/observability.test.ts`
- Migration notes for this release: `docs/migration-notes.md`.

### Changed

- Error observability wired into:
  - `src/app/provider.tsx` (`ErrorBoundary` onError path)
  - `src/shared/lib/errorHandler.ts` (query/mutation error path)
  - `src/shared/api/client.ts` (API request/upload failure path)
- Updated release performance notes with measured bundle/chunk metrics:
  - `docs/perf-notes.md`.
- Improved test determinism under pre-push/CI load:
  - `src/features/auth/hooks/useLogin.test.tsx`.

### Fixed

- Prevented host-environment dependency failures in git hooks by running checks through Docker Compose.
- Removed disallowed GitHub Actions usages from CI workflow to satisfy repository action policy.
- Reduced pre-push flakes in theme provider test path:
  - `src/provider/theme-provider.test.tsx`.

## [1.0.6] - 2026-02-20

### Added

- ADR for frontend dependency baseline: `docs/adr/0002-frontend-dependency-rules.md`.
- Explicit feature contracts for dashboard presentation layer via typed props in `src/features/dashboard/types/dashboard.ts`.
- App-level dashboard orchestration:
  - `src/app/hooks/useDashboardData.ts`
  - `src/app/pages/DashboardPage.tsx`
- Regression tests for dashboard role rendering and access control: `src/app/pages/DashboardPage.test.tsx`.

### Changed

- Enforced architecture import boundaries in ESLint:
  - Added `import/no-restricted-paths` zones for `auth`, `tickets`, `users`, `dashboard`.
  - Strengthened `no-restricted-imports` for `shared -> features/app` and `features -> app`.
  - All architecture restrictions are configured as `error`.
- Updated CI lint gates to block merges on lint issues:
  - `.gitlab-ci.yml`: `npm run lint -- --max-warnings 0`
  - `.github/workflows/ci.yml`: `npm run lint -- --max-warnings 0`
- Extended architecture documentation with frontend import rules and allowed/forbidden examples in `docs/ARCHITECTURE.md`.
- Refactored dashboard feature to remove direct dependencies on `tickets/users`:
  - Moved data fetching and cross-feature composition to `app` layer.
  - Converted dashboard components/charts to receive data and callbacks via props only.
  - Updated router to use app-owned dashboard page (`src/app/router.tsx`).

### Fixed

- Removed all direct imports `src/features/dashboard/** -> src/features/tickets/**` and `src/features/dashboard/** -> src/features/users/**`.
- Resolved architecture lint violations reported by `import/no-restricted-paths` for dashboard.

## [1.0.5] - 2025-09-27

- Started rewriting the project to use React Query for data fetching and caching
- Refactored the ViewSupportStatus.tsx component: now uses React Query, moved state management from parent to child components, and fixed excessive rerendering.
- Performed extensive refactoring across the codebase to optimize performance and maintainability.

## [1.0.4] - 2025-09-26

## Fixed

- (Ticket Table): Gurded the owner cells so we never read owner.name when it's missing, adding safe fallbacks for the name, avatar URL, initials, and the admin user link.
- Switched the row avatar to the shared UI wrapper so we get the built-in fallback rendering and only enable the owner link when an id is available

## [1.0.3] - 2025-09-25

## Fixed

- Configuration gitlab-ci to trigger pipelines only for tags

## Refactor

- Refactoring User Profile to make responsive for mobile devices

## [1.0.2] - 2025-09-25

## Fixed

- Configuration gitlab-ci and pipelines

## Refactor

- Small refactoring to optimization

## [1.0.1] - 2025-09-25

### Fixed

- Prettier formatting to satisfy CI
- Remove manualChunks from vite.config

## [1.0.0] - 2025-09-25

### Overview

- Major migration from the previous React + CSS Modules codebase to a new project scaffold using Vite, TypeScript, Tailwind CSS, and shadcn/ui components. Most UI pieces were reimplemented using Radix primitives and shadcn/ui patterns for consistency, accessibility, and themeability.

### Added

- New Vite + React + TypeScript application scaffold with path aliasing (`@` -> `src`).
- Tailwind CSS v4 setup with `@tailwindcss/vite` for build-time integration.
- shadcn/ui component suite under `src/shared/components/ui/*` (buttons, inputs, selects, sheets, menus, tooltip, card, badge, avatar, form, chart helpers and more).
- Theme provider and dark mode support (`next-themes`, `src/provider/theme-provider.tsx`).
- Routing with `react-router-dom` and a feature-first structure (auth, users, tickets, dashboard).
- Forms using `react-hook-form` + `zod` resolvers for validation.
- Data tables and virtualization with `@tanstack/react-table` and `@tanstack/react-virtual`.
- Charts via `recharts` and chart helpers under `src/shared/components/ui/chart.tsx`.
- Drag-and-drop utilities via `@dnd-kit/*` for interactive UI.
- CI/linting/formatting setup improvements: ESLint 9, Prettier, Stylelint, Husky + Commitlint, and Prettier Tailwind plugin.

### Changed

- Replaced legacy CSS Modules with Tailwind CSS utility classes across the app.
- Rewrote UI components using accessible Radix primitives and shadcn/ui composition for a consistent design system.
- Simplified build and dev experience with Vite; optimized chunks in `vite.config.ts` for common vendor splits (react, router, recharts, radix, tanstack, etc.).
- Updated folder structure to feature-based domains (`src/features/*`) with shared UI and hooks (`src/shared/*`).
- Updated authentication, users, tickets, and dashboard pages to the new component system and hooks.

### Removed

- Legacy CSS Modules and styles tied to the previous project structure.
- Ad-hoc UI components that duplicated functionality now provided by shadcn/ui.

### Breaking Changes

- Styling is no longer powered by CSS Modules; all styles now rely on Tailwind CSS utilities and shadcn/ui patterns.
- Component API changes: several components have different props/structure to align with shadcn/ui and Radix accessibility standards.
- File and import paths changed to the new feature-first layout and the `@` alias.

### Migration Notes

- When bringing over code from the old project, replace CSS Module classnames with Tailwind classes and adopt shadcn/ui components where applicable.
- Prefer `@/shared/components/ui/*` components for common primitives to ensure consistent styling and behavior.
- Use `react-hook-form` + `zod` for form handling and validation to match the new patterns.
- Verify routes and imports after moving files to the `src/features/*` structure and using the `@` alias.

### Deployment

- Netlify configuration is tracked in `netlify.toml`. Review environment variables and build commands to match the new Vite setup.

### Internal Tooling

- Linting, formatting, and commit checks updated. Use:
  - `npm run lint`, `npm run lint:fix`
  - `npm run lint:css`, `npm run lint:css:fix`
  - `npm run format`, `npm run format:check`
