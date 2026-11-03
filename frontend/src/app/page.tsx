"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createTopology, deleteTopology, listTopologies } from "@/lib/api";
import type { TopologySummary } from "@/lib/types";

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function HomePage() {
  const router = useRouter();
  const [items, setItems] = useState<TopologySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listTopologies());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load topologies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate() {
    setCreating(true);
    setError(null);
    try {
      const created = await createTopology(
        `Topology ${new Date().toLocaleString("ko-KR")}`,
      );
      router.push(`/editor/${created.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create topology");
      setCreating(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`"${name}" 토폴로지를 삭제할까요?`)) return;
    setError(null);
    try {
      await deleteTopology(id);
      setItems((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col px-6 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Network Topology
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            라우터, 스위치, VPN, 방화벽을 배치하고 연결하세요.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleCreate()}
          disabled={creating}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {creating ? "Creating…" : "새 토폴로지"}
        </button>
      </header>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
          <p className="mt-1 text-xs text-red-700">
            백엔드가{" "}
            <code className="rounded bg-red-100 px-1">localhost:8080</code> 에
            실행 중인지 확인하세요.
          </p>
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="text-slate-600">저장된 토폴로지가 없습니다.</p>
          <button
            type="button"
            onClick={() => void handleCreate()}
            className="mt-4 text-sm font-medium text-slate-900 underline"
          >
            첫 토폴로지 만들기
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-4"
            >
              <div>
                <Link
                  href={`/editor/${item.id}`}
                  className="font-medium text-slate-900 hover:underline"
                >
                  {item.name}
                </Link>
                <p className="text-xs text-slate-500">
                  Updated {formatDate(item.updatedAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/editor/${item.id}`}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
                >
                  Open
                </Link>
                <button
                  type="button"
                  onClick={() => void handleDelete(item.id, item.name)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
