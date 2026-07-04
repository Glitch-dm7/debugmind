// Typed API client — all fetch calls go through here

const BASE = import.meta.env.VITE_API_URL ?? ""  // either env or proxied via vite to localhost:3001 for local developement

console.log("🔧 API BASE URL:", BASE || "(empty — using relative URLs)");
console.log("🔧 All env vars:", import.meta.env);

export interface SubmitBugPayload {
  rawError: string;
  fix: string;
  language: string;
  framework?: string;
  projectId: string;
  tags: string[];
}

export interface RecallResult {
  bugId: string;
  similarity: number;
  displayScore: number;
  normalizedError: string;
  fix: string;
  language: string;
  projectId: string;
  confidence: { confirmCount: number; denyCount: number };
  lastConfirmedAt?: string;
}

export interface BugEntry {
  id: string;
  rawError: string;
  normalizedError: string;
  fingerprint: string;
  fix: string;
  language: string;
  framework?: string;
  projectId: string;
  tags: string[];
  confidence: { confirmCount: number; denyCount: number };
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  archived: boolean;
  createdAt: string;
  archivedAt?: string;
  datasetId?: string;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Request failed: ${res.status}`);
  return data as T;
}

export const api = {
  submitBug: (payload: SubmitBugPayload) =>
    post<{ success: boolean; bug: BugEntry }>("/api/bugs", payload),

  recall: (rawError: string, projectId?: string) =>
    post<{ results: RecallResult[] }>("/api/bugs/recall", { rawError, projectId }),

  feedback: (bugId: string, outcome: "worked" | "failed") =>
    post<{ success: boolean }>("/api/bugs/feedback", { bugId, outcome }),

  archiveProject: (projectId: string, hardDelete = false) =>
    post<{ success: boolean }>("/api/bugs/archive", { projectId, hardDelete }),

  unarchiveProject: (projectId: string) =>
    post<{ success: boolean }>("/api/bugs/unarchive", { projectId }),

  getProjects: async () => {
    const res = await fetch("/api/bugs/projects");
    const data = await res.json();
    return data as { projects: Project[] };
  },
};
