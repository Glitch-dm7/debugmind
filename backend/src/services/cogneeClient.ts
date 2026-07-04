import axios from "axios";
import type { BugEntry } from "../types/index.ts";

const BASE_URL = process.env.COGNEE_BASE_URL ?? "http://localhost:8000";

const COGNEE_EMAIL = process.env.COGNEE_EMAIL ?? "default_user@example.com";
const COGNEE_PASSWORD = process.env.COGNEE_PASSWORD ?? "default_password";
const COGNEE_API_KEY = process.env.COGNEE_API_KEY ?? "";
const USE_CLOUD = !!COGNEE_API_KEY;


const http = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 120_000,
});

http.interceptors.request.use((config) => {
  if (USE_CLOUD) {
    config.headers["X-Api-Key"] = COGNEE_API_KEY;
  }
  config.headers["Content-Type"] = config.headers["Content-Type"] ?? "application/json";
  return config;
});

// ─── Auth token management ────────────────────────────────────────────────────
// Token is fetched once on first request and reused for all subsequent calls.
// If it expires (401), we re-login automatically.

let authToken: string | null = null;

async function getToken(): Promise<string> {
  if (authToken) return authToken;

  // Try login first
  try {
    console.log({COGNEE_EMAIL, COGNEE_PASSWORD})
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `username=${encodeURIComponent(COGNEE_EMAIL)}&password=${encodeURIComponent(COGNEE_PASSWORD)}`,
    });

    if (res.ok) {
      const data = await res.json();
      authToken = data.access_token;
      console.log("=== Cognee auth: logged in as", COGNEE_EMAIL);
      return authToken!;
    }
  } catch {}

  // If login fails, try register then login
  console.log("=== Cognee auth: login failed, trying register...");
  await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: COGNEE_EMAIL, password: COGNEE_PASSWORD }),
  });

  const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `username=${encodeURIComponent(COGNEE_EMAIL)}&password=${encodeURIComponent(COGNEE_PASSWORD)}`,
  });

  if (!res.ok) throw new Error("Cognee auth failed — check credentials");

  const data = await res.json();
  authToken = data.access_token;
  console.log("=== Cognee auth: registered + logged in as", COGNEE_EMAIL);
  return authToken!;
}

// Attach token to every axios request automatically
http.interceptors.request.use(async (config) => {
  const token = await getToken();
  config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

// On 401, clear token and retry once (handles token expiry)
http.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry) {
      authToken = null;
      err.config._retry = true;
      const token = await getToken();
      err.config.headers["Authorization"] = `Bearer ${token}`;
      return http(err.config);
    }
    return Promise.reject(err);
  }
);

// Authenticated fetch for multipart requests
async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (USE_CLOUD) {
    headers["X-Api-Key"] = COGNEE_API_KEY;
  }
  return fetch(url, { ...options, headers });
}

// ─── remember() ──────────────────────────────────────────────────────────────
// Uses /api/v1/add + /api/v1/cognify separately (the reliable path).
// /api/v1/remember causes 409 conflicts when the dataset already exists.
export async function rememberBug(bug: BugEntry): Promise<string | undefined> {
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
  if (!addRes.ok) throw new Error(`/api/v1/add failed: ${JSON.stringify(addBody)}`);

  const datasetId = addBody?.dataset_id as string | undefined;

  const cognifyRes = await fetch(`${BASE_URL}/api/v1/cognify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ datasets: [datasetName] }),
  });

  const cognifyBody = await cognifyRes.json().catch(() => ({}));
  if (!cognifyRes.ok) throw new Error(`/api/v1/cognify failed: ${JSON.stringify(cognifyBody)}`);

  return datasetId; // ← return to bugService so it can be stored in projectStore
}

// ─── recall() ────────────────────────────────────────────────────────────────
export async function recallSimilarBugs(
  normalizedError: string,
  datasetNames?: string[]  // ← now accepts array of names to scope search
): Promise<CogneeSearchResult[]> {
  const query = `Find similar bugs and their fixes for this error: ${normalizedError}`;

  const body: Record<string, unknown> = {
    query,
    search_type: "GRAPH_COMPLETION",
  };

  // Scope search to specific datasets if provided
  if (datasetNames && datasetNames.length > 0) {
    body.datasets = datasetNames;
  }

  const response = await http.post("/api/v1/search", body);
  const raw = response.data;

  console.log("=== RAW TYPE ===", typeof raw);
  console.log("=== RAW DATA ===", JSON.stringify(raw, null, 2));

  if (Array.isArray(raw) && typeof raw[0] === "string" && raw[0].trim()) {
    return [{
      id: "graph-result-0",
      score: 0.7,
      metadata: {},
      text: raw[0],
    }];
  }

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
      projectId: r.metadata?.projectId,
      archived: r.metadata?.archived ?? false,
      confirmCount: r.metadata?.confirmCount ?? 0,
      denyCount: r.metadata?.denyCount ?? 0,
    },
    text: r.text ?? r.content ?? "",
  }));
}

// ─── improve() ───────────────────────────────────────────────────────────────
// Stores feedback as a new memory entry so future recalls factor it in.
// export async function improveConfidence(
//   bugId: string,
//   update: { confirmCount: number; denyCount: number }
// ): Promise<void> {
//   const feedbackText = `
//     FEEDBACK ENTRY
//     BugId: ${bugId}
//     Outcome: ${update.confirmCount > 0 ? "fix worked" : "fix did not apply"}
//     ConfirmCount: ${update.confirmCount}
//     DenyCount: ${update.denyCount}
//     Timestamp: ${new Date().toISOString()}
//   `.trim();

//   await http.post("/api/v1/add", { data: feedbackText });
//   await http.post("/api/v1/cognify");
// }

// ─── forget() ────────────────────────────────────────────────────────────────
export async function forgetProject(
  projectId: string,
  datasetId: string | undefined,
  hardDelete = false
): Promise<void> {
  if (hardDelete && datasetId) {
    // TODO: re-enable when deployed to Cognee Cloud with proper auth
    // Currently skipped — datasets owned by anonymous user return 403
    // Hard delete is handled locally by removing from projectStore + bugStore
    console.log(
      `=== forgetProject: skipping Cognee delete for ${datasetId} ` +
      `(anonymous ownership — will purge on Cloud deployment)`
    );
  }
  // Soft delete handled entirely by projectStore — no Cognee call needed
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