"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";
import {
  getLinkDefinition,
  type LinkEdgeData,
} from "@/lib/linkCatalog";

function offsetPath(path: string, offset: number): string {
  if (offset === 0) return path;
  return path.replace(
    /M([\d.-]+),([\d.-]+)/,
    (_, x, y) =>
      `M${Number(x) + offset},${Number(y) + offset}`,
  );
}

export function NetworkLinkEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
  style,
}: EdgeProps) {
  const linkType = (data as LinkEdgeData | undefined)?.linkType ?? "ethernet";
  const def = getLinkDefinition(linkType);
  const edgeData = data as LinkEdgeData | undefined;
  const displayLabel = edgeData?.label ?? def.defaultLabel;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const mergedStyle = { ...def.style, ...style };
  const onPath = edgeData?.onPath;
  const isAggregation = linkType === "aggregation";
  const pathStroke = onPath
    ? { stroke: "#d97706", strokeWidth: 4, opacity: 1 }
    : {};

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...mergedStyle,
          ...pathStroke,
          ...(selected && !onPath ? { stroke: "#1d4ed8" } : {}),
        }}
      />
      {isAggregation ? (
        <BaseEdge
          id={`${id}-agg`}
          path={offsetPath(edgePath, 4)}
          style={{
            ...mergedStyle,
            strokeWidth: Math.max(Number(mergedStyle.strokeWidth ?? 2) - 1, 1),
            ...(selected ? { stroke: "#1d4ed8" } : {}),
          }}
        />
      ) : null}
      {displayLabel ? (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className="rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 shadow-sm ring-1 ring-slate-200"
          >
            {displayLabel}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}
