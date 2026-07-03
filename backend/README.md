# DebugMind — Backend

REST API server built with **Hono** and **Bun**. Routes bug submissions, semantic recall, feedback, and project archiving. Integrates with Cognee for knowledge graph storage and uses a local JSON file for structured metadata.

---

## Stack

| Layer | Tech |
|-------|------|
| Runtime | [Bun](https://bun.sh) |
| Framework | [Hono](https://hono.dev) v4 |
| HTTP Client | Axios (for Cognee API calls) |
| Storage | Cognee (knowledge graph) + `bugs.json` (local metadata) |

---

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Entry point — creates Hono app, mounts middleware + routes
│   ├── seed.ts               # Seeds 20 realistic bugs across 4 projects
│   ├── reindex.ts            # Re-ingests all bugs from bugs.json into Cognee
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   ├── routes/
│   │   └── bugs.ts           # Route handlers: submit, recall, feedback, archive
│   └── services/
│       ├── bugService.ts     # Core business logic
│       ├── bugStore.ts       # Local JSON file CRUD
│       └── cogneeClient.ts   # Cognee HTTP API client
├── data/
│   └── bugs.json             # Persistent bug metadata storage
├── .env                      # Cognee credentials
├── package.json
└── tsconfig.json
```

---

## API Endpoints

All routes are prefixed with `/api/bugs`. The frontend dev server proxies `/api` → `localhost:3001`.

### `POST /api/bugs`
Submit a new bug into memory.

```json
{
  "rawError": "TypeError: Cannot read properties of undefined",
  "fix": "Check that the object exists before accessing properties",
  "language": "typescript",
  "framework": "react",
  "projectId": "proj-alpha",
  "tags": ["undefined", "null-check"]
}
```

### `POST /api/bugs/recall`
Search memory for similar bugs.

```json
{ "rawError": "TypeError: Cannot read properties of undefined" }
```

### `POST /api/bugs/feedback`
Mark a recalled fix as worked or failed.

```json
{ "bugId": "<uuid>", "outcome": "worked" }
```

### `POST /api/bugs/archive`
Soft or hard delete a project's data from Cognee.

```json
{ "projectId": "proj-alpha", "hardDelete": false }
```

### `GET /health`
Health check.

---

## Service Layer

### `bugService.ts` — Business Logic

**`submit()`** — Normalizes the error, computes an MD5 fingerprint, sends the bug to Cognee via `rememberBug()`, and saves metadata to `bugs.json`.

**`recall()`** — Two-tier search:
1. **Exact fingerprint match** — checks `bugs.json` for the same MD5 hash. Returns instantly if found (100% similarity).
2. **Semantic search** — falls back to Cognee `GRAPH_COMPLETION`. Cognee returns a narrative answer; a keyword overlap scorer matches it to the best local bug entry.

Results are sorted by `displayScore = similarity × wilsonScoreLowerBound` and capped at 5.

**`feedback()`** — Updates confirm/deny counts in `bugs.json`. The Wilson score is computed at read time, not write time.

### `cogneeClient.ts` — Cognee Integration

Handles authentication (login/register with Bearer tokens, auto-refresh on 401).

| Operation | Cognee API | Purpose |
|-----------|-----------|---------|
| `rememberBug()` | `POST /api/v1/add` + `POST /api/v1/cognify` | Uploads a bug report as a text document and processes it into the knowledge graph |
| `recallSimilarBugs()` | `POST /api/v1/search` with `search_type: GRAPH_COMPLETION` | Queries the knowledge graph for similar bugs |
| `forgetProject()` | `GET /api/v1/datasets` + `DELETE /api/v1/datasets/:id` | Soft or hard deletes a project's dataset |

### `bugStore.ts` — Local Storage

Simple JSON file-based repository with file-locked reads/writes.

| Method | Purpose |
|--------|---------|
| `save()` | Persist a new bug entry |
| `getById()` | Fetch by UUID |
| `getByFingerprint()` | Fast exact-match lookup |
| `updateConfidence()` | Increment confirm/deny count |
| `getAll()` | Return all stored bugs |

---

## Confidence Scoring

Uses the **Wilson score lower bound** (one-sided, 95% CI):

```
z = 1.96
phat = confirmCount / total
numerator = phat + z²/2total - z√((phat(1-phat) + z²/4total) / total)
denominator = 1 + z²/total
wilsonScore = max(0, numerator / denominator)
displayScore = similarity × wilsonScore
```

This penalizes small sample sizes — a fix with 1 confirmation gets Wilson score ~0.21, while 50 confirmations gets ~0.93.

---

## Error Normalization

Before fingerprinting or sending to Cognee, errors are normalized to strip noisy per-run details:

| Pattern | Replaced with |
|---------|---------------|
| Memory addresses (`0x7f...`) | `<ADDR>` |
| Timestamps (`2024-01-15 14:23:01`) | `<TIMESTAMP>` |
| Line numbers (`line 42`) | `line <N>` |
| Column numbers (`:42:7`) | `:<LINE>:<COL>` |
| UUIDs | `<UUID>` |
| File paths (`/src/app.tsx`) | `app.tsx` (filename only) |

---

## Getting Started

```bash
# Install dependencies
bun install

# Ensure Cognee is running (from project root)
docker compose up -d

# Start development server with hot reload
bun run dev

# Seed sample data
bun run seed

# Re-index existing bugs into Cognee
bun run reindex
```
