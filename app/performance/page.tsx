"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type ClaimRow = {
  id: string;
  payer_name?: string | null;
  status?: string | null;
  claim_charge_amount?: number | null;
  created_at?: string | null;
};

function currency(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));
}

export default function PerformancePage() {
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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
        .select("id, payer_name, status, claim_charge_amount, created_at")
        .eq("user_id", uid);
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

  const metrics = useMemo(() => {
    const total = claims.length;
    const totalCharges = claims.reduce((sum, c) => sum + (Number(c.claim_charge_amount) || 0), 0);
    const accepted = claims.filter((c) => (c.status || "").toLowerCase() === "accepted").length;
    const denied = claims.filter((c) => ["denied", "rejected"].includes((c.status || "").toLowerCase())).length;
    const submitted = claims.filter((c) => ["submitted", "sent"].includes((c.status || "").toLowerCase())).length;
    const avg = total ? totalCharges / total : 0;
    const byPayer = claims.reduce<Record<string, number>>((acc, c) => {
      const key = c.payer_name || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const topPayers = Object.entries(byPayer)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    return { total, totalCharges, accepted, denied, submitted, avg, topPayers };
  }, [claims]);

  if (supabaseMissing) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/40 text-center space-y-4">
          <p className="text-lg font-semibold text-white">Supabase environment variables are missing.</p>
          <p className="text-sm text-slate-300">Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to view performance.</p>
        </div>
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/40 text-center space-y-4">
          <p className="text-lg font-semibold text-white">Please sign in to view performance.</p>
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
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm">Loading performance…</div>
      </main>
    );
  }

  if (claims.length === 0) {
    return (
      <main className="min-h-screen bg-[#f6f7f8] text-slate-900">
        <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Performance</h1>
            <Link href="/dashboard" className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 border border-slate-200 hover:bg-slate-200">
              Back to dashboard
            </Link>
          </div>
          <div className="space-y-3">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              No claims found. Submit a claim while signed in to populate performance metrics.
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              Quick check: after submitting, confirm the claim appears in Supabase (`claims` table) and on the dashboard. If not, ensure you are signed in and that
              NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your environment.
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f8] text-slate-900">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 px-6 sm:px-10 py-3 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4 text-gray-900">
          <svg className="w-6 h-6 text-[#137fec]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" fill="currentColor"></path>
          </svg>
          <h2 className="text-gray-900 text-lg font-bold leading-tight tracking-[-0.015em]">Clinix AI Billing</h2>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link className="text-sm font-medium text-slate-500 hover:text-slate-800" href="/dashboard">Dashboard</Link>
          <Link className="text-sm font-medium text-slate-500 hover:text-slate-800" href="/upload">Upload</Link>
          <Link className="text-sm font-medium text-slate-500 hover:text-slate-800" href="/denials">Denials</Link>
          <Link className="text-sm font-medium text-[#137fec] font-semibold" href="/performance">Reports</Link>
          <Link className="text-sm font-medium text-slate-500 hover:text-slate-800" href="/settings">Settings</Link>
        </nav>
        <div className="flex items-center gap-4">
          <button className="flex cursor-pointer items-center justify-center rounded-lg h-10 w-10 bg-gray-100 text-gray-800">
            <span className="material-symbols-outlined text-xl">notifications</span>
          </button>
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAo26DySMBL37uyyFxr2SZsBgv_9bZgBqxg4Hcye7R9T5aR1R4uO2DDnTWYCEPT0KrSg7LkmEh-WjktqZZBOYx7JmuNBHY7Hv3UEYe-aTBBzJ7mwjsUvhp64pCcCEid15VCuLJVK9pRQO3BzCjdj6953fO4SEvGQ_KVbHkuDK4sUN5LlEnBPnBmVfuD2GOMyP1CGZ-wmLx4v0NzlE2GyThneMjSybEVobsNuw1Zk0immZQYf-H__5ROO_WhN2lCwowjtq9tKo3jul4")'}}></div>
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Performance Reports</h1>
          <Link href="/claims/new" className="flex items-center gap-2 rounded-lg bg-[#137fec] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#0f6acc]">
            <span className="material-symbols-outlined text-base">add</span>
            New Claim
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total claims" value={metrics.total.toString()} />
          <MetricCard label="Total billed" value={currency(metrics.totalCharges)} />
          <MetricCard label="Accepted" value={`${metrics.accepted}`} />
          <MetricCard label="Denied" value={`${metrics.denied}`} tone="danger" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 mb-2">Throughput</h3>
            <p className="text-sm text-slate-600">Submitted: {metrics.submitted}</p>
            <p className="text-sm text-slate-600">Avg charge per claim: {currency(metrics.avg)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-slate-900">Top Payers (by volume)</h3>
            </div>
            {metrics.topPayers.length === 0 ? (
              <p className="text-sm text-slate-500">No payer data yet.</p>
            ) : (
              <ul className="divide-y divide-slate-200">
                {metrics.topPayers.map(([payer, count]) => (
                  <li key={payer} className="flex items-center justify-between py-2 text-sm text-slate-800">
                    <span>{payer}</span>
                    <span className="text-slate-600">{count} claim{count === 1 ? "" : "s"}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone?: "danger" | "default" }) {
  const base = "rounded-xl border p-4 shadow-sm";
  const toneClass = tone === "danger" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-900";
  return (
    <div className={`${base} ${toneClass}`}>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}
