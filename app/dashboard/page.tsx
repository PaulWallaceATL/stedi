"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { ModernNav } from "@/components/ui/ModernNav";
import { GlassCard, MetricCard } from "@/components/ui/GlassCard";
import { ModernTable } from "@/components/ui/ModernTable";
import { AIOrb, AIAssistantPanel } from "@/components/ui/AIOrb";

type ClaimRow = {
  id: string;
  patient_name: string;
  payer_name: string;
  status: string;
  claim_charge_amount: number;
  date_of_service: string;
  created_at: string;
};

// Quick action card component
function QuickActionCard({
  icon,
  title,
  description,
  href,
  color,
  delay,
}: {
  icon: string;
  title: string;
  description: string;
  href: string;
  color: "blue" | "violet" | "emerald" | "amber";
  delay: number;
}) {
  const colors = {
    blue: {
      bg: "from-blue-500/20 to-blue-600/10",
      border: "border-blue-500/30 hover:border-blue-500/50",
      icon: "text-blue-400",
      glow: "group-hover:shadow-blue-500/20",
    },
    violet: {
      bg: "from-violet-500/20 to-violet-600/10",
      border: "border-violet-500/30 hover:border-violet-500/50",
      icon: "text-violet-400",
      glow: "group-hover:shadow-violet-500/20",
    },
    emerald: {
      bg: "from-emerald-500/20 to-emerald-600/10",
      border: "border-emerald-500/30 hover:border-emerald-500/50",
      icon: "text-emerald-400",
      glow: "group-hover:shadow-emerald-500/20",
    },
    amber: {
      bg: "from-amber-500/20 to-amber-600/10",
      border: "border-amber-500/30 hover:border-amber-500/50",
      icon: "text-amber-400",
      glow: "group-hover:shadow-amber-500/20",
    },
  };

  const c = colors[color];

  return (
    <Link href={href} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "group relative overflow-hidden rounded-2xl p-6 h-full",
          "bg-gradient-to-br",
          c.bg,
          "border",
          c.border,
          "backdrop-blur-xl",
          "transition-all duration-300",
          "shadow-lg",
          c.glow
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl",
              "bg-white/[0.05] ring-1 ring-white/[0.1]"
            )}
          >
            <span className={cn("material-symbols-outlined text-2xl", c.icon)}>
              {icon}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">{title}</h3>
            <p className="text-sm text-slate-400">{description}</p>
          </div>
          <motion.span
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="material-symbols-outlined text-slate-500 group-hover:text-white transition-colors"
          >
            arrow_forward
          </motion.span>
        </div>
      </motion.div>
    </Link>
  );
}

