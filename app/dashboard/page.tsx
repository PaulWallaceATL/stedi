"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { claimStatus } from "../lib/stediClient";

type ClaimRow = {
  id: string;
  patient_name?: string | null;
  payer_name?: string | null;
  trading_partner_name?: string | null;
  trading_partner_service_id?: string | null;
  status?: string | null;
  claim_charge_amount?: number | null;
  total_charge?: number | null;
  date_of_service?: string | null;
  service_line_count?: number | null;
  created_at?: string | null;
  payload?: any;
};

type ClaimEvent = {
  id: string;
  claim_id: string;
  type: string | null;
  payload?: any;
  created_at?: string | null;
};

function currency(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));
}

function derivePatientName(claim: ClaimRow) {
  if (claim.patient_name) return claim.patient_name;
  const payload = claim.payload || {};
  const patient = payload.patient;
  const subscriber = payload.subscriber;
  if (patient?.firstName || patient?.lastName) {
    return [patient.firstName, patient.lastName].filter(Boolean).join(" ").trim() || "Unnamed patient";
  }
  if (subscriber?.firstName || subscriber?.lastName) {
    return [subscriber.firstName, subscriber.lastName].filter(Boolean).join(" ").trim() || "Subscriber";
  }
  return "Unknown";
}

function deriveDateOfService(claim: ClaimRow) {
  const date = claim.date_of_service;
  const payload = claim.payload || {};
  const firstLine = payload.claim?.serviceLines?.[0];
  const fallback = firstLine?.serviceDate || payload.date_of_service || claim.created_at;
  const value = date || fallback;
  return value ? new Date(value).toLocaleDateString() : "—";
}

function deriveStatusMeta(status?: string | null) {
  const key = (status || "submitted").toLowerCase();
  if (["accepted", "paid", "posted", "success"].includes(key)) {
    return { label: "Accepted", tone: "success" as const };
  }
  if (["submitted", "sent"].includes(key)) {
    return { label: "Submitted", tone: "primary" as const };
  }
  if (["denied", "rejected"].includes(key)) {
    return { label: "Denied", tone: "danger" as const };
  }
  if (["needs review", "review", "pending"].includes(key)) {
    return { label: "Needs Review", tone: "warning" as const };
  }
  return { label: "Draft", tone: "muted" as const };
}

