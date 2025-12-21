"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { claimStatus, listTransactions, getTransactionOutput, createAttachment } from "../../lib/stediClient";
import ClaimIntelligence from "../../components/ClaimIntelligence";

export default function ClaimDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusResult, setStatusResult] = useState<any>(null);
  const [txnResult, setTxnResult] = useState<any>(null);
  const [txnId, setTxnId] = useState<string>("");
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingTxn, setLoadingTxn] = useState(false);
  const [attachmentResult, setAttachmentResult] = useState<any>(null);
  const [loadingAttachment, setLoadingAttachment] = useState(false);
  const supabaseMissing = !supabase;

  useEffect(() => {
    const load = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      try {
        const { data: row, error } = await supabase.from("claims").select("*").eq("id", id).single();
        if (error) {
          console.error("Error loading claim:", error);
          setData(null);
        } else {
          setData(row);
        }
      } catch (err) {
        console.error("Failed to load claim:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const handleStatus = async () => {
    if (!data) return;
    const payload = {
      encounter: {
        beginningDateOfService: "20250105",
        endDateOfService: "20250105",
      },
      providers: [
        {
          npi: data?.payload?.provider?.billingNpi || "1999999984",
          organizationName: data?.payload?.provider?.billingProvider || "Demo Clinic",
          providerType: "BillingProvider",
        },
      ],
      subscriber: {
        dateOfBirth: (data?.payload?.patient?.dob || "1970-01-01").replace(/-/g, ""),
        firstName: (data?.payload?.patient?.name || "JANE DOE").split(" ")[0],
        lastName: (data?.payload?.patient?.name || "JANE DOE").split(" ").slice(1).join(" ") || "DOE",
        memberId: data?.payload?.insurance?.subscriberId || "AETNA12345",
      },
      tradingPartnerServiceId: data?.payload?.tradingPartnerServiceId || data?.trading_partner_service_id || "60054",
    };
    try {
      setLoadingStatus(true);
      const res = await claimStatus(payload);
      setStatusResult(res.data);
      if (supabase) {
        try {
          await supabase.from("claim_events").insert({
            claim_id: id,
            type: "status",
            payload: res.data,
          });
        } catch (dbErr) {
          console.error("Failed to save claim event:", dbErr);
        }
      }
    } catch (err: any) {
      setStatusResult({ error: err?.message, data: err?.data });
    } finally {
      setLoadingStatus(false);
    }
  };

  const handlePollTransactions = async () => {
    try {
      setLoadingTxn(true);
      const res = await listTransactions();
      const items = (res.data?.data?.items || res.data?.items || []) as any[];
      const inbound = items.find((t) => (t?.operation || "").includes("X12->GuideJSON"));
      if (inbound?.transactionId) {
        setTxnId(inbound.transactionId);
        const info = { info: "Prefilled from latest inbound transaction", transactionId: inbound.transactionId };
        setTxnResult(info);
        if (supabase) {
          try {
            await supabase.from("claim_events").insert({ claim_id: id, type: "transaction_prefill", payload: info });
          } catch (dbErr) {
            console.error("Failed to save claim event:", dbErr);
          }
        }
      } else {
        setTxnResult({ info: "No inbound transactions found" });
      }
    } catch (err: any) {
      setTxnResult({ error: err?.message, data: err?.data });
    } finally {
      setLoadingTxn(false);
    }
  };

  const handleFetchOutput = async () => {
    if (!txnId) {
      setTxnResult({ error: "transactionId is required" });
      return;
    }
    try {
      setLoadingTxn(true);
      const res = await getTransactionOutput(txnId);
      setTxnResult(res.data);
      if (supabase) {
        try {
          await supabase.from("claim_events").insert({ claim_id: id, type: "transaction_output", payload: res.data, transaction_id: txnId });
        } catch (dbErr) {
          console.error("Failed to save claim event:", dbErr);
        }
      }
    } catch (err: any) {
      setTxnResult({ error: err?.message, data: err?.data });
    } finally {
      setLoadingTxn(false);
    }
  };

  const handleAttachment = async () => {
    const body = {
      tradingPartnerServiceId: "STEDITEST",
      controlNumber: "ATT-MAIN-UI",
      submitter: { organizationName: "Demo Clinic", contactInformation: { phoneNumber: "9999999999" } },
      receiver: { organizationName: "STEDITEST" },
      claim: { patientControlNumber: "PCN-MAIN-UI", payerClaimControlNumber: "PAYER-CTRL-TEST" },
      contentType: "application/pdf",
      fileName: "note.pdf",
      fileContent:
        "JVBERi0xLjQKJcTl8uXrp/Og0MTGCjEgMCBvYmoKPDwgL1R5cGUgL0NhdGFsb2cgL1BhZ2VzIDIgMCBSID4+CmVuZG9iagoyIDAgb2JqCjw8IC9UeXBlIC9QYWdlcyAvQ291bnQgMSAvS2lkcyBbIDMgMCBSIF0gPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWyAwIDAgNjEyIDc5MiBdIC9Db250ZW50cyA0IDAgUiA+PgplbmRvYmoKNCAwIG9iago8PCAvTGVuZ3RoIDEyID4+CnN0cmVhbQpCT1ggMTAwIDEwMCAxMDAgNDAwIG5cblBERiBwbGFjZWhvbGRlciB0ZXh0Ci9FTkQgQk9YCmVuZHN0cmVhbQplbmRvYmoKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKc3RhcnR4cmVmCjE2NQolJUVPRg==",
      description: "Clinical note (placeholder)",
      type: "EB",
    };
    try {
      setLoadingAttachment(true);
      const res = await createAttachment(body);
      setAttachmentResult(res.data);
      if (supabase) {
        try {
          await supabase.from("claim_events").insert({ claim_id: id, type: "attachment", payload: res.data });
        } catch (dbErr) {
          console.error("Failed to save claim event:", dbErr);
        }
      }
    } catch (err: any) {
      setAttachmentResult({ error: err?.message, data: err?.data });
    } finally {
      setLoadingAttachment(false);
    }
  };

  if (supabaseMissing) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <p className="text-slate-300">Supabase environment variables are missing.</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <p className="text-slate-300">Loading claim...</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <p className="text-slate-200">Claim not found.</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-sky-600/40 transition hover:-translate-y-0.5 hover:bg-sky-400"
          >
            Back to dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f8]">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 px-6 sm:px-10 py-3 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4 text-gray-900">
          <svg className="w-6 h-6 text-[#137fec]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" fill="currentColor"></path>
          </svg>
          <h2 className="text-gray-900 text-lg font-bold leading-tight tracking-[-0.015em]">Clinix AI Billing</h2>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
            <span className="material-symbols-outlined text-base">description</span>
            <span>Claim Details</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{data.patient_name || "Claim"}</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
              data.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
              data.status === 'denied' ? 'bg-red-100 text-red-700' :
              data.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
              'bg-slate-100 text-slate-700'
            }`}>
              {data.status || "draft"}
            </span>
            <span className="text-sm text-slate-600">Claim ID: {data.id}</span>
          </div>
        </div>
        
        {/* AI Claim Intelligence Component */}
        <div className="mb-6">
          <ClaimIntelligence 
            claim={data.payload} 
            claimId={data.id}
            onApplySuggestions={(optimizedClaim) => {
              console.log("Applying suggestions:", optimizedClaim);
              // Could update the claim in Supabase here
              alert("Suggestions applied! In production, this would update the claim.");
            }}
          />
        </div>

        {/* Claim Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-slate-600 text-lg">person</span>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Patient</p>
            </div>
            <p className="text-lg font-semibold text-slate-900">{data.patient_name || "—"}</p>
            <p className="text-sm text-slate-600 mt-1">
              DOB: {data.payload?.subscriber?.dateOfBirth || data.payload?.patient?.dob || "—"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-slate-600 text-lg">business</span>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Payer</p>
            </div>
            <p className="text-lg font-semibold text-slate-900">{data.payer_name || data.payload?.receiver?.organizationName || "—"}</p>
            <p className="text-sm text-slate-600 mt-1">
              Service ID: {data.trading_partner_service_id || "—"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-slate-600 text-lg">payments</span>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Amount</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              ${data.total_charge || data.claim_charge_amount || "0.00"}
            </p>
            <p className="text-sm text-slate-600 mt-1">
              {data.service_line_count || 0} service line(s)
            </p>
          </div>
        </div>

        {/* Claim Details Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Claim Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-600 font-medium">Trading Partner</p>
              <p className="text-slate-900">{data.trading_partner_name || "—"}</p>
            </div>
            <div>
              <p className="text-slate-600 font-medium">Date of Service</p>
              <p className="text-slate-900">{data.date_of_service ? new Date(data.date_of_service).toLocaleDateString() : "—"}</p>
            </div>
            <div>
              <p className="text-slate-600 font-medium">Created</p>
              <p className="text-slate-900">{data.created_at ? new Date(data.created_at).toLocaleDateString() : "—"}</p>
            </div>
            <div>
              <p className="text-slate-600 font-medium">Last Updated</p>
              <p className="text-slate-900">{data.updated_at ? new Date(data.updated_at).toLocaleDateString() : "—"}</p>
            </div>
          </div>
        </div>

        {/* Stedi Actions Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Stedi API Actions</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <button
              onClick={handleStatus}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#137fec] px-4 py-3 text-sm font-semibold text-white shadow hover:bg-[#0f6acc] disabled:opacity-60 transition-colors"
              disabled={loadingStatus}
            >
              <span className="material-symbols-outlined text-base">sync</span>
              {loadingStatus ? "Checking status…" : "Check Status (276/277)"}
            </button>
            <div className="flex gap-2">
              <button
                onClick={handlePollTransactions}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border-2 border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-[#137fec] hover:text-[#137fec] disabled:opacity-60 transition-colors"
                disabled={loadingTxn}
              >
                <span className="material-symbols-outlined text-base">list</span>
                {loadingTxn ? "Polling…" : "Poll Transactions"}
              </button>
              <button
                onClick={handleFetchOutput}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border-2 border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-[#137fec] hover:text-[#137fec] disabled:opacity-60 transition-colors"
                disabled={loadingTxn}
              >
                <span className="material-symbols-outlined text-base">download</span>
                {loadingTxn ? "Fetching…" : "Get 277/835"}
              </button>
            </div>
            <button
              onClick={handleAttachment}
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-[#137fec] hover:text-[#137fec] disabled:opacity-60 transition-colors"
              disabled={loadingAttachment}
            >
              <span className="material-symbols-outlined text-base">attach_file</span>
              {loadingAttachment ? "Sending attachment…" : "Send Attachment (275)"}
            </button>
          </div>
          {txnId && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-600 font-medium mb-1">Transaction ID</p>
              <code className="text-sm text-slate-900 font-mono">{txnId}</code>
            </div>
          )}
        </div>

        {/* API Results */}
        {(statusResult || txnResult || attachmentResult) && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">API Responses</h3>
            <div className="space-y-4">
              {statusResult && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Status Result</p>
                  <pre className="max-h-60 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800">
                    {JSON.stringify(statusResult, null, 2)}
                  </pre>
                </div>
              )}
              {txnResult && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Transactions</p>
                  <pre className="max-h-60 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800">
                    {JSON.stringify(txnResult, null, 2)}
                  </pre>
                </div>
              )}
              {attachmentResult && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Attachment</p>
                  <pre className="max-h-60 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800">
                    {JSON.stringify(attachmentResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Raw Payload (Collapsible) */}
        <details className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <summary className="cursor-pointer text-lg font-semibold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">code</span>
            Raw Claim Payload
          </summary>
          <div className="mt-4">
            <pre className="overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-800">
              {JSON.stringify(data.payload, null, 2)}
            </pre>
          </div>
        </details>
      </main>
    </div>
  );
}

