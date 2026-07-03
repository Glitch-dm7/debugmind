import { useState } from "react";

import { Search, Plus } from "lucide-react";
import { Header } from "./components/Header";
import { RecallPanel } from "./components/RecallPanel";
import { SubmitPanel } from "./components/SubmitPanel";

type Tab = "recall" | "submit";

export default function App() {
  const [tab, setTab] = useState<Tab>("recall");

  return (
    <div className="min-h-screen bg-base text-text-primary flex flex-col">
      <Header />

      {/* Main layout — two column on desktop */}
      <main className="flex-1 flex overflow-hidden">

        {/* Left sidebar — tab nav + context */}
        <aside className="w-48 shrink-0 border-r border-border flex-col py-4 px-3 md:flex">
          <nav className="space-y-1">
            <button
              onClick={() => setTab("recall")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left
                         font-mono text-xs transition-all duration-150
                         ${tab === "recall"
                           ? "bg-cyan-glow border border-cyan/20 text-cyan"
                           : "text-text-muted hover:text-text-primary hover:bg-surface"
                         }`}
            >
              <Search size={13} />
              search memory
            </button>
            <button
              onClick={() => setTab("submit")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left
                         font-mono text-xs transition-all duration-150
                         ${tab === "submit"
                           ? "bg-cyan-glow border border-cyan/20 text-cyan"
                           : "text-text-muted hover:text-text-primary hover:bg-surface"
                         }`}
            >
              <Plus size={13} />
              log a bug
            </button>
          </nav>

          {/* Subtle explainer at bottom of sidebar */}
          <div className="mt-auto pt-4 border-t border-border">
            <p className="text-[10px] font-mono text-text-faint leading-relaxed">
              paste an error.
              <br />
              find if you've been here before.
              <br />
              <br />
              powered by cognee graph memory.
            </p>
          </div>
        </aside>

        {/* Mobile tab bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 flex border-t border-border bg-base">
          <button
            onClick={() => setTab("recall")}
            className={`flex-1 flex flex-col items-center gap-1 py-3
                       font-mono text-[10px] transition-colors
                       ${tab === "recall" ? "text-cyan" : "text-text-muted"}`}
          >
            <Search size={16} />
            search
          </button>
          <button
            onClick={() => setTab("submit")}
            className={`flex-1 flex flex-col items-center gap-1 py-3
                       font-mono text-[10px] transition-colors
                       ${tab === "submit" ? "text-cyan" : "text-text-muted"}`}
          >
            <Plus size={16} />
            log bug
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden flex flex-col">

          {/* Page title */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h1 className="font-mono text-sm font-semibold text-text-primary">
                {tab === "recall" ? "have i seen this bug before?" : "log a new bug"}
              </h1>
              <p className="text-xs text-text-muted mt-0.5">
                {tab === "recall"
                  ? "paste a stack trace — memory searches graph + vector similarity"
                  : "describe the error and fix — cognee builds a knowledge graph entry"
                }
              </p>
            </div>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-hidden">
            {tab === "recall" ? <RecallPanel /> : <SubmitPanel />}
          </div>
        </div>
      </main>
    </div>
  );
}
