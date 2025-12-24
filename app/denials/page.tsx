"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

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

// Animated background
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0a0f]" />
      <motion.div
        className="absolute top-0 left-1/4 w-1/2 h-1/2 rounded-full bg-gradient-to-r from-rose-600/10 via-pink-600/10 to-red-600/10 blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-1/2 h-1/2 rounded-full bg-gradient-to-l from-violet-500/10 via-purple-500/10 to-indigo-500/10 blur-3xl"
        animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
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
      <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6">
        <AnimatedBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-8 shadow-2xl text-center space-y-4"
        >
          <span className="material-symbols-outlined text-5xl text-slate-500">cloud_off</span>
          <p className="text-lg font-semibold text-white">Database Not Connected</p>
          <p className="text-sm text-slate-300">Configure Supabase environment variables to view denials.</p>
        </motion.div>
      </main>
    );
  }

  if (!userId && !loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6">
        <AnimatedBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-8 shadow-2xl text-center space-y-6"
        >
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-rose-400">login</span>
          </div>
          <div>
            <p className="text-xl font-semibold text-white">Sign In Required</p>
            <p className="text-sm text-slate-300 mt-1">Access your denial management dashboard</p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#137fec] to-indigo-600 text-white font-semibold hover:from-[#0f6acc] hover:to-indigo-500 transition-all"
          >
            Sign In
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </motion.div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <motion.div className="flex flex-col items-center gap-4">
          <motion.div
            className="w-12 h-12 border-3 border-rose-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-slate-300">Loading denials...</p>
        </motion.div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#137fec] to-indigo-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 48 48">
                  <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" fill="currentColor" />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-white">Denial Manager</h1>
                <p className="text-xs text-slate-400">AI-Powered Resolution</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              {[
                { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
                { href: "/claims/new", label: "New Claim", icon: "add_circle" },
                { href: "/upload", label: "Upload", icon: "upload_file" },
                { href: "/performance", label: "Reports", icon: "analytics" },
                { href: "/settings", label: "Settings", icon: "settings" },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800/50 transition-colors">
                  <span className="material-symbols-outlined text-lg" style={{ color: '#ffffff' }}>{item.icon}</span>
                  <span style={{ color: '#ffffff' }}>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <div className="relative hidden lg:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                <input
                  type="text"
                  placeholder="Search claims..."
                  className="w-64 pl-10 pr-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#137fec] transition-colors"
                />
              </div>
              <button className="p-2 rounded-xl hover:bg-slate-800 text-white hover:text-white transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="h-[calc(100vh-73px)] grid grid-cols-1 lg:grid-cols-[280px_1fr_400px]">
        {/* Filters Sidebar */}
        <aside className="hidden lg:flex flex-col border-r border-slate-800 bg-slate-900/30 overflow-y-auto">
          <div className="p-4 border-b border-slate-800">
            <h2 className="font-semibold text-white">Filters</h2>
          </div>
          <div className="p-4 space-y-6 flex-1">
            <div>
              <label className="text-sm font-medium text-white mb-3 block">Status</label>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-medium text-sm">
                  <span className="material-symbols-outlined text-lg">cancel</span>
                  Rejected
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-rose-500/20 text-xs">{claims.length}</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white hover:text-white font-medium text-sm transition-colors">
                  <span className="material-symbols-outlined text-lg">warning</span>
                  Denied
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-slate-700 text-xs">0</span>
                </button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-white mb-3 block">AI Categorized Reasons</label>
              <div className="space-y-1">
                {["Modifier Issues", "Coding Conflicts", "Missing/Invalid Dx", "Payer Coverage Rules"].map((cat) => (
                  <button key={cat} className="w-full text-left px-3 py-2 rounded-xl text-white hover:text-white hover:bg-slate-800/50 text-sm transition-colors">
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-slate-800 mt-auto">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white">High-Impact Only</label>
              <button
                onClick={() => setShowHighImpactOnly(!showHighImpactOnly)}
                className={`relative w-11 h-6 rounded-full transition-colors ${showHighImpactOnly ? "bg-[#137fec]" : "bg-slate-700"}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${showHighImpactOnly ? "left-6" : "left-1"}`} />
              </button>
            </div>
          </div>
        </aside>

        {/* Denial Queue */}
        <div className="flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/30">
            <div>
              <h2 className="font-semibold text-white">Denial Queue</h2>
              <p className="text-sm text-slate-400">{claims.length} claims requiring action</p>
            </div>
            <select className="px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-300 focus:outline-none focus:border-[#137fec]">
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
                        ? "bg-[#137fec]/10 border border-[#137fec]/30"
                        : "bg-slate-900/50 border border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-white">{c.patient_name || "Unknown Patient"}</p>
                        <p className="text-xs text-slate-400 font-mono">{c.id.slice(0, 8)}...</p>
                      </div>
                      <span className="px-2 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                        High
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-slate-400">Payer</p>
                        <p className="text-slate-300">{c.payer_name || "—"}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Amount</p>
                        <p className="text-slate-300">{currency(c.claim_charge_amount)}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-800">
                      <p className="text-xs text-slate-400">
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
                <p className="text-lg font-semibold text-white">No Denials Found</p>
                <p className="text-sm text-slate-300 mt-1">All your claims are in good standing</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Analyst Panel */}
        <aside className="hidden lg:flex flex-col border-l border-slate-800 bg-slate-900/30 overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl text-violet-400">psychology</span>
              </div>
              <div>
                <h2 className="font-semibold text-white">AI Denial Analyst</h2>
                <p className="text-xs text-slate-400">Claim {selectedClaimData?.id.slice(0, 8) || "..."}</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* AI Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4"
            >
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-2xl text-rose-400">error</span>
                <div>
                  <h3 className="font-semibold text-white">Modifier mismatch: CPT requires 59 instead of 25</h3>
                  <p className="text-sm text-slate-300 mt-1">
                    Payer rule indicates CPT 99214 with telehealth POS 02 requires modifier 59 for separate evaluation.
                  </p>
                </div>
              </div>
              <div className="mt-3 text-right">
                <span className="text-xs font-medium text-[#137fec]">AI is 93% confident</span>
              </div>
            </motion.div>

            {/* 277/835 Data */}
            <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 overflow-hidden">
              <button className="w-full p-4 flex items-center justify-between text-left">
                <span className="font-semibold text-white">Stedi 277/835 Data</span>
                <span className="material-symbols-outlined text-slate-400">expand_more</span>
              </button>
              <div className="px-4 pb-4 space-y-3">
                <div className="p-3 rounded-xl bg-slate-900/50">
                  <p className="text-sm font-mono text-slate-300">CARC Code: <span className="text-rose-400">CO-45</span></p>
                  <p className="text-xs text-slate-400 mt-1 italic">AI: Charge exceeds fee schedule.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/50">
                  <p className="text-sm font-mono text-slate-300">RARC Code: <span className="text-amber-400">N386</span></p>
                  <p className="text-xs text-slate-400 mt-1 italic">AI: Service not separately payable.</p>
                </div>
              </div>
            </div>

            {/* AI Suggested Fix */}
            <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 overflow-hidden">
              <button className="w-full p-4 flex items-center justify-between text-left">
                <span className="font-semibold text-white">AI-Suggested Fixes</span>
                <span className="material-symbols-outlined text-slate-400">expand_more</span>
              </button>
              <div className="px-4 pb-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Change modifier on CPT 99214 to <span className="font-mono font-bold text-emerald-400">59</span></p>
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
            <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 overflow-hidden">
              <button className="w-full p-4 flex items-center justify-between text-left">
                <span className="font-semibold text-white">Corrected Claim Preview</span>
                <span className="material-symbols-outlined text-slate-400">expand_more</span>
              </button>
              <div className="px-4 pb-4 space-y-3">
                <div className="p-3 rounded-xl bg-slate-900/50">
                  <p className="text-sm text-slate-300">
                    Line 1: CPT 99214 <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-xs">MOD: 59</span>
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#137fec] to-indigo-600 text-white font-semibold shadow-lg shadow-[#137fec]/20"
                >
                  Apply Corrections → Create 7X Claim
                </motion.button>
              </div>
            </div>
          </div>

          {/* Quick Tip */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#137fec]" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
              <div>
                <h4 className="text-sm font-semibold text-white">Quick Tip</h4>
                <p className="text-xs text-slate-400 mt-1">Our AI analyzes every 277/835 file to identify root cause. Most denials can be resolved in under 30 seconds.</p>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer Actions */}
      <footer className="sticky bottom-0 border-t border-slate-800 bg-[#0a0a0f]/90 backdrop-blur-xl p-4 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-end gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors">
            Mark as Resolved
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 font-medium hover:bg-sky-500/20 transition-colors">
            <span className="material-symbols-outlined text-lg">description</span>
            Draft Appeal
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#137fec] to-indigo-600 text-white font-semibold shadow-lg shadow-[#137fec]/20"
          >
            <span className="material-symbols-outlined text-lg">task_alt</span>
            Generate Corrected Claim
          </motion.button>
        </div>
      </footer>
    </div>
  );
}
