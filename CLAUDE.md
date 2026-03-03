# CLAUDE.md — AI Development Workflow

This project uses a 4-phase AI-assisted development workflow.
All workflow documents live in `.claude/`.

---

## Stack

| Layer        | Technology                                                              |
| ------------ | ----------------------------------------------------------------------- |
| Framework    | React 19 + TypeScript 5.9                                               |
| Build        | Vite 7                                                                  |
| Routing      | React Router v7                                                         |
| Server State | TanStack Query v5                                                       |
| Forms        | React Hook Form + Zod                                                   |
| UI           | shadcn/ui (Radix UI) + Tailwind CSS v4                                  |
| Charts       | Recharts                                                                |
| HTTP         | Custom fetch client + automatic CSRF retry (`src/shared/api/client.ts`) |
| Unit Tests   | Vitest + Testing Library + MSW v2                                       |
| E2E          | Playwright (Docker only)                                                |
| Linting      | ESLint + Stylelint + Prettier                                           |

---

## Architecture

```
src/
  features/             ← Feature-first modules
    auth/               ← Login, Register, AuthBackground, CSRF
    tickets/            ← Ticket CRUD, AI chat overlay
    users/              ← User profiles, avatar management
    dashboard/          ← Analytics, charts
  shared/
    api/                ← HTTP client, CSRF, auth endpoints, contracts.ts
    components/
      ui/               ← shadcn/ui components (never edit directly)
      auth/             ← AccessGuard, ProtectedRoute
      layout/           ← AppLayout, Sidebar, TabPageLayout
    context/            ← AuthContext
    hooks/              ← Cross-feature hooks
    lib/                ← apiErrors, observability, sanitizeRichText
    security/           ← access-matrix (role-based access control)
    utils/              ← jwt, misc
  app/                  ← Router (react-router v7), providers
  config/               ← paths.ts, env.ts
  test/                 ← MSW server, test-utils.tsx, mock db
```

**Path alias:** `@/` → `src/`

---

## Workflow Overview

```
research → design → [HUMAN REVIEW] → plan → implement → [HUMAN REVIEW]
```

---

## Commands

### Phase 1 — Research

```
Command:  /research_codebase {task description}
Agent:    research-lead (claude-sonnet-4-6) + research-sub agents (claude-haiku-4-5)
Output:   .claude/research/{task-slug}.md
```

### Phase 2 — Design

```
Command:  /design_feature {task-slug}
Input:    .claude/research/{task-slug}.md
Agent:    architect (claude-sonnet-4-6)
Output:   .claude/design/{task-slug}/
            01_c4_context.md
            02_c4_containers.md
            03_c4_components.md
            04_data_flow.md
            05_sequence.md
            06_api_contracts.md
            07_data_models.md
            08_test_strategy.md
            09_adr.md

!! HUMAN MUST REVIEW AND APPROVE .claude/design/{slug}/ BEFORE NEXT STEP !!
```

### Phase 3 — Plan

```
Command:  /plan_feature {task-slug}
Input:    .claude/design/{task-slug}/ + .claude/research/{task-slug}.md
Agent:    planner (claude-sonnet-4-6)
Output:   .claude/plan/{task-slug}/
            readme.md
            phase_01.md … phase_N.md

!! HUMAN MUST REVIEW AND APPROVE .claude/plan/{slug}/ BEFORE NEXT STEP !!
```

### Phase 4 — Implement

```
Command:  /implement_feature {task-slug}
Input:    .claude/plan/{task-slug}/ + .claude/design/{task-slug}/ + .claude/research/{task-slug}.md
Agents:   coder, reviewer, tester, security (all claude-sonnet-4-6)
Output:   actual code files + test files

!! HUMAN MUST DO FINAL CODE REVIEW BEFORE MERGING !!
```

---

## Directory Structure

