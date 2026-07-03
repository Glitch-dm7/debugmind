import { useState } from "react";
import { Plus, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { api, type SubmitBugPayload } from "../api/client";

const LANGUAGES = ["typescript", "javascript", "python", "go", "rust", "java", "ruby", "other"];
const FRAMEWORKS = ["react", "nextjs", "fastapi", "django", "gin", "express", "spring", "none"];

export function SubmitPanel() {
  const [form, setForm] = useState<SubmitBugPayload>({
    rawError: "",
    fix: "",
    language: "typescript",
    framework: "react",
    projectId: "",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function set(key: keyof SubmitBugPayload, value: any) {
    setForm((f) => ({ ...f, [key]: value }));
    setSuccess(false);
    setErr(null);
  }

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase().replace(/,/g, "");
      if (tag && !form.tags.includes(tag)) {
        set("tags", [...form.tags, tag]);
      }
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    set("tags", form.tags.filter((t) => t !== tag));
  }

  async function handleSubmit() {
    if (!form.rawError.trim() || !form.fix.trim() || !form.projectId.trim()) return;
    setLoading(true);
    setErr(null);
    setSuccess(false);

    try {
      await api.submitBug(form);
      setSuccess(true);
      // Reset form after success
      setForm({
        rawError: "",
        fix: "",
        language: "typescript",
        framework: "react",
        projectId: form.projectId, // keep project
        tags: [],
      });
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  const isValid = form.rawError.trim() && form.fix.trim() && form.projectId.trim();

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-5">

      {/* Project ID */}
      <div>
        <label className="block text-[10px] font-mono text-text-faint uppercase tracking-widest mb-2">
          project id
        </label>
        <input
          type="text"
          value={form.projectId}
          onChange={(e) => set("projectId", e.target.value)}
          placeholder="proj-alpha"
          className="w-full bg-surface border border-border rounded-lg px-3 py-2.5
                     font-mono text-sm text-text-primary placeholder:text-text-faint
                     focus:border-cyan focus:shadow-[0_0_0_1px_#22D3EE,0_0_16px_rgba(34,211,238,0.12)]
                     transition-all duration-200"
        />
      </div>

      {/* Language + Framework row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-mono text-text-faint uppercase tracking-widest mb-2">
            language
          </label>
          <select
            value={form.language}
            onChange={(e) => set("language", e.target.value)}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2.5
                       font-mono text-sm text-text-primary
                       focus:border-cyan transition-all duration-200 cursor-pointer"
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l} className="bg-surface">
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-mono text-text-faint uppercase tracking-widest mb-2">
            framework
          </label>
          <select
            value={form.framework}
            onChange={(e) => set("framework", e.target.value)}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2.5
                       font-mono text-sm text-text-primary
                       focus:border-cyan transition-all duration-200 cursor-pointer"
          >
            {FRAMEWORKS.map((f) => (
              <option key={f} value={f} className="bg-surface">
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error textarea */}
      <div>
        <label className="block text-[10px] font-mono text-text-faint uppercase tracking-widest mb-2">
          error / stack trace
        </label>
        <div className="glow-border rounded-lg border border-border transition-all duration-200">
          <textarea
            value={form.rawError}
            onChange={(e) => set("rawError", e.target.value)}
            placeholder={`TypeError: Cannot read properties of undefined\n  at render (/src/app.tsx:42:7)`}
            rows={6}
            spellCheck={false}
            className="w-full bg-transparent font-mono text-sm text-text-primary
                       placeholder:text-text-faint p-4 resize-none rounded-lg
                       focus:outline-none leading-relaxed"
          />
        </div>
      </div>

      {/* Fix textarea */}
      <div>
        <label className="block text-[10px] font-mono text-text-faint uppercase tracking-widest mb-2">
          what fixed it
        </label>
        <div className="glow-border rounded-lg border border-border transition-all duration-200">
          <textarea
            value={form.fix}
            onChange={(e) => set("fix", e.target.value)}
            placeholder="Describe the root cause and exactly what you did to fix it..."
            rows={5}
            className="w-full bg-transparent text-sm text-text-primary
                       placeholder:text-text-faint p-4 resize-none rounded-lg
                       focus:outline-none leading-relaxed"
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-[10px] font-mono text-text-faint uppercase tracking-widest mb-2">
          tags <span className="normal-case text-text-faint">(enter or comma to add)</span>
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {form.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md
                         bg-cyan-dim border border-cyan/20 font-mono text-xs text-cyan"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="text-cyan/60 hover:text-cyan transition-colors"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={addTag}
          placeholder="auth, jwt, react..."
          className="w-full bg-surface border border-border rounded-lg px-3 py-2.5
                     font-mono text-sm text-text-primary placeholder:text-text-faint
                     focus:border-cyan transition-all duration-200"
        />
      </div>

      {/* Feedback messages */}
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-success-dim border border-success/30 animate-fade-in">
          <CheckCircle2 size={14} className="text-success shrink-0" />
          <p className="text-xs font-mono text-success">
            bug logged to memory — cognee is building the graph (~45s)
          </p>
        </div>
      )}
      {err && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-danger-dim border border-danger/30 animate-fade-in">
          <AlertCircle size={14} className="text-danger mt-0.5 shrink-0" />
          <p className="text-xs font-mono text-danger">{err}</p>
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!isValid || loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3
                   bg-surface-2 border border-border rounded-lg
                   font-mono text-sm text-text-primary
                   hover:border-cyan hover:text-cyan hover:bg-cyan-glow
                   active:scale-[0.98] transition-all duration-150
                   disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            <span>logging to memory...</span>
          </>
        ) : (
          <>
            <Plus size={14} />
            <span>log this bug</span>
          </>
        )}
      </button>
    </div>
  );
}
