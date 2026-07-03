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

export default function PipelineDiagram() {
  const nodes: Node[] = useMemo(
    () => [
      {
        id: "remember",
        type: "process",
        position: { x: 0, y: 0 },
        data: {
          label: "Remember",
          subtitle: "Ingest + chunk + embed",
          icon: "upload",
          color: "bg-cyan-dim",
          iconColor: "text-cyan",
          description:
            "Ingests raw data, normalizes it, chunks documents, extracts entities and relationships, creates vector embeddings for the knowledge graph.",
        },
      },
      {
        id: "recall",
        type: "process",
        position: { x: 0, y: 140 },
        data: {
          label: "Recall",
          subtitle: "Query KG via GRAPH_COMPLETION",
          icon: "search",
          color: "bg-success-dim",
          iconColor: "text-success",
          description:
            "Queries the knowledge graph using auto-routed search types (defaults to GRAPH_COMPLETION). Returns narrative answers grounded in stored memory.",
        },
      },
      {
        id: "improve",
        type: "process",
        position: { x: 0, y: 280 },
        data: {
          label: "Improve",
          subtitle: "Enrich graph, bridge sessions",
          icon: "sparkles",
          color: "bg-warning/10",
          iconColor: "text-warning",
          description:
            "Enriches the graph with derived retrieval structures and bridges session memory into the permanent knowledge base for future recall.",
        },
      },
      {
        id: "forget",
        type: "process",
        position: { x: 0, y: 420 },
        data: {
          label: "Forget",
          subtitle: "Soft/hard delete datasets",
          icon: "database",
          color: "bg-danger-dim",
          iconColor: "text-danger",
          description:
            "Removes memory at item, dataset, or user scope. Supports soft delete (tombstone records that filter results) and hard delete (dataset removal from Cognee).",
        },
      },
    ],
    []
  );

  const edges: Edge[] = useMemo(
    () => [
      { id: "r→rec", source: "remember", target: "recall" },
      { id: "rec→imp", source: "recall", target: "improve" },
      { id: "imp→for", source: "improve", target: "forget" },
    ],
    []
  );

  return (
    <div className="h-[520px] w-full rounded-xl border border-border bg-surface/50 overflow-hidden">
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
