"use client";

import { useMemo, useState } from "react";

const toPretty = (value: unknown) => JSON.stringify(value, null, 2);

const sampleClaim = {
  tradingPartnerId: "STEDI",
  usageIndicator: "T",
  billingProvider: { npi: "1999999999", name: "Demo Clinic" },
  subscriber: { firstName: "Test", lastName: "User", dateOfBirth: "19800101" },
  claim: {
    patientControlNumber: "PCN-123",
    totalChargeAmount: "240.00",
    placeOfServiceCode: "11",
    diagnosisCodes: ["R519"],
    serviceLines: [
      {
        procedureCode: "99213",
        diagnosisPointers: [1],
        unitCount: 1,
        chargeAmount: "180.00",
        serviceDate: "2025-01-05",
      },
      {
        procedureCode: "97110",
        diagnosisPointers: [1],
        unitCount: 1,
        chargeAmount: "60.00",
        serviceDate: "2025-01-05",
      },
    ],
  },
};

export default function RagTestPage() {
  const header = useMemo(
    () => ({
      title: "RAG Claim Scrubber",
      subtitle:
        "Send a claim to /api/rag/suggest and view the model suggestion + retrieved rules.",
    }),
    [],
  );

  const [payerId, setPayerId] = useState("STEDI");
  const [specialty, setSpecialty] = useState("primary_care");
  const [claimJson, setClaimJson] = useState(toPretty(sampleClaim));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);

  const send = async () => {
    try {
      setLoading(true);
      setError(null);
      setResponse(null);
      const parsed = JSON.parse(claimJson || "{}");
      const ragBase =
        process.env.NEXT_PUBLIC_RAG_URL?.replace(/\/+$/, "") || "";
      const endpoint = ragBase ? `${ragBase}/rag/suggest` : "/api/rag/suggest";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payerId: payerId.trim() || undefined,
          specialty: specialty.trim() || undefined,
          claim: parsed,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || `Request failed: ${res.status}`);
      } else {
        setResponse(toPretty(data));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-slate-50">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-emerald-400">RAG tester</p>
          <h1 className="text-3xl font-semibold">{header.title}</h1>
          <p className="text-sm text-slate-200">{header.subtitle}</p>
          <p className="text-xs text-slate-300">
            Secrets stay server-side; /api/rag/suggest reads RAG_API_KEY, RAG_MODEL,
            and RAG_PROVIDER from env.
          </p>
        </header>

        <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-slate-200">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Payer ID (optional)
              </span>
              <input
                className="rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-400/40 focus:ring"
                value={payerId}
                onChange={(e) => setPayerId(e.target.value)}
                placeholder="STEDI or BCBS-PLACEHOLDER"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-200">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Specialty (optional)
              </span>
              <input
                className="rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-400/40 focus:ring"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="primary_care, orthopedics, etc."
              />
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Claim payload (JSON)
              </span>
              <button
                className="text-xs text-emerald-300 underline-offset-4 hover:underline"
                type="button"
                onClick={() => navigator.clipboard?.writeText(claimJson || "")}
              >
                Copy
              </button>
            </div>
            <textarea
              className="h-72 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-slate-50 outline-none ring-emerald-400/40 focus:ring"
              value={claimJson}
              onChange={(e) => setClaimJson(e.target.value)}
              spellCheck={false}
            />
          </div>

          <div className="flex flex-col gap-3">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-70"
              type="button"
              onClick={send}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send to RAG"}
            </button>
            {error && (
              <p className="rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-100">
                {error}
              </p>
            )}
            {response && (
              <pre className="max-h-80 overflow-auto rounded-lg border border-white/10 bg-black/60 p-3 text-xs text-slate-100">
                {response}
              </pre>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
