"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type PanelState = {
  loading: boolean;
  response: string | null;
  error?: string;
};

type ProxyPayload = {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  idempotencyKey?: string;
  body?: unknown;
};

const toPretty = (value: unknown) => JSON.stringify(value, null, 2);

const sampleEligibility = {
  tradingPartnerServiceId: "60054",
  provider: { organizationName: "Provider Name", npi: "1999999984" },
  subscriber: { firstName: "John", lastName: "Doe", memberId: "AETNA9wcSu" },
  dependents: [{ firstName: "Jordan", lastName: "Doe", dateOfBirth: "20010714" }],
  encounter: { serviceTypeCodes: ["30"] },
};

const sampleClaim837P = {
  controlNumber: "00001234",
  tradingPartnerId: "STEDI",
  usageIndicator: "T", // test indicator to avoid live payer submission
  billingProvider: {
    npi: "1234567890",
    taxId: "987654321",
    name: "Demo Clinic",
    address: {
      line1: "123 Main St",
      city: "Nashville",
      state: "TN",
      postalCode: "37201",
    },
  },
  subscriber: {
    id: "W000000000",
    firstName: "JANE",
    lastName: "DOE",
    dateOfBirth: "1970-01-01",
    relationship: "self",
  },
  patient: {
    firstName: "JANE",
    lastName: "DOE",
    dateOfBirth: "1970-01-01",
  },
  claim: {
    patientControlNumber: "PCN-12345",
    totalChargeAmount: "240.00",
    placeOfServiceCode: "11",
    diagnosisCodes: ["M542", "R519"],
    serviceLines: [
      {
        procedureCode: "99213",
        modifiers: ["25"],
        chargeAmount: "180.00",
        unitCount: 1,
        diagnosisPointers: [1],
        serviceDate: "2025-01-05",
      },
      {
        procedureCode: "97110",
        modifiers: ["GP"],
        chargeAmount: "60.00",
        unitCount: 1,
        diagnosisPointers: [2],
        serviceDate: "2025-01-05",
      },
    ],
  },
};

const sampleClaimStatus276 = {
  tradingPartnerId: "MOCKPAYER",
  claim: {
    providerClaimNumber: "PCN-12345",
    payerClaimControlNumber: "PAYER-CTRL-999",
  },
  subscriber: {
    id: "W000000000",
    firstName: "JANE",
    lastName: "DOE",
    dateOfBirth: "1970-01-01",
  },
  patient: {
    firstName: "JANE",
    lastName: "DOE",
    dateOfBirth: "1970-01-01",
  },
};

const sampleEra835 = {
  transactionId: "replace-with-835-transaction-id",
  format: "json",
};

const sampleAttachment275 = {
  tradingPartnerId: "MOCKPAYER",
  controlNumber: "ATT-0001",
  claim: {
    patientControlNumber: "PCN-12345",
    payerClaimControlNumber: "PAYER-CTRL-999",
  },
  attachments: [
    {
      type: "EB",
      description: "X-ray for tooth 14",
      contentType: "application/pdf",
      content: "<base64-encoded-file>",
    },
  ],
};

const panelOrder = [
  {
    id: "eligibility",
    title: "Eligibility & Benefits (270/271)",
    description:
      "Validate coverage, copay/coinsurance, frequency and age limits before scheduling or billing.",
    defaultPath: "/2024-04-01/change/medicalnetwork/eligibility/v3",
    sample: sampleEligibility,
    docHint: "Use test key + approved test members in Stedi docs.",
  },
  {
    id: "claim",
    title: "Clean Claim Builder (837P)",
    description:
      "Generate a scrubbed professional claim with payer-aware modifiers, POS, diagnosis pointers, and totals.",
    defaultPath: "/2023-10-01/claims/submit/professional",
    sample: sampleClaim837P,
    docHint: "Send in test mode to receive 999 + 277CA loopbacks.",
  },
  {
    id: "status",
    title: "Claim Status (276/277 + 277CA)",
    description:
      "Track acceptance, pends, and denials. Great for ML labeling of rejection vs denial patterns.",
    defaultPath: "/2023-10-01/claim-status",
    sample: sampleClaimStatus276,
    docHint: "Poll until a 277/277CA is ready; use payer control numbers if present.",
  },
  {
    id: "remit",
    title: "Remittance & Denial Learning (835)",
    description:
      "Pull ERAs to learn CARC/RARC patterns and automate write-offs or appeals.",
    defaultPath: "/2023-10-01/reports/835",
    sample: sampleEra835,
    docHint: "Use transactionId from claims list or webhook payload.",
  },
  {
    id: "attachments",
    title: "Appeal Attachments (275)",
    description:
      "Send narratives, imaging, or EOBs for appeals or secondary billing.",
    defaultPath: "/2023-10-01/attachments/submit",
    sample: sampleAttachment275,
    docHint: "Most payers expect PDF; include CARC/RARC context in your note.",
  },
];

