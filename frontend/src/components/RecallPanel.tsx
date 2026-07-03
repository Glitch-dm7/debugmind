import { useState } from "react";
import { Search, Loader2, AlertCircle, ChevronRight } from "lucide-react";
import { api, type RecallResult } from "../api/client";
import { ResultCard } from "./ResultCard";

export function RecallPanel() {
  const [error, setError] = useState("");
  const [results, setResults] = useState<RecallResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleRecall() {
    if (!error.trim()) return;
    setLoading(true);
    setErr(null);
    setResults(null);
    setHasSearched(true);

    try {
      const data = await api.recall(error);
      setResults(data.results);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleRecall();
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Input area */}
      <div className="p-6 border-b border-border">
        <div className="mb-3 flex items-center justify-between">
          <label className="text-xs font-mono text-text-muted uppercase tracking-widest">
            paste your error
          </label>
          <span className="text-[10px] font-mono text-text-faint">
            ⌘↵ to search
          </span>
        </div>

        <div className="glow-border rounded-lg border border-border transition-all duration-200">
          <textarea
            value={error}
            onChange={(e) => setError(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`TypeError: Cannot read properties of undefined\n  at Component (/src/app.tsx:42:7)`}
            rows={6}
            className="w-full bg-transparent font-mono text-sm text-text-primary placeholder:text-text-faint
                       p-4 resize-none rounded-lg focus:outline-none leading-relaxed"
            spellCheck={false}
          />
        </div>

        <button
          onClick={handleRecall}
          disabled={!error.trim() || loading}
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5
                     bg-cyan text-base font-mono text-sm font-medium rounded-lg
                     hover:bg-cyan/90 active:scale-[0.98] transition-all duration-150
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>searching memory...</span>
            </>
          ) : (
            <>
              <Search size={14} />
              <span>search memory</span>
            </>
          )}
        </button>
      </div>

      {/* Results area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Error state */}
        {err && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-danger-dim border border-danger/30 animate-fade-in">
            <AlertCircle size={15} className="text-danger mt-0.5 shrink-0" />
            <p className="text-sm font-mono text-danger">{err}</p>
          </div>
        )}

        {/* Empty state — before first search */}
        {!hasSearched && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center py-16">
            <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center mb-4">
              <Search size={20} className="text-text-faint" />
            </div>
            <p className="text-sm font-mono text-text-muted mb-1">
              no query yet
            </p>
            <p className="text-xs text-text-faint max-w-xs">
              paste a stack trace above to search your bug memory
            </p>
          </div>
        )}

        {/* No results */}
        {hasSearched && !loading && results?.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center py-16 animate-fade-in">
            <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center mb-4">
              <ChevronRight size={20} className="text-text-faint" />
            </div>
            <p className="text-sm font-mono text-text-muted mb-1">
              nothing in memory
            </p>
            <p className="text-xs text-text-faint max-w-xs">
              this looks like a new bug. fix it and log it using the submit tab.
            </p>
          </div>
        )}

        {/* Results */}
        {results && results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-mono text-text-muted uppercase tracking-widest">
                {results.length} match{results.length !== 1 ? "es" : ""} found
              </p>
              <p className="text-[10px] font-mono text-text-faint">
                ranked by relevance × confidence
              </p>
            </div>
            {results.map((result, i) => (
              <ResultCard key={result.bugId} result={result} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
