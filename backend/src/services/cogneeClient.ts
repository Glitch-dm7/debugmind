import axios from "axios";
import type { BugEntry } from "../types/index.ts";

const BASE_URL = process.env.COGNEE_BASE_URL ?? "http://localhost:8000";

const http = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 120_000,
});

// ─── remember() ──────────────────────────────────────────────────────────────
// Uses /api/v1/add + /api/v1/cognify separately (the reliable path).
// /api/v1/remember causes 409 conflicts when the dataset already exists.
export async function rememberBug(bug: BugEntry): Promise<void> {
  const document = formatBugAsDocument(bug);
  const datasetName = `debugmind_${bug.projectId}`;

  const formData = new FormData();
  const fileBlob = new Blob([document], { type: "text/plain" });
  formData.append("data", fileBlob, `bug_${bug.id}.txt`);
  formData.append("datasetName", datasetName);

  const addRes = await fetch(`${BASE_URL}/api/v1/add`, {
    method: "POST",
    body: formData,
  });

  const addBody = await addRes.json().catch(() => ({}));

  if (!addRes.ok) {
    console.error("=== /api/v1/add FAILED ===", addBody);
    throw new Error(`/api/v1/add failed: ${JSON.stringify(addBody)}`);
  }

  // Use dataset_id from add response to scope cognify correctly
  const datasetId = addBody?.dataset_id;

  const cognifyRes = await fetch(`${BASE_URL}/api/v1/cognify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
       datasets: [datasetName],
    }),
  });

  const cognifyBody = await cognifyRes.json().catch(() => ({}));

  if (!cognifyRes.ok) {
    console.error("=== /api/v1/cognify FAILED ===", cognifyBody);
    throw new Error(`/api/v1/cognify failed: ${JSON.stringify(cognifyBody)}`);
  }
}

// ─── recall() ────────────────────────────────────────────────────────────────
export async function recallSimilarBugs(
  normalizedError: string,
  projectId?: string
): Promise<CogneeSearchResult[]> {
  const query = `Find similar bugs and their fixes for this error: ${normalizedError}`;

  const response = await http.post("/api/v1/search", {
    query,
    search_type: "GRAPH_COMPLETION",
  });

  const raw = response.data;

  // GRAPH_COMPLETION returns a string narrative — extract the fix from it directly
  if (Array.isArray(raw) && typeof raw[0] === "string" && raw[0].trim()) {
    return [{
      id: "graph-result-0",
      score: 0.7,
      metadata: { projectId },
      text: raw[0], // ← the actual answer is raw[0]
    }];
  }

  // Handle array or { results: [] } shapes
  const results: RawCogneeResult[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.results)
    ? raw.results
    : [];

  return results.map((r, i) => ({
    id: r.id ?? `result-${i}`,
    score: r.score ?? r.similarity_score ?? 0.7,
    metadata: {
      fingerprint: r.metadata?.fingerprint,
      projectId: r.metadata?.projectId ?? projectId,
      archived: r.metadata?.archived ?? false,
      confirmCount: r.metadata?.confirmCount ?? 0,
      denyCount: r.metadata?.denyCount ?? 0,
    },
    text: r.text ?? r.content ?? "",
  }));
}

// ─── improve() ───────────────────────────────────────────────────────────────
// Stores feedback as a new memory entry so future recalls factor it in.
export async function improveConfidence(
  bugId: string,
  update: { confirmCount: number; denyCount: number }
): Promise<void> {
  const feedbackText = `
    FEEDBACK ENTRY
    BugId: ${bugId}
    Outcome: ${update.confirmCount > 0 ? "fix worked" : "fix did not apply"}
    ConfirmCount: ${update.confirmCount}
    DenyCount: ${update.denyCount}
    Timestamp: ${new Date().toISOString()}
  `.trim();

  await http.post("/api/v1/add", { data: feedbackText });
  await http.post("/api/v1/cognify");
}

// ─── forget() ────────────────────────────────────────────────────────────────
export async function forgetProject(
  projectId: string,
  hardDelete = false
): Promise<void> {
  if (hardDelete) {
    const datasets = await http.get("/api/v1/datasets");
    const target = (datasets.data ?? []).find(
      (d: { id: string; name: string }) =>
        d.name?.includes(projectId)
    );
    if (target?.id) {
      await http.delete(`/api/v1/datasets/${target.id}`);
    }
  } else {
    // Soft delete: ingest a tombstone record — future recalls will see it
    // and our bugService filters results mentioning ARCHIVED PROJECT
    await http.post("/api/v1/add", {
      data: `ARCHIVED PROJECT: ${projectId} — do not recommend fixes from this project. Archived at ${new Date().toISOString()}.`,
    });
    await http.post("/api/v1/cognify");
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBugAsDocument(bug: BugEntry): string {
  return `
    BUG REPORT [ID: ${bug.id}]
    Project: ${bug.projectId}
    Language: ${bug.language}${bug.framework ? ` / ${bug.framework}` : ""}
    Tags: ${bug.tags.join(", ")}
    Fingerprint: ${bug.fingerprint}

    ERROR:
    ${bug.normalizedError}

    ROOT CAUSE AND FIX:
    ${bug.fix}

    Confidence: ${bug.confidence.confirmCount} confirmations, ${bug.confidence.denyCount} denials
    Logged: ${bug.createdAt}
  `.trim();
}

// ─── Internal types ───────────────────────────────────────────────────────────

interface RawCogneeResult {
  id?: string;
  score?: number;
  similarity_score?: number;
  text?: string;
  content?: string;
  metadata?: {
    fingerprint?: string;
    projectId?: string;
    archived?: boolean;
    confirmCount?: number;
    denyCount?: number;
  };
}

export interface CogneeSearchResult {
  id: string;
  score: number;
  metadata: {
    fingerprint?: string;
    projectId?: string;
    archived?: boolean;
    confirmCount?: number;
    denyCount?: number;
  };
  text: string;
}