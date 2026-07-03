import { Terminal, Bug, Home, BookOpen } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";

export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
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
        </Link>
      </div>

      <nav className="flex items-center gap-2">
        <Link
          to="/"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs transition-all duration-150
                     ${pathname === "/"
                       ? "bg-cyan-glow border border-cyan/20 text-cyan"
                       : "text-text-muted hover:text-text-primary hover:bg-surface"
                     }`}
        >
          <Home size={12} />
          home
        </Link>
        <Link
          to="/how-it-works"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs transition-all duration-150
                     ${pathname === "/how-it-works"
                       ? "bg-cyan-glow border border-cyan/20 text-cyan"
                       : "text-text-muted hover:text-text-primary hover:bg-surface"
                     }`}
        >
          <BookOpen size={12} />
          how it works
        </Link>
        <Link
          to="/bugs"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs transition-all duration-150
                     ${pathname === "/bugs"
                       ? "bg-cyan-glow border border-cyan/20 text-cyan"
                       : "text-text-muted hover:text-text-primary hover:bg-surface"
                     }`}
        >
          <Bug size={12} />
          bug memory
        </Link>
      </nav>
    </header>
  );
}
