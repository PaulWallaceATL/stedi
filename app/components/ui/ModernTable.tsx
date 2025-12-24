"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Claim {
  id: string;
  patient_name: string;
  payer_name: string;
  status: string;
  claim_charge_amount: number;
  date_of_service: string;
}

interface ModernTableProps {
  claims: Claim[];
  isLoading?: boolean;
}

const statusConfig: Record<
  string,
  { label: string; icon: string; color: string; bgColor: string; glowColor: string }
> = {
  accepted: {
    label: "Accepted",
    icon: "check_circle",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    glowColor: "shadow-emerald-500/20",
  },
  paid: {
    label: "Paid",
    icon: "payments",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    glowColor: "shadow-emerald-500/20",
  },
  submitted: {
    label: "Processing",
    icon: "schedule",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    glowColor: "shadow-blue-500/20",
  },
  pending: {
    label: "Pending",
    icon: "pending",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    glowColor: "shadow-amber-500/20",
  },
  denied: {
    label: "Denied",
    icon: "cancel",
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
    glowColor: "shadow-rose-500/20",
  },
  rejected: {
    label: "Rejected",
    icon: "block",
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
    glowColor: "shadow-rose-500/20",
  },
  draft: {
    label: "Draft",
    icon: "edit_note",
    color: "text-slate-400",
    bgColor: "bg-slate-500/10",
    glowColor: "shadow-slate-500/20",
  },
};

function getStatusConfig(status: string) {
  return statusConfig[status.toLowerCase()] || statusConfig.draft;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function ModernTable({ claims, isLoading = false }: ModernTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="h-20 rounded-xl bg-white/[0.02] animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="overflow-hidden rounded-2xl bg-white/[0.02] border border-white/[0.06]"
    >
      {/* Header */}
      <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr_auto] gap-4 px-6 py-4 bg-white/[0.02] border-b border-white/[0.06]">
        {["Patient", "Date", "Payer", "Amount", "Status", ""].map((header) => (
          <div
            key={header}
            className="text-xs font-semibold text-slate-500 uppercase tracking-wider"
          >
            {header}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/[0.04]">
        <AnimatePresence mode="popLayout">
          {claims.map((claim, index) => {
            const status = getStatusConfig(claim.status);

            return (
              <motion.div
                key={claim.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{
                  delay: index * 0.05,
                  duration: 0.3,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                className="group grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr_auto] gap-4 px-6 py-5 items-center transition-colors"
              >
                {/* Patient */}
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl blur opacity-30" />
                    <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-white/[0.1] flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {claim.patient_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </motion.div>
                  <div>
                    <p className="font-semibold text-white">
                      {claim.patient_name.toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      {claim.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>

                {/* Date */}
                <div className="text-sm text-slate-300">
                  {formatDate(claim.date_of_service)}
                </div>

                {/* Payer */}
                <div className="text-sm text-slate-300">{claim.payer_name}</div>

                {/* Amount */}
                <div className="text-sm font-semibold text-white">
                  {formatCurrency(claim.claim_charge_amount)}
                </div>

                {/* Status */}
                <div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
                      status.bgColor,
                      "shadow-lg",
                      status.glowColor
                    )}
                  >
                    <span
                      className={cn(
                        "material-symbols-outlined text-sm",
                        status.color
                      )}
                    >
                      {status.icon}
                    </span>
                    <span className={cn("text-xs font-medium", status.color)}>
                      {status.label}
                    </span>
                  </motion.div>
                </div>

                {/* Action */}
                <div>
                  <Link href={`/claims/${claim.id}`}>
                    <motion.div
                      whileHover={{ scale: 1.05, x: 4 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.15] transition-all group/btn"
                    >
                      <span className="text-sm font-medium text-white">View</span>
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          repeatType: "loop",
                        }}
                        className="material-symbols-outlined text-lg text-slate-400 group-hover/btn:text-white transition-colors"
                      >
                        arrow_forward
                      </motion.span>
                    </motion.div>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {claims.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl text-slate-600">
              inbox
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No claims yet</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            Create your first claim to get started with intelligent billing
          </p>
          <Link href="/claims/new">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-medium shadow-lg shadow-violet-500/25"
            >
              Create Claim
            </motion.button>
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}

