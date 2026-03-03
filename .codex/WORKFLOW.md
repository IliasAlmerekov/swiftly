# Codex Workflow (No Commands)

This project uses the same 4-phase flow as `.claude`, but without slash commands.
In Codex, start a phase by writing a plain prompt in chat.

## How to trigger phases in Codex

Use one of these prompt patterns:

- `Phase 1 Research: <task>`
- `Phase 2 Design: <task-slug>`
- `Phase 3 Planning: <task-slug>`
- `Phase 4 Implement: <task-slug>`

## Artifacts

- Feature folder: `docs/{task-slug}/`
- Research: `docs/{task-slug}/research/`
- Design: `docs/{task-slug}/design/`
- Plan: `docs/{task-slug}/plan/`
- If missing, create the feature folder and all three phase subfolders before writing artifacts.

## Phase mapping to Codex agents

- Phase 1 Research: `explorer` (facts-only, read-only)
- Phase 2 Design: `reviewer` (architecture docs + ADR + human checkpoint)
- Phase 3 Planning: `tester` (phased implementation plan + test strategy)
- Phase 4 Implementation: `worker` + `reviewer` + `tester`

## Human checkpoints (mandatory)

- Design must be reviewed and approved by human before Planning.
- Plan must be reviewed and approved by human before Implementation.
- Final implementation must pass quality gates before merge.

## Quality gates

- `npm run type-check`
- `npm run lint -- --max-warnings 0`
- `npm run lint:css`
- `npm run format:check`
- `npm run test:run`
- `npm run build`

Container-first equivalents are preferred when Docker runtime is available.
