import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  type Node,
  type Edge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ProcessNode, DecisionNode } from "./nodes";

const nodeTypes = { process: ProcessNode, decision: DecisionNode };

const cyanEdge = {
  animated: true,
  style: { stroke: "#22D3EE", strokeWidth: 1.5 },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#22D3EE" },
};

const greenEdge = {
  animated: true,
  style: { stroke: "#4ADE80", strokeWidth: 1.5 },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#4ADE80" },
};

const redEdge = {
  animated: true,
  style: { stroke: "#F87171", strokeWidth: 1.5 },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#F87171" },
};

const mutedEdge = {
  animated: true,
  style: { stroke: "#64748B", strokeWidth: 1.5 },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#64748B" },
};

export default function RecallFlowDiagram() {
  const nodes: Node[] = useMemo(
    () => [
      {
        id: "normalize",
        type: "process",
        position: { x: 180, y: 0 },
        data: {
          label: "Normalize + Fingerprint",
          subtitle: "Same process as submit",
          icon: "fingerprint",
          color: "bg-success-dim",
          iconColor: "text-success",
          description:
            "Applies the same normalization (strip noise) and MD5 fingerprinting as the submit path for consistent matching.",
        },
      },
      {
        id: "decision",
        type: "decision",
        position: { x: 180, y: 150 },
        data: {
          label: "Exact match in bugs.json?",
          yesLabel: "yes",
          noLabel: "no",
          description:
            "Checks the computed fingerprint against all stored bugs. A hash match means we have seen this exact error before — return the known fix instantly.",
        },
      },
      {
        id: "exact",
        type: "process",
        position: { x: -80, y: 300 },
        data: {
          label: "Return Exact Match",
          subtitle: "100% similarity, skip Cognee",
          icon: "zap",
          color: "bg-success-dim",
          iconColor: "text-success",
          description:
            "Returns the stored fix immediately at 100% similarity. No Cognee round-trip needed — this is the fast path for recurring errors.",
        },
      },
      {
        id: "cognee",
        type: "process",
        position: { x: 210, y: 300 },
        data: {
          label: "Cognee GRAPH_COMPLETION",
          subtitle: "Semantic search over KG",
          icon: "brain",
          color: "bg-success-dim",
          iconColor: "text-success",
          description:
            "Queries the knowledge graph with the error text using GRAPH_COMPLETION. Cognee returns a narrative answer describing similar bugs and their fixes.",
        },
      },
      {
        id: "rank",
        type: "process",
        position: { x: 180, y: 450 },
        data: {
          label: "Keyword Overlap + Rank",
          subtitle: "Match answer to local bugs",
          icon: "barchart",
          color: "bg-success-dim",
          iconColor: "text-success",
          description:
            "Matches Cognee's prose answer to local bug entries using word-overlap scoring then ranks by displayScore = similarity × Wilson confidence.",
        },
      },
      {
        id: "result",
        type: "process",
        position: { x: 180, y: 580 },
        data: {
          label: "Return Top 5",
          subtitle: "Sorted by displayScore",
          icon: "check",
          color: "bg-success-dim",
          iconColor: "text-success",
          description:
            "Returns the 5 highest-ranked results sorted by displayScore (Cognee similarity × Wilson score lower bound).",
        },
      },
    ],
    []
  );

  const edges: Edge[] = useMemo(
    () => [
      { id: "n→d", source: "normalize", target: "decision", ...cyanEdge },
      { id: "d→exact", source: "decision", target: "exact", sourceHandle: "yes", ...greenEdge },
      { id: "d→cognee", source: "decision", target: "cognee", sourceHandle: "no", ...redEdge },
      { id: "cognee→rank", source: "cognee", target: "rank", ...mutedEdge },
      { id: "rank→result", source: "rank", target: "result", ...mutedEdge },
    ],
    []
  );

  return (
    <div className="h-[680px] w-full rounded-xl border border-border bg-surface/50 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
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
