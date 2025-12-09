"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

const sampleClaim837Pv3 = {
  controlNumber: "CLM-AETNA-001",
  tradingPartnerServiceId: "60054",
  usageIndicator: "T",
  submitter: { organizationName: "Demo Clinic", contactInformation: { phoneNumber: "9999999999" } },
  receiver: { organizationName: "AETNA" },
  billing: {
    npi: "1999999984",
    employerId: "123456789",
    organizationName: "Demo Clinic",
    address: { address1: "123 Main St", city: "Nashville", state: "TN", postalCode: "37201" },
  },
  subscriber: {
    memberId: "AETNA12345",
    firstName: "JANE",
    lastName: "DOE",
    dateOfBirth: "19700101",
    gender: "F",
  },
  claimInformation: {
    claimFilingCode: "CI",
    claimFrequencyCode: "1",
    signatureIndicator: "Y",
    planParticipationCode: "A",
    benefitsAssignmentCertificationIndicator: "Y",
    releaseInformationCode: "Y",
    patientControlNumber: "PCN-AETNA-001",
    claimChargeAmount: "240.00",
    placeOfServiceCode: "11",
    healthCareCodeInformation: [{ diagnosisTypeCode: "ABK", diagnosisCode: "M542" }],
    serviceLines: [
      {
        assignedNumber: "1",
        professionalService: {
          procedureIdentifier: "HC",
          procedureCode: "99213",
          procedureModifiers: ["25"],
          lineItemChargeAmount: "180.00",
          measurementUnit: "UN",
          serviceUnitCount: "1",
          compositeDiagnosisCodePointers: [["1"]],
        },
        serviceDate: "20250105",
      },
      {
        assignedNumber: "2",
        professionalService: {
          procedureIdentifier: "HC",
          procedureCode: "97110",
          procedureModifiers: ["GP"],
          lineItemChargeAmount: "60.00",
          measurementUnit: "UN",
          serviceUnitCount: "1",
          compositeDiagnosisCodePointers: [["1"]],
        },
        serviceDate: "20250105",
      },
    ],
  },
};

const sampleClaimStatusV2 = {
  encounter: {
    beginningDateOfService: "20250105",
    endDateOfService: "20250105",
  },
  providers: [
    {
      npi: "1999999984",
      organizationName: "Demo Clinic",
      providerType: "BillingProvider",
    },
  ],
  subscriber: {
    dateOfBirth: "19700101",
    firstName: "JANE",
    lastName: "DOE",
    memberId: "AETNA12345",
  },
  tradingPartnerServiceId: "60054", // Aetna; swap to 62308 for Cigna if needed
};

const sampleAttachment275 = {
  tradingPartnerServiceId: "STEDITEST",
  controlNumber: "ATT-ERA-001",
  submitter: {
    organizationName: "Mock ERA Clinic",
    contactInformation: { phoneNumber: "9999999999" },
  },
  receiver: { organizationName: "STEDITEST" },
  claim: {
    patientControlNumber: "PCN-ERA-001",
    payerClaimControlNumber: "PAYER-CTRL-TEST",
  },
  // file fields required at root for claim-attachments/file
  contentType: "application/pdf",
  fileName: "note.pdf",
  fileContent: "JVBERi0xLjQKJcTl8uXrp/Og0MTGCjEgMCBvYmoKPDwgL1R5cGUgL0NhdGFsb2cgL1BhZ2VzIDIgMCBSID4+CmVuZG9iagoyIDAgb2JqCjw8IC9UeXBlIC9QYWdlcyAvQ291bnQgMSAvS2lkcyBbIDMgMCBSIF0gPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWyAwIDAgNjEyIDc5MiBdIC9Db250ZW50cyA0IDAgUiA+PgplbmRvYmoKNCAwIG9iago8PCAvTGVuZ3RoIDEyID4+CnN0cmVhbQpCT1ggMTAwIDEwMCAxMDAgNDAwIG5cblBERiBwbGFjZWhvbGRlciB0ZXh0Ci9FTkQgQk9YCmVuZHN0cmVhbQplbmRvYmoKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKc3RhcnR4cmVmCjE2NQolJUVPRg==", // small PDF placeholder base64
  description: "Clinical note (placeholder)",
  type: "EB",
};

