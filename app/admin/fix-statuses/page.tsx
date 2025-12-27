"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function FixStatusesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const fixStatuses = async () => {
    if (!supabase) {
      setResult("Supabase not configured");
      return;
    }

    try {
      setLoading(true);
      setResult("Starting status fix...\n");

      // Pull recent claims and fix statuses client-side (more reliable than PostgREST OR filters for empty strings)
      const { data: claims, error } = await supabase
        .from("claims")
        .select("id, patient_name, status, created_at")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) {
        setResult((prev) => prev + `Error fetching claims: ${error.message}\n`);
        return;
      }

      const toFix =
        (claims || []).filter((c) => {
          const s = String(c.status ?? "").trim().toLowerCase();
          const known = new Set([
            "accepted",
            "paid",
            "posted",
            "success",
            "submitted",
            "sent",
            "denied",
            "rejected",
            "pending",
            "needs review",
            "review",
          ]);
          // Fix: blank, draft, numeric HTTP codes, or any unknown values.
          return !s || s === "draft" || /^\d+$/.test(s) || !known.has(s);
        }) || [];

      if (toFix.length === 0) {
        setResult((prev) => prev + "✅ No claims found with missing/blank/Draft status (checked last 500).\n");
        return;
      }

      setResult((prev) => prev + `Found ${toFix.length} claims needing status fix (last 500):\n`);
      toFix.forEach((c) => {
        setResult((prev) => prev + `  - ${c.patient_name || "Unknown"} (${c.status || "null"})\n`);
      });
      setResult((prev) => prev + "\nUpdating all to 'submitted'...\n");

      const ids = toFix.map((c) => c.id);
      const { error: updateError } = await supabase.from("claims").update({ status: "submitted" }).in("id", ids);

      if (updateError) {
        setResult((prev) => prev + `Error updating claims: ${updateError.message}\n`);
        return;
      }

      setResult((prev) => prev + `✅ Successfully updated ${toFix.length} claims to "submitted" status\n`);
      setResult((prev) => prev + "\nStatus fix complete! All claims now have proper status values.\n");
    } catch (err) {
      setResult((prev) => prev + `Error: ${err instanceof Error ? err.message : String(err)}\n`);
    } finally {
      setLoading(false);
    }
  };

  const viewAllStatuses = async () => {
    if (!supabase) {
      setResult("Supabase not configured");
      return;
    }

    try {
      setLoading(true);
      setResult("Fetching all claim statuses...\n");

      const { data: claims, error } = await supabase
        .from("claims")
        .select("id, patient_name, status, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        setResult((prev) => prev + `Error: ${error.message}\n`);
        return;
      }

      setResult((prev) => prev + `\nFound ${claims?.length || 0} recent claims:\n\n`);

      const statusCounts: Record<string, number> = {};
      claims?.forEach((claim) => {
        const status = claim.status || "null";
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      setResult((prev) => prev + "Status Summary:\n");
      Object.entries(statusCounts).forEach(([status, count]) => {
        setResult((prev) => prev + `  ${status}: ${count}\n`);
      });

      setResult((prev) => prev + "\nRecent Claims (showing first 10):\n");
      claims?.slice(0, 10).forEach((claim) => {
        const needsFix = !claim.status || claim.status === "" || claim.status.toLowerCase() === "draft";
        const indicator = needsFix ? "⚠️ NEEDS FIX" : "✓";
        setResult(
          (prev) =>
            prev +
            `  ${indicator} ${claim.patient_name} - ${claim.status || "null"} (${new Date(claim.created_at).toLocaleDateString()})\n`,
        );
      });
    } catch (err) {
      setResult((prev) => prev + `Error: ${err instanceof Error ? err.message : String(err)}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f8]">
      {/* Header */}
      <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#137fec] text-white">
            <span className="material-symbols-outlined text-xl">medical_services</span>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] text-gray-900">Clinix AI Billing</h2>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to Dashboard
        </button>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Fix Claim Statuses</h1>
          <p className="mt-2 text-slate-600">Utility to repair claims with missing or incorrect statuses</p>
        </div>

        {/* Actions */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex gap-4">
            <button
              onClick={viewAllStatuses}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border-2 border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-[#137fec] hover:text-[#137fec] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-base">visibility</span>
              {loading ? "Loading..." : "View Status Summary"}
            </button>
            <button
              onClick={fixStatuses}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-[#137fec] px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#0f6acc] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-base">build</span>
              {loading ? "Fixing..." : "Fix Missing Statuses"}
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <span className="material-symbols-outlined text-base">terminal</span>
              Result
            </h3>
            <pre className="overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
              {result}
            </pre>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-600">info</span>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">What this does:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Finds claims with null, empty, or "Draft" status</li>
                <li>Sets them all to "submitted" (blue) by default</li>
                <li>Status will auto-update to accurate values when you:</li>
                <ul className="list-circle list-inside ml-6 mt-1">
                  <li>Click "Check Status" on individual claims</li>
                  <li>Click "Get 277/835" to fetch payment data</li>
                </ul>
              </ul>
              <p className="mt-3 font-semibold">Valid statuses:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>accepted, paid, posted, success</strong> → Shows as "Accepted" (green)</li>
                <li><strong>submitted, sent</strong> → Shows as "Submitted" (blue)</li>
                <li><strong>denied, rejected</strong> → Shows as "Denied" (red)</li>
                <li><strong>pending, needs review, review</strong> → Shows as "Needs Review" (yellow)</li>
                <li><strong>null or other</strong> → Shows as "Draft" (gray)</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


