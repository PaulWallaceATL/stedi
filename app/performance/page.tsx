"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { ModernNav } from "@/components/ui/ModernNav";

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


// Metric card with functional colors for KPIs
function MetricCard({ title, value, subtitle, icon, color, delay = 0 }: { title: string; value: string; subtitle?: string; icon: string; color: string; delay?: number }) {
  const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
    blue: { bg: "from-sky-500/10 to-sky-600/5", icon: "text-sky-400", border: "border-sky-500/20" },
    green: { bg: "from-emerald-500/10 to-emerald-600/5", icon: "text-emerald-400", border: "border-emerald-500/20" },
    amber: { bg: "from-amber-500/10 to-amber-600/5", icon: "text-amber-400", border: "border-amber-500/20" },
    rose: { bg: "from-rose-500/10 to-rose-600/5", icon: "text-rose-400", border: "border-rose-500/20" },
    violet: { bg: "from-[#c97435]/10 to-[#8b5a2b]/5", icon: "text-[#c97435]", border: "border-[#c97435]/20" },
  };
  const classes = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`rounded-2xl bg-gradient-to-br ${classes.bg} border ${classes.border} p-5`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#a67c52]">{title}</p>
          <p className="text-3xl font-bold text-[#e8dcc8] mt-1">{value}</p>
          {subtitle && <p className="text-xs text-[#6b5a45] mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-[#1a1512]/50 flex items-center justify-center ${classes.icon}`}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
      </div>
    </motion.div>
  );
}

