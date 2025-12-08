"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Claim = {
  id: string;
  trading_partner_name?: string;
  trading_partner_service_id?: string;
  status?: string;
  claim_charge_amount?: number;
  created_at?: string;
};

export default function DashboardPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user?.id || null;
      if (!mounted) return;
      setUserId(uid);
      if (!uid) return;
      const { data: rows } = await supabase
        .from("claims")
        .select("id, trading_partner_name, trading_partner_service_id, status, claim_charge_amount, created_at")
        .order("created_at", { ascending: false });
      if (rows) setClaims(rows as Claim[]);
    };
    load();
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      const uid = session?.user?.id || null;
      setUserId(uid);
      if (!uid) {
        setClaims([]);
      }
    });
    return () => {
      mounted = false;
      sub?.subscription.unsubscribe();
    };
  }, []);

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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <section className="border-b border-slate-900 bg-slate-950">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.22em] text-sky-300">Dashboard</p>
              <h1 className="text-3xl font-semibold text-white">Claims</h1>
              <p className="text-sm text-slate-300">Create new claims or monitor existing submissions and statuses.</p>
            </div>
            <Link
              href="/claims/new"
              className="rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-md shadow-sky-600/40 transition hover:-translate-y-0.5 hover:bg-sky-400"
            >
              New claim
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl shadow-black/40">
            {claims.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-sm text-slate-300">
                <p>No claims yet.</p>
                <Link href="/claims/new" className="text-sky-300 underline underline-offset-4">
                  Start a claim
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-slate-100">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Payer</th>
                      <th className="px-3 py-2">Service ID</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Amount</th>
                      <th className="px-3 py-2">Created</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {claims.map((c) => (
                      <tr key={c.id} className="border-t border-slate-800">
                        <td className="px-3 py-2 font-mono text-xs text-slate-300">{c.id}</td>
                        <td className="px-3 py-2">{c.trading_partner_name || "—"}</td>
                        <td className="px-3 py-2">{c.trading_partner_service_id || "—"}</td>
                        <td className="px-3 py-2 text-sky-200">{c.status || "draft"}</td>
                        <td className="px-3 py-2">{c.claim_charge_amount ? `$${c.claim_charge_amount}` : "—"}</td>
                        <td className="px-3 py-2 text-slate-400">
                          {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-3 py-2">
                          <Link href={`/claims/${c.id}`} className="text-sky-300 underline underline-offset-4">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

