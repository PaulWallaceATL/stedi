"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ragSuggest } from "../lib/stediClient";

type Suggestion = {
  claim: any;
  changes: Array<{ path: string; before: any; after: any; reason: string }>;
  confidence: number;
  rationale: string;
};

type AIClaimIntelligenceProps = {
  claim: any;
  claimId: string;
  onApplySuggestions?: (optimizedClaim: any) => void;
};

// Animated Waves Background - inspired by reactbits.dev
function WavesBackground({ isActive = false, isThinking = false }: { isActive?: boolean; isThinking?: boolean }) {
  const baseIntensity = isThinking ? 1.5 : isActive ? 1 : 0.6;
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-violet-950/30 to-slate-900" />
      
      {/* Animated wave layers */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 560">
        {/* Wave 1 - Slow, background */}
        <motion.path
          d="M0,280 C240,320 480,400 720,280 C960,160 1200,320 1440,280 L1440,560 L0,560 Z"
          fill="url(#wave-gradient-1)"
          animate={{
            d: [
              "M0,280 C240,320 480,400 720,280 C960,160 1200,320 1440,280 L1440,560 L0,560 Z",
              "M0,320 C240,280 480,160 720,280 C960,400 1200,280 1440,320 L1440,560 L0,560 Z",
              "M0,280 C240,320 480,400 720,280 C960,160 1200,320 1440,280 L1440,560 L0,560 Z",
            ],
          }}
          transition={{ duration: isThinking ? 2 : 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ opacity: 0.3 * baseIntensity }}
        />
        
        {/* Wave 2 - Medium */}
        <motion.path
          d="M0,350 C180,300 360,420 540,350 C720,280 900,380 1080,350 C1260,320 1350,380 1440,350 L1440,560 L0,560 Z"
          fill="url(#wave-gradient-2)"
          animate={{
            d: [
              "M0,350 C180,300 360,420 540,350 C720,280 900,380 1080,350 C1260,320 1350,380 1440,350 L1440,560 L0,560 Z",
              "M0,380 C180,420 360,280 540,350 C720,420 900,280 1080,350 C1260,420 1350,300 1440,380 L1440,560 L0,560 Z",
              "M0,350 C180,300 360,420 540,350 C720,280 900,380 1080,350 C1260,320 1350,380 1440,350 L1440,560 L0,560 Z",
            ],
          }}
          transition={{ duration: isThinking ? 1.5 : 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ opacity: 0.4 * baseIntensity }}
        />
        
        {/* Wave 3 - Fast, foreground */}
        <motion.path
          d="M0,420 C120,380 240,460 360,420 C480,380 600,460 720,420 C840,380 960,460 1080,420 C1200,380 1320,460 1440,420 L1440,560 L0,560 Z"
          fill="url(#wave-gradient-3)"
          animate={{
            d: [
              "M0,420 C120,380 240,460 360,420 C480,380 600,460 720,420 C840,380 960,460 1080,420 C1200,380 1320,460 1440,420 L1440,560 L0,560 Z",
              "M0,440 C120,460 240,380 360,420 C480,460 600,380 720,420 C840,460 960,380 1080,420 C1200,460 1320,380 1440,440 L1440,560 L0,560 Z",
              "M0,420 C120,380 240,460 360,420 C480,380 600,460 720,420 C840,380 960,460 1080,420 C1200,380 1320,460 1440,420 L1440,560 L0,560 Z",
            ],
          }}
          transition={{ duration: isThinking ? 1 : 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ opacity: 0.5 * baseIntensity }}
        />
        
        {/* Gradients */}
        <defs>
          <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
          <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="wave-gradient-3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6d28d9" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Floating particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-violet-400/60"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: 0,
          }}
          animate={{
            y: [0, -200 - Math.random() * 200],
            x: [0, (Math.random() - 0.5) * 100],
            opacity: [0, 0.8, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// AI Entity Orb - The living AI avatar
function AIEntityOrb({ 
  state, 
  onActivate 
}: { 
  state: "idle" | "thinking" | "ready" | "success" | "error"; 
  onActivate: () => void;
}) {
  const breatheVariants = {
    idle: { scale: [1, 1.05, 1], transition: { duration: 4, repeat: Infinity } },
    thinking: { scale: [1, 1.15, 1], transition: { duration: 1, repeat: Infinity } },
    ready: { scale: [1, 1.08, 1], transition: { duration: 2, repeat: Infinity } },
    success: { scale: 1.1, transition: { type: "spring" as const, bounce: 0.5 } },
    error: { scale: [1, 0.95, 1], transition: { duration: 0.5, repeat: 3 } },
  };

  const glowColors = {
    idle: "shadow-violet-500/30",
    thinking: "shadow-violet-500/60",
    ready: "shadow-emerald-500/40",
    success: "shadow-emerald-500/60",
    error: "shadow-rose-500/50",
  };

  const ringColors = {
    idle: "border-violet-500/30",
    thinking: "border-violet-400",
    ready: "border-emerald-500/50",
    success: "border-emerald-400",
    error: "border-rose-500/50",
  };

  return (
    <motion.button
      onClick={onActivate}
      className="relative group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Outer pulse rings */}
      <motion.div
        className={`absolute inset-0 rounded-full border-2 ${ringColors[state]}`}
        animate={{
          scale: state === "thinking" ? [1, 1.5, 1.5] : [1, 1.3, 1.3],
          opacity: [0.6, 0, 0],
        }}
        transition={{ duration: state === "thinking" ? 1 : 2, repeat: Infinity }}
      />
      <motion.div
        className={`absolute inset-0 rounded-full border ${ringColors[state]}`}
        animate={{
          scale: state === "thinking" ? [1, 1.8, 1.8] : [1, 1.6, 1.6],
          opacity: [0.4, 0, 0],
        }}
        transition={{ duration: state === "thinking" ? 1.5 : 3, repeat: Infinity, delay: 0.5 }}
      />
      
      {/* Main orb */}
      <motion.div
        className={`relative w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 shadow-2xl ${glowColors[state]} flex items-center justify-center overflow-hidden`}
        variants={breatheVariants}
        animate={state}
      >
        {/* Inner glow */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent" />
        
        {/* Core light */}
        <motion.div
          className="absolute inset-4 rounded-full bg-gradient-radial from-violet-300/50 via-violet-500/30 to-transparent"
          animate={{
            opacity: state === "thinking" ? [0.5, 1, 0.5] : [0.3, 0.6, 0.3],
          }}
          transition={{ duration: state === "thinking" ? 0.5 : 2, repeat: Infinity }}
        />
        
        {/* Icon */}
        <motion.span
          className="material-symbols-outlined text-4xl text-white z-10"
          style={{ fontVariationSettings: "'FILL' 1" }}
          animate={state === "thinking" ? { rotate: 360 } : { rotate: 0 }}
          transition={state === "thinking" ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
        >
          {state === "thinking" ? "sync" : state === "success" ? "check_circle" : state === "error" ? "error" : "auto_awesome"}
        </motion.span>
      </motion.div>
      
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-full bg-violet-500/0 group-hover:bg-violet-500/20 transition-colors duration-300" />
    </motion.button>
  );
}

// Animated text that types out
function TypewriterText({ text, speed = 30 }: { text: string; speed?: number }) {
  const [displayText, setDisplayText] = useState("");
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  
  return (
    <span>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="inline-block w-0.5 h-5 bg-violet-400 ml-0.5 align-middle"
      />
    </span>
  );
}

// Change card with animation
function ChangeCard({ change, index }: { change: { path: string; before: any; after: any; reason: string }; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay: index * 0.15, type: "spring" }}
      className="p-4 bg-slate-800/60 backdrop-blur-sm rounded-xl border border-violet-500/20 hover:border-violet-500/50 transition-all group"
    >
      <div className="flex items-start gap-3">
        <motion.div
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30"
          whileHover={{ scale: 1.1, rotate: 10 }}
        >
          <span className="text-white font-bold">{index + 1}</span>
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-violet-300 mb-1">{change.path}</p>
          <p className="text-sm text-slate-300 mb-3">{change.reason}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 line-through">
              {typeof change.before === "object" ? JSON.stringify(change.before) : String(change.before)}
            </span>
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-violet-400 text-lg"
            >
              →
            </motion.span>
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
              {typeof change.after === "object" ? JSON.stringify(change.after) : String(change.after)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Confidence visualization
function ConfidenceRing({ value }: { value: number }) {
  const percentage = Math.round(value * 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const getColor = () => {
    if (percentage >= 80) return { stroke: "#10b981", text: "text-emerald-400", label: "Excellent" };
    if (percentage >= 60) return { stroke: "#f59e0b", text: "text-amber-400", label: "Good" };
    return { stroke: "#ef4444", text: "text-rose-400", label: "Review" };
  };
  
  const { stroke, text, label } = getColor();
  
  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={`text-3xl font-bold ${text}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          {percentage}%
        </motion.span>
        <span className="text-xs text-slate-400">{label}</span>
      </div>
    </div>
  );
}

export default function AIClaimIntelligence({ claim, claimId, onApplySuggestions }: AIClaimIntelligenceProps) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiState, setAiState] = useState<"idle" | "thinking" | "ready" | "success" | "error">("idle");
  const [aiMessage, setAiMessage] = useState("Hello! I'm your AI Claim Intelligence assistant. Click me to analyze and optimize this claim.");

  const analyzeClaim = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuggestion(null);
      setAiState("thinking");
      setAiMessage("Analyzing your claim against payer-specific rules and best practices...");

      const transformedClaim = {
        tradingPartnerId: claim?.tradingPartnerServiceId || claim?.receiver?.organizationName || "STEDI",
        usageIndicator: "T" as const,
        billingProvider: claim?.billing || claim?.billingProvider || {
          npi: claim?.billing?.npi || "1999999984",
          name: claim?.billing?.organizationName || "Demo Clinic",
        },
        subscriber: claim?.subscriber || {
          firstName: claim?.subscriber?.firstName || "JANE",
          lastName: claim?.subscriber?.lastName || "DOE",
          dateOfBirth: claim?.subscriber?.dateOfBirth || "19700101",
        },
        claim: claim?.claim || {
          patientControlNumber: claim?.claimInformation?.patientControlNumber || "PCN-001",
          totalChargeAmount: claim?.claimInformation?.claimChargeAmount || "240.00",
          placeOfServiceCode: claim?.claimInformation?.placeOfServiceCode || "11",
          diagnosisCodes: claim?.claimInformation?.healthCareCodeInformation?.map((c: any) => c.diagnosisCode) || ["R519"],
          serviceLines: claim?.claimInformation?.serviceLines?.map((line: any) => ({
            procedureCode: line?.professionalService?.procedureCode || "99213",
            diagnosisPointers: [1],
            unitCount: parseInt(line?.professionalService?.serviceUnitCount || "1"),
            chargeAmount: line?.professionalService?.lineItemChargeAmount || "180.00",
            serviceDate: line?.serviceDate || "2025-01-05",
          })) || [{ procedureCode: "99213", diagnosisPointers: [1], unitCount: 1, chargeAmount: "180.00", serviceDate: "2025-01-05" }],
        },
      };

      const result = await ragSuggest({
        claim: transformedClaim,
        payerId: transformedClaim.tradingPartnerId,
        specialty: "primary_care",
      });

      const data = result.data;
      setSuggestion(data);
      setAiState("ready");
      
      const changeCount = data.changes?.length || 0;
      const confidence = Math.round((data.confidence || 0) * 100);
      
      if (changeCount === 0) {
        setAiMessage(`Great news! Your claim looks optimized. I'm ${confidence}% confident it will be approved on first submission.`);
      } else {
        setAiMessage(`I found ${changeCount} optimization${changeCount > 1 ? 's' : ''} that could improve your claim's approval chances. Confidence level: ${confidence}%.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze claim");
      setAiState("error");
      setAiMessage("I encountered an issue while analyzing. Please try again or check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (suggestion?.claim && onApplySuggestions) {
      onApplySuggestions(suggestion.claim);
      setAiState("success");
      setAiMessage("Optimizations applied successfully! Your claim is now ready for submission.");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-violet-500/20">
      {/* Waves Background */}
      <WavesBackground isActive={!!suggestion} isThinking={loading} />
      
      {/* Content */}
      <div className="relative z-10 p-8">
        {/* AI Entity Section */}
        <div className="flex flex-col items-center text-center mb-8">
          {/* AI Orb */}
          <AIEntityOrb state={aiState} onActivate={analyzeClaim} />
          
          {/* AI Name */}
          <motion.h3
            className="mt-6 text-2xl font-bold bg-gradient-to-r from-violet-200 via-purple-200 to-indigo-200 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            AI Claim Intelligence
          </motion.h3>
          
          {/* AI Message Bubble */}
          <motion.div
            className="mt-4 max-w-md px-6 py-4 rounded-2xl bg-slate-800/60 backdrop-blur-md border border-violet-500/20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            key={aiMessage}
          >
            <p className="text-slate-300 text-sm leading-relaxed">
              {loading ? <TypewriterText text={aiMessage} speed={20} /> : aiMessage}
            </p>
          </motion.div>
          
          {/* Status indicators */}
          {!suggestion && !error && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 flex flex-wrap justify-center gap-4"
            >
              {[
                { icon: "rule", label: "Payer Rules", color: "text-violet-400" },
                { icon: "verified", label: "Code Validation", color: "text-emerald-400" },
                { icon: "psychology", label: "Pattern Analysis", color: "text-cyan-400" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 ${item.color}`}
                >
                  <span className="material-symbols-outlined text-sm">{item.icon}</span>
                  <span className="text-xs font-medium">{item.label}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Error state */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-rose-400">error</span>
                <div>
                  <p className="font-medium text-rose-300">Analysis Failed</p>
                  <p className="text-sm text-rose-400/80">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {suggestion && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Confidence & Summary Row */}
              <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-slate-800/40 backdrop-blur-sm border border-violet-500/20">
                <ConfidenceRing value={suggestion.confidence} />
                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-lg font-semibold text-white mb-2">
                    {suggestion.changes?.length || 0} Optimization{(suggestion.changes?.length || 0) !== 1 ? 's' : ''} Found
                  </h4>
                  <p className="text-slate-400 text-sm">{suggestion.rationale}</p>
                </div>
              </div>

              {/* Changes */}
              {suggestion.changes && suggestion.changes.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-violet-300 uppercase tracking-wider">
                    Recommended Changes
                  </h4>
                  {suggestion.changes.map((change, index) => (
                    <ChangeCard key={index} change={change} index={index} />
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <motion.button
                  onClick={handleApply}
                  className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="material-symbols-outlined">rocket_launch</span>
                  Apply Optimizations
                </motion.button>
                <motion.button
                  onClick={analyzeClaim}
                  disabled={loading}
                  className="px-6 py-4 rounded-xl border border-violet-500/30 text-violet-300 font-medium hover:bg-violet-500/10 transition-colors flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="material-symbols-outlined">refresh</span>
                  Re-analyze
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subtle hint when idle */}
        {!suggestion && !error && !loading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-slate-400 text-xs mt-4"
          >
            Click the AI orb above to start optimization
          </motion.p>
        )}
      </div>
    </div>
  );
}

