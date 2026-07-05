import { createHash } from "crypto";
import type {
  BugEntry,
  SubmitBugRequest,
  RecallResult,
  ConfidenceScore,
  FeedbackRequest,
} from "../types/index.ts";
import {
  rememberBug,
  recallSimilarBugs,
  CogneeSearchResult,
} from "./cogneeClient";
import { bugStore } from "./bugStore";
import { projectStore } from "./projectStore";

// ─── Public API of this service ───────────────────────────────────────────────

export const bugService = {
  submit,
  recall,
  feedback,
  computeDisplayScore,
};

// ─── submit() ─────────────────────────────────────────────────────────────────

async function submit(req: SubmitBugRequest): Promise<BugEntry> {
  const normalized = normalizeError(req.rawError);
  const fingerprint = computeFingerprint(normalized);

  const bug: BugEntry = {
    id: crypto.randomUUID(),
    rawError: req.rawError,
    normalizedError: normalized,
    fingerprint,
    fix: req.fix,
    language: req.language,
    framework: req.framework,
    projectId: req.projectId,
    tags: req.tags ?? [],
    confidence: { confirmCount: 0, denyCount: 0 },
    createdAt: new Date().toISOString(),
  };

  // remember() returns datasetId from Cognee — capture it for hard delete later
  const datasetId = await rememberBug(bug);

  // Save bug metadata
  bugStore.save({
    id: bug.id,
    fingerprint: bug.fingerprint,
    language: bug.language,
    framework: bug.framework,
    projectId: bug.projectId,
    tags: bug.tags,
    fix: bug.fix,
    createdAt: bug.createdAt,
    confirmCount: 0,
    denyCount: 0,
  });

  // Register project — upsert so we don't duplicate
  projectStore.upsert(req.projectId, datasetId);

  return bug;
}

// ─── recall() ─────────────────────────────────────────────────────────────────

async function recall(
  rawError: string,
  projectId?: string
): Promise<RecallResult[]> {
  const normalized = normalizeError(rawError);
  const fingerprint = computeFingerprint(normalized);

  // Step 1: exact fingerprint match
  const exactMatch = bugStore.getByFingerprint(fingerprint);
  if (exactMatch) {
    const proj = projectStore.getAll().find(p => p.id === exactMatch.projectId);
    if (proj?.archived) return [];

    const confidence = {
      confirmCount: exactMatch.confirmCount,
      denyCount: exactMatch.denyCount,
    };
    return [{
      bugId: exactMatch.id,
      similarity: 1.0,
      displayScore: computeDisplayScore(1.0, confidence),
      normalizedError: normalized,
      fix: exactMatch.fix,
      language: exactMatch.language,
      projectId: exactMatch.projectId,
      confidence,
      lastConfirmedAt: exactMatch.lastConfirmedAt,
    }];
  }

  // Step 2: semantic search — scope to active datasets only
  const activeProjects = projectStore.getActive();
  const activeDatasetNames = activeProjects.map(p => `debugmind_${p.id}`);

  const searchDatasets = projectId
    ? activeDatasetNames.filter(n => n === `debugmind_${projectId}`)
    : activeDatasetNames;

  if (searchDatasets.length === 0) return [];

  // Search datasets one at a time — stop at first meaningful result.
  // Avoids Cognee Cloud returning one result per dataset (noisy + slow).
  let results: CogneeSearchResult[] = [];
  for (const dataset of searchDatasets) {
    const r = await recallSimilarBugs(normalized, [dataset]);
    if (r.length > 0) {
      results = r;
      break;
    }
  }

  if (results.length === 0) return [];

  const allLocalBugs = bugStore.getAll().filter(b => {
    const proj = activeProjects.find(p => p.id === b.projectId);
    return !!proj;
  });

  return results
    .map((r) => {
      const cogneeAnswer = r.text?.toLowerCase() ?? "";

      // Try local enrichment first
      const bestLocal = allLocalBugs.length > 0
        ? allLocalBugs
            .map((bug) => {
              const score = keywordOverlapScore(
                cogneeAnswer,
                `${bug.fix} ${bug.language} ${bug.tags.join(" ")}`.toLowerCase()
              );
              return { bug, score };
            })
            .sort((a, b) => b.score - a.score)[0]
        : null;

      const local = bestLocal && bestLocal.score > 0.1 ? bestLocal.bug : null;

      const confidence: ConfidenceScore = {
        confirmCount: local?.confirmCount ?? 0,
        denyCount: local?.denyCount ?? 0,
      };

      return {
        bugId: local?.id ?? r.id,
        similarity: r.score,
        displayScore: computeDisplayScore(r.score, confidence),
        normalizedError: normalized,
        fix: r.text?.trim() ?? local?.fix ?? "No similar bugs found",
        // Use Cognee Cloud's dataset_name first, then local, then unknown
        language: local?.language ?? "unknown",
        projectId: local?.projectId ?? r.metadata.projectId ?? projectId ?? "unknown",
        confidence,
        lastConfirmedAt: local?.lastConfirmedAt,
      } satisfies RecallResult;
    })
    .sort((a, b) => b.displayScore - a.displayScore)
    .slice(0, 5);
}

