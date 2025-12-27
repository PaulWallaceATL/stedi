"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";

// Dune-themed animated background
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0908]" />
      <motion.div
        className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-gradient-to-r from-emerald-600/15 via-[#c97435]/15 to-[#8b5a2b]/15 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, 20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-1/2 h-1/2 rounded-full bg-gradient-to-l from-[#c97435]/10 via-[#a67c52]/10 to-[#6b4423]/10 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, -20, 0], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// Confetti animation - sand/spice colored
function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-5">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-2 h-2 rounded-full ${
            ["bg-emerald-500", "bg-[#c97435]", "bg-[#a67c52]", "bg-amber-500", "bg-[#8b5a2b]"][i % 5]
          }`}
          style={{
            left: `${Math.random() * 100}%`,
            top: -20,
          }}
          animate={{
            y: ["0vh", "100vh"],
            rotate: [0, 360],
            opacity: [1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  // Support both 'id' and 'claimId' parameters
  const claimId = searchParams.get("claimId") || searchParams.get("id");
  const patientName = searchParams.get("patient") || "Patient";
  const payer = searchParams.get("payer") || "Payer";
  const amount = searchParams.get("amount") || "0.00";
  
  // Valid if it has content and is at least 6 characters
  const hasValidClaimId = claimId && claimId.length >= 6;

  return (
    <div className="min-h-screen bg-[#0a0908] flex flex-col">
      <AnimatedBackground />
      <Confetti />
      
      <header className="sticky top-0 z-50 border-b border-[#c97435]/10 bg-[#0a0908]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c97435] to-[#8b5a2b] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#0a0908]" fill="none" viewBox="0 0 48 48">
                  <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" fill="currentColor" />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-[#e8dcc8]">Clinix AI</h1>
                <p className="text-xs text-[#6b5a45]">Claim Submitted</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          {/* Success Icon - GREEN for positive outcome */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl animate-pulse" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <motion.span
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="material-symbols-outlined text-5xl text-white"
                >
                  check
                </motion.span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-[#e8dcc8] mb-2">Claim Created Successfully!</h1>
            <p className="text-[#8b7355]">Your claim has been submitted and is now being processed</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-[#1a1512]/50 border border-[#c97435]/10 overflow-hidden mb-8"
          >
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-[#6b5a45] mb-1">Claim ID</p>
                  <p className="text-[#e8dcc8] font-semibold font-mono">
                    {hasValidClaimId ? claimId?.slice(0, 8) + "..." : "Pending..."}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#6b5a45] mb-1">Payer</p>
                  <p className="text-[#e8dcc8] font-semibold">{payer}</p>
                </div>
                <div>
                  <p className="text-sm text-[#6b5a45] mb-1">Patient Name</p>
                  <p className="text-[#e8dcc8] font-semibold">{patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-[#6b5a45] mb-1">Total Billed</p>
                  <p className="text-emerald-400 font-bold text-lg">${amount}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-[#c97435]/10">
                <p className="text-sm text-[#6b5a45] mb-2">Current Status</p>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Submitted to Payer
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#c97435] to-[#8b5a2b] text-[#0a0908] font-semibold shadow-lg shadow-[#c97435]/20 hover:shadow-xl transition-all"
            >
              <span className="material-symbols-outlined">dashboard</span>
              Go to Dashboard
            </Link>
            
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/claims/new"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#2a2018] border border-[#c97435]/40 font-medium hover:bg-[#c97435]/30 hover:border-[#c97435]/60 transition-colors"
              >
                <span className="material-symbols-outlined text-lg text-[#c97435]">add</span>
                <span className="text-white">Create Another</span>
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#2a2018] border border-[#c97435]/40 font-medium hover:bg-[#c97435]/30 hover:border-[#c97435]/60 transition-colors"
              >
                <span className="material-symbols-outlined text-lg text-[#c97435]">list</span>
                <span className="text-white">View All Claims</span>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

export default function ClaimSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0908] flex items-center justify-center">
          <motion.div
            className="w-12 h-12 border-3 border-[#c97435] border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