const panelOrder = [
  {
    id: "eligibility",
    title: "Eligibility & Benefits (270/271)",
    description: "Validate coverage, copay/coinsurance, frequency and age limits.",
    defaultPath: "/2024-04-01/change/medicalnetwork/eligibility/v3",
    sample: sampleEligibility,
    docHint: "Use approved test members; returns plan rules and coverage.",
    method: "POST",
  },
  {
    id: "claim",
    title: "Professional Claims v3 (837P JSON)",
    description: "Submit 837P JSON; uses v3 schema and returns 277CA.",
    defaultPath: "/2024-04-01/change/medicalnetwork/professionalclaims/v3/submission",
    sample: sampleClaim837Pv3,
    docHint: "Service dates YYYYMMDD; authorization header must be raw key (no 'Key ').",
    method: "POST",
  },
  {
    id: "claimstatusv2",
    title: "Claim Status v2 (276/277)",
    description: "Real-time claim status using v2 JSON schema.",
    defaultPath: "/2024-04-01/change/medicalnetwork/claimstatus/v2",
    sample: sampleClaimStatusV2,
    docHint: "Requires payer/member; placeholder returns D0/153 for mock data.",
    method: "POST",
  },
  {
    id: "attachments",
    title: "Attachments (275) v3",
    description: "Send narratives or documents for appeals/secondary billing.",
    defaultPath: "/api/stedi/attachments",
    sample: sampleAttachment275,
    docHint:
      "One-click: posts and uploads file via server route using STEDI_API_KEY. Provide base64 fileContent and PDF contentType.",
    method: "POST",
  },
  {
    id: "ack277",
    title: "277 Acknowledgment (transactions API)",
    description: "Fetch 277CA/277 output by transactionId via core transactions API.",
    defaultPath: "/api/stedi/transactions",
    sample: { transactionId: "" },
    docHint:
      "Uses server-side STEDI_API_KEY to fetch core transactions output. Replace transactionId as needed. Returns documentDownloadUrl for 302.",
    method: "POST",
  },
  {
    id: "era835",
    title: "835 ERA (transactions API)",
    description: "Fetch ERA output by transactionId via core transactions API.",
    defaultPath: "/api/stedi/transactions",
    sample: { transactionId: "{transactionId}" },
    docHint:
      "Uses server-side STEDI_API_KEY to fetch ERA output. Replace transactionId with the ERA transactionId. Returns documentDownloadUrl for 302.",
    method: "POST",
    extraAction: "poll",
  },
];

