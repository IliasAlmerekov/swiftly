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

```bash
npm install
```

## Run

Local development:

```bash
npm run dev
```

Production build preview:

```bash
npm run build
npm run preview
```

Container workflow (recommended for tooling consistency):

```bash
docker compose up -d
docker compose exec app npm install
docker compose exec app npm run dev
```
