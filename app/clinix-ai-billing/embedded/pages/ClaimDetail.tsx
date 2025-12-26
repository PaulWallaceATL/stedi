import React, { useState } from 'react';
import { ViewState } from '../types';
import { claimStatus, listTransactions, getTransactionOutput } from '../stediClient';
import { supabase } from '../supabaseClient';

interface Props {
  setView: (view: ViewState) => void;
}

export const ClaimDetail: React.FC<Props> = ({ setView }) => {
  const [statusResult, setStatusResult] = useState<any>(null);
  const [txnResult, setTxnResult] = useState<any>(null);
  const [txnId, setTxnId] = useState<string>("");
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingTxn, setLoadingTxn] = useState(false);

  const sampleStatusPayload = {
    encounter: { beginningDateOfService: "20250105", endDateOfService: "20250105" },
    providers: [{ npi: "1999999984", organizationName: "Demo Clinic", providerType: "BillingProvider" }],
    subscriber: {
      dateOfBirth: "19700101",
      firstName: "JANE",
      lastName: "DOE",
      memberId: "AETNA12345",
    },
    tradingPartnerServiceId: "60054",
  };

  const handleStatus = async () => {
    try {
      setLoadingStatus(true);
      const res = await claimStatus(sampleStatusPayload);
      setStatusResult(res.data);
      if (supabase) {
        try {
          await supabase.from("claim_status_events").insert({
            type: "status",
            payload: res.data,
          });
        } catch (e) { console.warn("Event insert failed:", e); }
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
            await supabase.from("claim_status_events").insert({ type: "transaction_prefill", payload: info });
          } catch (e) { console.warn("Event insert failed:", e); }
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
          await supabase.from("claim_status_events").insert({ type: "transaction_output", payload: res.data, transaction_id: txnId });
        } catch (e) { console.warn("Event insert failed:", e); }
      }
    } catch (err: any) {
      setTxnResult({ error: err?.message, data: err?.data });
    } finally {
      setLoadingTxn(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden relative h-full">
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24">
        <div className="mx-auto max-w-screen-2xl">
          
          <div className="mb-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
             <button onClick={() => setView(ViewState.DASHBOARD)} className="hover:text-primary transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Back to Dashboard
             </button>
             <span>/</span>
             <span className="text-slate-800 dark:text-slate-200 font-medium">Claim #UH87654321</span>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
            {/* Left Column */}
            <div className="flex flex-col gap-6">
              
              {/* Patient Snapshot */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/20">
                  <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">person</span>
                    <span>Patient Snapshot</span>
                  </div>
                  <button className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" title="Toggle patient details">
                    <span className="material-symbols-outlined">expand_less</span>
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-center">
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-24 shrink-0 shadow-sm border-4 border-white dark:border-slate-700" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB-JMMVFKEDPm32yaU-Xim225TXpXhX8IUyM3JyVbDEfofCzTzoG8Mrbt3CdmbkfG9NYaF489Vw9pFh1l9_Dg_x4cP6hIvLyt1JsBbUXxGnSonR2QBkjlqkbF8kQ-kB9CgAwJYioK2qYxgyxcm9FXlp4EEpNYZGyx5-lydTYqsWKJq7eX6wnVRASBIO3fqzt1eEkqU0GoO8JujvUHrt11e8-iZgnV9W7TNhyqGduKs-g9LIjQkTbfUKNbdZOdlfemJO9CWgofSVvTs")'}}></div>
                    <div className="flex flex-col justify-center gap-1">
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">Isabella Rossi</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                        <span>MRN: <span className="font-mono text-slate-700 dark:text-slate-300">87654321</span></span>
                        <span>•</span>
                        <span>DOB: 08/15/1985 (38yo)</span>
                        <span>•</span>
                        <span>Female</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-100 dark:bg-slate-700 border-t border-slate-200 dark:border-slate-700">
                  <div className="bg-white dark:bg-slate-800 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                      <span className="material-symbols-outlined text-lg">credit_card</span>
                      <span className="font-medium">Insurance</span>
                    </div>
                    <p className="text-slate-900 dark:text-slate-200 font-semibold text-sm">United Health PPO</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                      <span className="material-symbols-outlined text-lg">calendar_month</span>
                      <span className="font-medium">Visit Date</span>
                    </div>
                    <p className="text-slate-900 dark:text-slate-200 font-semibold text-sm">Oct 26, 2023</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                      <span className="material-symbols-outlined text-lg">location_on</span>
                      <span className="font-medium">Location</span>
                    </div>
                    <p className="text-slate-900 dark:text-slate-200 font-semibold text-sm">General Hospital, Wing A</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                      <span className="material-symbols-outlined text-lg">badge</span>
                      <span className="font-medium">Provider</span>
                    </div>
                    <p className="text-slate-900 dark:text-slate-200 font-semibold text-sm">Dr. Emily Carter</p>
                  </div>
                </div>
              </div>

              {/* Codes Section */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b border-slate-200 dark:border-slate-700 gap-3 bg-slate-50/50 dark:bg-slate-700/20">
                  <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">code</span>
                    <span>Codes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 text-xs font-bold transition-colors">
                      <span className="material-symbols-outlined text-sm">auto_fix</span>
                      <span>Auto-Fix</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 rounded-lg bg-danger/10 text-danger-700 dark:text-danger-300 px-3 py-1.5 text-xs font-bold hover:bg-danger/20 transition-colors">
                      <span className="material-symbols-outlined text-sm">cancel</span>
                      <span>Reject All</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 rounded-lg bg-success/10 text-success dark:text-success-300 px-3 py-1.5 text-xs font-bold hover:bg-success/20 transition-colors">
                      <span className="material-symbols-outlined text-sm">task_alt</span>
                      <span>Approve All</span>
                    </button>
                  </div>
                </header>
                
                <div className="flex flex-col">
                  {/* ICD-10 */}
                  <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">ICD-10 Diagnoses</h3>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    <div className="group flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150">
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-lg text-slate-800 dark:text-slate-200">S82.61XA</span>
                          <div className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                            <span className="material-symbols-outlined text-[10px]">auto_awesome</span>
                            <span>AI-Verified</span>
                          </div>
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Displaced fracture of lateral malleolus of right fibula</span>
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                           <span className="material-symbols-outlined text-sm text-amber-500">lightbulb</span>
                           <span>AI Match: 98% (Matches chief complaint "ankle injury")</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                        <button className="flex size-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                        <button className="flex size-8 items-center justify-center rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"><span className="material-symbols-outlined text-lg">check</span></button>
                      </div>
                    </div>
                  </div>

                  {/* CPT */}
                  <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 border-t border-slate-200">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">CPT Procedures</h3>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    <div className="group flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4 bg-amber-50/50 dark:bg-amber-900/10 border-l-4 border-warning">
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-lg text-slate-800 dark:text-slate-200">27792</span>
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-warning/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                            <span className="material-symbols-outlined text-[12px]">warning</span>
                            <span>Modifier Required</span>
                          </div>
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Open treatment of distal fibular fracture</span>
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                           <span className="material-symbols-outlined text-sm text-amber-500">lightbulb</span>
                           <span>AI Match: 75% (Found in operative report)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                        <button className="flex size-8 items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                        <button className="flex size-8 items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-success hover:bg-success/10 transition-colors"><span className="material-symbols-outlined text-lg">check</span></button>
                      </div>
                    </div>

                    <div className="group flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4 bg-red-50/50 dark:bg-red-900/10 border-l-4 border-danger">
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-lg text-danger-700 dark:text-danger-300">99284</span>
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-danger-800 dark:text-danger-300">
                            <span className="material-symbols-outlined text-[12px]">error</span>
                            <span>Pre-auth Needed</span>
                          </div>
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Emergency dept visit, moderate severity</span>
                         <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                           <span className="material-symbols-outlined text-sm text-amber-500">lightbulb</span>
                           <span>AI Match: 80% (Identified based on payer rules)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                        <button className="flex size-8 items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                        <button className="flex size-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed" disabled><span className="material-symbols-outlined text-lg">check</span></button>
                      </div>
                    </div>
                  </div>
                  
                  {/* HCPCS */}
                  <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 border-t border-slate-200">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">HCPCS Supplies</h3>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    <div className="group flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150">
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-lg text-slate-800 dark:text-slate-200">L4361</span>
                           <div className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                            <span className="material-symbols-outlined text-[10px]">auto_awesome</span>
                            <span>AI-Verified</span>
                          </div>
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Pneumatic walker boot</span>
                         <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                           <span className="material-symbols-outlined text-sm text-amber-500">lightbulb</span>
                           <span>AI Match: 95% (Found in discharge summary)</span>
                        </div>
                      </div>
                       <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                        <button className="flex size-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                        <button className="flex size-8 items-center justify-center rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"><span className="material-symbols-outlined text-lg">check</span></button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

               {/* Documentation Section */}
               <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/20">
                  <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">description</span>
                    <span>Additional Documentation</span>
                  </div>
                  <button className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">expand_less</span>
                  </button>
                </div>
                <div className="p-0">
                  <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-300">
                            <span className="material-symbols-outlined text-lg">folder</span>
                        </div>
                        <span className="font-medium text-slate-800 dark:text-slate-200 text-sm">Pre-authorization Documents</span>
                    </div>
                    <span className="text-primary text-sm font-medium group-hover:underline">View (2)</span>
                  </div>
                   <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-300">
                            <span className="material-symbols-outlined text-lg">attach_file</span>
                        </div>
                        <span className="font-medium text-slate-800 dark:text-slate-200 text-sm">Attachments</span>
                    </div>
                    <span className="text-primary text-sm font-medium group-hover:underline">View (1)</span>
                  </div>
                   <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-300">
                            <span className="material-symbols-outlined text-lg">clinical_notes</span>
                        </div>
                        <span className="font-medium text-slate-800 dark:text-slate-200 text-sm">Encounter Notes Preview</span>
                    </div>
                    <span className="text-primary text-sm font-medium group-hover:underline">View</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Timeline */}
            <div className="flex flex-col gap-6">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">cloud_sync</span>
                    <span>Stedi Proxy</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleStatus}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-70"
                    disabled={loadingStatus}
                  >
                    {loadingStatus ? "Checking status…" : "Check claim status"}
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handlePollTransactions}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/50"
                      disabled={loadingTxn}
                    >
                      {loadingTxn ? "Polling…" : "Poll transactions"}
                    </button>
                    <button
                      onClick={handleFetchOutput}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/50"
                      disabled={loadingTxn}
                    >
                      {loadingTxn ? "Fetching…" : "Get 277/835 output"}
                    </button>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    transactionId:{" "}
                    <span className="font-mono text-slate-800 dark:text-slate-100">
                      {txnId || "(poll to fill)"}
                    </span>
                  </div>
                  {statusResult && (
                    <pre className="max-h-40 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                      {JSON.stringify(statusResult, null, 2)}
                    </pre>
                  )}
                  {txnResult && (
                    <pre className="max-h-40 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                      {JSON.stringify(txnResult, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm h-fit">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/20">
                  <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">route</span>
                    <span>Claim Status Timeline</span>
                  </div>
                </div>
                <div className="p-6">
                  <ol className="relative border-l border-slate-200 dark:border-slate-700 space-y-8">
                    <li className="ml-6">
                      <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 ring-4 ring-white dark:ring-slate-800">
                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-sm">construction</span>
                      </span>
                      <h3 className="flex items-center mb-1 text-sm font-bold text-slate-900 dark:text-white">Generated</h3>
                      <time className="block mb-2 text-xs font-normal leading-none text-slate-400 dark:text-slate-500">Claim created in system</time>
                    </li>
                    <li className="ml-6">
                      <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary ring-4 ring-white dark:ring-slate-800">
                        <span className="material-symbols-outlined text-white text-sm">send</span>
                      </span>
                      <h3 className="mb-1 text-sm font-bold text-slate-900 dark:text-white">Submitted</h3>
                      <time className="block mb-2 text-xs font-normal leading-none text-slate-400 dark:text-slate-500">Oct 26, 2023 - Claim ID: 123XYZ</time>
                    </li>
                    <li className="ml-6">
                      <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary ring-4 ring-white dark:ring-slate-800">
                        <span className="material-symbols-outlined text-white text-sm">check</span>
                      </span>
                      <h3 className="mb-1 text-sm font-bold text-slate-900 dark:text-white">Accepted</h3>
                      <time className="block mb-2 text-xs font-normal leading-none text-slate-400 dark:text-slate-500">Oct 27, 2023 - Payer: UHC</time>
                      <div className="mt-3 flex gap-2">
                        <button className="flex items-center justify-center gap-1.5 rounded-md border border-slate-300 dark:border-slate-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                          <span className="material-symbols-outlined text-sm">description</span>
                          <span>999</span>
                        </button>
                        <button className="flex items-center justify-center gap-1.5 rounded-md border border-slate-300 dark:border-slate-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                          <span className="material-symbols-outlined text-sm">description</span>
                          <span>277</span>
                        </button>
                      </div>
                    </li>
                    <li className="ml-6">
                      <div className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-danger ring-4 ring-white dark:ring-slate-800">
                         <span className="material-symbols-outlined text-white text-sm">thumb_down</span>
                      </div>
                      <div className="p-3 rounded-lg bg-danger/5 dark:bg-danger/10 border border-danger/20">
                         <h3 className="mb-1 text-sm font-bold text-danger-700 dark:text-danger-300">Rejected</h3>
                         <time className="block mb-2 text-xs font-normal leading-none text-danger-600 dark:text-danger-400">Received Oct 28, 2023</time>
                         <p className="mt-2 text-xs text-danger-800 dark:text-danger-200">
                           <span className="font-semibold">Reason:</span> Incorrect modifier.
                         </p>
                         <button onClick={() => setView(ViewState.DENIAL_MANAGER)} className="mt-3 inline-flex items-center justify-center w-full rounded-md bg-white dark:bg-slate-800 border border-danger/30 px-3 py-1.5 text-xs font-bold text-danger-700 dark:text-danger-300 hover:bg-danger/5 dark:hover:bg-danger/20 transition-colors">
                           <span className="material-symbols-outlined text-sm mr-1.5">gavel</span>
                           Open Denial Manager
                         </button>
                      </div>
                    </li>
                    <li className="ml-6">
                      <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 ring-4 ring-white dark:ring-slate-800">
                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-sm">paid</span>
                      </span>
                      <h3 className="mb-1 text-sm font-bold text-slate-500 dark:text-slate-400">Paid</h3>
                      <time className="block mb-2 text-xs font-normal leading-none text-slate-400 dark:text-slate-500">Pending</time>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 p-4 shadow-lg z-20">
         <div className="mx-auto max-w-screen-2xl flex flex-col sm:flex-row items-center justify-end gap-3">
            <button onClick={() => setView(ViewState.DENIAL_MANAGER)} className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-danger/10 text-danger-700 dark:text-danger-300 px-6 py-2.5 text-sm font-bold hover:bg-danger/20 transition-colors">
                <span className="material-symbols-outlined text-lg">gavel</span>
                <span>Open Denial Manager</span>
            </button>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-2.5 text-sm font-bold text-white shadow-md hover:bg-primary/90 transition-colors">
                <span className="material-symbols-outlined text-lg">send</span>
                <span>Submit Clean Claim</span>
            </button>
         </div>
      </footer>
    </div>
  );
}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">cloud_sync</span>
                    <span>Stedi Proxy</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleStatus}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-70"
                    disabled={loadingStatus}
                  >
                    {loadingStatus ? "Checking status…" : "Check claim status"}
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handlePollTransactions}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/50"
                      disabled={loadingTxn}
                    >
                      {loadingTxn ? "Polling…" : "Poll transactions"}
                    </button>
                    <button
                      onClick={handleFetchOutput}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/50"
                      disabled={loadingTxn}
                    >
                      {loadingTxn ? "Fetching…" : "Get 277/835 output"}
                    </button>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    transactionId:{" "}
                    <span className="font-mono text-slate-800 dark:text-slate-100">
                      {txnId || "(poll to fill)"}
                    </span>
                  </div>
                  {statusResult && (
                    <pre className="max-h-40 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                      {JSON.stringify(statusResult, null, 2)}
                    </pre>
                  )}
                  {txnResult && (
                    <pre className="max-h-40 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                      {JSON.stringify(txnResult, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm h-fit">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/20">
                  <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">route</span>
                    <span>Claim Status Timeline</span>
                  </div>
                </div>
                <div className="p-6">
                  <ol className="relative border-l border-slate-200 dark:border-slate-700 space-y-8">
                    <li className="ml-6">
                      <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 ring-4 ring-white dark:ring-slate-800">
                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-sm">construction</span>
                      </span>
                      <h3 className="flex items-center mb-1 text-sm font-bold text-slate-900 dark:text-white">Generated</h3>
                      <time className="block mb-2 text-xs font-normal leading-none text-slate-400 dark:text-slate-500">Claim created in system</time>
                    </li>
                    <li className="ml-6">
                      <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary ring-4 ring-white dark:ring-slate-800">
                        <span className="material-symbols-outlined text-white text-sm">send</span>
                      </span>
                      <h3 className="mb-1 text-sm font-bold text-slate-900 dark:text-white">Submitted</h3>
                      <time className="block mb-2 text-xs font-normal leading-none text-slate-400 dark:text-slate-500">Oct 26, 2023 - Claim ID: 123XYZ</time>
                    </li>
                    <li className="ml-6">
                      <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary ring-4 ring-white dark:ring-slate-800">
                        <span className="material-symbols-outlined text-white text-sm">check</span>
                      </span>
                      <h3 className="mb-1 text-sm font-bold text-slate-900 dark:text-white">Accepted</h3>
                      <time className="block mb-2 text-xs font-normal leading-none text-slate-400 dark:text-slate-500">Oct 27, 2023 - Payer: UHC</time>
                      <div className="mt-3 flex gap-2">
                        <button className="flex items-center justify-center gap-1.5 rounded-md border border-slate-300 dark:border-slate-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                          <span className="material-symbols-outlined text-sm">description</span>
                          <span>999</span>
                        </button>
                        <button className="flex items-center justify-center gap-1.5 rounded-md border border-slate-300 dark:border-slate-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                          <span className="material-symbols-outlined text-sm">description</span>
                          <span>277</span>
                        </button>
                      </div>
                    </li>
                    <li className="ml-6">
                      <div className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-danger ring-4 ring-white dark:ring-slate-800">
                         <span className="material-symbols-outlined text-white text-sm">thumb_down</span>
                      </div>
                      <div className="p-3 rounded-lg bg-danger/5 dark:bg-danger/10 border border-danger/20">
                         <h3 className="mb-1 text-sm font-bold text-danger-700 dark:text-danger-300">Rejected</h3>
                         <time className="block mb-2 text-xs font-normal leading-none text-danger-600 dark:text-danger-400">Received Oct 28, 2023</time>
                         <p className="mt-2 text-xs text-danger-800 dark:text-danger-200">
                           <span className="font-semibold">Reason:</span> Incorrect modifier.
                         </p>
                         <button onClick={() => setView(ViewState.DENIAL_MANAGER)} className="mt-3 inline-flex items-center justify-center w-full rounded-md bg-white dark:bg-slate-800 border border-danger/30 px-3 py-1.5 text-xs font-bold text-danger-700 dark:text-danger-300 hover:bg-danger/5 dark:hover:bg-danger/20 transition-colors">
                           <span className="material-symbols-outlined text-sm mr-1.5">gavel</span>
                           Open Denial Manager
                         </button>
                      </div>
                    </li>
                    <li className="ml-6">
                      <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 ring-4 ring-white dark:ring-slate-800">
                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-sm">paid</span>
                      </span>
                      <h3 className="mb-1 text-sm font-bold text-slate-500 dark:text-slate-400">Paid</h3>
                      <time className="block mb-2 text-xs font-normal leading-none text-slate-400 dark:text-slate-500">Pending</time>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 p-4 shadow-lg z-20">
         <div className="mx-auto max-w-screen-2xl flex flex-col sm:flex-row items-center justify-end gap-3">
            <button onClick={() => setView(ViewState.DENIAL_MANAGER)} className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-danger/10 text-danger-700 dark:text-danger-300 px-6 py-2.5 text-sm font-bold hover:bg-danger/20 transition-colors">
                <span className="material-symbols-outlined text-lg">gavel</span>
                <span>Open Denial Manager</span>
            </button>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-2.5 text-sm font-bold text-white shadow-md hover:bg-primary/90 transition-colors">
                <span className="material-symbols-outlined text-lg">send</span>
                <span>Submit Clean Claim</span>
            </button>
         </div>
      </footer>
    </div>
  );
}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">cloud_sync</span>
                    <span>Stedi Proxy</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleStatus}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-70"
                    disabled={loadingStatus}
                  >
                    {loadingStatus ? "Checking status…" : "Check claim status"}
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handlePollTransactions}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/50"
                      disabled={loadingTxn}
                    >
                      {loadingTxn ? "Polling…" : "Poll transactions"}
                    </button>
                    <button
                      onClick={handleFetchOutput}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/50"
                      disabled={loadingTxn}
                    >
                      {loadingTxn ? "Fetching…" : "Get 277/835 output"}
                    </button>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    transactionId:{" "}
                    <span className="font-mono text-slate-800 dark:text-slate-100">
                      {txnId || "(poll to fill)"}
                    </span>
                  </div>
                  {statusResult && (
                    <pre className="max-h-40 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                      {JSON.stringify(statusResult, null, 2)}
                    </pre>
                  )}
                  {txnResult && (
                    <pre className="max-h-40 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                      {JSON.stringify(txnResult, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm h-fit">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/20">
                  <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">route</span>
                    <span>Claim Status Timeline</span>
                  </div>
                </div>
                <div className="p-6">
                  <ol className="relative border-l border-slate-200 dark:border-slate-700 space-y-8">
                    <li className="ml-6">
                      <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 ring-4 ring-white dark:ring-slate-800">
                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-sm">construction</span>
                      </span>
                      <h3 className="flex items-center mb-1 text-sm font-bold text-slate-900 dark:text-white">Generated</h3>
                      <time className="block mb-2 text-xs font-normal leading-none text-slate-400 dark:text-slate-500">Claim created in system</time>
                    </li>
                    <li className="ml-6">
                      <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary ring-4 ring-white dark:ring-slate-800">
                        <span className="material-symbols-outlined text-white text-sm">send</span>
                      </span>
                      <h3 className="mb-1 text-sm font-bold text-slate-900 dark:text-white">Submitted</h3>
                      <time className="block mb-2 text-xs font-normal leading-none text-slate-400 dark:text-slate-500">Oct 26, 2023 - Claim ID: 123XYZ</time>
                    </li>
                    <li className="ml-6">
                      <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary ring-4 ring-white dark:ring-slate-800">
                        <span className="material-symbols-outlined text-white text-sm">check</span>
                      </span>
                      <h3 className="mb-1 text-sm font-bold text-slate-900 dark:text-white">Accepted</h3>
                      <time className="block mb-2 text-xs font-normal leading-none text-slate-400 dark:text-slate-500">Oct 27, 2023 - Payer: UHC</time>
                      <div className="mt-3 flex gap-2">
                        <button className="flex items-center justify-center gap-1.5 rounded-md border border-slate-300 dark:border-slate-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                          <span className="material-symbols-outlined text-sm">description</span>
                          <span>999</span>
                        </button>
                        <button className="flex items-center justify-center gap-1.5 rounded-md border border-slate-300 dark:border-slate-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                          <span className="material-symbols-outlined text-sm">description</span>
                          <span>277</span>
                        </button>
                      </div>
                    </li>
                    <li className="ml-6">
                      <div className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-danger ring-4 ring-white dark:ring-slate-800">
                         <span className="material-symbols-outlined text-white text-sm">thumb_down</span>
                      </div>
                      <div className="p-3 rounded-lg bg-danger/5 dark:bg-danger/10 border border-danger/20">
                         <h3 className="mb-1 text-sm font-bold text-danger-700 dark:text-danger-300">Rejected</h3>
                         <time className="block mb-2 text-xs font-normal leading-none text-danger-600 dark:text-danger-400">Received Oct 28, 2023</time>
                         <p className="mt-2 text-xs text-danger-800 dark:text-danger-200">
                           <span className="font-semibold">Reason:</span> Incorrect modifier.
                         </p>
                         <button onClick={() => setView(ViewState.DENIAL_MANAGER)} className="mt-3 inline-flex items-center justify-center w-full rounded-md bg-white dark:bg-slate-800 border border-danger/30 px-3 py-1.5 text-xs font-bold text-danger-700 dark:text-danger-300 hover:bg-danger/5 dark:hover:bg-danger/20 transition-colors">
                           <span className="material-symbols-outlined text-sm mr-1.5">gavel</span>
                           Open Denial Manager
                         </button>
                      </div>
                    </li>
                    <li className="ml-6">
                      <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 ring-4 ring-white dark:ring-slate-800">
                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-sm">paid</span>
                      </span>
                      <h3 className="mb-1 text-sm font-bold text-slate-500 dark:text-slate-400">Paid</h3>
                      <time className="block mb-2 text-xs font-normal leading-none text-slate-400 dark:text-slate-500">Pending</time>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 p-4 shadow-lg z-20">
         <div className="mx-auto max-w-screen-2xl flex flex-col sm:flex-row items-center justify-end gap-3">
            <button onClick={() => setView(ViewState.DENIAL_MANAGER)} className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-danger/10 text-danger-700 dark:text-danger-300 px-6 py-2.5 text-sm font-bold hover:bg-danger/20 transition-colors">
                <span className="material-symbols-outlined text-lg">gavel</span>
                <span>Open Denial Manager</span>
            </button>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-2.5 text-sm font-bold text-white shadow-md hover:bg-primary/90 transition-colors">
                <span className="material-symbols-outlined text-lg">send</span>
                <span>Submit Clean Claim</span>
            </button>
         </div>
      </footer>
    </div>
  );
}