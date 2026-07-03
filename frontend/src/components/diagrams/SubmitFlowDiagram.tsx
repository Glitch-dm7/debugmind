import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  type Node,
  type Edge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ProcessNode } from "./nodes";

const nodeTypes = { process: ProcessNode };

const defaultEdgeOptions = {
  animated: true,
  style: { stroke: "#22D3EE", strokeWidth: 1.5 },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#22D3EE" },
};

export default function SubmitFlowDiagram() {
  const nodes: Node[] = useMemo(
    () => [
      {
        id: "normalize",
        type: "process",
        position: { x: 0, y: 0 },
        data: {
          label: "Normalize Error",
          subtitle: "Strip noise: timestamps, addrs, paths",
          icon: "fingerprint",
          color: "bg-cyan-dim",
          iconColor: "text-cyan",
          description:
            "Strips timestamps, memory addresses, file paths, and line numbers so embeddings capture the real error pattern — not noisy per-run details.",
        },
      },
      {
        id: "fingerprint",
        type: "process",
        position: { x: 0, y: 130 },
        data: {
          label: "Compute Fingerprint",
          subtitle: "MD5 of first 500 chars",
          icon: "gitbranch",
          color: "bg-cyan-dim",
          iconColor: "text-cyan",
          description:
            "Creates an MD5 hash of the first 500 normalized characters. Future errors with the same hash are an exact match — no Cognee round-trip needed.",
        },
      },
      {
        id: "add",
        type: "process",
        position: { x: 0, y: 260 },
        data: {
          label: "Cognee — /api/v1/add",
          subtitle: "Upload as text document",
          icon: "upload",
          color: "bg-cyan-dim",
          iconColor: "text-cyan",
          description:
            "Uploads the normalized bug report as a text document to the Cognee dataset (scoped by projectId).",
        },
      },
      {
        id: "cognify",
        type: "process",
        position: { x: 0, y: 390 },
        data: {
          label: "Cognee — /api/v1/cognify",
          subtitle: "Chunk, embed, extract entities",
          icon: "brain",
          color: "bg-cyan-dim",
          iconColor: "text-cyan",
          description:
            "Processes the uploaded document: chunks the text, extracts entities and relationships, creates vector embeddings, and builds the knowledge graph.",
        },
      },
      {
        id: "persist",
        type: "process",
        position: { x: 0, y: 520 },
        data: {
          label: "Persist to bugs.json",
          subtitle: "Store metadata locally",
          icon: "database",
          color: "bg-purple-900/30",
          iconColor: "text-purple-400",
          description:
            "Saves structured metadata — bug ID, fingerprint, language, framework, project, tags, and fix — to the local bugs.json file for fast retrieval.",
        },
      },
    ],
    []
  );

  const edges: Edge[] = useMemo(
    () => [
      { id: "n→f", source: "normalize", target: "fingerprint" },
      { id: "f→a", source: "fingerprint", target: "add" },
      { id: "a→c", source: "add", target: "cognify" },
      { id: "c→p", source: "cognify", target: "persist" },
    ],
    []
  );

  return (
    <div className="h-[620px] w-full rounded-xl border border-border bg-surface/50 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        panOnScroll={false}
        preventScrolling={false}
        minZoom={1}
        maxZoom={1}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#2A2F3A" gap={20} />
      </ReactFlow>
    </div>
  );
}
