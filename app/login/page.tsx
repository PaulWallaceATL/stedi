"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// Dune-themed animated background
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0908]" />
      <motion.div
        className="absolute top-1/4 -left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-[#c97435]/20 via-[#8b5a2b]/20 to-[#6b4423]/20 blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-1/4 w-96 h-96 rounded-full bg-gradient-to-l from-[#a67c52]/15 via-[#8b5a2b]/15 to-[#6b4423]/15 blur-3xl"
        animate={{
          x: [0, -50, 0],
          y: [0, -30, 0],
          scale: [1.1, 1, 1.1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-[#c97435]/5 to-[#8b5a2b]/5 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// Floating particles - sand colored (seeded positions to avoid hydration mismatch)
function FloatingParticles() {
  // Use deterministic positions based on index to avoid hydration mismatch
  const particles = [
    { left: 5, top: 10, duration: 6, delay: 0.5 },
    { left: 15, top: 25, duration: 7, delay: 1 },
    { left: 25, top: 45, duration: 8, delay: 1.5 },
    { left: 35, top: 15, duration: 6, delay: 2 },
    { left: 45, top: 65, duration: 7, delay: 2.5 },
    { left: 55, top: 35, duration: 8, delay: 3 },
    { left: 65, top: 55, duration: 6, delay: 3.5 },
    { left: 75, top: 20, duration: 7, delay: 4 },
    { left: 85, top: 70, duration: 8, delay: 4.5 },
    { left: 95, top: 40, duration: 6, delay: 0 },
    { left: 10, top: 80, duration: 7, delay: 0.3 },
    { left: 20, top: 60, duration: 8, delay: 0.8 },
    { left: 30, top: 90, duration: 6, delay: 1.3 },
    { left: 40, top: 30, duration: 7, delay: 1.8 },
    { left: 50, top: 50, duration: 8, delay: 2.3 },
    { left: 60, top: 85, duration: 6, delay: 2.8 },
    { left: 70, top: 5, duration: 7, delay: 3.3 },
    { left: 80, top: 75, duration: 8, delay: 3.8 },
    { left: 90, top: 95, duration: 6, delay: 4.3 },
    { left: 3, top: 55, duration: 7, delay: 4.8 },
  ];

  return (
    <div className="fixed inset-0 -z-5 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[#c97435]/30"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabaseMissing = !supabase;

  // Get the base URL for redirects - prioritize production URL from env
  const getBaseUrl = () => {
    // Always use NEXT_PUBLIC_SITE_URL if set (for production)
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL;
    }
    // Fallback to current origin for local development
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "http://localhost:3000";
  };

  const submit = async () => {
    if (!supabase) {
      setError("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    if (mode === "signup") {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: { full_name: fullName },
          // Use auth callback route which handles the code exchange
          emailRedirectTo: `${getBaseUrl()}/auth/callback`,
        },
      });
      if (err) {
        setError(err.message);
      } else {
        setSuccess("Check your email for a confirmation link! You'll be redirected to the dashboard after confirming.");
      }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(err.message);
      else router.push("/dashboard");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <AnimatedBackground />
      <FloatingParticles />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c97435] to-[#8b5a2b] flex items-center justify-center shadow-lg shadow-[#c97435]/30">
            <svg className="w-7 h-7 text-[#0a0908]" fill="none" viewBox="0 0 48 48">
              <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" fill="currentColor" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#e8dcc8]">Clinix AI</h1>
            <p className="text-xs text-[#8b7355]">Medical Billing Platform</p>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-3xl border border-[#c97435]/20 bg-[#1a1512]/70 backdrop-blur-xl shadow-2xl"
        >
          {/* Gradient border effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#c97435]/20 via-[#8b5a2b]/20 to-[#6b4423]/20 opacity-50 blur-xl" />
          
          <div className="relative p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c97435]/10 text-[#c97435] text-xs font-medium border border-[#c97435]/20 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c97435] animate-pulse" />
                  {mode === "signin" ? "Welcome Back" : "Get Started"}
                </span>
              </motion.div>
              <h2 className="text-2xl font-bold text-[#e8dcc8]">
                {mode === "signin" ? "Sign in to your account" : "Create your account"}
              </h2>
              <p className="text-sm text-[#8b7355] mt-2">
                {mode === "signin" 
                  ? "Access your billing dashboard and manage claims" 
                  : "Start optimizing your medical billing workflow"}
              </p>
            </div>

            {/* Form */}
            <div className="space-y-5">
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-[#a67c52]">Full Name</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#6b5a45] text-lg">person</span>
                    <input
                      className="w-full h-12 rounded-xl border border-[#c97435]/20 bg-[#0a0908]/50 pl-12 pr-4 text-[#e8dcc8] placeholder-[#6b5a45] outline-none focus:border-[#c97435] focus:ring-2 focus:ring-[#c97435]/20 transition-all"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                    />
                  </div>
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#a67c52]">Email</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#6b5a45] text-lg">mail</span>
                  <input
                    type="email"
                    className="w-full h-12 rounded-xl border border-[#c97435]/20 bg-[#0a0908]/50 pl-12 pr-4 text-[#e8dcc8] placeholder-[#6b5a45] outline-none focus:border-[#c97435] focus:ring-2 focus:ring-[#c97435]/20 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#a67c52]">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#6b5a45] text-lg">lock</span>
                  <input
                    type="password"
                    className="w-full h-12 rounded-xl border border-[#c97435]/20 bg-[#0a0908]/50 pl-12 pr-4 text-[#e8dcc8] placeholder-[#6b5a45] outline-none focus:border-[#c97435] focus:ring-2 focus:ring-[#c97435]/20 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Success message - GREEN */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10"
                >
                  <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
                  <p className="text-sm text-emerald-400">{success}</p>
                </motion.div>
              )}

              {/* Error - RED for visibility */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10"
                >
                  <span className="material-symbols-outlined text-rose-400 text-lg">error</span>
                  <p className="text-sm text-rose-400">{error}</p>
                </motion.div>
              )}

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={submit}
                disabled={loading}
                className="relative w-full h-12 rounded-xl bg-gradient-to-r from-[#c97435] to-[#8b5a2b] text-[#0a0908] font-semibold shadow-lg shadow-[#c97435]/30 transition-all hover:shadow-xl hover:shadow-[#c97435]/40 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-[#0a0908]/30 border-t-[#0a0908] rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Working...
                    </>
                  ) : (
                    <>
                      {mode === "signin" ? "Sign In" : "Create Account"}
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#d4844c] to-[#a67c52] opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#c97435]/20" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-[#1a1512] text-[#6b5a45]">or</span>
              </div>
            </div>

            {/* Toggle mode */}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="w-full text-center text-sm text-[#a67c52] hover:text-[#e8dcc8] transition-colors"
            >
              {mode === "signin" ? (
                <>Don&apos;t have an account? <span className="text-[#c97435] font-medium">Sign up</span></>
              ) : (
                <>Already have an account? <span className="text-[#c97435] font-medium">Sign in</span></>
              )}
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-[#6b5a45] mt-6"
        >
          By continuing, you agree to our Terms of Service and Privacy Policy
        </motion.p>
      </motion.div>
    </main>
  );
}