// ─── Keyword overlap scorer ───────────────────────────────────────────────────
// Counts how many words from `source` appear in `target`.
// Simple but effective for matching Cognee's answer to our stored bugs.
function keywordOverlapScore(source: string, target: string): number {
  const sourceWords = new Set(
    source.split(/\W+/).filter((w) => w.length > 3) // skip short words
  );
  const targetWords = target.split(/\W+/).filter((w) => w.length > 3);
  const matches = targetWords.filter((w) => sourceWords.has(w)).length;
  return matches / Math.max(sourceWords.size, 1);
}

// ─── feedback() ──────────────────────────────────────────────────────────────

async function feedback(req: FeedbackRequest): Promise<void> {
  // Update confidence in local store only — Cognee doesn't track feedback.
  // The updated counts are read at recall() time to compute Wilson score.
  const updated = bugStore.updateConfidence(req.bugId, req.outcome);

  if (!updated) {
    throw new Error(`Bug ${req.bugId} not found in local store`);
  }

  // Log for visibility
  console.log(
    `=== feedback: bug ${req.bugId.slice(0, 8)} → ${req.outcome} ` +
    `(${updated.confirmCount}✓ ${updated.denyCount}✗)`
  );
}

// ─── Confidence scoring ───────────────────────────────────────────────────────
// confidence score computed at READ time from aggregate counts.
//
// Formula: Wilson score lower bound (one-sided, 95% confidence).
// Why Wilson score and not just confirmCount / total?
// - With 1 confirm out of 1 attempt, naive ratio = 100% — overconfident.
// - Wilson score penalizes low sample sizes, giving a more honest estimate.
//
// Combined displayScore = similarity × wilsonScore
// This means: a 95% similar bug with a low-confidence fix
// can rank below a 80% similar bug with a high-confidence fix.

export function computeDisplayScore(
  similarity: number,
  confidence: ConfidenceScore
): number {
  const wilson = wilsonScoreLowerBound(
    confidence.confirmCount,
    confidence.confirmCount + confidence.denyCount
  );
  return similarity * wilson;
}

function wilsonScoreLowerBound(positives: number, total: number): number {
  if (total === 0) return 0.5; // no feedback yet → neutral confidence
  const z = 1.96; // 95% confidence interval
  const phat = positives / total;
  const numerator =
    phat +
    (z * z) / (2 * total) -
    z * Math.sqrt((phat * (1 - phat) + (z * z) / (4 * total)) / total);
  const denominator = 1 + (z * z) / total;
  return Math.max(0, numerator / denominator);
}

// ─── Error normalization ──────────────────────────────────────────────────────
// Goal: strip noise that would hurt embedding similarity between errors
// that are semantically the same bug but from different runs.
//
// What we strip:
// - Memory addresses (0x00007f...)
// - Timestamps (2024-01-15 14:23:01 etc.)
// - Line numbers that shift when code changes (line 42 → line 47)
// - UUIDs / request IDs in error messages
// - File paths (we keep the filename but not the full path)
//
// What we KEEP:
// - The error type / exception class (TypeError, SegFault, etc.)
// - The error message itself
// - Function/method names in stack frames
// - Module names

export function normalizeError(raw: string): string {
  return raw
    .replace(/0x[0-9a-fA-F]+/g, "<ADDR>")          // memory addresses
    .replace(/\b\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?\b/g, "<TIMESTAMP>") // ISO timestamps
    .replace(/\b\d{2}\/\d{2}\/\d{4}\b/g, "<DATE>") // MM/DD/YYYY dates
    .replace(/line \d+/gi, "line <N>")              // line numbers
    .replace(/:\d+:\d+/g, ":<LINE>:<COL>")          // :42:7 style
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, "<UUID>") // UUIDs
    .replace(/\/([^/\s]+\/)+/g, "/")                // file paths → just filename
    .replace(/\s+/g, " ")                           // collapse whitespace
    .trim()
    .toLowerCase();
}

// ─── Fingerprinting ───────────────────────────────────────────────────────────
// A cheap exact-match check before hitting Cognee's semantic search.
// If two normalized errors produce the same fingerprint, they're the same bug.
// Saves a Cognee round-trip for the most common case (rerunning a failing test).

function computeFingerprint(normalizedError: string): string {
  // Take only first 500 chars — captures error type + top few stack frames,
  // ignores tail noise that varies between runs of the same bug.
  const signature = normalizedError.slice(0, 500);
  return createHash("md5").update(signature).digest("hex");
}

// ─── Document parsing helpers ─────────────────────────────────────────────────
// Used in recall() to extract fields out of the text documents we stored.
// Simple line-based parsing — fine for our controlled document format.

function extractFixFromDocument(text: string): string {
  const marker = "ROOT CAUSE AND FIX:";
  const start = text.indexOf(marker);
  if (start === -1) return "Fix not found";
  return text
    .slice(start + marker.length)
    .split("\n\n")[0] // up to next blank line
    .trim();
}

function extractFieldFromDocument(text: string, field: string): string {
  const line = text.split("\n").find((l) => l.startsWith(`${field}:`));
  return line ? line.replace(`${field}:`, "").trim() : "unknown";
}