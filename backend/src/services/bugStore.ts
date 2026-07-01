import { existsSync, readFileSync, writeFileSync } from "fs";

// Simple local JSON store for bug metadata
// In production this would be a proper DB — for v1 a JSON file is fine
// and actually makes for a good HLD talking point:
// "Cognee owns semantic/graph memory, we own structured metadata"

const STORE_PATH = "./data/bugs.json";

export interface StoredBug {
  id: string;
  fingerprint: string;
  language: string;
  framework?: string;
  projectId: string;
  tags: string[];
  fix: string;
  createdAt: string;
  confirmCount: number;
  denyCount: number;
  lastConfirmedAt?: string;
}

type BugStore = Record<string, StoredBug>; // keyed by bug id

// ─── Load / Save ─────────────────────────────────────────────────────────────

function load(): BugStore {
  try {
    if (!existsSync(STORE_PATH)) return {};
    return JSON.parse(readFileSync(STORE_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function save(store: BugStore): void {
  // Ensure data dir exists
  const dir = STORE_PATH.split("/").slice(0, -1).join("/");
  if (!existsSync(dir)) {
    import("fs").then(({ mkdirSync }) => mkdirSync(dir, { recursive: true }));
  }
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const bugStore = {
  save(bug: StoredBug): void {
    const store = load();
    store[bug.id] = bug;
    save(store);
  },

  getById(id: string): StoredBug | null {
    return load()[id] ?? null;
  },

  getByFingerprint(fingerprint: string): StoredBug | null {
    const store = load();
    return Object.values(store).find((b) => b.fingerprint === fingerprint) ?? null;
  },

  updateConfidence(
    id: string,
    outcome: "worked" | "failed"
  ): StoredBug | null {
    const store = load();
    const bug = store[id];
    if (!bug) return null;

    if (outcome === "worked") {
      bug.confirmCount += 1;
      bug.lastConfirmedAt = new Date().toISOString();
    } else {
      bug.denyCount += 1;
    }

    store[id] = bug;
    save(store);
    return bug;
  },

  getAll(): StoredBug[] {
    return Object.values(load());
  },
};