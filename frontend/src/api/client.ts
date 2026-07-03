// Typed API client — all fetch calls go through here

const BASE = "";  // proxied via vite to localhost:3001

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
};
