// ─── Core entities ───────────────────────────────────────────────────────────

export interface BugEntry {
  id: string;                  // uuid generated on creation
  rawError: string;            // original pasted stack trace (unmodified)
  normalizedError: string;     // cleaned version used for embedding/fingerprint
  fingerprint: string;         // md5-ish hash of normalized error signature
  fix: string;                 // what fixed it
  language: string;            // e.g. "typescript", "python"
  framework?: string;          // e.g. "react", "fastapi"
  projectId: string;           // which project this bug belongs to
  tags: string[];              // user-supplied tags for extra searchability
  confidence: ConfidenceScore; 
  createdAt: string;           // ISO date string
  lastConfirmedAt?: string;    // last time a user said "this fix worked"
}

export interface ConfidenceScore {
  confirmCount: number;        // times users said "this fix worked again"
  denyCount: number;           // times users said "didn't apply"
  // display score computed at READ time from these two — never stored directly
  // formula lives in bugService.computeDisplayScore()
}

export interface Project {
  id: string;
  name: string;
  archived: boolean;
  createdAt: string;
}

export interface Fix {
  id: string;
  bugId: string;
  description: string;
  codeSnippet?: string;        // optional — paste a diff or code block
}

// ─── API request/response shapes ─────────────────────────────────────────────

export interface SubmitBugRequest {
  rawError: string;
  fix: string;
  language: string;
  framework?: string;
  projectId: string;
  tags?: string[];
}

export interface RecallRequest {
  rawError: string;
  projectId?: string;          // optional — if omitted, searches all non-archived projects
}

export interface RecallResult {
  bugId: string;
  similarity: number;          // 0–1, from Cognee recall
  displayScore: number;        // similarity × confidence — used for ranking
  normalizedError: string;
  fix: string;
  language: string;
  projectId: string;
  confidence: ConfidenceScore;
  lastConfirmedAt?: string;
}

export interface FeedbackRequest {
  bugId: string;
  outcome: "worked" | "failed"; // maps to confirmCount++ or denyCount++
}

export interface ArchiveProjectRequest {
  projectId: string;
  hardDelete?: boolean;        // default false (soft delete / tombstone)
}