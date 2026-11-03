"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { getDeviceDefinition } from "@/lib/deviceCatalog";
import type { DeviceNodeData } from "@/lib/types";

export function NetworkDeviceNode({
  type,
  data,
  selected,
}: NodeProps & { type?: string }) {
  const kind = type ?? "router";
  const def = getDeviceDefinition(kind);
  const Icon = def.icon;
  const nodeData = data as DeviceNodeData;
  const label = nodeData?.label ?? def.label;
  const ip = nodeData?.ipAddress?.trim();
  const onPath = nodeData?.onPath;
  const traceRole = nodeData?.traceRole;

  let ring = selected ? "ring-2 ring-blue-400 ring-offset-1" : "";
  if (traceRole === "source") ring = "ring-2 ring-emerald-500 ring-offset-1";
  if (traceRole === "destination") ring = "ring-2 ring-rose-500 ring-offset-1";
  if (onPath && !traceRole) ring = "ring-2 ring-amber-400 ring-offset-1";

  return (
    <div
      className={`min-w-[120px] rounded-lg border-2 px-3 py-2 shadow-sm ${def.border} ${def.bg} ${ring}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-600" />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-slate-600"
      />
      <Handle type="target" position={Position.Left} className="!bg-slate-600" />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-slate-600"
      />
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-700" strokeWidth={2} />
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-slate-800">
            {label}
          </div>
          {ip ? (
            <div className="truncate font-mono text-[10px] text-slate-600">
              {ip}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
