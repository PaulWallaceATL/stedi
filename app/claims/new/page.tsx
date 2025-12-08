"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type ClaimPayload = {
  tradingPartnerName?: string;
  tradingPartnerServiceId?: string;
  claimChargeAmount?: string;
  memberId?: string;
  patientControlNumber?: string;
};

export default function NewClaimPage() {
  const [payload, setPayload] = useState<ClaimPayload>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async () => {
    setError(null);
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user?.id;
    if (!userId) {
      setError("Please sign in.");
      setLoading(false);
      return;
    }
    const { error: err } = await supabase.from("claims").insert({
      user_id: userId,
      trading_partner_name: payload.tradingPartnerName,
      trading_partner_service_id: payload.tradingPartnerServiceId,
      claim_charge_amount: payload.claimChargeAmount ? Number(payload.claimChargeAmount) : null,
      status: "draft",
      payload: payload,
    });
    if (err) setError(err.message);
    else router.push("/dashboard");
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.22em] text-sky-300">New claim</p>
          <h1 className="text-3xl font-semibold text-white">Create a claim</h1>
          <p className="text-sm text-slate-300">
            Minimal stub aligned to Stedi 837P JSON. Expand with subscriber, billing, and service lines as needed.
          </p>
        </div>
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/40">
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Trading partner name"
              value={payload.tradingPartnerName || ""}
              onChange={(v) => setPayload((p) => ({ ...p, tradingPartnerName: v }))}
            />
            <Field
              label="Trading partner service ID"
              value={payload.tradingPartnerServiceId || ""}
              onChange={(v) => setPayload((p) => ({ ...p, tradingPartnerServiceId: v }))}
            />
            <Field
              label="Claim charge amount"
              value={payload.claimChargeAmount || ""}
              onChange={(v) => setPayload((p) => ({ ...p, claimChargeAmount: v }))}
            />
            <Field
              label="Member ID"
              value={payload.memberId || ""}
              onChange={(v) => setPayload((p) => ({ ...p, memberId: v }))}
            />
            <Field
              label="Patient control number"
              value={payload.patientControlNumber || ""}
              onChange={(v) => setPayload((p) => ({ ...p, patientControlNumber: v }))}
            />
          </div>
          {error && <p className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p>}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:-translate-y-0.5 hover:border-sky-500/60 transition"
              onClick={() => router.back()}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-sky-600/40 transition hover:-translate-y-0.5 hover:bg-sky-400 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save draft"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-slate-200">
      <span className="text-slate-300">{label}</span>
      <input
        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

