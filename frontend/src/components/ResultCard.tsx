import { useState } from "react";
import { ThumbsUp, ThumbsDown, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import { api, type RecallResult } from "../api/client";

interface Props {
  result: RecallResult;
  index: number;
}

export function ResultCard({ result, index }: Props) {
  const [feedback, setFeedback] = useState<"worked" | "failed" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [localConfirm, setLocalConfirm] = useState(result.confidence.confirmCount);
  const [localDeny, setLocalDeny] = useState(result.confidence.denyCount);

  const total = localConfirm + localDeny;
  const confidencePct = total === 0 ? 50 : Math.round((localConfirm / total) * 100);
  const similarityPct = Math.round(result.similarity * 100);

  // A result is only "real" if similarity is meaningful AND fix text is useful
  const isLowConfidence = similarityPct < 50;
  const hasNoFix =
    !result.fix ||
    result.fix.toLowerCase().includes("context is empty") ||
    result.fix.toLowerCase().includes("i am sorry") ||
    result.fix.toLowerCase().includes("cannot find similar") ||
    result.fix.toLowerCase().includes("no similar bugs");

  const barColor =
    confidencePct >= 70 ? "bg-success" :
    confidencePct >= 40 ? "bg-warning" :
    "bg-danger";

  async function handleFeedback(outcome: "worked" | "failed") {
    if (feedback || submitting) return;
    setSubmitting(true);
    try {
      await api.feedback(result.bugId, outcome);
      setFeedback(outcome);
      if (outcome === "worked") setLocalConfirm((c) => c + 1);
      else setLocalDeny((d) => d + 1);
    } catch {
      // silent fail — feedback is non-critical
    } finally {
      setSubmitting(false);
    }
  }

  // ── No meaningful result ───────────────────────────────────────────────────
  if (hasNoFix || isLowConfidence) {
    return (
      <div
        className="rounded-xl border border-border bg-surface p-5 animate-slide-up opacity-60"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle size={14} className="text-warning mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-mono text-warning mb-1">
              weak match
            </p>
            <p className="text-xs text-text-faint leading-relaxed">
              Cognee found something loosely related but couldn't surface a
              confident fix. Log more bugs in this domain to improve recall.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Real result ───────────────────────────────────────────────────────────
  return (
    <div
      className="scan-line rounded-xl border border-border bg-surface p-5 animate-slide-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Top row — match rank + scores */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-text-faint">#{index + 1}</span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-2 text-text-muted border border-border">
            {result.language}
          </span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-2 text-text-muted border border-border">
            {result.projectId}
          </span>
        </div>
        {/* <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-text-faint">similarity</span>
          <span
            className="font-mono text-sm font-semibold"
            style={{
              color:
                similarityPct >= 80 ? "#22D3EE" :
                similarityPct >= 60 ? "#FBBF24" : "#94A3B8",
            }}
          >
            {similarityPct}%
          </span>
        </div> */}
      </div>

      {/* Fix content */}
      <div className="mb-4">
        <p className="text-[10px] font-mono text-text-faint uppercase tracking-widest mb-2">
          fix
        </p>
        <p className="text-sm text-text-primary leading-relaxed">{result.fix}</p>
      </div>

      {/* Confidence bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono text-text-faint uppercase tracking-widest">
            confidence
          </span>
          <span className="text-[10px] font-mono text-text-muted">
            {localConfirm}✓&nbsp;&nbsp;{localDeny}✗&nbsp;&nbsp;
            {total === 0 ? "no feedback yet" : `${confidencePct}%`}
          </span>
        </div>
        <div className="h-1 rounded-full bg-surface-2 overflow-hidden">
          <div
            className={`h-full rounded-full confidence-fill ${barColor}`}
            style={{ width: total === 0 ? "0%" : `${confidencePct}%` }}
          />
        </div>
        {total === 0 && (
          <p className="text-[10px] font-mono text-text-faint mt-1">
            no feedback yet — be the first to confirm this fix
          </p>
        )}
      </div>

      {/* Last confirmed */}
      {result.lastConfirmedAt && (
        <div className="flex items-center gap-1.5 mb-4">
          <Clock size={11} className="text-text-faint" />
          <span className="text-[10px] font-mono text-text-faint">
            last confirmed {new Date(result.lastConfirmedAt).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Feedback — only shown on real results */}
      <div className="border-t border-border pt-4">
        {feedback ? (
          <div className="flex items-center gap-2 animate-fade-in">
            {feedback === "worked" ? (
              <>
                <CheckCircle2 size={13} className="text-success" />
                <span className="text-xs font-mono text-success">
                  marked as worked — confidence updated
                </span>
              </>
            ) : (
              <>
                <XCircle size={13} className="text-danger" />
                <span className="text-xs font-mono text-danger">
                  marked as not applicable
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-text-faint mr-1">
              did this fix apply?
            </span>
            <button
              onClick={() => handleFeedback("worked")}
              disabled={submitting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border
                         text-xs font-mono text-text-muted hover:border-success hover:text-success
                         transition-colors duration-150 disabled:opacity-40"
            >
              <ThumbsUp size={11} />
              yes, it worked
            </button>
            <button
              onClick={() => handleFeedback("failed")}
              disabled={submitting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border
                         text-xs font-mono text-text-muted hover:border-danger hover:text-danger
                         transition-colors duration-150 disabled:opacity-40"
            >
              <ThumbsDown size={11} />
              didn't apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
}