"use client";

import {
  DEVICE_CATEGORIES,
  devicesByCategory,
  type DeviceKind,
} from "@/lib/deviceCatalog";
import { LINK_CATALOG, type LinkKind } from "@/lib/linkCatalog";

type DevicePaletteProps = {
  onAdd: (kind: DeviceKind) => void;
  defaultLinkKind: LinkKind;
  onDefaultLinkKindChange: (kind: LinkKind) => void;
};

export function DevicePalette({
  onAdd,
  defaultLinkKind,
  onDefaultLinkKindChange,
}: DevicePaletteProps) {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Devices
        </h2>
        {DEVICE_CATEGORIES.map((category) => {
          const items = devicesByCategory(category);
          if (items.length === 0) return null;
          return (
            <section key={category} className="mt-4">
              <h3 className="mb-2 text-[11px] font-semibold text-slate-400">
                {category}
              </h3>
              <div className="flex flex-col gap-1.5">
                {items.map(({ kind, label, border, bg, icon: Icon }) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => onAdd(kind)}
                    className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-left text-sm font-medium text-slate-800 transition hover:brightness-[0.98] ${border} ${bg}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                    {label}
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      <div className="border-t border-slate-200 p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Links
        </h2>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
          새로 연결하는 선에 적용됩니다. 선을 클릭해 타입을 변경할 수 있습니다.
        </p>
        <div className="mt-3 flex max-h-48 flex-col gap-1 overflow-y-auto">
          {LINK_CATALOG.map((link) => (
            <button
              key={link.kind}
              type="button"
              onClick={() => onDefaultLinkKindChange(link.kind)}
              className={`rounded-md border px-2 py-1.5 text-left text-xs transition ${
                defaultLinkKind === link.kind
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
              title={link.description}
            >
              <span className="font-medium">{link.label}</span>
              <span
                className={`mt-0.5 block truncate ${
                  defaultLinkKind === link.kind
                    ? "text-slate-300"
                    : "text-slate-400"
                }`}
              >
                {link.description}
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
