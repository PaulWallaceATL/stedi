"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";

// Animated background
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0a0f]" />
      <motion.div
        className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-gradient-to-r from-emerald-600/15 via-teal-600/15 to-cyan-600/15 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, 20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-1/2 h-1/2 rounded-full bg-gradient-to-l from-violet-500/10 via-purple-500/10 to-indigo-500/10 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, -20, 0], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// Confetti animation
function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-5">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-2 h-2 rounded-full ${
            ["bg-emerald-500", "bg-[#137fec]", "bg-violet-500", "bg-amber-500", "bg-rose-500"][i % 5]
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
  const claimId = searchParams.get("id"); // Can be null if not passed
  const patientName = searchParams.get("patient") || "Jane Doe";
  const payer = searchParams.get("payer") || "United Healthcare";
  const amount = searchParams.get("amount") || "550.00";
  
  // Check if we have a valid UUID claim ID
  const hasValidClaimId = claimId && claimId.length > 10 && !claimId.startsWith("CL-");

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <AnimatedBackground />
      <Confetti />
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#137fec] to-indigo-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 48 48">
                  <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" fill="currentColor" />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-white">Clinix AI</h1>
                <p className="text-xs text-slate-400">Claim Submitted</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              {[
                { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
                { href: "/claims/new", label: "New Claim", icon: "add_circle" },
                { href: "/upload", label: "Upload", icon: "upload_file" },
                { href: "/settings", label: "Settings", icon: "settings" },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800/50 transition-colors">
                  <span className="material-symbols-outlined text-lg" style={{ color: '#ffffff' }}>{item.icon}</span>
                  <span style={{ color: '#ffffff' }}>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          {/* Success Icon */}
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
                  style={{ fontVariationSettings: "'wght' 500" }}
                >
                  check
                </motion.span>
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">Claim Created Successfully!</h1>
            <p className="text-slate-300">Your claim has been submitted and is now being processed</p>
          </motion.div>

          {/* Claim Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden mb-8"
          >
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Claim ID</p>
                  <p className="text-white font-semibold font-mono">
                    {hasValidClaimId ? claimId?.slice(0, 8) + "..." : "Pending..."}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Payer</p>
                  <p className="text-white font-semibold">{payer}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Patient Name</p>
                  <p className="text-white font-semibold">{patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Total Billed</p>
                  <p className="text-emerald-400 font-bold text-lg">${amount}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800">
                <p className="text-sm text-slate-400 mb-2">Current Status</p>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Submitted to Payer
                </span>
              </div>

              <div className="pt-6 border-t border-slate-800">
                <p className="text-sm text-slate-400 mb-1">Created on</p>
                <p className="text-slate-300">
                  {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} at{" "}
                  {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 mb-8 text-xs font-medium"
          >
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Created
            </span>
            <div className="w-8 h-px bg-emerald-500/50" />
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Submitted
            </span>
            <div className="w-8 h-px bg-slate-700" />
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              Processing
            </span>
            <div className="w-8 h-px bg-slate-700" />
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              Paid
            </span>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            {hasValidClaimId ? (
              <Link
                href={`/claims/${claimId}`}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#137fec] to-indigo-600 text-white font-semibold shadow-lg shadow-[#137fec]/20 hover:shadow-xl transition-all"
              >
                <span className="material-symbols-outlined">visibility</span>
                View Claim Details
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#137fec] to-indigo-600 text-white font-semibold shadow-lg shadow-[#137fec]/20 hover:shadow-xl transition-all"
              >
                <span className="material-symbols-outlined">dashboard</span>
                Go to Dashboard
              </Link>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/claims/new"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Create Another
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">dashboard</span>
                Dashboard
              </Link>
            </div>
          </motion.div>

          {/* Upload Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center mt-6"
          >
            <Link href="#" className="inline-flex items-center gap-1.5 text-sm text-[#137fec] hover:underline">
              <span className="material-symbols-outlined text-base">upload_file</span>
              Upload supporting documents (optional)
            </Link>
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
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
          <motion.div
            className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full"
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

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";

// Animated background
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0a0f]" />
      <motion.div
        className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-gradient-to-r from-emerald-600/15 via-teal-600/15 to-cyan-600/15 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, 20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-1/2 h-1/2 rounded-full bg-gradient-to-l from-violet-500/10 via-purple-500/10 to-indigo-500/10 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, -20, 0], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// Confetti animation
function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-5">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-2 h-2 rounded-full ${
            ["bg-emerald-500", "bg-[#137fec]", "bg-violet-500", "bg-amber-500", "bg-rose-500"][i % 5]
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
  const claimId = searchParams.get("id"); // Can be null if not passed
  const patientName = searchParams.get("patient") || "Jane Doe";
  const payer = searchParams.get("payer") || "United Healthcare";
  const amount = searchParams.get("amount") || "550.00";
  
  // Check if we have a valid UUID claim ID
  const hasValidClaimId = claimId && claimId.length > 10 && !claimId.startsWith("CL-");

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <AnimatedBackground />
      <Confetti />
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#137fec] to-indigo-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 48 48">
                  <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" fill="currentColor" />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-white">Clinix AI</h1>
                <p className="text-xs text-slate-400">Claim Submitted</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              {[
                { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
                { href: "/claims/new", label: "New Claim", icon: "add_circle" },
                { href: "/upload", label: "Upload", icon: "upload_file" },
                { href: "/settings", label: "Settings", icon: "settings" },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800/50 transition-colors">
                  <span className="material-symbols-outlined text-lg" style={{ color: '#ffffff' }}>{item.icon}</span>
                  <span style={{ color: '#ffffff' }}>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          {/* Success Icon */}
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
                  style={{ fontVariationSettings: "'wght' 500" }}
                >
                  check
                </motion.span>
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">Claim Created Successfully!</h1>
            <p className="text-slate-300">Your claim has been submitted and is now being processed</p>
          </motion.div>

          {/* Claim Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden mb-8"
          >
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Claim ID</p>
                  <p className="text-white font-semibold font-mono">
                    {hasValidClaimId ? claimId?.slice(0, 8) + "..." : "Pending..."}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Payer</p>
                  <p className="text-white font-semibold">{payer}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Patient Name</p>
                  <p className="text-white font-semibold">{patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Total Billed</p>
                  <p className="text-emerald-400 font-bold text-lg">${amount}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800">
                <p className="text-sm text-slate-400 mb-2">Current Status</p>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Submitted to Payer
                </span>
              </div>

              <div className="pt-6 border-t border-slate-800">
                <p className="text-sm text-slate-400 mb-1">Created on</p>
                <p className="text-slate-300">
                  {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} at{" "}
                  {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 mb-8 text-xs font-medium"
          >
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Created
            </span>
            <div className="w-8 h-px bg-emerald-500/50" />
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Submitted
            </span>
            <div className="w-8 h-px bg-slate-700" />
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              Processing
            </span>
            <div className="w-8 h-px bg-slate-700" />
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              Paid
            </span>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            {hasValidClaimId ? (
              <Link
                href={`/claims/${claimId}`}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#137fec] to-indigo-600 text-white font-semibold shadow-lg shadow-[#137fec]/20 hover:shadow-xl transition-all"
              >
                <span className="material-symbols-outlined">visibility</span>
                View Claim Details
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#137fec] to-indigo-600 text-white font-semibold shadow-lg shadow-[#137fec]/20 hover:shadow-xl transition-all"
              >
                <span className="material-symbols-outlined">dashboard</span>
                Go to Dashboard
              </Link>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/claims/new"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Create Another
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">dashboard</span>
                Dashboard
              </Link>
            </div>
          </motion.div>

          {/* Upload Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center mt-6"
          >
            <Link href="#" className="inline-flex items-center gap-1.5 text-sm text-[#137fec] hover:underline">
              <span className="material-symbols-outlined text-base">upload_file</span>
              Upload supporting documents (optional)
            </Link>
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
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
          <motion.div
            className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full"
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

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";

// Animated background
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0a0f]" />
      <motion.div
        className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-gradient-to-r from-emerald-600/15 via-teal-600/15 to-cyan-600/15 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, 20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-1/2 h-1/2 rounded-full bg-gradient-to-l from-violet-500/10 via-purple-500/10 to-indigo-500/10 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, -20, 0], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// Confetti animation
function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-5">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-2 h-2 rounded-full ${
            ["bg-emerald-500", "bg-[#137fec]", "bg-violet-500", "bg-amber-500", "bg-rose-500"][i % 5]
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
  const claimId = searchParams.get("id"); // Can be null if not passed
  const patientName = searchParams.get("patient") || "Jane Doe";
  const payer = searchParams.get("payer") || "United Healthcare";
  const amount = searchParams.get("amount") || "550.00";
  
  // Check if we have a valid UUID claim ID
  const hasValidClaimId = claimId && claimId.length > 10 && !claimId.startsWith("CL-");

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <AnimatedBackground />
      <Confetti />
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#137fec] to-indigo-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 48 48">
                  <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" fill="currentColor" />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-white">Clinix AI</h1>
                <p className="text-xs text-slate-400">Claim Submitted</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              {[
                { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
                { href: "/claims/new", label: "New Claim", icon: "add_circle" },
                { href: "/upload", label: "Upload", icon: "upload_file" },
                { href: "/settings", label: "Settings", icon: "settings" },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800/50 transition-colors">
                  <span className="material-symbols-outlined text-lg" style={{ color: '#ffffff' }}>{item.icon}</span>
                  <span style={{ color: '#ffffff' }}>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          {/* Success Icon */}
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
                  style={{ fontVariationSettings: "'wght' 500" }}
                >
                  check
                </motion.span>
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">Claim Created Successfully!</h1>
            <p className="text-slate-300">Your claim has been submitted and is now being processed</p>
          </motion.div>

          {/* Claim Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden mb-8"
          >
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Claim ID</p>
                  <p className="text-white font-semibold font-mono">
                    {hasValidClaimId ? claimId?.slice(0, 8) + "..." : "Pending..."}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Payer</p>
                  <p className="text-white font-semibold">{payer}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Patient Name</p>
                  <p className="text-white font-semibold">{patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Total Billed</p>
                  <p className="text-emerald-400 font-bold text-lg">${amount}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800">
                <p className="text-sm text-slate-400 mb-2">Current Status</p>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Submitted to Payer
                </span>
              </div>

              <div className="pt-6 border-t border-slate-800">
                <p className="text-sm text-slate-400 mb-1">Created on</p>
                <p className="text-slate-300">
                  {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} at{" "}
                  {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 mb-8 text-xs font-medium"
          >
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Created
            </span>
            <div className="w-8 h-px bg-emerald-500/50" />
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Submitted
            </span>
            <div className="w-8 h-px bg-slate-700" />
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              Processing
            </span>
            <div className="w-8 h-px bg-slate-700" />
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              Paid
            </span>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            {hasValidClaimId ? (
              <Link
                href={`/claims/${claimId}`}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#137fec] to-indigo-600 text-white font-semibold shadow-lg shadow-[#137fec]/20 hover:shadow-xl transition-all"
              >
                <span className="material-symbols-outlined">visibility</span>
                View Claim Details
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#137fec] to-indigo-600 text-white font-semibold shadow-lg shadow-[#137fec]/20 hover:shadow-xl transition-all"
              >
                <span className="material-symbols-outlined">dashboard</span>
                Go to Dashboard
              </Link>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/claims/new"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Create Another
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">dashboard</span>
                Dashboard
              </Link>
            </div>
          </motion.div>

          {/* Upload Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center mt-6"
          >
            <Link href="#" className="inline-flex items-center gap-1.5 text-sm text-[#137fec] hover:underline">
              <span className="material-symbols-outlined text-base">upload_file</span>
              Upload supporting documents (optional)
            </Link>
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
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
          <motion.div
            className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full"
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

