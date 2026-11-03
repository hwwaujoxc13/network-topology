import type { DeviceKind } from "@/lib/deviceCatalog";
import type { LinkEdgeData, LinkKind } from "@/lib/linkCatalog";
import type { Edge, Node, Viewport } from "@xyflow/react";

export type { DeviceKind } from "@/lib/deviceCatalog";
export type { LinkEdgeData, LinkKind } from "@/lib/linkCatalog";

export type DeviceNodeData = {
  label: string;
  ipAddress?: string;
  /** Visual flags (not persisted on save — stripped in getCanvasData) */
  onPath?: boolean;
  traceRole?: "source" | "destination" | null;
};

export type CanvasData = {
  nodes: Node<DeviceNodeData>[];
  edges: Edge<LinkEdgeData>[];
  viewport?: Viewport;
};

export type TopologySummary = {
  id: number;
  name: string;
  updatedAt: string;
};

export type TopologyDetail = TopologySummary & {
  canvasData: CanvasData;
  createdAt: string;
};

export type CanvasSelection = {
  nodeId: string | null;
  nodeLabel: string | null;
  nodeIp: string | null;
  nodeKind: string | null;
  edgeId: string | null;
  edgeLinkType: LinkKind | null;
  edgeLabel: string | null;
};

export function canvasSelectionEqual(
  a: CanvasSelection,
  b: CanvasSelection,
): boolean {
  return (
    a.nodeId === b.nodeId &&
    a.nodeLabel === b.nodeLabel &&
    a.nodeIp === b.nodeIp &&
    a.nodeKind === b.nodeKind &&
    a.edgeId === b.edgeId &&
    a.edgeLinkType === b.edgeLinkType &&
    a.edgeLabel === b.edgeLabel
  );
}
