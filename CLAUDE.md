# AI Consult

Qualitative research and consulting engagement platform with AI-assisted analysis.

## Project Structure

Monorepo with two independent apps:

- `frontend/` — Next.js 16 (App Router, React 19, TypeScript strict mode)
- `backend/` — FastAPI (SQLAlchemy 2, LiteLLM for multi-provider AI)

Each has its own SQLite database at `<app>/data/consult.db`.

## Frontend

### Tech Stack

- **Next.js 16.1** with App Router (`src/app/`)
- **React 19** — client components with `"use client"` directive
- **TypeScript** — strict mode, import alias `@/*` -> `./src/*`
- **Tailwind CSS v4** — utility-first, custom CSS variables in `globals.css`
- **SQLite** — Node.js experimental `node:sqlite` (`DatabaseSync`)
- **pnpm** — package manager

### Key Paths

- `src/lib/db.ts` — database setup with inline auto-migration
- `src/lib/types.ts` — shared TypeScript interfaces
- `src/lib/api.ts` — API client functions
- `src/components/` — PascalCase component files
- `src/app/api/` — Next.js route handlers (`route.ts`)
- `src/app/engagements/` — main engagement pages

### Running

```bash
cd frontend && pnpm dev   # http://localhost:3000
```

### Conventions

- Pages: `page.tsx`, Layouts: `layout.tsx`, API routes: `route.ts`
- Components: PascalCase filenames (e.g. `Sidebar.tsx`)
- Libs/utils: camelCase filenames (e.g. `api.ts`)
- Inline SVG icons — no icon library
- Data fetching in `useEffect` with `useState`
- DB queries use parameterized `?` placeholders
- CSS variables: `--navy`, `--accent`, `--sidebar-width` (see `globals.css`)

## Backend

### Tech Stack

- **FastAPI** with Uvicorn
- **SQLAlchemy 2** (async via aiosqlite)
- **LiteLLM** — multi-provider AI (OpenAI, Anthropic, Google, Mistral, Ollama)
- **Pydantic** — request/response schemas

### Key Paths

- `app/main.py` — app setup, CORS, router registration
- `app/models.py` — SQLAlchemy models
- `app/schemas.py` — Pydantic schemas
- `app/routers/` — API endpoint modules
- `app/config.py` — settings via pydantic-settings (loads `.env`)

### Running

```bash
cd backend && uvicorn app.main:app --reload   # http://localhost:8000
```

### Environment

Copy `.env.example` to `.env`. Key vars: `DEBUG`, `FRONTEND_URL`.

## Data Model

Engagement > Phases, Hypotheses, Stakeholders > Interviews > Coded Segments
Codes > Coded Segments (tagging system for qualitative analysis)
Insights generated from coded data

## Specification

`specification.md` (project root) is the authoritative specification for this application. Always consult it when implementing features or making architectural decisions. If implementation work reveals that the spec should be updated (e.g. a new feature was added, a requirement changed), propose the update but **never modify the spec without explicit user approval**.

## Guidelines

- Don't auto-commit — only commit when explicitly asked
- Keep solutions simple; avoid over-engineering
- Use Tailwind utilities; no external UI component libraries
- Prefer editing existing files over creating new ones