```
.claude/
  commands/
    research_codebase.md   ← /research_codebase — research lead + sub-agent orchestration
    design_feature.md      ← /design_feature — architect agent orchestration
    plan_feature.md        ← /plan_feature — planner agent orchestration
    implement_feature.md   ← /implement_feature — coder + reviewer + tester + security
  agents/
    research-lead.md       ← Lead Research Agent prompt
    research-sub.md        ← Sub-Agent prompt (haiku, read-only)
    architect.md           ← Architect Agent prompt
    planner.md             ← Planning Agent prompt
    coder.md               ← Implementor Agent prompt
    reviewer.md            ← Code Quality + Architecture Reviewer prompt
    tester.md              ← Builder/Tester Agent prompt
    security.md            ← Security Reviewer prompt
  research/
    {task-slug}.md         ← generated research document
  design/
    {task-slug}/           ← generated + human-reviewed design docs (9 files)
  plan/
    {task-slug}/           ← generated implementation plan (readme + phase files)
```

---

## Workflow Rules

1. NEVER skip the human review after Design
2. NEVER skip the human review after Plan
3. NEVER let implementation proceed past a failed quality gate
4. Research agents report facts only — no opinions, no suggestions
5. Design patterns from research MUST be followed in implementation
6. Each phase reads the previous phase's output — never regenerate from scratch
7. NEVER cross feature boundaries — only import through `features/{name}/index.ts`
8. NEVER place components inside `hooks/` directories
9. NEVER modify `shared/components/ui/` directly — use `npx shadcn add`
10. Git commits MUST NOT contain Co-authored-by or any AI attribution

---

## Model Usage

| Agent                             | Model                                |
| --------------------------------- | ------------------------------------ |
| Research sub-agents               | `claude-haiku-4-5` — fast, read-only |
| Research lead, Architect, Planner | `claude-sonnet-4-6`                  |
| Coder, Reviewer, Tester, Security | `claude-sonnet-4-6`                  |

---

## Quality Gates

All must pass before any commit. Implement agent runs these after each phase.

```bash
npm run type-check                    # tsc --noEmit
npm run lint -- --max-warnings 0      # ESLint
npm run lint:css                      # Stylelint
npm run format:check                  # Prettier
npx vitest run {test-file}            # phase-specific tests
npm run test:run                      # full suite (no regressions)
npm run build                         # final gate (phase 7+)
```

### CI Pipeline (GitHub Actions)

```
security_ioc_scan → dependency_audit → lint → typecheck → test → build → e2e
```

| Job       | Commands                                                  |
| --------- | --------------------------------------------------------- |
| lint      | `npm run lint -- --max-warnings 0` + stylelint + prettier |
| typecheck | `npm run type-check`                                      |
| test      | `npm run test:run` + `npm run test:coverage`              |
| build     | `npm run build`                                           |
| e2e       | Playwright chromium (requires Docker stack)               |

---

## Frontend Layer Map (for planning phases)

| Phase | Layer          | Equivalent                                                  |
| ----- | -------------- | ----------------------------------------------------------- |
| 1     | Domain         | TypeScript types + Zod schemas                              |
| 2     | Ports          | API contracts (`contracts.ts`) + shared interfaces          |
| 3     | Application    | TanStack Query hooks (`use{Feature}.ts`)                    |
| 4     | Infrastructure | API fetch functions (`features/{name}/api/`) + MSW handlers |
| 5     | Presentation   | React components + page components                          |
| 6     | Wiring         | `features/{name}/index.ts` exports + router registration    |

---

## Key Patterns

```ts
// HTTP — always use the shared client
import { createApiClient } from '@/shared/api/client';
// Auto-handles CSRF token fetch + retry on CSRF_INVALID

// Server state — TanStack Query key factory
export const {feature}Keys = {
  all: () => ['{feature}'] as const,
  detail: (id: string) => ['{feature}', id] as const,
};

// Forms
const schema = z.object({ field: z.string().min(1) });
const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

// Access control — component level
<AccessGuard access="component.{feature}.{action}">...</AccessGuard>
// Access control — logic level
if (!canAccess(user.role, 'feature.{feature}.{action}')) return null;

// Tests — always use test-utils (wraps with QueryClient, Router, AuthContext)
import { render } from '@/test/test-utils';
// MSW handlers live in src/test/mocks/handlers/{feature}.ts
```
