import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  Cloud,
  Flame,
  Globe,
  Laptop,
  Monitor,
  Network,
  Radio,
  Router,
  ScanEye,
  Server,
  ShieldAlert,
  Waypoints,
  Wifi,
  Workflow,
} from "lucide-react";

export type DeviceCategory = "Endpoint" | "Security" | "Cloud" | "Network";

export type DeviceKind =
  | "router"
  | "switch"
  | "firewall"
  | "vpn"
  | "pc"
  | "server"
  | "ips"
  | "wips"
  | "ids"
  | "cloud"
  | "load_balancer"
  | "access_point"
  | "modem"
  | "sd_wan"
  | "proxy"
  | "gateway";

export type DeviceDefinition = {
  kind: DeviceKind;
  label: string;
  category: DeviceCategory;
  border: string;
  bg: string;
  icon: LucideIcon;
};

export const DEVICE_CATALOG: DeviceDefinition[] = [
  {
    kind: "pc",
    label: "PC",
    category: "Endpoint",
    border: "border-slate-500",
    bg: "bg-slate-50",
    icon: Monitor,
  },
  {
    kind: "server",
    label: "Server",
    category: "Endpoint",
    border: "border-zinc-600",
    bg: "bg-zinc-50",
    icon: Server,
  },
  {
    kind: "ips",
    label: "IPS",
    category: "Security",
    border: "border-red-500",
    bg: "bg-red-50",
    icon: ShieldAlert,
  },
  {
    kind: "wips",
    label: "WIPS",
    category: "Security",
    border: "border-rose-500",
    bg: "bg-rose-50",
    icon: Wifi,
  },
  {
    kind: "ids",
    label: "IDS",
    category: "Security",
    border: "border-amber-600",
    bg: "bg-amber-50",
    icon: ScanEye,
  },
  {
    kind: "firewall",
    label: "Firewall",
    category: "Security",
    border: "border-orange-500",
    bg: "bg-orange-50",
    icon: Flame,
  },
  {
    kind: "vpn",
    label: "VPN",
    category: "Security",
    border: "border-violet-500",
    bg: "bg-violet-50",
    icon: Globe,
  },
  {
    kind: "cloud",
    label: "Cloud",
    category: "Cloud",
    border: "border-cyan-500",
    bg: "bg-cyan-50",
    icon: Cloud,
  },
  {
    kind: "router",
    label: "Router",
    category: "Network",
    border: "border-sky-500",
    bg: "bg-sky-50",
    icon: Router,
  },
  {
    kind: "switch",
    label: "Switch",
    category: "Network",
    border: "border-emerald-500",
    bg: "bg-emerald-50",
    icon: Network,
  },
  {
    kind: "gateway",
    label: "Gateway",
    category: "Network",
    border: "border-teal-600",
    bg: "bg-teal-50",
    icon: Waypoints,
  },
  {
    kind: "load_balancer",
    label: "Load Balancer",
    category: "Network",
    border: "border-indigo-500",
    bg: "bg-indigo-50",
    icon: Workflow,
  },
  {
    kind: "access_point",
    label: "Access Point",
    category: "Network",
    border: "border-lime-600",
    bg: "bg-lime-50",
    icon: Wifi,
  },
  {
    kind: "modem",
    label: "Modem",
    category: "Network",
    border: "border-stone-500",
    bg: "bg-stone-50",
    icon: Radio,
  },
  {
    kind: "sd_wan",
    label: "SD-WAN",
    category: "Network",
    border: "border-blue-600",
    bg: "bg-blue-50",
    icon: Globe,
  },
  {
    kind: "proxy",
    label: "Proxy",
    category: "Network",
    border: "border-fuchsia-500",
    bg: "bg-fuchsia-50",
    icon: ArrowLeftRight,
  },
];

const FALLBACK: DeviceDefinition = {
  kind: "router",
  label: "Device",
  category: "Network",
  border: "border-gray-400",
  bg: "bg-gray-50",
  icon: Laptop,
};

const byKind = new Map<DeviceKind, DeviceDefinition>(
  DEVICE_CATALOG.map((d) => [d.kind, d]),
);

export function getDeviceDefinition(kind: string): DeviceDefinition {
  return byKind.get(kind as DeviceKind) ?? { ...FALLBACK, kind: kind as DeviceKind, label: kind };
}

export function getDeviceLabel(kind: DeviceKind): string {
  return getDeviceDefinition(kind).label;
}

export const DEVICE_CATEGORIES: DeviceCategory[] = [
  "Endpoint",
  "Security",
  "Cloud",
  "Network",
];

export function devicesByCategory(category: DeviceCategory): DeviceDefinition[] {
  return DEVICE_CATALOG.filter((d) => d.category === category);
}
