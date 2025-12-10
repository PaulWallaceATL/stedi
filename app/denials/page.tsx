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
};

function currency(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));
}

export default function DenialsPage() {
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

  return (
    <main className="min-h-screen bg-[#f6f7f8] text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Denials</h1>
          <Link href="/dashboard" className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 border border-slate-200 hover:bg-slate-200">
            Back to dashboard
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-rose-50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-rose-700">Patient</th>
                  <th className="px-6 py-3 text-left font-semibold text-rose-700">Claim ID</th>
                  <th className="px-6 py-3 text-left font-semibold text-rose-700">Payer</th>
                  <th className="px-6 py-3 text-left font-semibold text-rose-700">Status</th>
                  <th className="px-6 py-3 text-right font-semibold text-rose-700">Amount</th>
                  <th className="px-6 py-3 text-left font-semibold text-rose-700">Created</th>
                  <th className="px-6 py-3 text-left font-semibold text-rose-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {claims.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-sm text-slate-500">
                      No denials found.
                    </td>
                  </tr>
                )}
                {claims.map((c) => (
                  <tr key={c.id}>
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-800">{c.patient_name || "Unknown patient"}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">{c.id}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">{c.payer_name || "—"}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">{c.status || "denied"}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-slate-800">{currency(c.claim_charge_amount)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <Link href={`/claims/${c.id}`} className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
