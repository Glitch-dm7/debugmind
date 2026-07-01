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
  improveConfidence,
} from "./cogneeClient";
import { bugStore } from "./bugStore.js";

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

  // Save to Cognee (semantic/graph memory)
  await rememberBug(bug);

  // Save metadata locally (structured lookup)
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

  return bug;
}

// ─── recall() ─────────────────────────────────────────────────────────────────

async function recall(
  rawError: string,
  projectId?: string
): Promise<RecallResult[]> {
  const normalized = normalizeError(rawError);
  const fingerprint = computeFingerprint(normalized);

  // Step 1: exact fingerprint match — skip Cognee entirely
  const exactMatch = bugStore.getByFingerprint(fingerprint);
  if (exactMatch) {
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

  // Step 2: semantic search via Cognee
  const results = await recallSimilarBugs(normalized, projectId);

  if (results.length === 0) return [];

  // Step 3: Cognee GRAPH_COMPLETION returns "graph-result-0" as id, not real bug ids.
  // So we can't match by id — instead find the best local bug by keyword overlap
  // between the Cognee answer text and our stored bug fixes/errors.
  const allLocalBugs = bugStore.getAll();

  return results
    .filter((r) => !r.metadata.archived)
    .map((r) => {
      // Find best matching local bug by scoring keyword overlap with Cognee's answer
      const cogneeAnswer = r.text?.toLowerCase() ?? "";
      const bestLocal = allLocalBugs
        .map((bug) => {
          const score = keywordOverlapScore(
            cogneeAnswer,
            `${bug.fix} ${bug.language} ${bug.tags.join(" ")}`.toLowerCase()
          );
          return { bug, score };
        })
        .sort((a, b) => b.score - a.score)[0];

      const local = bestLocal && bestLocal.score > 0 ? bestLocal.bug : null;

      const confidence: ConfidenceScore = {
        confirmCount: local?.confirmCount ?? 0,
        denyCount: local?.denyCount ?? 0,
      };
      const similarity = r.score;
      const displayScore = computeDisplayScore(similarity, confidence);

      return {
        bugId: local?.id ?? r.id,
        similarity,
        displayScore,
        normalizedError: normalized,
        fix: r.text?.trim() ?? local?.fix ?? "No similar bugs found",
        language: local?.language ?? "unknown",
        projectId: local?.projectId ?? projectId ?? "unknown",
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
  // Update local metadata store
  const updated = bugStore.updateConfidence(req.bugId, req.outcome);

  if (updated) {
    // Push updated confidence to Cognee too
    await improveConfidence(req.bugId, {
      confirmCount: updated.confirmCount,
      denyCount: updated.denyCount,
    });
  }
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