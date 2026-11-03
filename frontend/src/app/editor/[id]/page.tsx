"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { DeviceInspectorPanel } from "@/components/DeviceInspectorPanel";
import { DevicePalette } from "@/components/DevicePalette";
import {
  TopologyCanvas,
  type TopologyCanvasRef,
} from "@/components/TopologyCanvas";
import { getTopology, updateTopology } from "@/lib/api";
import { EMPTY_CANVAS } from "@/lib/canvas";
import { LINK_CATALOG, type LinkKind } from "@/lib/linkCatalog";
import { findShortestPath, type PathResult } from "@/lib/pathfinding";
import {
  canvasSelectionEqual,
  type CanvasData,
  type CanvasSelection,
  type DeviceKind,
  type DeviceNodeData,
} from "@/lib/types";

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
          Loading editor…
        </div>
      }
    >
      <EditorPageInner />
    </Suspense>
  );
}

function hopLabel(node: { data?: DeviceNodeData; type?: string } | undefined) {
  if (!node) return "Unknown";
  const name = node.data?.label ?? node.type ?? "Device";
  const ip = node.data?.ipAddress?.trim();
  return ip ? `${name} (${ip})` : name;
}

function EditorPageInner() {
  const params = useParams<{ id: string }>();
  const topologyId = Number(params.id);
  const canvasRef = useRef<TopologyCanvasRef>(null);

  const [name, setName] = useState("");
  const [canvasData, setCanvasData] = useState<CanvasData>(EMPTY_CANVAS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [defaultLinkKind, setDefaultLinkKind] = useState<LinkKind>("ethernet");
  const [selection, setSelection] = useState<CanvasSelection>({
    nodeId: null,
    nodeLabel: null,
    nodeIp: null,
    nodeKind: null,
    edgeId: null,
    edgeLinkType: null,
    edgeLabel: null,
  });
  const [selectedLabel, setSelectedLabel] = useState("");
  const [selectedIp, setSelectedIp] = useState("");
  const [selectedEdgeLabel, setSelectedEdgeLabel] = useState("");
  const [selectedEdgeLinkType, setSelectedEdgeLinkType] =
    useState<LinkKind>("ethernet");

  const [traceMode, setTraceMode] = useState(false);
  const [traceStep, setTraceStep] = useState<
    "source" | "destination" | "idle"
  >("source");
  const [traceSourceId, setTraceSourceId] = useState<string | null>(null);
  const [traceDestId, setTraceDestId] = useState<string | null>(null);
  const [pathResult, setPathResult] = useState<PathResult | null>(null);
  const [pathLabels, setPathLabels] = useState<string[]>([]);

  const load = useCallback(async () => {
    if (!Number.isFinite(topologyId)) {
      setError("Invalid topology id");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const detail = await getTopology(topologyId);
      setName(detail.name);
      setCanvasData({
        nodes: detail.canvasData?.nodes ?? [],
        edges: detail.canvasData?.edges ?? [],
        viewport: detail.canvasData?.viewport ?? EMPTY_CANVAS.viewport,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [topologyId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSelectionChange = useCallback((next: CanvasSelection) => {
    setSelection((prev) =>
      canvasSelectionEqual(prev, next) ? prev : next,
    );
    setSelectedLabel(next.nodeLabel ?? "");
    setSelectedIp(next.nodeIp ?? "");
    if (!next.edgeId) {
      setSelectedEdgeLabel("");
      setSelectedEdgeLinkType("ethernet");
      return;
    }
    setSelectedEdgeLinkType(next.edgeLinkType ?? "ethernet");
    setSelectedEdgeLabel(next.edgeLabel ?? "");
  }, []);

  function handleAddDevice(kind: DeviceKind) {
    canvasRef.current?.addDevice(kind);
  }

  function handleDefaultLinkKindChange(kind: LinkKind) {
    setDefaultLinkKind(kind);
    canvasRef.current?.setDefaultLinkKind(kind);
  }

  function handleLabelChange(value: string) {
    setSelectedLabel(value);
    canvasRef.current?.updateSelectedLabel(value);
  }

  function handleIpChange(value: string) {
    setSelectedIp(value);
    canvasRef.current?.updateSelectedIpAddress(value);
  }

  function handleEdgeLabelChange(value: string) {
    setSelectedEdgeLabel(value);
    canvasRef.current?.updateSelectedEdgeLabel(value);
  }

  function handleEdgeLinkTypeChange(kind: LinkKind) {
    setSelectedEdgeLinkType(kind);
    canvasRef.current?.updateSelectedEdgeLinkType(kind);
  }

  function clearTrace() {
    setTraceSourceId(null);
    setTraceDestId(null);
    setPathResult(null);
    setPathLabels([]);
    setTraceStep("source");
  }

  function handleTraceModeToggle() {
    setTraceMode((on) => {
      if (on) clearTrace();
      else setTraceStep("source");
      return !on;
    });
  }

  function handleTraceNodeClick(nodeId: string) {
    const snapshot = canvasRef.current?.getCanvasData();
    const edges = snapshot?.edges ?? [];

    if (traceStep === "source" || !traceSourceId) {
      setTraceSourceId(nodeId);
      setTraceDestId(null);
      setPathResult(null);
      setPathLabels([]);
      setTraceStep("destination");
      return;
    }

    setTraceDestId(nodeId);
    const path = findShortestPath(edges, traceSourceId!, nodeId);
    setPathResult(path);
    if (path) {
      const nodes = snapshot?.nodes ?? [];
      setPathLabels(
        path.nodeIds.map((id) => hopLabel(nodes.find((n) => n.id === id))),
      );
    } else {
      setPathLabels([]);
    }
    setTraceStep("idle");
  }

  async function handleSave() {
    if (!Number.isFinite(topologyId)) return;
    setSaving(true);
    setSaveMessage(null);
    setError(null);
    try {
      const snapshot = canvasRef.current?.getCanvasData() ?? canvasData;
      const updated = await updateTopology(
        topologyId,
        name.trim() || "Untitled",
        snapshot,
      );
      setName(updated.name);
      setCanvasData({
        nodes: updated.canvasData.nodes,
        edges: updated.canvasData.edges,
        viewport: updated.canvasData.viewport,
      });
      setSaveMessage("Saved");
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
        Loading editor…
      </div>
    );
  }

  if (error && !name) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="text-red-700">{error}</p>
        <Link href="/" className="mt-4 inline-block text-sm underline">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-0px)] flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <Link
          href="/"
          className="text-sm text-slate-600 hover:text-slate-900 hover:underline"
        >
          ← 목록
        </Link>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-w-[200px] flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium"
          aria-label="Topology name"
        />
        {traceMode ? (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
            패킷 추적 모드
          </span>
        ) : null}
        {selection.edgeId ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">Link</span>
            <select
              value={selectedEdgeLinkType}
              onChange={(e) =>
                handleEdgeLinkTypeChange(e.target.value as LinkKind)
              }
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
            >
              {LINK_CATALOG.map((link) => (
                <option key={link.kind} value={link.kind}>
                  {link.label}
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-500">Label</span>
            <input
              type="text"
              value={selectedEdgeLabel}
              onChange={(e) => handleEdgeLabelChange(e.target.value)}
              placeholder="Optional"
              className="w-28 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
            />
          </div>
        ) : null}
        {saveMessage ? (
          <span className="text-sm text-emerald-600">{saveMessage}</span>
        ) : null}
        {error ? (
          <span className="text-sm text-red-600">{error}</span>
        ) : null}
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="ml-auto rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? "Saving…" : "저장"}
        </button>
      </header>
      <div className="flex min-h-0 flex-1">
        <DevicePalette
          onAdd={handleAddDevice}
          defaultLinkKind={defaultLinkKind}
          onDefaultLinkKindChange={handleDefaultLinkKindChange}
        />
        <div className="min-h-0 flex-1">
          <TopologyCanvas
            ref={canvasRef}
            initialData={canvasData}
            onSelectionChange={handleSelectionChange}
            traceMode={traceMode}
            onTraceNodeClick={handleTraceNodeClick}
            pathHighlight={pathResult}
            traceSourceId={traceSourceId}
            traceDestId={traceDestId}
          />
        </div>
        <DeviceInspectorPanel
          nodeId={selection.nodeId}
          nodeKind={selection.nodeKind}
          label={selectedLabel}
          ipAddress={selectedIp}
          onLabelChange={handleLabelChange}
          onIpChange={handleIpChange}
          traceMode={traceMode}
          traceStep={traceStep}
          traceSourceId={traceSourceId}
          traceDestId={traceDestId}
          pathResult={pathResult}
          pathLabels={pathLabels}
          onTraceModeToggle={handleTraceModeToggle}
          onClearTrace={clearTrace}
        />
      </div>
    </div>
  );
}
