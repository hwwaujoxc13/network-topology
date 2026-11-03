"use client";

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type Viewport,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { NetworkLinkEdge } from "@/components/edges/NetworkLinkEdge";
import { NetworkDeviceNode } from "@/components/nodes/NetworkDeviceNode";
import { DEVICE_CATALOG, getDeviceLabel } from "@/lib/deviceCatalog";
import {
  applyLinkKindToEdge,
  buildEdgeFromLinkKind,
  normalizeEdge,
  type LinkKind,
} from "@/lib/linkCatalog";
import type { PathResult } from "@/lib/pathfinding";
import type {
  CanvasData,
  CanvasSelection,
  DeviceKind,
  DeviceNodeData,
} from "@/lib/types";

export type TopologyCanvasRef = {
  getCanvasData: () => CanvasData;
  addDevice: (kind: DeviceKind) => void;
  updateSelectedLabel: (label: string) => void;
  updateSelectedIpAddress: (ipAddress: string) => void;
  setDefaultLinkKind: (kind: LinkKind) => void;
  updateSelectedEdgeLinkType: (kind: LinkKind) => void;
  updateSelectedEdgeLabel: (label: string) => void;
};

type TopologyCanvasProps = {
  initialData: CanvasData;
  onSelectionChange: (selection: CanvasSelection) => void;
  traceMode: boolean;
  onTraceNodeClick: (nodeId: string) => void;
  pathHighlight: PathResult | null;
  traceSourceId: string | null;
  traceDestId: string | null;
};

const nodeTypes = Object.fromEntries(
  DEVICE_CATALOG.map((d) => [d.kind, NetworkDeviceNode]),
);

const edgeTypes = {
  networkLink: NetworkLinkEdge,
};

function stripNodeData(data: DeviceNodeData): DeviceNodeData {
  const { onPath, traceRole, ...rest } = data;
  void onPath;
  void traceRole;
  return rest;
}

function stripEdgeData(data: Record<string, unknown> | undefined) {
  if (!data) return data;
  const { onPath, ...rest } = data;
  void onPath;
  return rest;
}

