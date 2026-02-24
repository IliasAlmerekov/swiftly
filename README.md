# Swiftly Helpdesk (Ticket System)

Swiftly Helpdesk is an internal ticket management frontend for creating, tracking, and resolving employee support requests.

## What It Does

- User authentication
- Ticket creation and ticket status tracking
- Ticket list and filtering
- Dashboard and support analytics
- Profile and role-based access flows

## Server Integration

This repository contains the frontend app.
It is connected to an external API server via `VITE_API_URL`.

Set `VITE_API_URL` in:

- `.env` (project-level), or
- your shell/profile environment (if you manage server URL there).

If not set, the app falls back to `http://localhost:4000/api`.

## Install

Container-first dependency install:

```bash
docker compose run --rm app npm ci
```

## Run

Container-first development server:

```bash
docker compose --profile dev up dev
```

Container-first quality commands:

```bash
docker compose run --rm lint
docker compose run --rm typecheck
docker compose run --rm test
docker compose run --rm build
docker compose run --rm app npm run format:check
```

Container-first end-to-end tests:

```bash
docker compose run --rm e2e
```

Optional local fallback (if container runtime is unavailable):

```bash
npm ci
npm run dev
npm run ci:lint
npm run ci:typecheck
npm run ci:test
npm run ci:build
```
