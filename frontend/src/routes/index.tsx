import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { Search, Plus, Network, ArrowRight, Bug, Sparkles } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Semantic Search",
    desc: "Paste a stack trace and instantly find similar bugs across all your projects using vector + graph memory.",
    color: "text-cyan",
    bgColor: "bg-cyan-dim",
    borderColor: "border-cyan/20",
  },
  {
    icon: Plus,
    title: "Log & Learn",
    desc: "Every fix you log strengthens the knowledge graph. Build a growing memory of solutions for your team.",
    color: "text-success",
    bgColor: "bg-success-dim",
    borderColor: "border-success/20",
  },
  {
    icon: Network,
    title: "Graph-Powered",
    desc: "Cognee\u2019s knowledge graph connects related errors, frameworks, and fixes \u2014 surfacing insights you\u2019d miss with search alone.",
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/20",
  },
];

export default function LandingPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* ── Hero ── */}
      <section className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-size-[64px_64px]" />

        <motion.div
          className="absolute -top-48 -right-48 w-96 h-96 rounded-full bg-cyan/5 blur-[128px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-48 -left-48 w-96 h-96 rounded-full bg-cyan/5 blur-[128px]"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-dim border border-cyan/20 mb-8">
              <Sparkles size={12} className="text-cyan" />
              <span className="text-[11px] font-mono text-cyan tracking-wider">semantic bug memory</span>
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          >
            <span className="text-text-primary">debug</span>
            <span className="text-cyan">mind</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-text-muted font-mono leading-relaxed mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            Have I seen this bug before?
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
          >
            <Link
              to="/bugs"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl
                         bg-cyan text-base font-mono text-sm font-medium
                         hover:bg-cyan/90 active:scale-[0.98] transition-all duration-150"
            >
              start searching
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>

          <motion.p
            className="mt-8 text-xs font-mono text-text-faint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.65 }}
          >
            or press{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-text-muted text-[10px]">
              ⌘K
            </kbd>{" "}
            to search
          </motion.p>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ opacity: { delay: 1.5 }, y: { duration: 2, repeat: Infinity } }}
        >
          <div className="w-5 h-8 rounded-full border border-text-faint flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-text-faint" />
          </div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
            How it works
          </h2>
          <p className="text-sm text-text-muted font-mono max-w-xl mx-auto">
            Three steps to never debug the same issue twice
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group rounded-xl border border-border bg-surface p-6 hover:border-cyan/30 hover:bg-surface/80 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              whileHover={{ y: -4 }}
            >
              <div className={`w-10 h-10 rounded-lg ${feature.bgColor} border ${feature.borderColor} flex items-center justify-center mb-4`}>
                <feature.icon size={18} className={feature.color} />
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-2">{feature.title}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-24 border-t border-border">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-cyan-dim border border-cyan/20 flex items-center justify-center mx-auto mb-6">
            <Bug size={28} className="text-cyan" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-3">
            Ready to start remembering?
          </h2>
          <p className="text-sm text-text-muted mb-8 max-w-md mx-auto">
            Paste an error, find if you've been here before, and apply the fix that worked last time.
          </p>
          <Link
            to="/bugs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                       bg-cyan text-base font-mono text-sm font-medium
                       hover:bg-cyan/90 active:scale-[0.98] transition-all duration-150"
          >
            go to bug memory
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-8 border-t border-border">
        <p className="text-center text-[10px] font-mono text-text-faint">
          powered by cognee knowledge graph &middot; vector + graph memory
        </p>
      </footer>
    </div>
  );
}
