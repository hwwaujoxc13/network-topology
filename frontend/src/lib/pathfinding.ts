import type { Edge } from "@xyflow/react";

export type PathResult = {
  nodeIds: string[];
  edgeIds: string[];
};

function buildAdjacency(edges: Edge[]): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  const add = (a: string, b: string) => {
    const list = adj.get(a) ?? [];
    list.push(b);
    adj.set(a, list);
  };
  for (const edge of edges) {
    add(edge.source, edge.target);
    add(edge.target, edge.source);
  }
  return adj;
}

function edgeBetween(
  edges: Edge[],
  a: string,
  b: string,
): string | undefined {
  return edges.find(
    (e) =>
      (e.source === a && e.target === b) ||
      (e.source === b && e.target === a),
  )?.id;
}

/** Undirected shortest path (fewest hops) over canvas links. */
export function findShortestPath(
  edges: Edge[],
  sourceId: string,
  targetId: string,
): PathResult | null {
  if (sourceId === targetId) {
    return { nodeIds: [sourceId], edgeIds: [] };
  }

  const adj = buildAdjacency(edges);
  if (!adj.has(sourceId) || !adj.has(targetId)) {
    return null;
  }

  const queue: string[] = [sourceId];
  const visited = new Set<string>([sourceId]);
  const parent = new Map<string, { node: string; edgeId?: string }>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === targetId) break;

    for (const next of adj.get(current) ?? []) {
      if (visited.has(next)) continue;
      visited.add(next);
      parent.set(next, {
        node: current,
        edgeId: edgeBetween(edges, current, next),
      });
      queue.push(next);
    }
  }

  if (!visited.has(targetId)) return null;

  const nodeIds: string[] = [];
  const edgeIds: string[] = [];
  let cursor: string | undefined = targetId;
  while (cursor) {
    nodeIds.unshift(cursor);
    if (cursor === sourceId) break;
    const step = parent.get(cursor);
    if (!step) return null;
    if (step.edgeId) edgeIds.unshift(step.edgeId);
    cursor = step.node;
  }

  return { nodeIds, edgeIds };
}
