import { useState, useEffect } from "react";
import {
  Folder, FolderOpen, Trash2, RotateCcw,
  AlertTriangle, Loader2, Archive
} from "lucide-react";
import { api } from "../api/client";

interface Project {
  id: string;
  name: string;
  archived: boolean;
  createdAt: string;
  archivedAt?: string;
  datasetId?: string;
}

export function ProjectsPanel() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmHardDelete, setConfirmHardDelete] = useState<string | null>(null);

  async function fetchProjects() {
    try {
      const data = await api.getProjects();
      setProjects(data.projects ?? []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchProjects(); }, []);

  async function handleArchive(projectId: string) {
    setActionLoading(projectId);
    try {
      await api.archiveProject(projectId, false);
      await fetchProjects();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleUnarchive(projectId: string) {
    setActionLoading(projectId);
    try {
      await api.unarchiveProject(projectId);
      await fetchProjects();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleHardDelete(projectId: string) {
    setActionLoading(projectId);
    setConfirmHardDelete(null);
    try {
      await api.archiveProject(projectId, true);
      await fetchProjects();
    } finally {
      setActionLoading(null);
    }
  }

  const active   = projects.filter(p => !p.archived);
  const archived = projects.filter(p => p.archived);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={16} className="animate-spin text-text-muted" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-16">
        <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border
                        flex items-center justify-center mb-4">
          <Folder size={20} className="text-text-faint" />
        </div>
        <p className="text-sm font-mono text-text-muted mb-1">no projects yet</p>
        <p className="text-xs text-text-faint max-w-xs">
          projects appear here automatically when you log your first bug
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">

      {/* Active projects */}
      {active.length > 0 && (
        <div>
          <p className="text-[10px] font-mono text-text-faint uppercase
                        tracking-widest mb-3">
            active — {active.length}
          </p>
          <div className="space-y-2">
            {active.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 rounded-xl
                           border border-border bg-surface animate-fade-in"
              >
                <div className="flex items-center gap-3">
                  <FolderOpen size={14} className="text-cyan shrink-0" />
                  <div>
                    <p className="font-mono text-sm text-text-primary">
                      {project.name}
                    </p>
                    <p className="text-[10px] font-mono text-text-faint mt-0.5">
                      created {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleArchive(project.id)}
                  disabled={actionLoading === project.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                             border border-border text-xs font-mono text-text-muted
                             hover:border-warning hover:text-warning
                             transition-colors duration-150 disabled:opacity-40"
                >
                  {actionLoading === project.id
                    ? <Loader2 size={11} className="animate-spin" />
                    : <Archive size={11} />
                  }
                  archive
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Archived projects */}
      {archived.length > 0 && (
        <div>
          <p className="text-[10px] font-mono text-text-faint uppercase
                        tracking-widest mb-3">
            archived — {archived.length}
          </p>
          <div className="space-y-2">
            {archived.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 rounded-xl
                           border border-border bg-surface opacity-60
                           animate-fade-in"
              >
                <div className="flex items-center gap-3">
                  <Folder size={14} className="text-text-faint shrink-0" />
                  <div>
                    <p className="font-mono text-sm text-text-muted line-through">
                      {project.name}
                    </p>
                    <p className="text-[10px] font-mono text-text-faint mt-0.5">
                      archived {project.archivedAt
                        ? new Date(project.archivedAt).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Restore */}
                  <button
                    onClick={() => handleUnarchive(project.id)}
                    disabled={actionLoading === project.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                               border border-border text-xs font-mono text-text-muted
                               hover:border-success hover:text-success
                               transition-colors duration-150 disabled:opacity-40"
                  >
                    {actionLoading === project.id
                      ? <Loader2 size={11} className="animate-spin" />
                      : <RotateCcw size={11} />
                    }
                    restore
                  </button>

                  {/* Hard delete — two-step confirm */}
                  {confirmHardDelete === project.id ? (
                    <div className="flex items-center gap-1.5 animate-fade-in">
                      <span className="text-[10px] font-mono text-danger">
                        sure?
                      </span>
                      <button
                        onClick={() => handleHardDelete(project.id)}
                        disabled={actionLoading === project.id}
                        className="px-3 py-1.5 rounded-lg border border-danger
                                   text-xs font-mono text-danger
                                   hover:bg-danger-dim transition-colors duration-150"
                      >
                        delete forever
                      </button>
                      <button
                        onClick={() => setConfirmHardDelete(null)}
                        className="px-3 py-1.5 rounded-lg border border-border
                                   text-xs font-mono text-text-muted
                                   hover:text-text-primary transition-colors duration-150"
                      >
                        cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmHardDelete(project.id)}
                      disabled={actionLoading === project.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                 border border-border text-xs font-mono text-text-muted
                                 hover:border-danger hover:text-danger
                                 transition-colors duration-150 disabled:opacity-40"
                    >
                      <Trash2 size={11} />
                      purge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* forget() explainer — makes the HLD concept visible in the UI */}
      <div className="p-4 rounded-xl border border-border bg-surface-2">
        <div className="flex items-start gap-2">
          <AlertTriangle size={12} className="text-text-faint mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-[10px] font-mono text-text-faint uppercase tracking-widest">
              how forget() works
            </p>
            <p className="text-xs text-text-faint leading-relaxed">
              <span className="text-text-muted">archive</span> — soft delete.
              bugs are excluded from future recall but data is preserved.
              you can restore anytime.
            </p>
            <p className="text-xs text-text-faint leading-relaxed">
              <span className="text-text-muted">purge</span> — hard delete.
              permanently removes the dataset from cognee's knowledge graph.
              cannot be undone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}