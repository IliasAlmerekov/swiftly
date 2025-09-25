# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
