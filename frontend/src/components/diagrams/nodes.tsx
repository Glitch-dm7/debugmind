import { useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { motion, AnimatePresence } from "motion/react";

export interface ProcessData {
  label: string;
  subtitle: string;
  icon: string;
  color: string;
  iconColor: string;
  description?: string;
}

export interface DecisionData {
  label: string;
  yesLabel?: string;
  noLabel?: string;
  description?: string;
}

function IconSvg({ icon, className }: { icon: string; className: string }) {
  const paths: Record<string, string> = {
    server: "M4 7V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3M4 7v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7M4 7h12M7 10h2M13 10h2",
    cpu: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m16-6h-2m2 6h-2M7 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2ZM9 9h6v6H9V9Z",
    brain: "M12 2a4 4 0 0 1 4 4c0 1-.4 1.9-1 2.6A4 4 0 0 1 16 12a4 4 0 0 1-1 2.6 4 4 0 0 1 0 5.4M12 2a4 4 0 0 0-4 4c0 1 .4 1.9 1 2.6A4 4 0 0 0 8 12a4 4 0 0 0 1 2.6 4 4 0 0 0 0 5.4M12 2v20M8 12h8",
    database: "M4 6c0-1.1 1.8-2 8-2s8 .9 8 2v2c0 1.1-1.8 2-8 2s-8-.9-8-2V6zm0 5c0-1.1 1.8-2 8-2s8 .9 8 2v2c0 1.1-1.8 2-8 2s-8-.9-8-2v-2zm0 5c0-1.1 1.8-2 8-2s8 .9 8 2v2c0 1.1-1.8 2-8 2s-8-.9-8-2v-2z",
    search: "M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm6-2 4 4",
    upload: "M12 16V4m0 0L8 8m4-4 4 4M4 20h16",
    zap: "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
    fingerprint: "M5.8 4a8 8 0 0 0-2.2 5.2A8 8 0 0 0 5.8 14M6.5 6.5a5 5 0 0 0-1.4 3.5A5 5 0 0 0 6.5 13.5M9.5 9.5A2 2 0 0 0 8 11.5c0 .6.2 1 .6 1.4M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10",
    gitbranch: "M6 18v-8a4 4 0 0 1 4-4h4M6 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8-16a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
    barchart: "M12 20V10m-7 10v-4m14 4v-6",
    layers: "M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5",
    filetext: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM14 2v6h6M16 13H8m0 4h8m-8-8h2",
    sparkles: "M12 2l1.2 3.6a6 6 0 0 0 3.2 3.2L20 10l-3.6 1.2a6 6 0 0 0-3.2 3.2L12 18l-1.2-3.6a6 6 0 0 0-3.2-3.2L4 10l3.6-1.2a6 6 0 0 0 3.2-3.2L12 2Z",
    check: "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  };

  const d = paths[icon] ?? paths.server;

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={d} />
    </svg>
  );
}

export function ProcessNode({ data }: NodeProps) {
  const d = data as unknown as ProcessData;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className={`rounded-xl border ${d.color} bg-surface px-5 py-4 min-w-[170px] shadow-lg cursor-default`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ boxShadow: "0 0 0 1px #22D3EE, 0 0 20px rgba(34,211,238,0.15)" }}
    >
      <Handle type="target" position={Position.Top} className="!bg-cyan !w-2 !h-2 !border-0 !pointer-events-none" />
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg ${d.color} flex items-center justify-center`}>
          <IconSvg icon={d.icon} className={d.iconColor} />
        </div>
        <div>
          <div className="text-sm font-semibold text-text-primary">{d.label}</div>
          <div className="text-[10px] font-mono text-text-faint mt-0.5">{d.subtitle}</div>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {hovered && d.description && (
          <motion.div
            className="mt-3 pt-3 border-t border-border text-[11px] text-text-muted leading-relaxed overflow-hidden"
            initial={{ opacity: 0, maxHeight: 0 }}
            animate={{ opacity: 1, maxHeight: 200 }}
            exit={{ opacity: 0, maxHeight: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {d.description}
          </motion.div>
        )}
      </AnimatePresence>
      <Handle type="source" position={Position.Bottom} className="!bg-cyan !w-2 !h-2 !border-0 !pointer-events-none" />
    </motion.div>
  );
}

export function DecisionNode({ data }: NodeProps) {
  const d = data as unknown as DecisionData;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="flex flex-col items-center cursor-default"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Handle type="target" position={Position.Top} className="!bg-warning !w-2 !h-2 !border-0 !pointer-events-none" />
      <div
        className="relative px-4 py-3 bg-warning/10 border border-warning/30 rounded-lg text-center min-w-[140px] shadow-lg"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="mx-auto text-warning">
          <path d="M6 2v8M2 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="text-xs font-semibold text-warning mt-1">{d.label}</div>
        <div className="flex justify-center gap-4 mt-2">
          {d.yesLabel && <span className="text-[10px] font-mono text-success">yes →</span>}
          {d.noLabel && <span className="text-[10px] font-mono text-danger">no →</span>}
        </div>
        <AnimatePresence initial={false}>
          {hovered && d.description && (
            <motion.div
              className="mt-3 pt-3 border-t border-warning/20 text-[11px] text-text-muted leading-relaxed text-left overflow-hidden"
              initial={{ opacity: 0, maxHeight: 0 }}
              animate={{ opacity: 1, maxHeight: 200 }}
              exit={{ opacity: 0, maxHeight: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {d.description}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Handle type="source" position={Position.Left} id="yes" className="!bg-success !w-2 !h-2 !border-0 !pointer-events-none" />
      <Handle type="source" position={Position.Bottom} id="no" className="!bg-danger !w-2 !h-2 !border-0 !pointer-events-none" />
    </motion.div>
  );
}
