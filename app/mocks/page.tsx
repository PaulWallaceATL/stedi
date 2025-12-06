"use client";

import { useEffect, useMemo, useState } from "react";

type MockRequest = {
  name: string;
  description: string;
  request: {
    path: string;
    method: string;
    body: Record<string, unknown>;
  };
};

type MockResponse = { mockRequests: MockRequest[] };

const toPretty = (value: unknown) => JSON.stringify(value, null, 2);

export default function MocksPage() {
  const [data, setData] = useState<MockRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/stedi/mock", { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`Failed to fetch mocks: ${res.status}`);
        }
        const json = (await res.json()) as MockResponse;
        setData(json.mockRequests || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const header = useMemo(
    () => ({
      title: "Stedi Mock Requests",
      subtitle:
        "Ready-made payloads to POST to /api/stedi/proxy using your test key.",
    }),
    [],
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-slate-50">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-emerald-400">Stedi mocks</p>
          <h1 className="text-3xl font-semibold">{header.title}</h1>
          <p className="text-sm text-slate-200">{header.subtitle}</p>
        </header>

        {loading && <p className="text-sm text-slate-200">Loading mocks…</p>}
        {error && (
          <p className="rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-100">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {data.map((mock) => {
            const proxyPayload = toPretty({
              path: mock.request.path,
              method: mock.request.method,
              body: mock.request.body,
            });
            return (
              <section
                key={mock.name}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold text-white">{mock.name}</h2>
                  <p className="text-sm text-slate-200">{mock.description}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                      Proxy payload
                    </span>
                    <button
                      className="text-xs text-emerald-300 underline-offset-4 hover:underline"
                      type="button"
                      onClick={() =>
                        navigator.clipboard?.writeText(proxyPayload || "")
                      }
                    >
                      Copy JSON
                    </button>
                  </div>
                  <pre className="max-h-56 overflow-auto rounded-lg border border-white/10 bg-black/50 p-3 text-xs text-slate-100">
                    {proxyPayload}
                  </pre>
                </div>
              </section>
            );
          })}
        </div>

        {!loading && data.length === 0 && !error && (
          <p className="text-sm text-slate-200">
            No mocks returned. Ensure /api/stedi/mock is reachable.
          </p>
        )}
      </div>
    </div>
  );
}
