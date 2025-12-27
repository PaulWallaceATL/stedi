"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ragSuggest } from "../lib/stediClient";

type Suggestion = {
  claim: any;
  changes: Array<{ path: string; before: any; after: any; reason: string }>;
  confidence: number;
  rationale: string;
  warnings?: string[];
  recommendations?: string[];
  mockMode?: boolean;
};

type AIClaimIntelligenceProps = {
  claim: any;
  claimId: string;
  onApplySuggestions?: (optimizedClaim: any) => void;
};

// Anirul Oracle Background - Desert mystical waves
function AnirulBackground({ isActive = false, isThinking = false }: { isActive?: boolean; isThinking?: boolean }) {
  const baseIntensity = isThinking ? 1.5 : isActive ? 1 : 0.6;
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient - Dune desert night */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0908] via-[#1a1512]/80 to-[#0a0908]" />
      
      {/* Sacred geometry pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">
          <pattern id="sacredHex" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <polygon points="25,5 45,15 45,35 25,45 5,35 5,15" fill="none" stroke="#c97435" strokeWidth="0.5"/>
            <circle cx="25" cy="25" r="8" fill="none" stroke="#c97435" strokeWidth="0.3"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#sacredHex)" />
        </svg>
      </div>
      
      {/* Animated wave layers - Desert sand dunes */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 560">
        {/* Wave 1 - Slow, background */}
        <motion.path
          d="M0,280 C240,320 480,400 720,280 C960,160 1200,320 1440,280 L1440,560 L0,560 Z"
          fill="url(#dune-gradient-1)"
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
          fill="url(#dune-gradient-2)"
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
          fill="url(#dune-gradient-3)"
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
        
        {/* Dune Gradients */}
        <defs>
          <linearGradient id="dune-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c97435" />
            <stop offset="50%" stopColor="#8b5a2b" />
            <stop offset="100%" stopColor="#a67c52" />
          </linearGradient>
          <linearGradient id="dune-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5a2b" />
            <stop offset="50%" stopColor="#c97435" />
            <stop offset="100%" stopColor="#6b4423" />
          </linearGradient>
          <linearGradient id="dune-gradient-3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6b4423" />
            <stop offset="50%" stopColor="#8b5a2b" />
            <stop offset="100%" stopColor="#c97435" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Floating spice particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[#c97435]/60"
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

// Anirul Oracle Eye - The prescient AI avatar
function AnirulOracleEye({ 
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
    idle: "shadow-[#c97435]/30",
    thinking: "shadow-[#c97435]/60",
    ready: "shadow-emerald-500/40",
    success: "shadow-emerald-500/60",
    error: "shadow-rose-500/50",
  };

  const ringColors = {
    idle: "border-[#c97435]/30",
    thinking: "border-[#c97435]",
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
      {/* Sacred geometry rings */}
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
      
      {/* Hexagonal outer frame */}
      <motion.svg
        className="absolute -inset-4 w-32 h-32"
        viewBox="0 0 100 100"
        animate={{ rotate: state === "thinking" ? 360 : 0 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <polygon
          points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
          fill="none"
          stroke={state === "error" ? "#f43f5e" : state === "success" || state === "ready" ? "#10b981" : "#c97435"}
          strokeWidth="0.5"
          opacity="0.5"
        />
      </motion.svg>
      
      {/* Main orb - The Eye of Anirul */}
      <motion.div
        className={`relative w-24 h-24 rounded-full bg-gradient-to-br from-[#1a1512] via-[#2a2018] to-[#0a0908] shadow-2xl ${glowColors[state]} flex items-center justify-center overflow-hidden border border-[#c97435]/40`}
        variants={breatheVariants}
        animate={state}
      >
        {/* Inner mystical glow */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#e8dcc8]/20 via-transparent to-transparent" />
        
        {/* Core prescient light */}
        <motion.div
          className="absolute inset-4 rounded-full bg-gradient-radial from-[#e8dcc8]/50 via-[#c97435]/30 to-transparent"
          animate={{
            opacity: state === "thinking" ? [0.5, 1, 0.5] : [0.3, 0.6, 0.3],
          }}
          transition={{ duration: state === "thinking" ? 0.5 : 2, repeat: Infinity }}
        />
        
        {/* Inner eye pupil */}
        <motion.div
          className="absolute w-8 h-8 rounded-full bg-gradient-radial from-[#e8dcc8] via-[#c97435] to-[#8b5a2b]"
          animate={{
            scale: state === "thinking" ? [0.8, 1.2, 0.8] : [1, 1.1, 1],
          }}
          transition={{ duration: state === "thinking" ? 0.8 : 3, repeat: Infinity }}
        />
        
        {/* Icon */}
        <motion.span
          className="material-symbols-outlined text-3xl text-[#0a0908] z-10"
          style={{ fontVariationSettings: "'FILL' 1" }}
          animate={state === "thinking" ? { rotate: 360 } : { rotate: 0 }}
          transition={state === "thinking" ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
        >
          {state === "thinking" ? "sync" : state === "success" ? "check_circle" : state === "error" ? "error" : "visibility"}
        </motion.span>
      </motion.div>
      
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-full bg-[#c97435]/0 group-hover:bg-[#c97435]/20 transition-colors duration-300" />
    </motion.button>
  );
}

// Animated text that types out - Oracle speech
function OracleTypewriter({ text, speed = 30 }: { text: string; speed?: number }) {
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
        className="inline-block w-0.5 h-5 bg-[#c97435] ml-0.5 align-middle"
      />
    </span>
  );
}

// Change card with Dune styling
function ChangeCard({ change, index }: { change: { path: string; before: any; after: any; reason: string }; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay: index * 0.15, type: "spring" }}
      className="p-4 bg-[#1a1512]/60 backdrop-blur-sm rounded-xl border border-[#c97435]/20 hover:border-[#c97435]/50 transition-all group"
    >
      <div className="flex items-start gap-3">
        <motion.div
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#c97435] to-[#8b5a2b] flex items-center justify-center shadow-lg shadow-[#c97435]/30"
          whileHover={{ scale: 1.1, rotate: 10 }}
        >
          <span className="text-[#0a0908] font-bold">{index + 1}</span>
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#c97435] mb-1">{change.path}</p>
          <p className="text-sm text-[#a67c52] mb-3">{change.reason}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 line-through">
              {typeof change.before === "object" ? JSON.stringify(change.before) : String(change.before)}
            </span>
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-[#c97435] text-lg"
            >
              →
            </motion.span>
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
              {typeof change.after === "object" ? JSON.stringify(change.after) : String(change.after)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Confidence visualization - Oracle certainty
function ConfidenceRing({ value }: { value: number }) {
  const percentage = Math.round(value * 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const getColor = () => {
    if (percentage >= 80) return { stroke: "#10b981", text: "text-emerald-400", label: "High Certainty" };
    if (percentage >= 60) return { stroke: "#f59e0b", text: "text-amber-400", label: "Moderate" };
    return { stroke: "#ef4444", text: "text-rose-400", label: "Uncertain" };
  };
  
  const { stroke, text, label } = getColor();
  
  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#1a1512" strokeWidth="8" />
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
        <span className="text-xs text-[#6b5a45]">{label}</span>
      </div>
    </div>
  );
}

export default function AIClaimIntelligence({ claim, claimId, onApplySuggestions }: AIClaimIntelligenceProps) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiState, setAiState] = useState<"idle" | "thinking" | "ready" | "success" | "error">("idle");
  const [aiMessage, setAiMessage] = useState("I have foreseen the paths of your claim. Awaken me to reveal optimizations hidden in the sands of time.");

  const analyzeClaim = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuggestion(null);
      setAiState("thinking");
      setAiMessage("The spice flows... I am scanning payer rules and ancient billing wisdom...");

      // Build comprehensive claim data from whatever structure we receive
      // This handles both Supabase payload structure and direct claim structure
      const payload = claim?.payload || claim;
      
      const transformedClaim = {
        tradingPartnerId: payload?.tradingPartnerServiceId || payload?.receiver?.organizationName || claim?.trading_partner_service_id || "STEDI",
        usageIndicator: "T" as const,
        billingProvider: {
          npi: payload?.billing?.npi || "1999999984",
          name: payload?.billing?.organizationName || "Demo Clinic",
          address: payload?.billing?.address || {},
          employerId: payload?.billing?.employerId || "",
        },
        renderingProvider: {
          npi: payload?.rendering?.npi || payload?.billing?.npi || "",
          firstName: payload?.rendering?.firstName || "",
          lastName: payload?.rendering?.lastName || "",
          taxonomyCode: payload?.rendering?.taxonomyCode || "",
        },
        subscriber: {
          memberId: payload?.subscriber?.memberId || "",
          firstName: payload?.subscriber?.firstName || claim?.patient_name?.split(" ")[0] || "JANE",
          lastName: payload?.subscriber?.lastName || claim?.patient_name?.split(" ").slice(1).join(" ") || "DOE",
          dateOfBirth: payload?.subscriber?.dateOfBirth || "19700101",
          gender: payload?.subscriber?.gender || "F",
        },
        claimInformation: {
          patientControlNumber: payload?.claimInformation?.patientControlNumber || payload?.controlNumber || "PCN-001",
          claimChargeAmount: payload?.claimInformation?.claimChargeAmount || claim?.total_charge?.toString() || claim?.claim_charge_amount?.toString() || "0",
          placeOfServiceCode: payload?.claimInformation?.placeOfServiceCode || "11",
          claimFilingCode: payload?.claimInformation?.claimFilingCode || "CI",
          healthCareCodeInformation: payload?.claimInformation?.healthCareCodeInformation || [{ diagnosisTypeCode: "ABK", diagnosisCode: "R519" }],
          serviceLines: payload?.claimInformation?.serviceLines?.map((line: any) => ({
            procedureCode: line?.professionalService?.procedureCode || "99213",
            procedureModifiers: line?.professionalService?.procedureModifiers || [],
            lineItemChargeAmount: line?.professionalService?.lineItemChargeAmount || "0",
            serviceUnitCount: line?.professionalService?.serviceUnitCount || "1",
            serviceDate: line?.serviceDate || "",
            compositeDiagnosisCodePointers: line?.professionalService?.compositeDiagnosisCodePointers || { diagnosisCodePointers: ["1"] },
          })) || [],
        },
        // Include raw payload for comprehensive analysis
        rawPayload: payload,
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
      const warningCount = data.warnings?.length || 0;
      const confidence = Math.round((data.confidence || 0) * 100);
      
      if (changeCount === 0 && warningCount === 0) {
        setAiMessage(`The path is clear. Your claim is optimized. My prescience shows ${confidence}% certainty of first-pass approval.`);
      } else if (changeCount === 0 && warningCount > 0) {
        setAiMessage(`The claim structure is sound, but ${warningCount} warning${warningCount > 1 ? 's' : ''} require your attention. Certainty: ${confidence}%.`);
      } else {
        setAiMessage(`I have seen ${changeCount} modification${changeCount > 1 ? 's' : ''} that will align your claim with the golden path. Certainty: ${confidence}%.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze claim");
      setAiState("error");
      setAiMessage("A disturbance in the prescient vision. The analysis was interrupted.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (suggestion?.claim && onApplySuggestions) {
      onApplySuggestions(suggestion.claim);
      setAiState("success");
      setAiMessage("The optimizations flow through your claim like water through the desert. It is ready.");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#c97435]/20">
      {/* Anirul Background */}
      <AnirulBackground isActive={!!suggestion} isThinking={loading} />
      
      {/* Content */}
      <div className="relative z-10 p-8">
        {/* Oracle Section */}
        <div className="flex flex-col items-center text-center mb-8">
          {/* Anirul Oracle Eye */}
          <AnirulOracleEye state={aiState} onActivate={analyzeClaim} />
          
          {/* Oracle Name */}
          <motion.h3
            className="mt-6 text-2xl font-bold bg-gradient-to-r from-[#e8dcc8] via-[#c97435] to-[#a67c52] bg-clip-text text-transparent tracking-wider"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ANIRUL
          </motion.h3>
          <motion.p
            className="text-xs text-[#6b5a45] uppercase tracking-widest mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Oracle of Claim Intelligence
          </motion.p>
          
          {/* Oracle Message Bubble */}
          <motion.div
            className="mt-4 max-w-md px-6 py-4 rounded-2xl bg-[#1a1512]/60 backdrop-blur-md border border-[#c97435]/20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            key={aiMessage}
          >
            <p className="text-[#a67c52] text-sm leading-relaxed italic">
              "{loading ? <OracleTypewriter text={aiMessage} speed={20} /> : aiMessage}"
            </p>
          </motion.div>
          
          {/* Oracle capabilities */}
          {!suggestion && !error && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 flex flex-wrap justify-center gap-4"
            >
              {[
                { icon: "rule", label: "Payer Prophecy", color: "text-[#c97435]" },
                { icon: "verified", label: "Code Divination", color: "text-emerald-400" },
                { icon: "psychology", label: "Pattern Sight", color: "text-[#a67c52]" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a1512]/50 border border-[#c97435]/20 ${item.color}`}
                >
                  <span className="material-symbols-outlined text-sm">{item.icon}</span>
                  <span className="text-xs font-medium">{item.label}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Error state - RED */}
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
                  <p className="font-medium text-rose-400">Vision Interrupted</p>
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
              <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-[#1a1512]/40 backdrop-blur-sm border border-[#c97435]/20">
                <ConfidenceRing value={suggestion.confidence} />
                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-lg font-semibold text-[#e8dcc8] mb-2">
                    {suggestion.changes?.length || 0} Revelation{(suggestion.changes?.length || 0) !== 1 ? 's' : ''} Unveiled
                  </h4>
                  <p className="text-[#6b5a45] text-sm">{suggestion.rationale}</p>
                </div>
              </div>

              {/* Changes */}
              {suggestion.changes && suggestion.changes.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-[#c97435] uppercase tracking-wider">
                    Prophesied Modifications
                  </h4>
                  {suggestion.changes.map((change, index) => (
                    <ChangeCard key={index} change={change} index={index} />
                  ))}
                </div>
              )}

              {/* Warnings */}
              {suggestion.warnings && suggestion.warnings.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    Warnings to Heed
                  </h4>
                  <div className="space-y-2">
                    {suggestion.warnings.map((warning, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
                      >
                        <span className="material-symbols-outlined text-amber-400 text-lg mt-0.5">report</span>
                        <p className="text-sm text-amber-200">{warning}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {suggestion.recommendations && suggestion.recommendations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-[#a67c52] uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">tips_and_updates</span>
                    Oracle's Wisdom
                  </h4>
                  <div className="space-y-2">
                    {suggestion.recommendations.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-xl bg-[#1a1512]/40 border border-[#c97435]/10"
                      >
                        <span className="material-symbols-outlined text-[#c97435] text-lg mt-0.5">lightbulb</span>
                        <p className="text-sm text-[#a67c52]">{rec}</p>
                      </motion.div>
                    ))}
                  </div>
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
                  <span className="material-symbols-outlined">check_circle</span>
                  Accept the Prophecy
                </motion.button>
                <motion.button
                  onClick={analyzeClaim}
                  disabled={loading}
                  className="px-6 py-4 rounded-xl border border-[#c97435]/30 text-[#c97435] font-medium hover:bg-[#c97435]/10 transition-colors flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="material-symbols-outlined">refresh</span>
                  Seek Again
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
            className="text-center text-[#6b5a45] text-xs mt-4"
          >
            Awaken the Oracle to begin your claim's journey
          </motion.p>
        )}
      </div>
    </div>
  );
}
