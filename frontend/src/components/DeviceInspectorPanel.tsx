"use client";

import { getDeviceDefinition } from "@/lib/deviceCatalog";
import type { PathResult } from "@/lib/pathfinding";

type DeviceInspectorPanelProps = {
  nodeId: string | null;
  nodeKind: string | null;
  label: string;
  ipAddress: string;
  onLabelChange: (value: string) => void;
  onIpChange: (value: string) => void;
  traceMode: boolean;
  traceStep: "source" | "destination" | "idle";
  traceSourceId: string | null;
  traceDestId: string | null;
  pathResult: PathResult | null;
  pathLabels: string[];
  onTraceModeToggle: () => void;
  onClearTrace: () => void;
};

export function DeviceInspectorPanel({
  nodeId,
  nodeKind,
  label,
  ipAddress,
  onLabelChange,
  onIpChange,
  traceMode,
  traceStep,
  traceSourceId,
  traceDestId,
  pathResult,
  pathLabels,
  onTraceModeToggle,
  onClearTrace,
}: DeviceInspectorPanelProps) {
  const def = nodeKind ? getDeviceDefinition(nodeKind) : null;

  return (
    <aside className="flex w-72 shrink-0 flex-col border-l border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Device
        </h2>
        {nodeId && def ? (
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {def.label}
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-500">
            캔버스에서 장비를 클릭하면 이름·IP를 설정할 수 있습니다.
          </p>
        )}
      </div>

      {nodeId ? (
        <div className="space-y-4 p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Name
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => onLabelChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              IP address
            </label>
            <input
              type="text"
              value={ipAddress}
              onChange={(e) => onIpChange(e.target.value)}
              placeholder="e.g. 192.168.1.10"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
            />
          </div>
        </div>
      ) : null}

      <div className="mt-auto border-t border-slate-200 p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Packet trace
        </h2>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
          출발지 장비 → 목적지 장비 순으로 클릭하면 최단 홉 경로를 표시합니다.
        </p>
        <button
          type="button"
          onClick={onTraceModeToggle}
          className={`mt-3 w-full rounded-lg px-3 py-2 text-sm font-medium ${
            traceMode
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "border border-slate-200 text-slate-800 hover:bg-slate-50"
          }`}
        >
          {traceMode ? "추적 모드 끄기" : "패킷 추적 모드"}
        </button>
        {traceMode ? (
          <p className="mt-2 text-xs text-emerald-700">
            {traceStep === "source"
              ? "출발지 장비를 클릭하세요."
              : traceStep === "destination"
                ? "목적지 장비를 클릭하세요."
                : "경로가 표시되었습니다."}
          </p>
        ) : null}
        {pathResult && pathLabels.length > 0 ? (
          <ol className="mt-3 max-h-36 list-decimal space-y-1 overflow-y-auto pl-4 text-xs text-slate-700">
            {pathLabels.map((hop, i) => (
              <li key={`${hop}-${i}`}>{hop}</li>
            ))}
          </ol>
        ) : null}
        {traceSourceId && traceDestId && !pathResult ? (
          <p className="mt-2 text-xs text-red-600">연결된 경로가 없습니다.</p>
        ) : null}
        <button
          type="button"
          onClick={onClearTrace}
          className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
        >
          경로 지우기
        </button>
      </div>
    </aside>
  );
}
