<div align="center">

<pre>
██████╗ ███████╗██████╗ ██╗   ██╗ ██████╗ ███╗   ███╗██╗███╗   ██╗██████╗
██╔══██╗██╔════╝██╔══██╗██║   ██║██╔════╝ ████╗ ████║██║████╗  ██║██╔══██╗
██║  ██║█████╗  ██████╔╝██║   ██║██║  ███╗██╔████╔██║██║██╔██╗ ██║██║  ██║
██║  ██║██╔══╝  ██╔══██╗██║   ██║██║   ██║██║╚██╔╝██║██║██║╚██╗██║██║  ██║
██████╔╝███████╗██████╔╝╚██████╔╝╚██████╔╝██║ ╚═╝ ██║██║██║ ╚████║██████╔╝
╚═════╝ ╚══════╝╚═════╝  ╚═════╝  ╚═════╝ ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═════╝
</pre>

**semantic bug memory** — *have I seen this bug before?*

</div>

Paste an error, find matching fixes from past bugs across all your projects. Powered by a Cognee knowledge graph with vector + graph memory.

---

## Quick Start

```bash
# Start the Cognee knowledge graph engine
docker compose up -d

# Start the backend (port 3001)
cd backend && bun install && bun run dev

# In another terminal — start the frontend (port 5173)
cd frontend && bun install && bun run dev
```

Seed some sample data:

```bash
cd backend && bun run seed
```

Open [localhost:5173](http://localhost:5173) and paste a stack trace.

---

## Architecture

| Layer | Stack | Role |
|-------|-------|------|
| Frontend | React 19 + Vite 8 + Tailwind v4 | SPA for searching and logging bugs |
| Backend | Hono 4 + Bun runtime | REST API, business logic, Cognee integration |
| Knowledge Graph | Cognee + LanceDB + SQLite | Semantic/vector search + entity relationships |
| Local Store | `bugs.json` | Structured metadata for fast fingerprint lookups |

---

## How It Works

1. **Log a bug** — paste an error + fix. The error is normalized (strips timestamps, addresses, paths), fingerprinted (MD5), and stored in Cognee + `bugs.json`.

2. **Search for a bug** — paste a new error. First checks for an exact fingerprint match (instant). If none found, queries Cognee's knowledge graph via `GRAPH_COMPLETION` for semantic similarity.

3. **Results ranked** — each result is scored by `similarity × Wilson score`. Wilson's lower bound penalizes low sample sizes so a 50-confirmed fix ranks higher than a single lucky guess.

4. **Feedback** — mark a fix as "worked" or "didn't apply". Confidence updates are factored into future searches.

---

## Routes

| Path | Page |
|------|------|
| `/` | Landing page |
| `/bugs` | Search memory / log a bug |
| `/how-it-works` | System architecture deep dive |

---

## Scripts

| Location | Script | Command |
|----------|--------|---------|
| `backend/` | dev | `bun run --hot src/index.ts` |
| `backend/` | seed | `bun run src/seed.ts` |
| `backend/` | reindex | `bun run src/reindex.ts` |
| `frontend/` | dev | `vite` |
| `frontend/` | build | `tsc -b && vite build` |
| `frontend/` | lint | `eslint .` |

---

## Tech Stack

| Category | Tools |
|----------|-------|
| Frontend | React 19, Vite 8, Tailwind v4, TanStack Router, Motion, Lucide, React Flow |
| Backend | Hono 4, Bun, TypeScript, Axios |
| Storage | Cognee (knowledge graph), LanceDB (vectors), SQLite (metadata), `bugs.json` |
| Infra | Docker Compose, Gemini 2.5 Flash, Gemini Embedding 001 |

---

## Seed Data

`bun run seed` creates 20 realistic bugs across 4 projects:

- **proj-alpha** — TypeScript / React (5 bugs)
- **proj-beta** — Python / FastAPI (5 bugs)
- **proj-gamma** — Go / Gin (4 bugs)
- **proj-delta** — JavaScript / Express (6 bugs)

---

## Confidence Scoring

Each fix is ranked by `displayScore = similarity × wilsonScoreLowerBound`:

| Feedback | Naive ratio | Wilson score |
|----------|-------------|--------------|
| 1✓ / 1   | 100%        | 21%          |
| 5✓ / 5   | 100%        | 57%          |
| 50✓ / 50 | 100%        | 93%          |

Wilson's lower bound (95% CI) prevents overconfidence on small sample sizes.

---

## Built With

This project was developed with assistance from:

- OpenCode — agentic coding CLI
- Google Gemini 2.5 Flash — Cognee LLM
- Anthropic Claude — code generation & architecture