// Main Dashboard Content
function DashboardContent() {
  const searchParams = useSearchParams();
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAI, setShowAI] = useState(false);

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

      const { data: rows } = await supabase
        .from("claims")
        .select("id, patient_name, payer_name, status, claim_charge_amount, date_of_service, created_at")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!mounted) return;
      if (rows) setClaims(rows as ClaimRow[]);
      setLoading(false);
    };

    load();
    return () => { mounted = false; };
  }, []);

  // Calculate metrics
  const totalClaims = claims.length;
  const acceptedClaims = claims.filter((c) => c.status === "accepted" || c.status === "paid");
  const pendingClaims = claims.filter((c) => c.status === "submitted" || c.status === "pending");
  const deniedClaims = claims.filter((c) => c.status === "denied" || c.status === "rejected");
  const totalRevenue = claims.reduce((sum, c) => sum + (c.claim_charge_amount || 0), 0);
  const acceptedRevenue = acceptedClaims.reduce((sum, c) => sum + (c.claim_charge_amount || 0), 0);
  const firstPassRate = totalClaims > 0 ? Math.round((acceptedClaims.length / totalClaims) * 100) : 0;

  // Auth check
  if (!loading && !userId && supabase) {
    return (
      <AuroraBackground>
        <ModernNav />
        <main className="flex flex-col items-center justify-center min-h-[80vh] px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <div className="mb-8">
              <AIOrb size="lg" isActive />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Welcome to Clinix AI
            </h1>
            <p className="text-slate-400 mb-8">
              The most advanced medical billing intelligence platform. Sign in to access your dashboard.
            </p>
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500 text-white font-semibold shadow-lg shadow-violet-500/30"
              >
                Sign In
              </motion.button>
            </Link>
          </motion.div>
        </main>
      </AuroraBackground>
    );
  }

  // Loading state
  if (loading) {
    return (
      <AuroraBackground>
        <ModernNav />
        <main className="flex items-center justify-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <AIOrb size="lg" isProcessing />
            <p className="text-slate-400 animate-pulse">Loading your dashboard...</p>
          </motion.div>
        </main>
      </AuroraBackground>
    );
  }

  return (
    <AuroraBackground>
      <ModernNav />

      {/* AI Assistant Panel */}
      <AIAssistantPanel isOpen={showAI} onClose={() => setShowAI(false)}>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
            <p className="text-sm text-slate-300">
              Hello! I&apos;m your AI billing assistant. I can help you:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400 text-sm">check_circle</span>
                Analyze claim denials and suggest fixes
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400 text-sm">check_circle</span>
                Optimize coding for maximum reimbursement
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400 text-sm">check_circle</span>
                Predict approval likelihood before submission
              </li>
            </ul>
          </div>
        </div>
      </AIAssistantPanel>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Command Center
            </h1>
            <p className="text-slate-400">
              Real-time intelligence for your medical billing operations
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* AI Assistant Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAI(true)}
              className="flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-violet-500/20 border border-blue-500/30 hover:border-blue-500/50 transition-all"
            >
              <AIOrb size="sm" isActive />
              <span className="font-medium text-white">AI Assistant</span>
            </motion.button>

            {/* New Claim Button */}
            <Link href="/claims/new">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500 text-white font-semibold shadow-lg shadow-violet-500/30"
              >
                <span className="material-symbols-outlined">add</span>
                New Claim
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <MetricCard
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            subtitle="All claims combined"
            icon="payments"
            color="blue"
            delay={0}
          />
          <MetricCard
            title="Accepted"
            value={`$${acceptedRevenue.toLocaleString()}`}
            subtitle={`${acceptedClaims.length} claims approved`}
            icon="verified"
            color="emerald"
            delay={0.1}
          />
          <MetricCard
            title="Processing"
            value={pendingClaims.length.toString()}
            subtitle="Awaiting response"
            icon="schedule"
            color="violet"
            delay={0.2}
          />
          <MetricCard
            title="First-Pass Rate"
            value={`${firstPassRate}%`}
            subtitle="Approval efficiency"
            icon="insights"
            trend={{ value: 5, isPositive: true }}
            color="amber"
            delay={0.3}
          />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-10"
        >
          <h2 className="text-xl font-semibold text-white mb-5">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
            <QuickActionCard
              icon="add_circle"
              title="New Claim"
              description="Create and submit a new claim"
              href="/claims/new"
              color="blue"
              delay={0.5}
            />
            <QuickActionCard
              icon="upload_file"
              title="Batch Upload"
              description="Import claims from CSV"
              href="/upload"
              color="violet"
              delay={0.6}
            />
            <QuickActionCard
              icon="error_outline"
              title="Denials"
              description="Review and appeal denials"
              href="/denials"
              color="amber"
              delay={0.7}
            />
            <QuickActionCard
              icon="insights"
              title="Analytics"
              description="Performance insights"
              href="/performance"
              color="emerald"
              delay={0.8}
            />
          </div>
        </motion.div>

        {/* Claims Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Recent Claims</h2>
              <p className="text-sm text-slate-500">{totalClaims} total claims</p>
            </div>
            <Link href="/claims">
              <motion.button
                whileHover={{ x: 4 }}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                View All
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </motion.button>
            </Link>
          </div>

          <ModernTable claims={claims} isLoading={loading} />
        </motion.div>
      </main>
    </AuroraBackground>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <AuroraBackground>
          <div className="flex items-center justify-center min-h-screen">
            <AIOrb size="lg" isProcessing />
          </div>
        </AuroraBackground>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