export default function Workbench() {
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

  const header = useMemo(
    () => ({
      title: "Clinix AI — Stedi Workbench",
      subtitle:
        "Send eligibility, claims, status, and attachments through the server proxy. Auth stays server-side via STEDI_API_KEY.",
    }),
    [],
  );

  const updateResult = (id: string, partial: Partial<PanelState>) => {
    setResults((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...partial },
    }));
  };

  const updateLinkedFromClaim = (claimPayload: any) => {
    const firstLine = claimPayload?.claimInformation?.serviceLines?.[0];
    const svcDate = firstLine?.serviceDate;
    setPayloads((prev) => {
      const next = { ...prev };
      // Claim Status v2 auto-fill
      try {
        const baseStatus =
          (prev.claimstatusv2 && JSON.parse(prev.claimstatusv2)) || sampleClaimStatusV2;
        next.claimstatusv2 = toPretty({
          ...baseStatus,
          tradingPartnerServiceId:
            claimPayload?.tradingPartnerServiceId || baseStatus.tradingPartnerServiceId,
          providers: [
            {
              ...(baseStatus.providers?.[0] || {}),
              npi: claimPayload?.billing?.npi || baseStatus.providers?.[0]?.npi,
              organizationName:
                claimPayload?.billing?.organizationName || baseStatus.providers?.[0]?.organizationName,
              providerType: "BillingProvider",
            },
          ],
          subscriber: {
            ...(baseStatus.subscriber || {}),
            memberId: claimPayload?.subscriber?.memberId || baseStatus.subscriber?.memberId,
            firstName: claimPayload?.subscriber?.firstName || baseStatus.subscriber?.firstName,
            lastName: claimPayload?.subscriber?.lastName || baseStatus.subscriber?.lastName,
            dateOfBirth:
              (claimPayload?.subscriber?.dateOfBirth || "").replace(/-/g, "") ||
              baseStatus.subscriber?.dateOfBirth,
          },
          encounter: {
            ...(baseStatus.encounter || {}),
            beginningDateOfService: svcDate || baseStatus.encounter?.beginningDateOfService,
            endDateOfService: svcDate || baseStatus.encounter?.endDateOfService,
          },
        });
      } catch {
        // ignore auto-fill errors
      }

      // Attachments v3 auto-fill
      try {
        next.attachments = toPretty({
          ...(JSON.parse(prev.attachments || "{}") || sampleAttachment275),
          tradingPartnerServiceId:
            claimPayload?.tradingPartnerServiceId || sampleAttachment275.tradingPartnerServiceId,
          claim: {
            patientControlNumber:
              claimPayload?.claimInformation?.patientControlNumber ||
              sampleAttachment275.claim.patientControlNumber,
            payerClaimControlNumber: sampleAttachment275.claim.payerClaimControlNumber,
          },
        });
      } catch {
        // ignore auto-fill errors
      }

      return next;
    });
  };

  const proxyBase = process.env.NEXT_PUBLIC_PROXY_URL?.replace(/\/+$/, "") || "";
  const usingProxy = Boolean(proxyBase);
  const proxyAwarePanels: Record<string, string> = {
    attachments: "/attachments",
    ack277: "/transactions",
    era835: "/transactions",
  };

  const callProxy = async (panelId: string) => {
    try {
      updateResult(panelId, { loading: true, error: undefined, response: null });
      const parsed = JSON.parse(payloads[panelId] || "{}");

      const endpoint = proxyBase ? `${proxyBase}/proxy` : "/api/stedi/proxy";
      const directProxyPath = usingProxy ? proxyAwarePanels[panelId] : undefined;
      const pathToUse = directProxyPath || paths[panelId];
      const endpointToUse = directProxyPath ? `${proxyBase}${directProxyPath}` : endpoint;

      const panel = panelOrder.find((p) => p.id === panelId);
      const method = (panel?.method || "POST") as ProxyPayload["method"];

      const payload: ProxyPayload = directProxyPath
        ? (parsed as any)
        : {
            path: pathToUse,
            method,
            idempotencyKey: idempotencyKey.trim() || undefined,
            body: parsed,
          };

      const res = await fetch(endpointToUse, {
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

      if (res.ok && panelId === "claim") {
        updateLinkedFromClaim(parsed);
        await pollTransactions();
      }
    } catch (error) {
      updateResult(panelId, {
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const pollTransactions = async () => {
    try {
      const listEndpoint = usingProxy
        ? `${proxyBase}/transactions/list`
        : "/api/stedi/transactions/list";

      const res = await fetch(listEndpoint, { method: "GET" });
      const data = await res.json();
      if (!res.ok) {
        updateResult("ack277", {
          error: `Transactions list failed (${res.status})`,
          response: toPretty(data),
        });
        updateResult("era835", {
          error: `Transactions list failed (${res.status})`,
          response: toPretty(data),
        });
        return;
      }
      const items = data?.data?.items || data?.items || [];
      // pick most recent X12->GuideJSON (likely 277/835)
      const inbound = items.find((t: any) => (t?.operation || "").includes("X12->GuideJSON"));
      if (!inbound?.transactionId) return;
      setPayloads((prev) => ({
        ...prev,
        ack277: toPretty({ transactionId: inbound.transactionId }),
        era835: toPretty({ transactionId: inbound.transactionId }),
      }));
      updateResult("ack277", { response: toPretty({ info: "Prefilled from latest inbound transaction", transactionId: inbound.transactionId }) });
      updateResult("era835", { response: toPretty({ info: "Prefilled from latest inbound transaction", transactionId: inbound.transactionId }) });
      return inbound.transactionId as string;
    } catch (error) {
      updateResult("ack277", {
        error: error instanceof Error ? error.message : "Failed to poll transactions",
      });
    }
  };

  // Periodic polling for transactions to auto-fill 277/835
  useEffect(() => {
    const interval = setInterval(() => {
      void pollTransactions();
    }, 30000); // 30s
    return () => clearInterval(interval);
  }, [usingProxy]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-medium text-sky-300">
            Eligibility • 837P • 276/277 • 275
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {header.title}
          </h1>
          <p className="max-w-4xl text-base text-slate-200">
            {header.subtitle} Set `NEXT_PUBLIC_PROXY_URL` to point at Cloud Run if you want the UI to
            call the deployed proxy; otherwise it uses the local API route.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/mocks"
              className="inline-flex items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-sky-400"
            >
              View Stedi mock payloads
            </Link>
            <Link
              href="/api/stedi/mock"
              className="text-sm text-sky-300 underline underline-offset-4 hover:text-sky-200"
            >
              Raw mock JSON
            </Link>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-semibold text-white">Environment tips</span>
              <span className="text-xs text-slate-300">
                For 837P v3, remove the 'Key ' prefix from Authorization. Use Idempotency-Key for safe retries.
              </span>
            </div>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <label className="text-xs uppercase tracking-wide text-slate-400">
                Optional Idempotency-Key
              </label>
              <input
                className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-slate-50 outline-none ring-sky-400/40 focus:ring"
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
                className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-sky-500/10"
              >
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-semibold text-white">
                    {panel.title}
                  </h2>
                  <p className="text-sm text-slate-200">{panel.description}</p>
                  <p className="text-xs text-sky-300">{panel.docHint}</p>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Stedi API path
                  </label>
                  <input
                    className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-slate-50 outline-none ring-sky-400/40 focus:ring"
                    value={paths[panel.id]}
                    onChange={(e) =>
                      setPaths((prev) => ({ ...prev, [panel.id]: e.target.value }))
                    }
                    placeholder="/2024-04-01/change/medicalnetwork/eligibility/v3"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                      Payload (JSON)
                    </label>
                    <button
                      type="button"
                      className="text-xs text-sky-300 underline-offset-4 hover:underline"
                      onClick={() =>
                        navigator.clipboard?.writeText(payloads[panel.id] || "")
                      }
                    >
                      Copy
                    </button>
                  </div>
                  <textarea
                    className="h-52 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-slate-50 outline-none ring-sky-400/40 focus:ring"
                    value={payloads[panel.id]}
                    onChange={(e) =>
                      setPayloads((prev) => ({ ...prev, [panel.id]: e.target.value }))
                    }
                    spellCheck={false}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-sky-400 disabled:opacity-70"
                    disabled={state?.loading}
                    onClick={() => callProxy(panel.id)}
                  >
                    {state?.loading ? "Sending..." : "Send to Stedi"}
                  </button>
                  {panel.extraAction === "poll" && (
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-sky-500/60 disabled:opacity-60"
                      type="button"
                      onClick={pollTransactions}
                    >
                      {"Poll latest transactions"}
                    </button>
                  )}
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
      </div>
    </div>
  );
}

