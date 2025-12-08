"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";

export default function ClaimDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: row } = await supabase.from("claims").select("*").eq("id", id).single();
      setData(row);
      setLoading(false);
    };
    if (id) load();
  }, [id]);

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
        </div>
      </div>
    </main>
  );
}

