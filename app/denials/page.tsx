"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { ModernNav } from "@/components/ui/ModernNav";

type ClaimRow = {
  id: string;
  patient_name?: string | null;
  payer_name?: string | null;
  status?: string | null;
  claim_charge_amount?: number | null;
  created_at?: string | null;
  date_of_service?: string | null;
};

function currency(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));
}

export default function DenialsPage() {
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);
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
        .select("id, patient_name, payer_name, status, claim_charge_amount, created_at, date_of_service")
        .eq("user_id", uid)
        .in("status", ["denied", "rejected"]);
      if (!mounted) return;
      if (rows) setClaims(rows as ClaimRow[]);
      if (error) console.error(error);
      setLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, []);

  const firstClaim = claims[0];
  const selectedClaimData = claims.find((c) => c.id === selectedClaim) || firstClaim;

  if (supabaseMissing) {
    return (
      <AuroraBackground className="flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-[#c97435]/20 bg-[#1a1512]/70 backdrop-blur-xl p-8 shadow-2xl text-center space-y-4"
        >
          <span className="material-symbols-outlined text-5xl text-[#6b5a45]">cloud_off</span>
          <p className="text-lg font-semibold text-[#e8dcc8]">Database Not Connected</p>
          <p className="text-sm text-[#8b7355]">Configure Supabase environment variables to view denials.</p>
        </motion.div>
      </AuroraBackground>
    );
  }

  if (!userId && !loading) {
    return (
      <AuroraBackground className="flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-[#c97435]/20 bg-[#1a1512]/70 backdrop-blur-xl p-8 shadow-2xl text-center space-y-6"
        >
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-600/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-rose-400">login</span>
          </div>
          <div>
            <p className="text-xl font-semibold text-[#e8dcc8]">Sign In Required</p>
            <p className="text-sm text-[#8b7355] mt-1">Access your denial management dashboard</p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#c97435] to-[#8b5a2b] text-[#0a0908] font-semibold hover:shadow-lg hover:shadow-[#c97435]/30 transition-all"
          >
            Sign In
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </motion.div>
      </AuroraBackground>
    );
  }

  if (loading) {
    return (
      <AuroraBackground className="flex items-center justify-center">
        <motion.div className="flex flex-col items-center gap-4">
          <motion.div
            className="w-12 h-12 border-3 border-[#c97435] border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-[#8b7355]">Loading denials...</p>
        </motion.div>
      </AuroraBackground>
    );
  }

  return (
    <AuroraBackground>
      <ModernNav />

      {/* Main */}
      <main className="h-[calc(100vh-73px)] grid grid-cols-1 lg:grid-cols-[280px_1fr_400px]">
        {/* Filters Sidebar */}
        <aside className="hidden lg:flex flex-col border-r border-[#c97435]/10 bg-[#0a0908]/30 overflow-y-auto">
          <div className="p-4 border-b border-[#c97435]/10">
            <h2 className="font-semibold text-[#e8dcc8]">Filters</h2>
          </div>
          <div className="p-4 space-y-6 flex-1">
            <div>
              <label className="text-sm font-medium text-[#e8dcc8] mb-3 block">Status</label>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-medium text-sm">
                  <span className="material-symbols-outlined text-lg">cancel</span>
                  Rejected
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-rose-500/20 text-xs">{claims.length}</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#1a1512]/50 border border-[#c97435]/10 text-[#e8dcc8] hover:text-[#e8dcc8] font-medium text-sm transition-colors">
                  <span className="material-symbols-outlined text-lg">warning</span>
                  Denied
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-[#1a1512] text-xs">0</span>
                </button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-[#e8dcc8] mb-3 block">AI Categorized Reasons</label>
              <div className="space-y-1">
                {["Modifier Issues", "Coding Conflicts", "Missing/Invalid Dx", "Payer Coverage Rules"].map((cat) => (
                  <button key={cat} className="w-full text-left px-3 py-2 rounded-xl text-[#a67c52] hover:text-[#e8dcc8] hover:bg-[#c97435]/10 text-sm transition-colors">
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-[#c97435]/10 mt-auto">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#e8dcc8]">High-Impact Only</label>
              <button
                onClick={() => setShowHighImpactOnly(!showHighImpactOnly)}
                className={`relative w-11 h-6 rounded-full transition-colors ${showHighImpactOnly ? "bg-[#c97435]" : "bg-[#1a1512]"}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-[#e8dcc8] transition-transform ${showHighImpactOnly ? "left-6" : "left-1"}`} />
              </button>
            </div>
          </div>
        </aside>

        {/* Denial Queue */}
        <div className="flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[#c97435]/10 flex items-center justify-between bg-[#0a0908]/30">
            <div>
              <h2 className="font-semibold text-[#e8dcc8]">Denial Queue</h2>
              <p className="text-sm text-[#8b7355]">{claims.length} claims requiring action</p>
            </div>
            <select className="px-3 py-2 rounded-xl bg-[#1a1512]/50 border border-[#c97435]/10 text-sm text-[#a67c52] focus:outline-none focus:border-[#c97435]">
              <option>AI-Suggested Priority</option>
              <option>Date of Service</option>
              <option>Severity</option>
              <option>Amount</option>
            </select>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {claims.length > 0 ? (
              <div className="space-y-3">
                {claims.map((c, idx) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedClaim(c.id)}
                    className={`rounded-2xl p-4 cursor-pointer transition-all ${
                      selectedClaim === c.id
                        ? "bg-[#c97435]/10 border border-[#c97435]/30"
                        : "bg-[#1a1512]/50 border border-[#c97435]/10 hover:border-[#c97435]/20"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-[#e8dcc8]">{c.patient_name || "Unknown Patient"}</p>
                        <p className="text-xs text-[#6b5a45] font-mono">{c.id.slice(0, 8)}...</p>
                      </div>
                      <span className="px-2 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                        High
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-[#6b5a45]">Payer</p>
                        <p className="text-[#a67c52]">{c.payer_name || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[#6b5a45]">Amount</p>
                        <p className="text-[#a67c52]">{currency(c.claim_charge_amount)}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-[#c97435]/10">
                      <p className="text-xs text-[#6b5a45]">
                        <span className="font-mono text-rose-400">CO-45, PR-22</span> — Incorrect modifier for telehealth POS
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-4xl text-emerald-400">check_circle</span>
                </div>
                <p className="text-lg font-semibold text-[#e8dcc8]">No Denials Found</p>
                <p className="text-sm text-[#8b7355] mt-1">All your claims are in good standing</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Analyst Panel */}
        <aside className="hidden lg:flex flex-col border-l border-[#c97435]/10 bg-[#0a0908]/30 overflow-hidden">
          <div className="p-4 border-b border-[#c97435]/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c97435]/20 to-[#8b5a2b]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl text-[#c97435]">psychology</span>
              </div>
              <div>
                <h2 className="font-semibold text-[#e8dcc8]">AI Denial Analyst</h2>
                <p className="text-xs text-[#6b5a45]">Claim {selectedClaimData?.id.slice(0, 8) || "..."}</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* AI Analysis - RED for errors */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4"
            >
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-2xl text-rose-400">error</span>
                <div>
                  <h3 className="font-semibold text-[#e8dcc8]">Modifier mismatch: CPT requires 59 instead of 25</h3>
                  <p className="text-sm text-[#8b7355] mt-1">
                    Payer rule indicates CPT 99214 with telehealth POS 02 requires modifier 59 for separate evaluation.
                  </p>
                </div>
              </div>
              <div className="mt-3 text-right">
                <span className="text-xs font-medium text-[#c97435]">AI is 93% confident</span>
              </div>
            </motion.div>

            {/* 277/835 Data */}
            <div className="rounded-2xl bg-[#1a1512]/30 border border-[#c97435]/10 overflow-hidden">
              <button className="w-full p-4 flex items-center justify-between text-left">
                <span className="font-semibold text-[#e8dcc8]">Stedi 277/835 Data</span>
                <span className="material-symbols-outlined text-[#6b5a45]">expand_more</span>
              </button>
              <div className="px-4 pb-4 space-y-3">
                <div className="p-3 rounded-xl bg-[#0a0908]/50">
                  <p className="text-sm font-mono text-[#a67c52]">CARC Code: <span className="text-rose-400">CO-45</span></p>
                  <p className="text-xs text-[#6b5a45] mt-1 italic">AI: Charge exceeds fee schedule.</p>
                </div>
                <div className="p-3 rounded-xl bg-[#0a0908]/50">
                  <p className="text-sm font-mono text-[#a67c52]">RARC Code: <span className="text-amber-400">N386</span></p>
                  <p className="text-xs text-[#6b5a45] mt-1 italic">AI: Service not separately payable.</p>
                </div>
              </div>
            </div>

            {/* AI Suggested Fix - GREEN for success */}
            <div className="rounded-2xl bg-[#1a1512]/30 border border-[#c97435]/10 overflow-hidden">
              <button className="w-full p-4 flex items-center justify-between text-left">
                <span className="font-semibold text-[#e8dcc8]">AI-Suggested Fixes</span>
                <span className="material-symbols-outlined text-[#6b5a45]">expand_more</span>
              </button>
              <div className="px-4 pb-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#e8dcc8]">Change modifier on CPT 99214 to <span className="font-mono font-bold text-emerald-400">59</span></p>
                      <p className="text-xs text-emerald-400 mt-1">AI Confidence: 95%</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="w-8 h-8 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 flex items-center justify-center text-emerald-400 transition-colors">
                        <span className="material-symbols-outlined text-lg">check</span>
                      </button>
                      <button className="w-8 h-8 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 flex items-center justify-center text-rose-400 transition-colors">
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Corrected Preview */}
            <div className="rounded-2xl bg-[#1a1512]/30 border border-[#c97435]/10 overflow-hidden">
              <button className="w-full p-4 flex items-center justify-between text-left">
                <span className="font-semibold text-[#e8dcc8]">Corrected Claim Preview</span>
                <span className="material-symbols-outlined text-[#6b5a45]">expand_more</span>
              </button>
              <div className="px-4 pb-4 space-y-3">
                <div className="p-3 rounded-xl bg-[#0a0908]/50">
                  <p className="text-sm text-[#a67c52]">
                    Line 1: CPT 99214 <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-xs">MOD: 59</span>
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#c97435] to-[#8b5a2b] text-[#0a0908] font-semibold shadow-lg shadow-[#c97435]/20"
                >
                  Apply Corrections → Create 7X Claim
                </motion.button>
              </div>
            </div>
          </div>

          {/* Quick Tip */}
          <div className="p-4 border-t border-[#c97435]/10 bg-[#0a0908]/50">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#c97435]" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
              <div>
                <h4 className="text-sm font-semibold text-[#e8dcc8]">Quick Tip</h4>
                <p className="text-xs text-[#6b5a45] mt-1">Our AI analyzes every 277/835 file to identify root cause. Most denials can be resolved in under 30 seconds.</p>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer Actions */}
      <footer className="sticky bottom-0 border-t border-[#c97435]/10 bg-[#0a0908]/90 backdrop-blur-xl p-4 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-end gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a1512] border border-[#c97435]/20 text-[#a67c52] font-medium hover:bg-[#c97435]/10 transition-colors">
            Mark as Resolved
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 font-medium hover:bg-sky-500/20 transition-colors">
            <span className="material-symbols-outlined text-lg">description</span>
            Draft Appeal
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c97435] to-[#8b5a2b] text-[#0a0908] font-semibold shadow-lg shadow-[#c97435]/20"
          >
            <span className="material-symbols-outlined text-lg">task_alt</span>
            Generate Corrected Claim
          </motion.button>
        </div>
      </footer>
    </AuroraBackground>
  );
}
