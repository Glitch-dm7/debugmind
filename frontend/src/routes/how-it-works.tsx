import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import {
  Brain,
  ArrowRight,
  FileText,
  GitBranch,
  Layers,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import ArchitectureDiagram from "../components/diagrams/ArchitectureDiagram";
import SubmitFlowDiagram from "../components/diagrams/SubmitFlowDiagram";
import RecallFlowDiagram from "../components/diagrams/RecallFlowDiagram";
import PipelineDiagram from "../components/diagrams/PipelineDiagram";

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
} as const;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <motion.h2
      className="text-2xl md:text-3xl font-bold text-text-primary mb-3"
      variants={sectionVariants}
    >
      {children}
    </motion.h2>
  );
}

function SectionSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-text-muted font-mono max-w-2xl mx-auto mb-12">
      {children}
    </p>
  );
}

// ─── Storage system card ────────────────────────────────────────────────────────

interface StorageCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  items: string[];
  color: string;
  borderColor: string;
  delay: number;
}

function StorageCard({ icon: Icon, title, subtitle, items, color, borderColor, delay }: StorageCardProps) {
  return (
    <motion.div
      className={`rounded-xl border ${borderColor} bg-surface p-6`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
    >
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-4`}>
        <Icon size={20} className="text-base" />
      </div>
      <h3 className="text-sm font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-[11px] font-mono text-text-faint mb-4">{subtitle}</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-xs text-text-muted">
            <span className="w-1 h-1 rounded-full bg-text-faint shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

// ─── Main page component ────────────────────────────────────────────────────────

export default function HowItWorksPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* ── Hero ── */}
      <section className="relative px-6 pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-size-[64px_64px]" />

        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-cyan/3 blur-[160px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-dim border border-cyan/20 mb-6">
              <Sparkles size={12} className="text-cyan" />
              <span className="text-[11px] font-mono text-cyan tracking-wider">system deep dive</span>
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            How It <span className="text-cyan">Works</span>
          </motion.h1>

          <motion.p
            className="text-base font-mono max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            From pasting a stack trace to finding a matching fix — here is the full journey
            through DebugMind's architecture and the Cognee knowledge graph engine.
          </motion.p>
        </div>
      </section>

      {/* ── 1. System Architecture ── */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-14"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <SectionTitle>System Architecture</SectionTitle>
          <SectionSubtitle>
            A three-tier design: React frontend, Hono API server, and Cognee knowledge graph backend
          </SectionSubtitle>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <ArchitectureDiagram />
        </motion.div>
      </section>

      {/* ── 2. Data Flow ── */}
      <section className="px-6 py-16 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-14"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <SectionTitle>Data Flow</SectionTitle>
            <SectionSubtitle>
              Two primary operations: logging a bug (Remember) and searching for one (Recall)
            </SectionSubtitle>
          </motion.div>

          <div className="grid grid-cols-1 gap-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-cyan" />
                <h3 className="text-sm font-semibold text-text-primary">Submit Flow</h3>
                <span className="text-[10px] font-mono text-text-faint ml-auto">POST /api/bugs</span>
              </div>
              <SubmitFlowDiagram />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-success" />
                <h3 className="text-sm font-semibold text-text-primary">Recall Flow</h3>
                <span className="text-[10px] font-mono text-text-faint ml-auto">POST /api/bugs/recall</span>
              </div>
              <RecallFlowDiagram />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 3. Scoring: Wilson Score ── */}
      <section className="px-6 py-16 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <SectionTitle>Confidence Scoring</SectionTitle>
            <SectionSubtitle>
              Wilson score lower bound — a statistically honest estimate that penalizes small sample sizes
            </SectionSubtitle>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: "1✓ / 1 total", naive: "100%", wilson: "21%", bar: "w-[21%]", color: "bg-danger" },
              { label: "5✓ / 5 total", naive: "100%", wilson: "57%", bar: "w-[57%]", color: "bg-warning" },
              { label: "50✓ / 50 total", naive: "100%", wilson: "93%", bar: "w-[93%]", color: "bg-success" },
            ].map((item) => (
              <motion.div
                key={item.label}
                className="rounded-xl border border-border bg-surface p-5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                whileHover={{ y: -2 }}
              >
                <p className="text-xs font-mono text-text-muted mb-3">{item.label}</p>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-sm font-mono text-text-faint">Naive: <span className="text-danger">{item.naive}</span></span>
                  <span className="text-sm font-mono text-text-faint">Wilson: <span className="text-cyan">{item.wilson}</span></span>
                </div>
                <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${item.color}`}
                    initial={{ width: 0 }}
                    whileInView={{ width: item.bar.match(/\d+/)?.[0] + "%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="rounded-xl border border-border bg-surface p-5"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-xs text-text-muted leading-relaxed">
              <span className="text-cyan font-semibold">displayScore</span> = similarity × wilsonScore
            </p>
            <p className="text-xs text-text-faint mt-2 leading-relaxed">
              A 95% similar bug with 1 confirmation ranks below an 80% similar bug with 50 confirmations.
              The Wilson score provides a conservative lower bound — the more feedback, the closer it gets
              to the true confidence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── 4. Cognee Deep Dive ── */}
      <section className="px-6 py-16 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-14"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain size={20} className="text-warning" />
            </div>
            <SectionTitle>The Cognee Engine</SectionTitle>
            <SectionSubtitle>
              An open-source knowledge graph platform that combines vector search with graph databases
            </SectionSubtitle>
          </motion.div>

          {/* Storage architecture */}
          <motion.h3
            className="text-lg font-semibold text-text-primary text-center mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Three Complementary Storage Systems
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
            <StorageCard
              icon={FileText}
              title="Relational Store"
              subtitle="SQLite (default)"
              items={[
                "Tracks documents and chunks",
                "Provenance tracking",
                "Where data came from",
                "How it links to source",
              ]}
              color="bg-blue-900/30"
              borderColor="border-blue-500/20"
              delay={0}
            />
            <StorageCard
              icon={Layers}
              title="Vector Store"
              subtitle="LanceDB (default)"
              items={[
                "Semantic embeddings",
                "Conceptually related text",
                "Numerical fingerprints",
                "Similarity scoring",
              ]}
              color="bg-purple-900/30"
              borderColor="border-purple-500/20"
              delay={0.15}
            />
            <StorageCard
              icon={GitBranch}
              title="Graph Store"
              subtitle="NetworkX (default)"
              items={[
                "Knowledge graph nodes",
                "Entity relationships",
                "Structural reasoning",
                "Cypher-style queries",
              ]}
              color="bg-cyan-dim"
              borderColor="border-cyan/20"
              delay={0.3}
            />
          </div>

          {/* Processing pipeline */}
          <motion.h3
            className="text-lg font-semibold text-text-primary text-center mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Processing Pipeline: Remember → Recall → Improve → Forget
          </motion.h3>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <PipelineDiagram />
          </motion.div>

          {/* How DebugMind uses Cognee */}
          <motion.div
            className="rounded-xl border border-border bg-surface p-6 mt-6"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <h4 className="text-sm font-semibold text-text-primary mb-3">
              How DebugMind Leverages Cognee
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-text-muted">
              <div className="space-y-2">
                <p className="flex items-start gap-2">
                  <span className="text-cyan mt-0.5">1.</span>
                  <span><strong className="text-text-primary">Remember</strong> — Bug reports are uploaded via <code className="text-cyan text-[10px]">/api/v1/add</code> as text documents with dataset names like <code className="text-cyan text-[10px]">debugmind_proj-alpha</code>.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-cyan mt-0.5">2.</span>
                  <span><strong className="text-text-primary">Cognify</strong> — Documents are chunked, entities extracted, embeddings created, and the knowledge graph is built.</span>
                </p>
              </div>
              <div className="space-y-2">
                <p className="flex items-start gap-2">
                  <span className="text-cyan mt-0.5">3.</span>
                  <span><strong className="text-text-primary">Search (GRAPH_COMPLETION)</strong> — Error text is queried against the graph. Cognee returns a narrative answer describing similar bugs and fixes.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-cyan mt-0.5">4.</span>
                  <span><strong className="text-text-primary">Keyword Overlap</strong> — Since Cognee returns prose, a keyword overlap scorer matches the answer to the best local bug entry for structured display.</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 5. Tech Stack Details ── */}
      <section className="px-6 py-16 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <SectionTitle>Tech Stack</SectionTitle>
            <SectionSubtitle>
              Everything powering DebugMind, from frontend to storage
            </SectionSubtitle>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Frontend", items: ["React 19", "Vite 8", "Tailwind v4", "TanStack Router", "Motion", "Lucide Icons"] },
              { label: "Backend", items: ["Hono 4", "Bun runtime", "TypeScript", "Axios", "Cognee HTTP API"] },
              { label: "Storage", items: ["Cognee (KG)", "LanceDB (vectors)", "SQLite (metadata)", "bugs.json (local)"] },
              { label: "Infra", items: ["Docker Compose", "Gemini 2.5 Flash", "Gemini Embedding", "Cognee SDK"] },
            ].map((group) => (
              <motion.div
                key={group.label}
                className="rounded-xl border border-border bg-surface p-4"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                whileHover={{ y: -2 }}
              >
                <h4 className="text-xs font-semibold text-text-primary mb-3">{group.label}</h4>
                <ul className="space-y-1.5">
                  {group.items.map((item) => (
                    <li key={item} className="text-[11px] font-mono text-text-muted">
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-16 border-t border-border">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-text-primary mb-3">
            See it in action
          </h2>
          <p className="text-sm text-text-muted mb-8 max-w-md mx-auto">
            Try searching your bug memory or log a new bug to see the pipeline in real time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/bugs"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                         bg-cyan text-base font-mono text-sm font-medium
                         hover:bg-cyan/90 active:scale-[0.98] transition-all duration-150"
            >
              go to bug memory
              <ArrowRight size={14} />
            </Link>
            <a
              href="https://docs.cognee.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                         border border-border font-mono text-sm text-text-muted
                         hover:text-text-primary hover:border-cyan/30 transition-all duration-150"
            >
              read cognee docs
              <ArrowRight size={14} />
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-8 border-t border-border">
        <p className="text-center text-[10px] font-mono text-text-faint">
          debugmind &middot; semantic bug memory &middot; cognee knowledge graph
        </p>
      </footer>
    </div>
  );
}