function StatusPill({ status }: { status?: string | null }) {
  const meta = deriveStatusMeta(status);
  const toneClasses: Record<string, string> = {
    success: "bg-emerald-100 text-emerald-700",
    primary: "bg-sky-100 text-sky-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
    muted: "bg-slate-100 text-slate-600",
  };
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${toneClasses[meta.tone]}`}>{meta.label}</span>;
}

export default function DashboardPage() {
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseMissing = !supabase;
  const [events, setEvents] = useState<ClaimEvent[]>([]);
  const [polling, setPolling] = useState(false);

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
        .select(
          "id, user_id, patient_name, payer_name, trading_partner_name, trading_partner_service_id, status, claim_charge_amount, total_charge, date_of_service, service_line_count, created_at, payload",
        )
        .eq("user_id", uid)
        .order("created_at", { ascending: false });
      if (!mounted) return;
      if (rows) setClaims(rows as ClaimRow[]);
      if (error) console.error(error);
      if (rows && rows.length) {
        const ids = rows.map((r) => r.id);
        const { data: evts, error: evtErr } = await supabase
          .from("claim_events")
          .select("id, claim_id, type, payload, created_at")
          .in("claim_id", ids)
          .order("created_at", { ascending: false })
          .limit(50);
        if (!mounted) return;
        if (evts) setEvents(evts as ClaimEvent[]);
        if (evtErr) console.error(evtErr);
      }
      setLoading(false);
    };
    load();
    const { data: sub } = supabase?.auth.onAuthStateChange((_evt, session) => {
      const uid = session?.user?.id || null;
      setUserId(uid);
      if (!uid) {
        setClaims([]);
      }
    }) || { subscription: { unsubscribe: () => undefined } };
    return () => {
      mounted = false;
      sub?.subscription.unsubscribe();
    };
  }, []);

  const summary = useMemo(() => {
    if (!claims.length) {
      return {
        totalCharges: 0,
        acceptedRate: 0,
        submittedCount: 0,
        needsAttention: 0,
      };
    }
    const totalCharges = claims.reduce((sum, c) => sum + (Number(c.total_charge ?? c.claim_charge_amount) || 0), 0);
    const accepted = claims.filter((c) => deriveStatusMeta(c.status).tone === "success").length;
    const submitted = claims.filter((c) => deriveStatusMeta(c.status).tone === "primary").length;
    const deniedOrAttention = claims.filter((c) => deriveStatusMeta(c.status).tone === "danger").length;
    return {
      totalCharges,
      acceptedRate: Math.round((accepted / claims.length) * 1000) / 10,
      submittedCount: submitted,
      needsAttention: deniedOrAttention,
    };
  }, [claims]);

  const denialClaims = useMemo(
    () => claims.filter((c) => deriveStatusMeta(c.status).tone === "danger").slice(0, 5),
    [claims],
  );

  const recentEvents = useMemo(() => events.slice(0, 8), [events]);

  const buildStatusPayload = (claim: ClaimRow) => {
    const p = claim.payload || {};
    const subscriber = p.subscriber || {};
    const billing = p.billing || p.provider || {};
    const serviceLine = p.claimInformation?.serviceLines?.[0] || {};
    const dosRaw =
      serviceLine.serviceDate ||
      serviceLine.from ||
      claim.date_of_service ||
      p.claimInformation?.dateOfService ||
      p.date_of_service;
    const dateClean =
      typeof dosRaw === "string"
        ? dosRaw.replace(/-/g, "").replace(/[^\d]/g, "")
        : "20250105";
    const dobClean =
      (subscriber.dateOfBirth || "1970-01-01").toString().replace(/-/g, "").replace(/[^\d]/g, "") ||
      "19700101";

    return {
      encounter: {
        beginningDateOfService: dateClean || "20250105",
        endDateOfService: dateClean || "20250105",
      },
      providers: [
        {
          npi: billing.npi || "1999999984",
          organizationName: billing.organizationName || claim.trading_partner_name || "Demo Clinic",
          providerType: "BillingProvider",
        },
      ],
      subscriber: {
        dateOfBirth: dobClean,
        firstName: subscriber.firstName || "JANE",
        lastName: subscriber.lastName || "DOE",
        memberId: subscriber.memberId || p.subscriber?.memberId || "AETNA12345",
      },
      tradingPartnerServiceId: p.tradingPartnerServiceId || claim.trading_partner_service_id || "60054",
    };
  };

  useEffect(() => {
    if (supabaseMissing || !claims.length) return;
    let alive = true;

    const pollStatuses = async () => {
      if (polling) return;
      setPolling(true);
      try {
        const toUpdate = claims
          .filter((c) => {
            const key = (c.status || "").toLowerCase();
            return !key || ["draft", "submitted", "pending", "success"].includes(key);
          })
          .slice(0, 3); // throttle per cycle

        for (const claim of toUpdate) {
          try {
            const payload = buildStatusPayload(claim);
            if (!payload) continue;
            const res = await claimStatus(payload);
            const raw = (res.data?.status || "").toString().toLowerCase();
            const normalized = raw === "success" ? "accepted" : raw || "submitted";
            await supabase?.from("claims").update({ status: normalized }).eq("id", claim.id);
          } catch (_err) {
            // ignore individual failures
          }
        }
      } finally {
        if (alive) setPolling(false);
      }
    };

    const id = setInterval(() => {
      void pollStatuses();
    }, 30000);

    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [claims, supabaseMissing, polling]);

  if (supabaseMissing) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/40 text-center space-y-4">
          <p className="text-lg font-semibold text-white">Supabase environment variables are missing.</p>
          <p className="text-sm text-slate-300">Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to view the dashboard.</p>
        </div>
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/40 text-center space-y-4">
          <p className="text-lg font-semibold text-white">Please sign in to view your dashboard.</p>
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
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm">Loading your claims…</div>
      </main>
    );
  }

  if (claims.length === 0) {
    return (
      <main className="min-h-screen bg-[#f9f9f8] text-gray-900 pt-12">
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-6 py-16 text-center mt-6">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight text-gray-900">Create or Import a Claim</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choose the method that matches your workflow. You can upload files, import structured data, or build a claim manually.
              </p>
              <p className="text-sm text-gray-500">ⓘ View sample files & required fields</p>
            </div>
            <div className="relative mt-12 w-full rounded-3xl border border-dashed border-gray-300 bg-gray-100/60 p-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
                <div className="flex flex-col rounded-xl bg-white p-8 text-left shadow">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 text-3xl font-bold">CSV</div>
                    <h3 className="text-xl font-bold text-gray-900">Upload CSV</h3>
                  </div>
                  <p className="mt-6 text-base text-gray-600 flex-1">
                    Perfect for uploading multiple claims at once — ideal for billing teams bringing in historical claims or bulk data from another system.
                  </p>
                  <div className="mt-8 flex flex-col gap-3">
                    <button type="button" className="h-10 rounded-lg bg-[#137fec] px-4 text-sm font-bold text-white">
                      Upload CSV
                    </button>
                    <button type="button" className="text-sm font-medium text-[#137fec] hover:underline">Download CSV template</button>
                    <p className="text-xs text-center text-gray-500">CSV uploads support claim headers and service lines.</p>
                  </div>
                </div>
                <div className="flex flex-col rounded-xl bg-white p-8 text-left shadow">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-teal-100 text-teal-600 text-3xl font-bold">JSON</div>
                    <h3 className="text-xl font-bold text-gray-900">Upload JSON</h3>
                  </div>
                  <p className="mt-6 text-base text-gray-600 flex-1">
                    Best for technical teams or integrations. Import structured claim data exactly as your system exports it.
                  </p>
                  <div className="mt-8 flex flex-col gap-3">
                    <button type="button" className="h-10 rounded-lg bg-[#137fec] px-4 text-sm font-bold text-white">
                      Upload JSON
                    </button>
                    <button type="button" className="text-sm font-medium text-[#137fec] hover:underline">View JSON schema</button>
                    <p className="text-xs text-center text-gray-500">Supports nested arrays for diagnoses and service lines.</p>
                  </div>
                </div>
                <div className="flex flex-col rounded-xl bg-white p-8 text-left shadow">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-amber-100 text-amber-600 text-3xl font-bold">✎</div>
                    <h3 className="text-xl font-bold text-gray-900">Build a Claim From Scratch</h3>
                  </div>
                  <p className="mt-6 text-base text-gray-600 flex-1">
                    Use our guided form to enter patient demographics, payer information, diagnoses, and CPT/HCPCS service lines one step at a time.
                  </p>
                  <div className="mt-8 flex flex-col gap-3">
                    <Link href="/claims/new" className="flex h-10 items-center justify-center rounded-lg bg-[#137fec] px-4 text-sm font-bold text-white">
                      Start Claim
                    </Link>
                    <p className="text-xs text-center text-gray-500">Great for single encounters or corrected claims.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7f8] text-slate-900">
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div className="flex items-center gap-3 text-slate-900">
            <div className="text-[#137fec]">
              <svg className="h-6 w-6" viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold tracking-tight">Clinix AI Billing</h2>
            <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
              <Link className="font-medium text-slate-900" href="/dashboard">
                Dashboard
              </Link>
              <Link className="hover:text-slate-900" href="#">
                Reports
              </Link>
              <Link className="hover:text-slate-900" href="#">
                Settings
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <input
                className="h-10 rounded-lg border border-slate-200 bg-slate-100 px-4 pr-4 text-sm text-slate-700 outline-none focus:border-[#137fec] focus:ring-2 focus:ring-[#137fec]/30"
                placeholder="Search claims..."
              />
            </div>
            <Link
              href="/claims/new"
              className="flex items-center justify-center gap-2 rounded-lg bg-[#137fec] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#0f6acc]"
            >
              <span>New Claim</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="mx-auto flex max-w-screen-2xl flex-col gap-6">
            <div className="flex justify-center">
              <div className="inline-flex items-center rounded-lg bg-slate-200/70 p-1">
                <button className="rounded-md bg-[#137fec] px-4 py-1.5 text-sm font-semibold text-white shadow-sm">Billing Ops Manager</button>
                <button className="rounded-md px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200">Intelligent Prioritization</button>
                <button className="rounded-md px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200">Performance Review</button>
              </div>
            </div>

            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-2xl font-bold text-slate-900">Claim Management Dashboard</h1>
              <div className="flex items-center gap-2">
                <button className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <span>More Filters</span>
                </button>
                <Link
                  href="/claims/new"
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#137fec] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#0f6acc]"
                >
                  <span>New Claim</span>
                </Link>
              </div>
            </header>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">Total AR</p>
                  <span className="text-[#137fec]">⦿</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">{currency(summary.totalCharges)}</p>
                <p className="text-sm text-slate-600 mt-1">Calculated from claim charge amount</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">First Pass Approval</p>
                  <span className="text-emerald-500">●</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">{summary.acceptedRate}%</p>
                <p className="text-sm text-slate-600 mt-1">Accepted / total claims</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">Submitted</p>
                  <span className="text-amber-500">●</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">{summary.submittedCount}</p>
                <p className="text-sm text-slate-600 mt-1">Currently in flight</p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm text-rose-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Needs Attention</p>
                  <span>!</span>
                </div>
                <p className="text-3xl font-bold">{summary.needsAttention}</p>
                <p className="text-sm mt-1">Rejected or denied</p>
              </div>
            </div>

            {(denialClaims.length > 0 || recentEvents.length > 0) && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-rose-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-rose-700">Denials / Needs Attention</h3>
                    <Link href="/denials" className="text-sm font-medium text-rose-700 hover:underline">
                      View all
                    </Link>
                  </div>
                  {denialClaims.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">No denials yet.</p>
                  ) : (
                    <ul className="mt-3 divide-y divide-slate-200">
                      {denialClaims.map((c) => (
                        <li key={c.id} className="py-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{derivePatientName(c)}</p>
                              <p className="text-xs text-slate-500">
                                {c.payer_name || "—"} · {deriveDateOfService(c)}
                              </p>
                            </div>
                            <Link href={`/claims/${c.id}`} className="text-sm font-medium text-[#137fec] hover:underline">
                              View
                            </Link>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Status: {c.status || "denied"}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900">Recent Activity</h3>
                  </div>
                  {recentEvents.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">No recent claim activity.</p>
                  ) : (
                    <ul className="mt-3 divide-y divide-slate-200">
                      {recentEvents.map((ev) => (
                        <li key={ev.id} className="py-3">
                          <p className="text-sm font-semibold text-slate-900 capitalize">{ev.type || "event"}</p>
                          <p className="text-xs text-slate-500">
                            Claim {ev.claim_id} · {ev.created_at ? new Date(ev.created_at).toLocaleString() : ""}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-slate-600">Patient Name</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-600">Claim ID</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-600">Date of Service</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-600">Payer</th>
                      <th className="px-6 py-3 text-right font-semibold text-slate-600">Billed Amount</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-600">Status</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-600">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {claims.map((claim) => (
                      <tr key={claim.id} className="bg-white">
                        <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-800">{derivePatientName(claim)}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-slate-600">{claim.id}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-slate-600">{deriveDateOfService(claim)}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-slate-600">{claim.trading_partner_name || "—"}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-slate-800">{currency(claim.claim_charge_amount)}</td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <StatusPill status={claim.status} />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Link
                            href={`/claims/${claim.id}`}
                            className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
                          >
                            View Claim Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 p-4 text-sm text-slate-600">
                <span>Showing {claims.length} claim{claims.length === 1 ? "" : "s"}</span>
                <div className="flex gap-2">
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50">‹</button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50">›</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </main>
  );
}