// Chart placeholder - simulated bar chart
function SimpleBarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map((item, idx) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="flex items-center gap-3"
        >
          <span className="w-24 text-sm text-[#a67c52] truncate">{item.label}</span>
          <div className="flex-1 h-8 bg-[#1a1512]/50 rounded-lg overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / max) * 100}%` }}
              transition={{ delay: 0.3 + idx * 0.1, duration: 0.5 }}
              className={`h-full ${item.color} rounded-lg flex items-center justify-end pr-3`}
            >
              <span className="text-xs font-semibold text-white">{item.value}</span>
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  );
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
    return () => { mounted = false; };
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
    const acceptanceRate = total > 0 ? Math.round((accepted / total) * 100) : 0;
    return { total, totalCharges, accepted, denied, submitted, avg, topPayers, acceptanceRate };
  }, [claims]);

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
          <p className="text-sm text-[#8b7355]">Configure Supabase environment variables to view reports.</p>
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
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-emerald-400">analytics</span>
          </div>
          <div>
            <p className="text-xl font-semibold text-[#e8dcc8]">Sign In Required</p>
            <p className="text-sm text-[#8b7355] mt-1">Access your performance reports</p>
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
          <p className="text-[#8b7355]">Loading reports...</p>
        </motion.div>
      </AuroraBackground>
    );
  }

  return (
    <AuroraBackground>
      <ModernNav />

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#e8dcc8]">Performance Reports</h2>
            <p className="text-[#8b7355] mt-1">Insights and analytics for your billing operations</p>
          </div>
          <Link
            href="/claims/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c97435] to-[#8b5a2b] text-[#0a0908] font-semibold shadow-lg shadow-[#c97435]/20 hover:shadow-xl transition-all"
          >
            <span className="material-symbols-outlined">add</span>
            New Claim
          </Link>
        </div>

        {claims.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-[#1a1512]/50 border border-[#c97435]/10 p-12 text-center"
          >
            <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-4xl text-amber-400">bar_chart</span>
            </div>
            <p className="text-lg font-semibold text-[#e8dcc8]">No Data Yet</p>
            <p className="text-sm text-[#8b7355] mt-1 mb-4">Submit claims to populate your performance reports</p>
            <Link
              href="/claims/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c97435] text-[#0a0908] font-semibold hover:bg-[#d4844c] transition-colors"
            >
              <span className="material-symbols-outlined">add</span>
              Create Your First Claim
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Metrics Grid - functional colors for KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MetricCard title="Total Claims" value={String(metrics.total)} subtitle="All time" icon="folder" color="blue" delay={0} />
              <MetricCard title="Total Billed" value={currency(metrics.totalCharges)} subtitle="Outstanding balance" icon="payments" color="violet" delay={0.1} />
              <MetricCard title="Accepted" value={String(metrics.accepted)} subtitle={`${metrics.acceptanceRate}% acceptance rate`} icon="check_circle" color="green" delay={0.2} />
              <MetricCard title="Denied" value={String(metrics.denied)} subtitle="Requires action" icon="cancel" color="rose" delay={0.3} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Throughput */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl bg-[#1a1512]/50 border border-[#c97435]/10 p-6"
              >
                <h3 className="text-lg font-semibold text-[#e8dcc8] mb-6">Throughput Overview</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl bg-[#0a0908]/30">
                    <p className="text-sm text-[#a67c52]">Submitted</p>
                    <p className="text-2xl font-bold text-[#e8dcc8] mt-1">{metrics.submitted}</p>
                    <p className="text-xs text-[#6b5a45] mt-1">Awaiting response</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0a0908]/30">
                    <p className="text-sm text-[#a67c52]">Avg per Claim</p>
                    <p className="text-2xl font-bold text-[#e8dcc8] mt-1">{currency(metrics.avg)}</p>
                    <p className="text-xs text-[#6b5a45] mt-1">Average charge</p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-[#c97435]/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#a67c52]">Acceptance Rate</p>
                      <p className="text-3xl font-bold text-emerald-400">{metrics.acceptanceRate}%</p>
                    </div>
                    <div className="w-24 h-24 relative">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1a1512" strokeWidth="3" />
                        <motion.circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                          strokeDasharray="100"
                          initial={{ strokeDashoffset: 100 }}
                          animate={{ strokeDashoffset: 100 - metrics.acceptanceRate }}
                          transition={{ delay: 0.5, duration: 1 }}
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Top Payers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl bg-[#1a1512]/50 border border-[#c97435]/10 p-6"
              >
                <h3 className="text-lg font-semibold text-[#e8dcc8] mb-6">Top Payers by Volume</h3>
                {metrics.topPayers.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-[#6b5a45]">
                    No payer data yet
                  </div>
                ) : (
                  <SimpleBarChart
                    data={metrics.topPayers.map(([payer, count], idx) => ({
                      label: payer,
                      value: count,
                      color: ["bg-[#c97435]", "bg-[#a67c52]", "bg-emerald-500", "bg-amber-500", "bg-rose-500"][idx] || "bg-[#6b5a45]",
                    }))}
                  />
                )}
              </motion.div>
            </div>

            {/* Status Distribution - functional colors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl bg-[#1a1512]/50 border border-[#c97435]/10 overflow-hidden"
            >
              <div className="p-6 border-b border-[#c97435]/10">
                <h3 className="text-lg font-semibold text-[#e8dcc8]">Status Distribution</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4">
                  {[
                    { label: "Accepted", value: metrics.accepted, color: "bg-emerald-500" },
                    { label: "Submitted", value: metrics.submitted, color: "bg-sky-500" },
                    { label: "Denied", value: metrics.denied, color: "bg-rose-500" },
                    { label: "Other", value: metrics.total - metrics.accepted - metrics.submitted - metrics.denied, color: "bg-[#6b5a45]" },
                  ].map((item) => (
                    <div key={item.label} className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[#a67c52]">{item.label}</span>
                        <span className="text-sm font-semibold text-[#e8dcc8]">{item.value}</span>
                      </div>
                      <div className="h-2 bg-[#1a1512] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: metrics.total > 0 ? `${(item.value / metrics.total) * 100}%` : "0%" }}
                          transition={{ delay: 0.6, duration: 0.5 }}
                          className={`h-full ${item.color} rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </main>
    </AuroraBackground>
  );
}
