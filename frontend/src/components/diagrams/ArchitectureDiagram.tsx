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

export default function ArchitectureDiagram() {
  const nodes: Node[] = useMemo(
    () => [
      {
        id: "frontend",
        type: "process",
        position: { x: 0, y: 0 },
        data: {
          label: "React + Vite",
          subtitle: "Frontend SPA :5173",
          icon: "server",
          color: "bg-cyan-dim",
          iconColor: "text-cyan",
          description:
            "Single-page application built with React 19 and Vite 8. Serves the UI on port 5173 with hot module replacement during development.",
        },
      },
      {
        id: "backend",
        type: "process",
        position: { x: 0, y: 170 },
        data: {
          label: "Hono + Bun",
          subtitle: "API Server :3001",
          icon: "cpu",
          color: "bg-success-dim",
          iconColor: "text-success",
          description:
            "Lightweight API server running on the Bun runtime. Handles CORS, request routing, and all business logic on port 3001.",
        },
      },
      {
        id: "cognee",
        type: "process",
        position: { x: 0, y: 340 },
        data: {
          label: "Cognee",
          subtitle: "Knowledge Graph :8000",
          icon: "brain",
          color: "bg-warning/10",
          iconColor: "text-warning",
          description:
            "Open-source knowledge graph engine. Stores bug embeddings, entities, and relationships. Runs inside Docker on port 8000.",
        },
      },
      {
        id: "json",
        type: "process",
        position: { x: 320, y: 170 },
        data: {
          label: "bugs.json",
          subtitle: "Local metadata store",
          icon: "database",
          color: "bg-purple-900/30",
          iconColor: "text-purple-400",
          description:
            "Local JSON file storing structured bug metadata — id, fingerprint, language, fix, tags, and feedback counts. Enables fast exact-match lookups without a Cognee round-trip.",
        },
      },
    ],
    []
  );

  const edges: Edge[] = useMemo(
    () => [
      {
        id: "fe→be",
        source: "frontend",
        target: "backend",
      },
      {
        id: "be→cg",
        source: "backend",
        target: "cognee",
      },
      {
        id: "be→json",
        source: "backend",
        target: "json",
        style: { stroke: "#64748B", strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#64748B" },
      },
    ],
    []
  );

  return (
    <div className="h-[440px] w-full rounded-xl border border-border bg-surface/50 overflow-hidden">
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