function TopologyCanvasInner(
  {
    initialData,
    onSelectionChange,
    traceMode,
    onTraceNodeClick,
    pathHighlight,
    traceSourceId,
    traceDestId,
  }: TopologyCanvasProps,
  ref: React.Ref<TopologyCanvasRef>,
) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<DeviceNodeData>>(
    initialData.nodes ?? [],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    (initialData.edges ?? []).map(normalizeEdge),
  );
  const viewportRef = useRef<Viewport>(
    initialData.viewport ?? { x: 0, y: 0, zoom: 1 },
  );
  const defaultLinkKindRef = useRef<LinkKind>("ethernet");
  const onSelectionChangeRef = useRef(onSelectionChange);
  onSelectionChangeRef.current = onSelectionChange;
  const onTraceNodeClickRef = useRef(onTraceNodeClick);
  onTraceNodeClickRef.current = onTraceNodeClick;
  const edgesRef = useRef(edges);
  edgesRef.current = edges;
  const { screenToFlowPosition, getViewport, setViewport, fitView } =
    useReactFlow();
  const loadedKey = useRef<string>("");

  useEffect(() => {
    const key = JSON.stringify(initialData);
    if (loadedKey.current === key) return;
    loadedKey.current = key;
    setNodes(initialData.nodes ?? []);
    setEdges((initialData.edges ?? []).map(normalizeEdge));
    const vp = initialData.viewport ?? { x: 0, y: 0, zoom: 1 };
    viewportRef.current = vp;
    setViewport(vp);
    if ((initialData.nodes ?? []).length > 0) {
      requestAnimationFrame(() => {
        fitView({ padding: 0.2, duration: 0 });
      });
    }
  }, [initialData, fitView, setEdges, setNodes, setViewport]);

  const pathNodeSet = useMemo(
    () => new Set(pathHighlight?.nodeIds ?? []),
    [pathHighlight],
  );
  const pathEdgeSet = useMemo(
    () => new Set(pathHighlight?.edgeIds ?? []),
    [pathHighlight],
  );

  const displayNodes = useMemo(
    () =>
      nodes.map((node) => {
        const traceRole =
          node.id === traceSourceId
            ? ("source" as const)
            : node.id === traceDestId
              ? ("destination" as const)
              : null;
        const onPath =
          pathNodeSet.has(node.id) && !traceRole ? true : undefined;
        return {
          ...node,
          data: {
            ...node.data,
            onPath,
            traceRole,
          },
        };
      }),
    [nodes, pathNodeSet, traceSourceId, traceDestId],
  );

  const displayEdges = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        data: {
          ...edge.data,
          onPath: pathEdgeSet.has(edge.id) ? true : undefined,
        },
        zIndex: pathEdgeSet.has(edge.id) ? 10 : edge.zIndex,
      })),
    [edges, pathEdgeSet],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      const newEdge = buildEdgeFromLinkKind(
        connection,
        defaultLinkKindRef.current,
      );
      setEdges((eds) => [...eds, newEdge]);
    },
    [setEdges],
  );

  const addDevice = useCallback(
    (kind: DeviceKind) => {
      const id = `${kind}-${crypto.randomUUID()}`;
      const position = screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      setNodes((nds) => [
        ...nds,
        {
          id,
          type: kind,
          position,
          data: { label: getDeviceLabel(kind), ipAddress: "" },
        },
      ]);
    },
    [screenToFlowPosition, setNodes],
  );

  const getCanvasData = useCallback((): CanvasData => {
    const viewport = getViewport();
    viewportRef.current = viewport;
    return {
      nodes: nodes.map((n) => ({
        ...n,
        data: stripNodeData(n.data),
      })),
      edges: edges.map((e) => ({
        ...e,
        data: stripEdgeData(e.data as Record<string, unknown>),
      })),
      viewport,
    };
  }, [edges, getViewport, nodes]);

  const updateSelectedLabel = useCallback(
    (label: string) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.selected ? { ...node, data: { ...node.data, label } } : node,
        ),
      );
    },
    [setNodes],
  );

  const updateSelectedIpAddress = useCallback(
    (ipAddress: string) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.selected
            ? { ...node, data: { ...node.data, ipAddress } }
            : node,
        ),
      );
    },
    [setNodes],
  );

  const setDefaultLinkKind = useCallback((kind: LinkKind) => {
    defaultLinkKindRef.current = kind;
  }, []);

  const updateSelectedEdgeLinkType = useCallback(
    (kind: LinkKind) => {
      setEdges((eds) =>
        eds.map((edge) =>
          edge.selected ? applyLinkKindToEdge(edge, kind) : edge,
        ),
      );
    },
    [setEdges],
  );

  const updateSelectedEdgeLabel = useCallback(
    (label: string) => {
      setEdges((eds) =>
        eds.map((edge) =>
          edge.selected
            ? { ...edge, data: { ...edge.data, label } }
            : edge,
        ),
      );
    },
    [setEdges],
  );

  useImperativeHandle(ref, () => ({
    getCanvasData,
    addDevice,
    updateSelectedLabel,
    updateSelectedIpAddress,
    setDefaultLinkKind,
    updateSelectedEdgeLinkType,
    updateSelectedEdgeLabel,
  }));

  const defaultViewport = useMemo(
    () => initialData.viewport ?? { x: 0, y: 0, zoom: 1 },
    [initialData.viewport],
  );

  const handleSelectionChange = useCallback(
    ({
      nodes: selectedNodes,
      edges: selectedEdges,
    }: {
      nodes: Node[];
      edges: Edge[];
    }) => {
      if (traceMode) return;
      const selectedNode = selectedNodes[0];
      const nodeId = selectedNode?.id ?? null;
      const nodeData = selectedNode?.data as DeviceNodeData | undefined;
      const nodeLabel = nodeId ? String(nodeData?.label ?? "") : null;
      const nodeIp = nodeId ? String(nodeData?.ipAddress ?? "") : null;
      const nodeKind = nodeId ? String(selectedNode?.type ?? "") : null;
      const edgeId = selectedEdges[0]?.id ?? null;
      const selectedEdge = edgeId
        ? edgesRef.current.find((e) => e.id === edgeId)
        : undefined;
      onSelectionChangeRef.current({
        nodeId,
        nodeLabel,
        nodeIp,
        nodeKind,
        edgeId,
        edgeLinkType: selectedEdge
          ? ((selectedEdge.data as { linkType?: LinkKind })?.linkType ??
            "ethernet")
          : null,
        edgeLabel: selectedEdge
          ? String((selectedEdge.data as { label?: string })?.label ?? "")
          : null,
      });
    },
    [traceMode],
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (!traceMode) return;
      onTraceNodeClickRef.current(node.id);
    },
    [traceMode],
  );

  return (
    <div className="h-full w-full bg-slate-100">
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: "networkLink" }}
        defaultViewport={defaultViewport}
        onMoveEnd={(_, viewport) => {
          viewportRef.current = viewport;
        }}
        onSelectionChange={handleSelectionChange}
        deleteKeyCode={["Backspace", "Delete"]}
      >
        <Background gap={16} size={1} />
        <Controls />
        <MiniMap pannable zoomable />
      </ReactFlow>
    </div>
  );
}

const TopologyCanvasInnerWithRef = forwardRef(TopologyCanvasInner);

export const TopologyCanvas = forwardRef<
  TopologyCanvasRef,
  TopologyCanvasProps
>(function TopologyCanvas(props, ref) {
  return (
    <ReactFlowProvider>
      <TopologyCanvasInnerWithRef {...props} ref={ref} />
    </ReactFlowProvider>
  );
});
