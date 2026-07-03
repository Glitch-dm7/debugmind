import { Terminal } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-cyan-dim border border-cyan/30 flex items-center justify-center">
          <Terminal size={15} className="text-cyan" />
        </div>
        <div>
          <span className="font-mono text-sm font-semibold text-text-primary tracking-tight">
            debug<span className="text-cyan">mind</span>
          </span>
          <span className="ml-2 text-[10px] font-mono text-text-muted uppercase tracking-widest">
            v0.1
          </span>
        </div>
      </div>
    </header>
  );
}
