# DebugMind — Frontend

Single-page application for searching and logging bugs. Built with **React 19**, **Vite 8**, and **Tailwind v4**. Features a dark terminal-inspired theme with animated interactive diagrams.

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | React 19 |
| Build Tool | Vite 8 (Rolldown) |
| Styling | Tailwind CSS v4 |
| Routing | TanStack Router |
| Animation | Motion (motion.dev) |
| Icons | Lucide React |
| Diagrams | React Flow (`@xyflow/react`) |
| API Client | Native `fetch` with typed wrappers |

---

## Project Structure

```
frontend/
├── src/
│   ├── main.tsx                # Entry point — mounts TanStack Router
│   ├── index.css               # Tailwind imports + custom dark theme
│   ├── App.tsx                 # (deleted — content moved to /bugs route)
│   ├── api/
│   │   └── client.ts           # Typed API client (submit, recall, feedback, archive)
│   ├── components/
│   │   ├── Header.tsx          # App header with navigation links
│   │   ├── RecallPanel.tsx     # Error search input + results list
│   │   ├── SubmitPanel.tsx     # Bug submission form
│   │   ├── ResultCard.tsx      # Individual result with confidence bar + feedback
│   │   └── diagrams/
│   │       ├── nodes.tsx               # Custom React Flow node components (ProcessNode, DecisionNode)
│   │       ├── ArchitectureDiagram.tsx  # Three-tier architecture flow
│   │       ├── SubmitFlowDiagram.tsx    # Submit pipeline (5 steps)
│   │       ├── RecallFlowDiagram.tsx    # Recall pipeline with decision branch
│   │       └── PipelineDiagram.tsx      # Cognee engine operations
│   └── routes/
│       ├── index.ts            # Route tree configuration
│       ├── __root.tsx          # Root layout (Header + Outlet)
│       ├── index.tsx           # Landing page (animated hero + features)
│       ├── bugs-page.tsx       # Bug memory (recall + submit tabs)
│       └── how-it-works.tsx    # System architecture deep dive
├── index.html
├── vite.config.ts
├── package.json
└── tsconfig*.json
```

---

## Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Landing | Animated hero with gradient orbs, feature cards, CTA |
| `/bugs` | Bug Memory | Sidebar with search (Recall) and submit tabs |
| `/how-it-works` | System Deep Dive | Architecture diagrams, data flows, confidence scoring, Cognee internals |

---

## Components

### `Header.tsx`
Logo + version + navigation links (`Home`, `How It Works`, `Bug Memory`). Active route is highlighted with cyan glow. Uses `useRouterState` from TanStack Router.

### `RecallPanel.tsx`
Text area for pasting an error. "Search Memory" button triggers `POST /api/bugs/recall`. Displays results via `ResultCard` components. Shows loading spinner, error banner, and empty states.

### `SubmitPanel.tsx`
Form with fields: project ID, language, framework, error text, fix description, tags. Validates required fields. Shows success/error feedback after submission.

### `ResultCard.tsx`
Displays a single recall result with:
- Match rank + similarity percentage
- Language + project badges
- Fix description
- Confidence bar (Wilson score based) with color coding
- Last confirmed date
- Feedback buttons ("worked" / "didn't apply")

---

## Diagrams (React Flow)

Four interactive but fully locked-down diagrams on the How It Works page:

| Diagram | Nodes | Features |
|---------|-------|----------|
| Architecture | 4 (React → Hono → Cognee + bugs.json) | Animated cyan edges, dark grid background |
| Submit Flow | 5 (Normalize → Fingerprint → Add → Cognify → Persist) | Vertical pipeline, motion entrance |
| Recall Flow | 6 with decision diamond | Branching layout (yes: green, no: red) |
| Cognee Pipeline | 4 (Remember → Recall → Improve → Forget) | Sequential operations |

All diagrams have `nodesDraggable={false}`, `zoomOnScroll/Pinch/DoubleClick={false}`, `minZoom={maxZoom}={1}`, and `preventScrolling={false}` so they act as static illustrations with animated edges. Hovering over a node expands it to show a description.

---

## API Client (`api/client.ts`)

Typed fetch wrapper. All calls go through a single `post<T>()` function with error handling.

```typescript
api.submitBug(payload)       // POST /api/bugs
api.recall(rawError)          // POST /api/bugs/recall
api.feedback(bugId, outcome)  // POST /api/bugs/feedback
api.archiveProject(projectId) // POST /api/bugs/archive
```

The Vite dev server proxies `/api` → `http://localhost:3001`.

---

## Theme

Dark terminal-inspired color palette defined in `index.css` using Tailwind v4's `@theme` directive:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-base` | `#0D0F12` | Page background |
| `--color-surface` | `#1A1D23` | Card / panel background |
| `--color-cyan` | `#22D3EE` | Primary accent |
| `--color-success` | `#4ADE80` | Positive feedback |
| `--color-danger` | `#F87171` | Errors / negative |
| `--color-warning` | `#FBBF24` | Low confidence |
| `--font-mono` | JetBrains Mono | UI text |
| `--font-sans` | Inter | Body text |

---

## Getting Started

```bash
# Install dependencies
bun install

# Start dev server (proxies /api → localhost:3001)
bun run dev

# Type-check and build for production
bun run build

# Lint
bun run lint
```

The dev server runs on [localhost:5173](http://localhost:5173). Make sure the backend is running on port 3001 and Cognee is available on port 8000.
