// Tracks project metadata and archive status locally.
// Cognee owns the graph data — we own the project registry.

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";

const STORE_PATH = "./data/projects.json";

export interface StoredProject {
  id: string;           // same as projectId used in bug entries
  name: string;
  datasetId?: string;   // Cognee dataset UUID — needed for hard delete
  archived: boolean;
  createdAt: string;
  archivedAt?: string;
}

type ProjectStore = Record<string, StoredProject>;

function load(): ProjectStore {
  try {
    if (!existsSync(STORE_PATH)) return {};
    return JSON.parse(readFileSync(STORE_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function save(store: ProjectStore): void {
  const dir = STORE_PATH.split("/").slice(0, -1).join("/");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

export const projectStore = {
  // Upsert — called every time a bug is submitted for a project
  upsert(projectId: string, datasetId?: string): StoredProject {
    const store = load();
    if (!store[projectId]) {
      store[projectId] = {
        id: projectId,
        name: projectId,
        datasetId,
        archived: false,
        createdAt: new Date().toISOString(),
      };
    } else if (datasetId && !store[projectId].datasetId) {
      // Capture datasetId if we didn't have it before
      store[projectId].datasetId = datasetId;
    }
    save(store);
    return store[projectId];
  },

  getAll(): StoredProject[] {
    return Object.values(load());
  },

  getActive(): StoredProject[] {
    return Object.values(load()).filter((p) => !p.archived);
  },

  archive(projectId: string): StoredProject | null {
    const store = load();
    if (!store[projectId]) return null;
    store[projectId].archived = true;
    store[projectId].archivedAt = new Date().toISOString();
    save(store);
    return store[projectId];
  },

  unarchive(projectId: string): StoredProject | null {
    const store = load();
    if (!store[projectId]) return null;
    store[projectId].archived = false;
    store[projectId].archivedAt = undefined;
    save(store);
    return store[projectId];
  },

  delete(projectId: string): void {
    const store = load();
    delete store[projectId];
    save(store);
  },

  getActiveDatasetNames(): string[] {
    return Object.values(load())
      .filter((p) => !p.archived)
      .map((p) => `debugmind_${p.id}`);
  },
};