export default function Home() {
  const [results, setResults] = useState<Record<string, PanelState>>(
    Object.fromEntries(
      panelOrder.map((panel) => [
        panel.id,
        { loading: false, response: null, error: undefined },
      ]),
    ),
  );

  const [paths, setPaths] = useState<Record<string, string>>(
    Object.fromEntries(panelOrder.map((panel) => [panel.id, panel.defaultPath])),
  );

  const [payloads, setPayloads] = useState<Record<string, string>>(
    Object.fromEntries(panelOrder.map((panel) => [panel.id, toPretty(panel.sample)])),
  );

  const [idempotencyKey, setIdempotencyKey] = useState<string>("");

  const updateResult = (id: string, partial: Partial<PanelState>) => {
    setResults((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...partial },
    }));
  };

  const callProxy = async (panelId: string) => {
    try {
      updateResult(panelId, { loading: true, error: undefined, response: null });
      const parsed = JSON.parse(payloads[panelId] || "{}");

      const proxyBase =
        process.env.NEXT_PUBLIC_PROXY_URL?.replace(/\/+$/, "") || "";
      const endpoint = proxyBase
        ? `${proxyBase}/proxy`
        : "/api/stedi/proxy";

      const payload: ProxyPayload = {
        path: paths[panelId],
        method: "POST",
        idempotencyKey: idempotencyKey.trim() || undefined,
        body: parsed,
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      updateResult(panelId, {
        loading: false,
        response: toPretty(data),
        error: res.ok ? undefined : "Stedi returned an error (see payload)",
      });
    } catch (error) {
      updateResult(panelId, {
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const header = useMemo(
    () => ({
      title: "Clinix AI — Stedi Workbench",
      subtitle:
        "Enter claim + eligibility data, hit Stedi testbeds, and ship to production when you drop real keys into Vercel env vars.",
    }),
    [],
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-medium text-emerald-400">
            Eligibility • 837P • 276/277 • 835 • 275
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {header.title}
          </h1>
          <p className="max-w-4xl text-base text-slate-200">
            {header.subtitle} Auth is handled server-side via `STEDI_API_KEY`
            (no client secrets). Set `STEDI_BASE_URL` if you need a non-default
            region.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/mocks"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
            >
              View Stedi mock payloads
            </Link>
            <Link
              href="/rag"
              className="inline-flex items-center justify-center rounded-full bg-indigo-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-indigo-300"
            >
              Test RAG scrubber
            </Link>
            <Link
              href="/api/stedi/mock"
              className="text-sm text-emerald-300 underline underline-offset-4 hover:text-emerald-200"
            >
              Raw mock JSON
            </Link>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-semibold text-white">Environment tips</span>
              <span className="text-xs text-slate-300">
                Stedi test keys work only with approved test payloads. Use
                Idempotency-Key to safely retry.
              </span>
            </div>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <label className="text-xs uppercase tracking-wide text-slate-400">
                Optional Idempotency-Key
              </label>
              <input
                className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-400/40 focus:ring"
                placeholder="uuid-v4 here for retries"
                value={idempotencyKey}
                onChange={(e) => setIdempotencyKey(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {panelOrder.map((panel) => {
            const state = results[panel.id];
            return (
              <section
                key={panel.id}
                className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-emerald-500/10"
              >
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-semibold text-white">
                    {panel.title}
                  </h2>
                  <p className="text-sm text-slate-200">{panel.description}</p>
                  <p className="text-xs text-emerald-300">{panel.docHint}</p>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Stedi API path
                  </label>
                  <input
                    className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-400/40 focus:ring"
                    value={paths[panel.id]}
                    onChange={(e) =>
                      setPaths((prev) => ({ ...prev, [panel.id]: e.target.value }))
                    }
                    placeholder="/2023-10-01/eligibility-check"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                      Payload (JSON)
                    </label>
                    <button
                      type="button"
                      className="text-xs text-emerald-300 underline-offset-4 hover:underline"
                      onClick={() =>
                        navigator.clipboard?.writeText(payloads[panel.id] || "")
                      }
                    >
                      Copy
                    </button>
                  </div>
                  <textarea
                    className="h-52 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-slate-50 outline-none ring-emerald-400/40 focus:ring"
                    value={payloads[panel.id]}
                    onChange={(e) =>
                      setPayloads((prev) => ({ ...prev, [panel.id]: e.target.value }))
                    }
                    spellCheck={false}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-70"
                    disabled={state?.loading}
                    onClick={() => callProxy(panel.id)}
                  >
                    {state?.loading ? "Sending..." : "Send to Stedi"}
                  </button>
                  {state?.error && (
                    <p className="text-xs text-rose-300">Error: {state.error}</p>
                  )}
                  {state?.response && (
                    <pre className="max-h-56 overflow-auto rounded-lg border border-white/10 bg-black/60 p-3 text-xs text-slate-100">
                      {state.response}
                    </pre>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        <footer className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200">
          <p className="font-semibold text-white">Ship steps</p>
          <ol className="mt-3 list-decimal space-y-1 pl-6">
            <li>
              Add Vercel env vars: `STEDI_API_KEY` (required) and optionally
              `STEDI_BASE_URL` for non-default regions.
            </li>
            <li>Use Stedi test keys + approved fixtures to validate each flow.</li>
            <li>
              Swap test key for production when ready; UI stays the same because
              the server proxy handles auth.
            </li>
            <li>
              Extend ML layers around 277/835 responses using the response JSON shown
              here.
            </li>
          </ol>
        </footer>
      </div>
    </div>
  );
}
