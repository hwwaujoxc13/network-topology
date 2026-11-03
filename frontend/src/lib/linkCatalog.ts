import type { CSSProperties } from "react";
import type { Edge } from "@xyflow/react";

export type LinkKind =
  | "ethernet"
  | "link_1g"
  | "link_10g"
  | "link_100g"
  | "aggregation"
  | "dwdm"
  | "trunk"
  | "wireless"
  | "vpn_tunnel"
  | "wan";

export type LinkEdgeData = {
  linkType?: LinkKind;
  label?: string;
  onPath?: boolean;
};

export type LinkDefinition = {
  kind: LinkKind;
  label: string;
  description: string;
  defaultLabel?: string;
  animated: boolean;
  style: CSSProperties;
};

export const LINK_CATALOG: LinkDefinition[] = [
  {
    kind: "ethernet",
    label: "Ethernet",
    description: "General copper/fiber link",
    animated: false,
    style: { stroke: "#64748b", strokeWidth: 1.5 },
  },
  {
    kind: "link_1g",
    label: "1G",
    description: "1 Gbps circuit",
    defaultLabel: "1G",
    animated: false,
    style: { stroke: "#475569", strokeWidth: 2 },
  },
  {
    kind: "link_10g",
    label: "10G",
    description: "10 Gbps circuit",
    defaultLabel: "10G",
    animated: false,
    style: { stroke: "#2563eb", strokeWidth: 2.5 },
  },
  {
    kind: "link_100g",
    label: "100G",
    description: "100 Gbps circuit",
    defaultLabel: "100G",
    animated: false,
    style: { stroke: "#7c3aed", strokeWidth: 3 },
  },
  {
    kind: "aggregation",
    label: "Aggregation",
    description: "LAG / port-channel",
    defaultLabel: "LAG",
    animated: false,
    style: { stroke: "#0f766e", strokeWidth: 3 },
  },
  {
    kind: "dwdm",
    label: "DWDM",
    description: "Dense wavelength division multiplexing",
    defaultLabel: "DWDM",
    animated: false,
    style: { stroke: "#ea580c", strokeWidth: 3 },
  },
  {
    kind: "trunk",
    label: "Trunk",
    description: "VLAN trunk",
    defaultLabel: "Trunk",
    animated: false,
    style: { stroke: "#334155", strokeWidth: 2, strokeDasharray: "12 6" },
  },
  {
    kind: "wireless",
    label: "Wireless",
    description: "Wi-Fi / radio link",
    defaultLabel: "Wireless",
    animated: false,
    style: { stroke: "#65a30d", strokeWidth: 2, strokeDasharray: "4 4" },
  },
  {
    kind: "vpn_tunnel",
    label: "VPN tunnel",
    description: "Encrypted overlay",
    defaultLabel: "VPN",
    animated: true,
    style: { stroke: "#059669", strokeWidth: 2, strokeDasharray: "8 4" },
  },
  {
    kind: "wan",
    label: "WAN / Internet",
    description: "Wide-area or internet path",
    defaultLabel: "WAN",
    animated: false,
    style: { stroke: "#94a3b8", strokeWidth: 1.5, strokeDasharray: "2 6" },
  },
];

const linkByKind = new Map(LINK_CATALOG.map((l) => [l.kind, l]));

export function getLinkDefinition(kind: LinkKind | string): LinkDefinition {
  return linkByKind.get(kind as LinkKind) ?? linkByKind.get("ethernet")!;
}

export function getLinkTypeFromEdge(edge: Edge): LinkKind {
  const data = edge.data as LinkEdgeData | undefined;
  return data?.linkType ?? "ethernet";
}

export function buildEdgeFromLinkKind(
  connection: {
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
  },
  linkKind: LinkKind,
  id?: string,
): Edge {
  const def = getLinkDefinition(linkKind);
  return {
    id: id ?? `edge-${crypto.randomUUID()}`,
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,
    type: "networkLink",
    animated: def.animated,
    style: { ...def.style },
    data: {
      linkType: linkKind,
      label: def.defaultLabel,
    } satisfies LinkEdgeData,
  };
}

export function normalizeEdge(edge: Edge): Edge {
  const linkType = getLinkTypeFromEdge(edge);
  const def = getLinkDefinition(linkType);
  const data = edge.data as LinkEdgeData | undefined;
  return {
    ...edge,
    type: "networkLink",
    animated: edge.animated ?? def.animated,
    style: { ...def.style, ...edge.style },
    data: {
      linkType,
      label: data?.label ?? def.defaultLabel,
    },
  };
}

export function applyLinkKindToEdge(edge: Edge, linkKind: LinkKind): Edge {
  const def = getLinkDefinition(linkKind);
  const data = edge.data as LinkEdgeData | undefined;
  return {
    ...edge,
    type: "networkLink",
    animated: def.animated,
    style: { ...def.style },
    data: {
      linkType: linkKind,
      label: data?.label ?? def.defaultLabel,
    },
  };
}
