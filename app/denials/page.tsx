"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type ClaimRow = {
  id: string;
  patient_name?: string | null;
  payer_name?: string | null;
  status?: string | null;
  claim_charge_amount?: number | null;
  created_at?: string | null;
  date_of_service?: string | null;
};

type DenialCategory = "modifier-issues" | "coding-conflicts" | "missing-dx" | "payer-rules";

function currency(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));
}

export default function DenialsPage() {
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<DenialCategory | "all">("all");
  const [showHighImpactOnly, setShowHighImpactOnly] = useState(false);
  const supabaseMissing = !supabase;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user?.id || null;
      if (!mounted) return;
      setUserId(uid);
      if (!uid) {
        setLoading(false);
        return;
      }
      const { data: rows, error } = await supabase
        .from("claims")
        .select("id, patient_name, payer_name, status, claim_charge_amount, created_at")
        .eq("user_id", uid)
        .in("status", ["denied", "rejected"]);
      if (!mounted) return;
      if (rows) setClaims(rows as ClaimRow[]);
      if (error) console.error(error);
      setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (supabaseMissing) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/40 text-center space-y-4">
          <p className="text-lg font-semibold text-white">Supabase environment variables are missing.</p>
          <p className="text-sm text-slate-300">Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to view denials.</p>
        </div>
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/40 text-center space-y-4">
          <p className="text-lg font-semibold text-white">Please sign in to view denials.</p>
          <Link
            href="/login"
            className="inline-flex rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-md shadow-sky-600/40 transition hover:-translate-y-0.5 hover:bg-sky-400"
          >
            Go to login
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center">
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm">Loading denials…</div>
      </main>
    );
  }

  const firstClaim = claims[0];

  return (
    <main className="min-h-screen bg-[#f6f7f8] text-slate-900">
      <div className="flex h-screen w-full flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 bg-white px-6 py-3 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 text-slate-900">
              <div className="text-[#137fec]">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" fill="currentColor"></path>
                </svg>
              </div>
              <h1 className="text-lg font-bold tracking-tight">Denial Manager Command Center</h1>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link className="text-sm font-medium text-slate-500 hover:text-slate-800" href="/dashboard">Dashboard</Link>
              <Link className="text-sm font-medium text-slate-500 hover:text-slate-800" href="/upload">Upload</Link>
              <Link className="text-sm font-medium text-[#137fec] font-semibold" href="/denials">Denials</Link>
              <Link className="text-sm font-medium text-slate-500 hover:text-slate-800" href="/performance">Reports</Link>
              <Link className="text-sm font-medium text-slate-500 hover:text-slate-800" href="/settings">Settings</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <label className="relative hidden sm:block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                className="form-input w-full min-w-0 resize-none overflow-hidden rounded-lg bg-slate-100 text-slate-900 focus:outline-0 focus:ring-2 focus:ring-[#137fec]/50 border-transparent h-10 placeholder:text-slate-400 pl-10 pr-4 text-sm"
                placeholder="Search claims, patients..."
              />
            </label>
            <button className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          <div className="h-full grid grid-cols-[300px_1fr] lg:grid-cols-[300px_1fr_450px]">
            {/* Filters Sidebar */}
            <div className="bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
              <div className="p-4 border-b border-slate-200">
                <h2 className="font-semibold text-lg text-slate-800">Filters</h2>
              </div>
              <div className="p-4 space-y-6 flex-1">
                <div>
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <div className="mt-2 space-y-2">
                    <a href="#" className="flex items-center gap-2 p-2 rounded-md bg-red-100 text-red-800 font-semibold text-sm">
                      <span>❌</span> Rejected 
                      <span className="ml-auto text-xs px-2 py-0.5 bg-red-200 rounded-full">{claims.length}</span>
                    </a>
                    <a href="#" className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 text-slate-600 text-sm">
                      <span>⚠️</span> Denied 
                      <span className="ml-auto text-xs px-2 py-0.5 bg-slate-200 rounded-full">0</span>
                    </a>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Reason Category (AI Clustered)</label>
                  <div className="mt-2 space-y-1">
                    <a href="#" className="block p-2 rounded-md text-slate-600 hover:bg-slate-100 text-sm">Modifier Issues</a>
                    <a href="#" className="block p-2 rounded-md text-slate-600 hover:bg-slate-100 text-sm">Coding Conflicts</a>
                    <a href="#" className="block p-2 rounded-md text-slate-600 hover:bg-slate-100 text-sm">Missing/Invalid Dx</a>
                    <a href="#" className="block p-2 rounded-md text-slate-600 hover:bg-slate-100 text-sm">Payer Coverage Rules</a>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-slate-200 mt-auto">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Show Only High-Impact</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={showHighImpactOnly}
                      onChange={() => setShowHighImpactOnly(!showHighImpactOnly)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#137fec]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#137fec]"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Denial Queue */}
            <div className="bg-[#f6f7f8] flex flex-col overflow-y-auto">
              <div className="p-4 border-b border-slate-200 bg-white backdrop-blur-sm sticky top-0">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg text-slate-800">Denial Queue</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Sort by:</span>
                    <select className="form-select text-sm rounded-md border-slate-300 bg-white shadow-sm focus:border-[#137fec] focus:ring-0 py-1">
                      <option>AI-Suggested Priority</option>
                      <option>Date of Service</option>
                      <option>Severity</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-4">
                <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-slate-200">
                  <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                      <tr>
                        <th className="px-4 py-3">Claim ID</th>
                        <th className="px-4 py-3">Patient</th>
                        <th className="px-4 py-3">DOS</th>
                        <th className="px-4 py-3">Payer</th>
                        <th className="px-4 py-3">Key Codes</th>
                        <th className="px-4 py-3">AI Summary</th>
                        <th className="px-4 py-3">Severity</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {claims.map((c) => (
                        <tr 
                          key={c.id} 
                          className={`bg-white border-b hover:bg-slate-50 cursor-pointer ${selectedClaim === c.id ? 'bg-blue-50' : ''}`}
                          onClick={() => setSelectedClaim(c.id)}
                        >
                          <td className="px-4 py-3 font-mono text-slate-700">{c.id.substring(0, 8)}...</td>
                          <td className="px-4 py-3">{c.patient_name || "Unknown"}</td>
                          <td className="px-4 py-3">{c.date_of_service ? new Date(c.date_of_service).toLocaleDateString() : "—"}</td>
                          <td className="px-4 py-3">{c.payer_name || "—"}</td>
                          <td className="px-4 py-3 font-mono">CO-45, PR-22</td>
                          <td className="px-4 py-3">Incorrect modifier for telehealth POS</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">High</span>
                          </td>
                          <td className="px-4 py-3">
                            <button className="text-[#137fec] hover:underline font-semibold">Review</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* AI Analyst Panel */}
            <div className="bg-white border-l border-slate-200 flex flex-col">
              <div className="p-4 border-b border-slate-200 shrink-0">
                <h2 className="font-semibold text-lg text-slate-800">AI Denial Analyst</h2>
                <p className="text-sm text-slate-500">Claim {selectedClaim ? selectedClaim.substring(0, 8) : firstClaim?.id.substring(0, 8) || "..."}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl text-red-500">🚨</span>
                    <div>
                      <h3 className="font-bold text-base text-slate-800">Modifier mismatch: CPT requires 59 instead of 25</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Payer rule indicates CPT 99214 with telehealth POS 02 requires modifier 59 for separate evaluation.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 text-right text-xs font-medium text-blue-600">AI is 93% confident</div>
                </div>

                <details className="border border-slate-200 rounded-lg" open>
                  <summary className="w-full flex items-center justify-between p-3 text-left font-semibold text-slate-700 cursor-pointer">
                    <span>Stedi 277/835 Data Extraction</span>
                    <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </summary>
                  <div className="p-4 border-t border-slate-200 text-sm space-y-3">
                    <div>
                      <p><strong className="font-mono text-slate-800">CARC Code:</strong> CO-45</p>
                      <p className="ml-4 text-slate-600 text-xs italic">AI: Charge exceeds fee schedule.</p>
                    </div>
                    <div>
                      <p><strong className="font-mono text-slate-800">RARC Code:</strong> N386</p>
                      <p className="ml-4 text-slate-600 text-xs italic">AI: Service not separately payable.</p>
                    </div>
                  </div>
                </details>

                <details className="border border-slate-200 rounded-lg" open>
                  <summary className="w-full flex items-center justify-between p-3 text-left font-semibold text-slate-700 cursor-pointer">
                    <span>AI-Suggested Fixes (Editable)</span>
                    <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </summary>
                  <div className="p-4 border-t border-slate-200 text-sm space-y-3">
                    <div className="flex justify-between items-center p-2 rounded-md bg-green-50">
                      <div>
                        <p>Change modifier on CPT 99214 to <span className="font-mono font-bold">59</span></p>
                        <span className="text-xs text-green-700">AI Confidence: 95%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-1 rounded-full hover:bg-slate-200">
                          <span className="text-emerald-600">✓</span>
                        </button>
                        <button className="p-1 rounded-full hover:bg-slate-200">
                          <span className="text-red-600">✕</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </details>

                <details className="border border-slate-200 rounded-lg">
                  <summary className="w-full flex items-center justify-between p-3 text-left font-semibold text-slate-700 cursor-pointer">
                    <span>Corrected Claim Preview</span>
                    <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="p-4 border-t border-slate-200 text-sm space-y-2">
                    <p><strong>Line 1:</strong> CPT 99214 <span className="bg-green-100 p-1 rounded-md font-mono text-green-800">MOD: 59</span></p>
                    <button className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#137fec] px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-[#0f6acc] transition-colors">
                      Apply Corrections → Create Corrected Claim (7X)
                    </button>
                  </div>
                </details>
              </div>
              <div className="p-4 border-t border-slate-200 mt-auto bg-slate-50 rounded-b-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#137fec] mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-sm">Quick Tip</h4>
                    <p className="text-xs text-slate-600">Our AI analyzes every 277/835 file to identify root cause and recommend corrections. Most denials can be resolved in under 30 seconds.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="sticky bottom-0 bg-white border-t border-slate-200 p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-20">
          <div className="flex items-center justify-end gap-2">
            <button className="flex items-center justify-center gap-2 rounded-lg bg-slate-200 text-slate-800 px-4 py-2 text-sm font-bold hover:bg-slate-300 transition-colors">
              <span>Mark as Resolved</span>
            </button>
            <button className="flex items-center justify-center gap-2 rounded-lg bg-blue-100 text-blue-700 px-4 py-2 text-sm font-bold hover:bg-blue-200 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Draft Appeal</span>
            </button>
            <button className="flex items-center justify-center gap-2 rounded-lg bg-[#137fec] px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-[#0f6acc] transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span>Generate Corrected Claim (7)</span>
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}





