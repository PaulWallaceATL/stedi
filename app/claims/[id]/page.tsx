"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { claimStatus, listTransactions, getTransactionOutput, createAttachment } from "../../lib/stediClient";

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
      const { data: row } = await supabase.from("claims").select("*").eq("id", id).single();
      setData(row);
      setLoading(false);
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
        await supabase.from("claim_events").insert({
          claim_id: id,
          type: "status",
          payload: res.data,
        });
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
          await supabase.from("claim_events").insert({ claim_id: id, type: "transaction_prefill", payload: info });
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
        await supabase.from("claim_events").insert({ claim_id: id, type: "transaction_output", payload: res.data, transaction_id: txnId });
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
        await supabase.from("claim_events").insert({ claim_id: id, type: "attachment", payload: res.data });
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
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-6 py-10">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.22em] text-sky-300">Claim</p>
          <h1 className="text-2xl font-semibold text-white">{data.id}</h1>
          <p className="text-sm text-slate-300">Status: {data.status || "draft"}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/40 space-y-4">
          <p className="text-sm text-slate-300">Trading partner: {data.trading_partner_name || "—"}</p>
          <p className="text-sm text-slate-300">Service ID: {data.trading_partner_service_id || "—"}</p>
          <p className="text-sm text-slate-300">
            Amount: {data.claim_charge_amount ? `$${data.claim_charge_amount}` : "—"}
          </p>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400 mb-2">Payload</p>
            <pre className="overflow-auto rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-200">
              {JSON.stringify(data.payload, null, 2)}
            </pre>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <button
              onClick={handleStatus}
              className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow hover:bg-sky-400 disabled:opacity-60"
              disabled={loadingStatus}
            >
              {loadingStatus ? "Checking status…" : "Check status (276/277)"}
            </button>
            <div className="flex gap-2">
              <button
                onClick={handlePollTransactions}
                className="flex-1 rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:border-sky-500/60 hover:text-sky-200 disabled:opacity-60"
                disabled={loadingTxn}
              >
                {loadingTxn ? "Polling…" : "Poll transactions"}
              </button>
              <button
                onClick={handleFetchOutput}
                className="flex-1 rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:border-sky-500/60 hover:text-sky-200 disabled:opacity-60"
                disabled={loadingTxn}
              >
                {loadingTxn ? "Fetching…" : "Get 277/835"}
              </button>
            </div>
            <button
              onClick={handleAttachment}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:border-sky-500/60 hover:text-sky-200 disabled:opacity-60"
              disabled={loadingAttachment}
            >
              {loadingAttachment ? "Sending attachment…" : "Send attachment (275)"}
            </button>
          </div>
          <div className="text-xs text-slate-400">
            transactionId: <span className="font-mono text-slate-200">{txnId || "(poll to fill)"}</span>
          </div>
          {(statusResult || txnResult || attachmentResult) && (
            <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/80 p-3">
              {statusResult && (
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-sky-300 mb-1">Status Result</p>
                  <pre className="max-h-40 overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-2 text-[11px] text-slate-100">
                    {JSON.stringify(statusResult, null, 2)}
                  </pre>
                </div>
              )}
              {txnResult && (
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-sky-300 mb-1">Transactions</p>
                  <pre className="max-h-40 overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-2 text-[11px] text-slate-100">
                    {JSON.stringify(txnResult, null, 2)}
                  </pre>
                </div>
              )}
              {attachmentResult && (
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-sky-300 mb-1">Attachment</p>
                  <pre className="max-h-40 overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-2 text-[11px] text-slate-100">
                    {JSON.stringify(attachmentResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

