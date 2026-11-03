import type { CanvasData, TopologyDetail, TopologySummary } from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8080";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function listTopologies(): Promise<TopologySummary[]> {
  return request<TopologySummary[]>("/api/topologies");
}

export function getTopology(id: number): Promise<TopologyDetail> {
  return request<TopologyDetail>(`/api/topologies/${id}`);
}

export function createTopology(
  name: string,
  canvasData?: CanvasData,
): Promise<TopologyDetail> {
  return request<TopologyDetail>("/api/topologies", {
    method: "POST",
    body: JSON.stringify({ name, canvasData: canvasData ?? null }),
  });
}

export function updateTopology(
  id: number,
  name: string,
  canvasData: CanvasData,
): Promise<TopologyDetail> {
  return request<TopologyDetail>(`/api/topologies/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name, canvasData }),
  });
}

export function deleteTopology(id: number): Promise<void> {
  return request<void>(`/api/topologies/${id}`, { method: "DELETE" });
}
