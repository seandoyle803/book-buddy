# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains the BookBuddy reading habit app — a premium, calm, dark-mode app for building consistent reading habits.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: Supabase (PostgreSQL + Auth + RLS) — NOT the Replit local database
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite (wouter routing, React Query, shadcn/ui, Tailwind CSS)
- **Auth**: Supabase Auth (browser client via @supabase/supabase-js)

## Artifacts

- **bookbuddy** (`artifacts/bookbuddy/`) — Main BookBuddy frontend (React + Vite), served at `/`
- **api-server** (`artifacts/api-server/`) — Express API backend, served at `/api`

## Environment Variables (Secrets)

- `SUPABASE_URL` — Your Supabase project URL
- `SUPABASE_ANON_KEY` — Your Supabase anon/public key

The Vite frontend accesses these via `import.meta.env.SUPABASE_URL` and `import.meta.env.SUPABASE_ANON_KEY` (envPrefix set to include `SUPABASE_`).

## Supabase Setup — IMPORTANT

Before the app works, you must apply the SQL schema to your Supabase project:
1. Open `supabase-schema.sql` in the repo root
2. Copy the entire contents into your Supabase SQL Editor
3. Run it — this creates the `users`, `books`, `reading_sessions` tables, RLS policies, and the auth trigger

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/bookbuddy run dev` — run frontend locally

## BookBuddy App Structure

### Frontend (`artifacts/bookbuddy/src/`)
- `lib/supabase.ts` — Supabase browser client + TypeScript types
- `contexts/AuthContext.tsx` — Auth state, signIn/signUp/signOut, profile fetch
- `lib/calculations.ts` — Reading streak, weekly activity, consistency helpers
- `pages/` — All app pages (landing, login, signup, onboarding, dashboard, session, history, books, settings)
- `components/layout/` — AppLayout (sidebar + mobile nav), ProtectedRoute, AuthLayout
- `hooks/` — use-books, use-sessions custom hooks

### Backend (`artifacts/api-server/src/`)
- `lib/supabase.ts` — Supabase server-side client
- `routes/dashboard.ts` — GET /api/dashboard/summary (computes streak, weekly stats, all-time totals)

### Database (Supabase)
Tables: `users`, `books`, `reading_sessions`
- RLS enforces per-user data isolation using `auth.uid()`
- Auth trigger `on_auth_user_created` auto-creates a `public.users` row on sign-up

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
