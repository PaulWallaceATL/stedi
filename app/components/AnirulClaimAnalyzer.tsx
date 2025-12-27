"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ragSuggest } from "@/lib/stediClient";

type AnalysisResult = {
  confidence: number;
  rationale: string;
  changes: Array<{ path: string; before: any; after: any; reason: string }>;
  warnings?: string[];
  recommendations?: string[];
  mockMode?: boolean;
};

type ClaimDraft = {
  patient: any;
  insurance: any;
  provider: any;
  diagnoses: any[];
  serviceLines: any[];
};

interface AnirulClaimAnalyzerProps {
  draft: ClaimDraft;
  totalCharge: number;
  onApplySuggestion?: (path: string, value: any) => void;
  compact?: boolean;
}

// Compact Anirul Eye for inline use
function CompactAnirulEye({ 
  state, 
  size = "md" 
}: { 
  state: "idle" | "thinking" | "ready" | "warning" | "error"; 
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20",
  };
  
  const iconSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const stateColors = {
    idle: "from-[#c97435]/30 to-[#8b5a2b]/30 border-[#c97435]/40",
    thinking: "from-[#c97435]/50 to-[#8b5a2b]/50 border-[#c97435]",
    ready: "from-emerald-500/30 to-green-600/30 border-emerald-500/60",
    warning: "from-amber-500/30 to-yellow-600/30 border-amber-500/60",
    error: "from-rose-500/30 to-red-600/30 border-rose-500/60",
  };

  const iconColors = {
    idle: "text-[#c97435]",
    thinking: "text-[#c97435]",
    ready: "text-emerald-400",
    warning: "text-amber-400",
    error: "text-rose-400",
  };

  return (
    <motion.div
      className={`${sizes[size]} rounded-full bg-gradient-to-br ${stateColors[state]} border-2 flex items-center justify-center relative overflow-hidden`}
      animate={state === "thinking" ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 1, repeat: state === "thinking" ? Infinity : 0 }}
    >
      {/* Inner glow */}
      <motion.div
        className="absolute inset-1 rounded-full bg-gradient-radial from-[#e8dcc8]/20 to-transparent"
        animate={{ opacity: state === "thinking" ? [0.3, 0.8, 0.3] : 0.5 }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      
      <motion.span
        className={`material-symbols-outlined ${iconSizes[size]} ${iconColors[state]} z-10`}
        style={{ fontVariationSettings: "'FILL' 1" }}
        animate={state === "thinking" ? { rotate: 360 } : {}}
        transition={state === "thinking" ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
      >
        {state === "thinking" ? "sync" : state === "ready" ? "check_circle" : state === "warning" ? "warning" : state === "error" ? "error" : "visibility"}
      </motion.span>
    </motion.div>
  );
}

// Confidence badge
function ConfidenceBadge({ value }: { value: number }) {
  const percentage = Math.round(value * 100);
  const color = percentage >= 85 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" :
                percentage >= 70 ? "text-amber-400 bg-amber-500/10 border-amber-500/30" :
                "text-rose-400 bg-rose-500/10 border-rose-500/30";
  
  return (
    <span className={`px-2.5 py-1 rounded-lg text-sm font-bold border ${color}`}>
      {percentage}%
    </span>
  );
}

export default function AnirulClaimAnalyzer({ 
  draft, 
  totalCharge, 
  onApplySuggestion,
  compact = false 
}: AnirulClaimAnalyzerProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const buildClaimPayload = () => {
    // Build payload matching the RAG schema validation requirements
    return {
      tradingPartnerId: draft.insurance.payerId || "STEDI",
      usageIndicator: "T" as const,
      billingProvider: {
        npi: draft.provider.billingNpi || "1999999984",
        name: draft.provider.billingProviderName || "Demo Clinic",
        taxId: draft.provider.billingTaxId,
      },
      renderingProvider: {
        npi: draft.provider.renderingNpi,
        name: draft.provider.renderingProviderName,
        taxonomyCode: draft.provider.taxonomyCode,
      },
      subscriber: {
        memberId: draft.insurance.subscriberId,
        firstName: draft.patient.firstName || "JANE",
        lastName: draft.patient.lastName || "DOE",
        dateOfBirth: draft.patient.dob?.replace(/-/g, "") || "19700101",
        gender: draft.patient.gender,
      },
      // Required 'claim' object with 'serviceLines' array
      claim: {
        patientControlNumber: `PCN-${Date.now()}`,
        totalChargeAmount: totalCharge.toFixed(2),
        placeOfServiceCode: draft.provider.posCode || "11",
        diagnosisCodes: draft.diagnoses.map((dx) => dx.code.replace(".", "")),
        serviceLines: draft.serviceLines.length > 0 
          ? draft.serviceLines.map((sl) => ({
              procedureCode: sl.code || "99213",
              modifiers: sl.modifiers.filter((m: string) => m),
              chargeAmount: (sl.charge * sl.units).toFixed(2),
              unitCount: sl.units || 1,
              diagnosisPointers: sl.dxPointers.length > 0 ? sl.dxPointers : [1],
              serviceDate: sl.fromDate?.replace(/-/g, "") || new Date().toISOString().split("T")[0].replace(/-/g, ""),
            }))
          : [{
              procedureCode: "99213",
              modifiers: [],
              chargeAmount: "150.00",
              unitCount: 1,
              diagnosisPointers: [1],
              serviceDate: new Date().toISOString().split("T")[0].replace(/-/g, ""),
            }],
      },
      // Also include claimInformation for backward compatibility with RAG analysis
      claimInformation: {
        claimChargeAmount: totalCharge.toFixed(2),
        placeOfServiceCode: draft.provider.posCode || "11",
        healthCareCodeInformation: draft.diagnoses.map((dx, i) => ({
          diagnosisTypeCode: i === 0 ? "ABK" : "ABF",
          diagnosisCode: dx.code.replace(".", ""),
        })),
        serviceLines: draft.serviceLines.map((sl) => ({
          professionalService: {
            procedureCode: sl.code,
            procedureModifiers: sl.modifiers.filter((m: string) => m),
            lineItemChargeAmount: (sl.charge * sl.units).toFixed(2),
            serviceUnitCount: String(sl.units),
            compositeDiagnosisCodePointers: {
              diagnosisCodePointers: sl.dxPointers.map(String),
            },
          },
          serviceDate: sl.fromDate?.replace(/-/g, "") || "",
        })),
      },
    };
  };

  const analyze = async () => {
    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const payload = buildClaimPayload();
      const response = await ragSuggest({
        claim: payload,
        payerId: draft.insurance.payerId,
        specialty: "primary_care",
      });
      
      setResult(response.data);
      setExpanded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const getState = (): "idle" | "thinking" | "ready" | "warning" | "error" => {
    if (analyzing) return "thinking";
    if (error) return "error";
    if (result) {
      if ((result.warnings?.length || 0) > 0 || (result.changes?.length || 0) > 0) return "warning";
      return "ready";
    }
    return "idle";
  };

  const hasIssues = result && ((result.warnings?.length || 0) > 0 || (result.changes?.length || 0) > 0);

  if (compact) {
    return (
      <div className="rounded-xl bg-[#1a1512]/60 border border-[#c97435]/20 p-4">
        <div className="flex items-center gap-4">
          <CompactAnirulEye state={getState()} size="md" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-[#e8dcc8]">Anirul</h4>
              {result && <ConfidenceBadge value={result.confidence} />}
            </div>
            <p className="text-sm text-[#8b7355] truncate">
              {analyzing ? "Analyzing claim..." : 
               error ? "Analysis failed" :
               result ? (hasIssues ? `${(result.changes?.length || 0) + (result.warnings?.length || 0)} items need attention` : "Claim looks good!") :
               "Click to analyze claim"}
            </p>
          </div>
          
          <button
            onClick={analyze}
            disabled={analyzing}
            className="px-4 py-2 rounded-xl bg-[#c97435] text-[#0a0908] font-semibold text-sm hover:bg-[#c97435]/90 disabled:opacity-50 transition-all"
          >
            {analyzing ? "..." : result ? "Re-analyze" : "Analyze"}
          </button>
        </div>

        {/* Expandable results */}
        <AnimatePresence>
          {expanded && result && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-[#c97435]/20 space-y-3">
                <p className="text-sm text-[#a67c52]">{result.rationale}</p>
                
                {result.changes && result.changes.length > 0 && (
                  <div className="space-y-2">
                    {result.changes.slice(0, 2).map((change, i) => (
                      <div key={i} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <p className="text-sm text-amber-300 font-medium">{change.path}</p>
                        <p className="text-xs text-amber-200/70 mt-1">{change.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {result.warnings && result.warnings.length > 0 && (
                  <div className="space-y-2">
                    {result.warnings.slice(0, 2).map((warning, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-rose-500/10">
                        <span className="material-symbols-outlined text-rose-400 text-sm mt-0.5">warning</span>
                        <p className="text-xs text-rose-300">{warning}</p>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setExpanded(false)}
                  className="text-xs text-[#6b5a45] hover:text-[#c97435] transition-colors"
                >
                  Hide details
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full version for Step 6
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#1a1512]/80 to-[#0a0908]/80 border border-[#c97435]/20 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#c97435]/10">
        <div className="flex items-center gap-4">
          <CompactAnirulEye state={getState()} size="lg" />
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-xl font-bold bg-gradient-to-r from-[#e8dcc8] via-[#c97435] to-[#a67c52] bg-clip-text text-transparent">
                ANIRUL
              </h3>
              <span className="text-xs text-[#6b5a45] uppercase tracking-wider">Pre-Submission Analysis</span>
            </div>
            <p className="text-sm text-[#8b7355]">
              {analyzing ? "Scanning payer rules and billing wisdom..." :
               error ? "The vision was interrupted. Please try again." :
               result ? result.rationale :
               "Awaken the Oracle to analyze your claim before submission."}
            </p>
          </div>
          
          {result && <ConfidenceBadge value={result.confidence} />}
        </div>

        {/* Analyze button */}
        {!result && !analyzing && (
          <motion.button
            onClick={analyze}
            className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-[#c97435] to-[#8b5a2b] text-[#0a0908] font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#c97435]/20 transition-all"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <span className="material-symbols-outlined">visibility</span>
            Analyze Claim Before Submission
          </motion.button>
        )}

        {/* Re-analyze button */}
        {result && !analyzing && (
          <button
            onClick={analyze}
            className="mt-4 px-4 py-2 rounded-lg border border-[#c97435]/30 text-[#c97435] text-sm hover:bg-[#c97435]/10 transition-colors"
          >
            Re-analyze
          </button>
        )}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-rose-500/10 border-t border-rose-500/20"
          >
            <div className="flex items-center gap-2 text-rose-400">
              <span className="material-symbols-outlined">error</span>
              <span className="text-sm">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 space-y-4"
          >
            {/* Status summary */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0a0908]/40">
              <div className="flex-1">
                <p className="text-2xl font-bold text-[#e8dcc8]">
                  {result.confidence >= 0.85 ? "Ready to Submit" : 
                   result.confidence >= 0.70 ? "Review Recommended" : 
                   "Issues Detected"}
                </p>
                <p className="text-sm text-[#6b5a45] mt-1">
                  {(result.changes?.length || 0)} optimizations • {(result.warnings?.length || 0)} warnings • {(result.recommendations?.length || 0)} tips
                </p>
              </div>
              <div className={`px-4 py-2 rounded-xl font-bold text-lg ${
                result.confidence >= 0.85 ? "bg-emerald-500/20 text-emerald-400" :
                result.confidence >= 0.70 ? "bg-amber-500/20 text-amber-400" :
                "bg-rose-500/20 text-rose-400"
              }`}>
                {Math.round(result.confidence * 100)}% Confidence
              </div>
            </div>

            {/* Changes/Optimizations */}
            {result.changes && result.changes.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-[#c97435] uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">auto_fix_high</span>
                  Suggested Optimizations
                </h4>
                {result.changes.map((change, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-xl bg-[#0a0908]/40 border border-[#c97435]/10"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-mono text-[#c97435]">{change.path}</p>
                        <p className="text-sm text-[#a67c52] mt-1">{change.reason}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs">
                          <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-400 line-through">
                            {typeof change.before === "object" ? JSON.stringify(change.before) : String(change.before || "empty")}
                          </span>
                          <span className="text-[#6b5a45]">→</span>
                          <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400">
                            {typeof change.after === "object" ? JSON.stringify(change.after) : String(change.after)}
                          </span>
                        </div>
                      </div>
                      {onApplySuggestion && (
                        <button
                          onClick={() => onApplySuggestion(change.path, change.after)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-colors"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Warnings */}
            {result.warnings && result.warnings.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  Warnings
                </h4>
                {result.warnings.map((warning, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
                  >
                    <span className="material-symbols-outlined text-amber-400 mt-0.5">report</span>
                    <p className="text-sm text-amber-200">{warning}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-[#a67c52] uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">tips_and_updates</span>
                  Best Practices
                </h4>
                {result.recommendations.map((rec, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-[#1a1512]/40 border border-[#c97435]/10"
                  >
                    <span className="material-symbols-outlined text-[#c97435] mt-0.5">lightbulb</span>
                    <p className="text-sm text-[#a67c52]">{rec}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* All clear message */}
            {result.confidence >= 0.85 && (result.changes?.length || 0) === 0 && (result.warnings?.length || 0) === 0 && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <span className="material-symbols-outlined text-4xl text-emerald-400 mb-2">verified</span>
                <p className="text-lg font-semibold text-emerald-400">Claim Ready for Submission</p>
                <p className="text-sm text-emerald-400/70 mt-1">No issues detected. This claim has a high probability of first-pass acceptance.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo mode indicator */}
      {result?.mockMode && (
        <div className="px-4 py-2 bg-[#c97435]/10 border-t border-[#c97435]/20 text-center">
          <p className="text-xs text-[#6b5a45]">
            Demo Mode • Connect OpenAI API for full intelligence
          </p>
        </div>
      )}
    </div>
  );
}
