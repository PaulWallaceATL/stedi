"use client";

import { useState } from "react";
import Link from "next/link";

type ClaimSuggestion = {
  claim: any;
  changes: Array<{
    path: string;
    before: any;
    after: any;
    reason: string;
  }>;
  confidence: number;
  rationale: string;
  retrieved?: {
    rules: any[];
    exemplars: any[];
  };
};

type ClaimIntelligenceProps = {
  claim: any;
  claimId: string;
  onApplySuggestions?: (optimizedClaim: any) => void;
};

export default function ClaimIntelligence({ claim, claimId, onApplySuggestions }: ClaimIntelligenceProps) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<ClaimSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const analyzeClaim = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuggestion(null);

      // Transform the claim to the expected RAG format
      const transformedClaim = {
        tradingPartnerId: claim?.tradingPartnerServiceId || 
                          claim?.receiver?.organizationName ||
                          "STEDI",
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
          patientControlNumber: claim?.claim?.patientControlNumber || "PCN-001",
          totalChargeAmount: claim?.claim?.totalChargeAmount || "240.00",
          placeOfServiceCode: claim?.claim?.placeOfServiceCode || "11",
          diagnosisCodes: claim?.claim?.diagnosisCodes || ["R519"],
          serviceLines: claim?.claim?.serviceLines || [
            {
              procedureCode: "99213",
              diagnosisPointers: [1],
              unitCount: 1,
              chargeAmount: "180.00",
              serviceDate: "2025-01-05",
            }
          ],
        },
      };

      // Use proxy URL if available, otherwise fall back to direct API
      const proxyUrl = process.env.NEXT_PUBLIC_PROXY_URL?.replace(/\/+$/, "");
      const endpoint = proxyUrl ? `${proxyUrl}/rag/suggest` : "/api/rag/suggest";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claim: transformedClaim,
          payerId: transformedClaim.tradingPartnerId,
          specialty: "primary_care",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      const data = await response.json();
      setSuggestion(data);
      setExpanded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze claim");
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (confidence >= 0.6) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "High Confidence";
    if (confidence >= 0.6) return "Medium Confidence";
    return "Low Confidence";
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#137fec] to-[#0f6acc] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <span className="material-symbols-outlined text-white text-xl">psychology</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Claim Intelligence</h3>
              <p className="text-sm text-white/80">Optimize for 90%+ first-time approval</p>
            </div>
          </div>
          {!suggestion && !loading && (
            <button
              onClick={analyzeClaim}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#137fec] hover:bg-white/90 transition-colors"
            >
              <span className="material-symbols-outlined text-base">auto_fix_high</span>
              Analyze Claim
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-6 flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-600">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[#137fec]"></div>
            <span className="text-sm">Analyzing claim with AI...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 m-4 rounded-lg border border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-red-600">error</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900">Analysis Failed</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={analyzeClaim}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Suggestion Results */}
      {suggestion && (
        <div className="divide-y divide-slate-200">
          {/* Confidence Score */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">Approval Confidence</span>
                <span className={`text-xs px-2 py-1 rounded-full border ${getConfidenceColor(suggestion.confidence)}`}>
                  {getConfidenceLabel(suggestion.confidence)}
                </span>
              </div>
              <span className="text-2xl font-bold text-slate-900">{Math.round(suggestion.confidence * 100)}%</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  suggestion.confidence >= 0.8 ? "bg-emerald-500" :
                  suggestion.confidence >= 0.6 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${suggestion.confidence * 100}%` }}
              ></div>
            </div>

            {/* Rationale */}
            {suggestion.rationale && (
              <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">AI Analysis</p>
                <p className="text-sm text-slate-700">{suggestion.rationale}</p>
              </div>
            )}
          </div>

          {/* Suggested Changes */}
          {suggestion.changes && suggestion.changes.length > 0 ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-900">
                  Recommended Changes ({suggestion.changes.length})
                </h4>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-sm text-[#137fec] hover:underline font-medium"
                >
                  {expanded ? "Collapse" : "Expand"}
                </button>
              </div>

              {expanded && (
                <div className="space-y-3">
                  {suggestion.changes.map((change, idx) => (
                    <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-[#137fec] text-lg mt-0.5">lightbulb</span>
                        <div className="flex-1 space-y-2">
                          <p className="text-sm font-semibold text-slate-900">{change.path}</p>
                          <p className="text-xs text-slate-600">{change.reason}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="rounded bg-red-100 p-2">
                              <p className="text-red-600 font-semibold mb-1">Before:</p>
                              <code className="text-red-900">{JSON.stringify(change.before)}</code>
                            </div>
                            <div className="rounded bg-emerald-100 p-2">
                              <p className="text-emerald-600 font-semibold mb-1">After:</p>
                              <code className="text-emerald-900">{JSON.stringify(change.after)}</code>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                <div>
                  <p className="text-sm font-semibold text-emerald-900">No Changes Needed</p>
                  <p className="text-xs text-emerald-700 mt-1">This claim is optimally configured for submission</p>
                </div>
              </div>
            </div>
          )}

          {/* Retrieved Rules */}
          {suggestion.retrieved && suggestion.retrieved.rules.length > 0 && (
            <div className="p-4">
              <details className="group">
                <summary className="cursor-pointer text-sm font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base group-open:rotate-90 transition-transform">chevron_right</span>
                  Applied Rules ({suggestion.retrieved.rules.length})
                </summary>
                <div className="mt-3 space-y-2">
                  {suggestion.retrieved.rules.map((rule: any, idx: number) => (
                    <div key={idx} className="text-xs p-2 rounded bg-slate-50 border border-slate-200">
                      <p className="font-semibold text-slate-900">{rule.id}</p>
                      <p className="text-slate-600 mt-1">{rule.description}</p>
                      {rule.payerId && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                          {rule.payerId}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}

          {/* Actions */}
          <div className="p-4 bg-slate-50">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="material-symbols-outlined text-base">info</span>
                <span>AI suggestions preserve all IDs and identifiers</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={analyzeClaim}
                  className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Re-analyze
                </button>
                {suggestion.changes.length > 0 && onApplySuggestions && (
                  <button
                    onClick={() => onApplySuggestions(suggestion.claim)}
                    className="px-3 py-1.5 text-sm font-semibold text-white bg-[#137fec] hover:bg-[#0f6acc] rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-base">done</span>
                    Apply Suggestions
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Initial State - No Analysis Yet */}
      {!suggestion && !loading && !error && (
        <div className="p-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-slate-400 text-3xl">psychology</span>
          </div>
          <h4 className="text-sm font-semibold text-slate-900 mb-2">Ready to Optimize</h4>
          <p className="text-xs text-slate-600 mb-4 max-w-md mx-auto">
            Our AI will analyze this claim against payer-specific rules, exemplar patterns, and best practices to maximize first-time approval rates.
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base text-emerald-500">check_circle</span>
              <span>Payer Rules</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base text-emerald-500">check_circle</span>
              <span>Code Validation</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base text-emerald-500">check_circle</span>
              <span>Best Practices</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

