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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-sky-700">RAG tester</p>
          <h1 className="text-3xl font-semibold">{header.title}</h1>
          <p className="text-sm text-slate-600">{header.subtitle}</p>
          <p className="text-xs text-slate-500">
            Secrets stay server-side; /api/rag/suggest reads RAG_API_KEY, RAG_MODEL,
            and RAG_PROVIDER from env.
          </p>
        </header>

        <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-md shadow-sky-500/10">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Payer ID (optional)
              </span>
              <input
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-sky-200 focus:ring"
                value={payerId}
                onChange={(e) => setPayerId(e.target.value)}
                placeholder="STEDI or BCBS-PLACEHOLDER"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Specialty (optional)
              </span>
              <input
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-sky-200 focus:ring"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="primary_care, orthopedics, etc."
              />
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Claim payload (JSON)
              </span>
              <button
                className="text-xs text-sky-700 underline-offset-4 hover:underline"
                type="button"
                onClick={() => navigator.clipboard?.writeText(claimJson || "")}
              >
                Copy
              </button>
            </div>
            <textarea
              className="h-72 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 outline-none ring-sky-200 focus:ring"
              value={claimJson}
              onChange={(e) => setClaimJson(e.target.value)}
              spellCheck={false}
            />
          </div>

          <div className="flex flex-col gap-3">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-sky-500 disabled:opacity-70"
              type="button"
              onClick={send}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send to RAG"}
            </button>
            {error && (
              <p className="rounded-md border border-rose-500/40 bg-rose-500/5 p-3 text-xs text-rose-700">
                {error}
              </p>
            )}
            {response && (
              <pre className="max-h-80 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800">
                {response}
              </pre>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}



