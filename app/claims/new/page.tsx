"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, hasSupabaseEnv } from "@/lib/supabaseClient";
import { submitClaim } from "../../lib/stediClient";
import { motion, AnimatePresence } from "framer-motion";

type StepId = 1 | 2 | 3 | 4 | 5 | 6;

type ServiceLine = {
  code: string;
  description: string;
  charge: number;
  modifiers: string[];
  from: string;
  to: string;
};

type Draft = {
  patientName: string;
  dob: string;
  memberId: string;
  payerName: string;
  policyNumber: string;
  groupNumber: string;
  billingProvider: string;
  billingNpi: string;
  posCode: string;
  serviceLines: ServiceLine[];
};

// Animated background
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0a0f]" />
      <motion.div
        className="absolute top-0 left-0 w-1/2 h-1/2 rounded-full bg-gradient-to-r from-violet-600/10 via-purple-600/10 to-indigo-600/10 blur-3xl"
        animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-1/2 h-1/2 rounded-full bg-gradient-to-l from-cyan-500/10 via-blue-500/10 to-indigo-500/10 blur-3xl"
        animate={{ x: [0, -100, 0], y: [0, -50, 0], scale: [1.2, 1, 1.2] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// Step indicator
function StepIndicator({ steps, currentStep, onStepClick }: { steps: { id: StepId; label: string; icon: string }[]; currentStep: StepId; onStepClick: (id: StepId) => void }) {
  return (
    <div className="sticky top-24 space-y-2">
      {steps.map((s) => (
        <motion.button
          key={s.id}
          onClick={() => onStepClick(s.id)}
          whileHover={{ x: 4 }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            currentStep === s.id
              ? "bg-[#137fec]/10 border border-[#137fec]/30 text-[#137fec]"
              : currentStep > s.id
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
              : "bg-slate-800/50 border border-slate-700/50 text-white hover:text-white hover:bg-slate-800"
          }`}
        >
          {currentStep > s.id ? (
            <span className="material-symbols-outlined text-lg">check_circle</span>
          ) : (
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep === s.id ? "bg-[#137fec] text-white" : "bg-slate-700 text-white"
            }`}>
              {s.id}
            </span>
          )}
          <span className={`text-sm ${currentStep === s.id ? "font-semibold" : "font-medium"}`}>{s.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

// Form field component
function FormField({ label, value, onChange, placeholder, icon, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; icon?: string; type?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <div className="relative">
        {icon && <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">{icon}</span>}
        <input
          type={type}
          className={`w-full h-12 rounded-xl border border-slate-700 bg-slate-800/50 ${icon ? "pl-12" : "pl-4"} pr-4 text-white placeholder-slate-500 outline-none focus:border-[#137fec] focus:ring-2 focus:ring-[#137fec]/20 transition-all`}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export default function NewClaimPage() {
  const router = useRouter();
  const [step, setStep] = useState<StepId>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supabaseNote, setSupabaseNote] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  // Prefilled with Stedi Test Payer data to receive mock 835 ERAs
  // Payer ID must be: STEDI, STEDITEST, or FRCPB
  // NPI and Tax ID must match your Stedi enrollment
  const [draft, setDraft] = useState<Draft>({
    patientName: "JANE DOE",
    dob: "1985-03-15",
    memberId: "STEDI-TEST-001",
    payerName: "Stedi Test Payer",
    policyNumber: "TEST-POLICY-001",
    groupNumber: "TEST-GROUP-001",
    billingProvider: "Clinix AI Demo Practice",
    billingNpi: "1999999984", // Must match your Stedi Test Payer enrollment
    posCode: "11",
    serviceLines: [
      { code: "99213", description: "Office visit, established patient (Level 3)", charge: 150, modifiers: [], from: "2025-01-04", to: "2025-01-04" },
      { code: "97110", description: "Therapeutic exercises", charge: 90, modifiers: [], from: "2025-01-04", to: "2025-01-04" },
    ],
  });

  const totalCharge = useMemo(() => draft.serviceLines.reduce((sum, l) => sum + (l.charge || 0), 0), [draft.serviceLines]);

  const buildPayload = () => {
    const nameParts = draft.patientName.trim().split(/\s+/);
    const firstName = nameParts[0] || "JANE";
    const lastName = nameParts.slice(1).join(" ") || "DOE";
    // Generate unique ID - must be <= 38 chars for patientControlNumber per EDI spec
    const unique = typeof crypto !== "undefined" && "randomUUID" in crypto 
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 32) // 32 char hex
      : String(Date.now());
    const controlNumber = `C${unique}`.slice(0, 38); // Max 38 chars
    const patientControlNumber = `P${unique}`.slice(0, 38); // Max 38 chars for 837P
    
    // Use Stedi Test Payer ID for mock ERA responses
    // Valid test payer IDs: STEDI, STEDITEST, FRCPB
    const isStediTestPayer = draft.payerName?.toLowerCase().includes("stedi") || 
                              draft.payerName?.toLowerCase().includes("test payer");
    const tradingPartnerId = isStediTestPayer ? "STEDI" : "60054"; // STEDI for test, Aetna ID otherwise
    
    return {
      controlNumber,
      tradingPartnerServiceId: tradingPartnerId,
      usageIndicator: "T", // T = Test mode
      submitter: { organizationName: draft.billingProvider || "Clinix AI Demo Practice", contactInformation: { phoneNumber: "6155551234" } },
      receiver: { organizationName: draft.payerName || "Stedi Test Payer" },
      billing: {
        npi: draft.billingNpi || "1999999984", // Must match Stedi enrollment
        employerId: "123456789", // Must match Stedi enrollment Tax ID
        organizationName: draft.billingProvider || "Clinix AI Demo Practice",
        address: { address1: "123 Main St", city: "Nashville", state: "TN", postalCode: "37201" },
      },
      subscriber: {
        memberId: draft.memberId || "AETNA12345",
        firstName,
        lastName,
        dateOfBirth: (draft.dob || "1970-01-01").replace(/-/g, ""),
        gender: "F",
      },
      claimInformation: {
        claimFilingCode: "CI",
        claimFrequencyCode: "1",
        signatureIndicator: "Y",
        planParticipationCode: "A",
        benefitsAssignmentCertificationIndicator: "Y",
        releaseInformationCode: "Y",
        patientControlNumber,
        claimChargeAmount: totalCharge.toFixed(2),
        placeOfServiceCode: draft.posCode || "11",
        healthCareCodeInformation: [{ diagnosisTypeCode: "ABK", diagnosisCode: "M542" }],
        serviceLines: draft.serviceLines.map((line, idx) => ({
          assignedNumber: String(idx + 1),
          professionalService: {
            procedureIdentifier: "HC",
            procedureCode: line.code,
            procedureModifiers: line.modifiers.filter(Boolean),
            lineItemChargeAmount: (line.charge || 0).toFixed(2),
            measurementUnit: "UN",
            serviceUnitCount: "1",
            compositeDiagnosisCodePointers: [["1"]],
          },
          serviceDate: (line.from || line.to || "2025-01-05").replace(/-/g, ""),
        })),
      },
    };
  };

  const handleSubmit = async () => {
    if (!draft.patientName || !draft.dob || !draft.memberId) {
      setError("Patient name, DOB, and Member ID are required.");
      return;
    }
    if (supabase && hasSupabaseEnv) {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id || null;
      if (!userId) {
        setError("Please sign in to save and track claims.");
        return;
      }
    } else {
      setError("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSupabaseNote(null);
      setResult(null);
      const payload = buildPayload();
      const res = await submitClaim(payload);
      const wrapped = res.data;
      const upstream = wrapped && typeof wrapped === "object" && "data" in (wrapped as any) ? (wrapped as any).data : wrapped;
      setResult(upstream);

      const rawStatus = typeof upstream?.status === "string" ? upstream.status.toLowerCase() : null;
      const normalizedStatus = rawStatus === "success" ? "accepted" : rawStatus || "submitted";
      const submissionTransactionId = typeof upstream?.transactionId === "string" ? upstream.transactionId : null;

      // Track the inserted claim ID for redirect
      let insertedClaimId: string | null = null;

      if (supabase && hasSupabaseEnv) {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const userId = sessionData?.session?.user?.id || null;
          if (userId) {
            const firstServiceDate = draft.serviceLines?.[0]?.from || draft.serviceLines?.[0]?.to || null;
            const { data: inserted, error: insertErr } = await supabase
              .from("claims")
              .insert({
                user_id: userId,
                patient_name: `${payload.subscriber.firstName} ${payload.subscriber.lastName}`,
                payer_name: payload.receiver.organizationName,
                trading_partner_name: payload.receiver.organizationName,
                trading_partner_service_id: payload.tradingPartnerServiceId,
                status: normalizedStatus,
                claim_charge_amount: Number(payload.claimInformation.claimChargeAmount),
                total_charge: Number(payload.claimInformation.claimChargeAmount),
                date_of_service: firstServiceDate ? new Date(firstServiceDate).toISOString() : null,
                service_line_count: payload.claimInformation.serviceLines.length,
                payload,
              })
              .select("id")
              .single();
            if (insertErr) throw insertErr;

            if (inserted?.id) {
              insertedClaimId = inserted.id; // Store for redirect
              // Try to insert event - don't fail if table schema is different
              try {
                await supabase.from("claim_status_events").insert({
                  claim_id: inserted.id,
                  type: "submission",
                  transaction_id: submissionTransactionId,
                  payload: {
                    status: upstream?.status ?? null,
                    transactionId: submissionTransactionId,
                    controlNumber: upstream?.controlNumber ?? payload.controlNumber ?? null,
                    response: upstream ?? null,
                  },
                });
              } catch (eventErr) {
                console.warn("Could not insert claim event (table schema may differ):", eventErr);
              }
            }
          } else {
            setSupabaseNote("Not signed in — claim saved to Stedi; skipped Supabase insert.");
          }
        } catch (e: any) {
          setSupabaseNote(`Saved to Stedi, but Supabase insert failed: ${e?.message || "unknown error"}`);
        }
      }

      const nameParts = draft.patientName.trim().split(/\s+/);
      const patientNameForUrl = encodeURIComponent(`${nameParts[0]} ${nameParts.slice(1).join(" ") || "DOE"}`);
      
      // Build success URL with the actual claim ID
      const successUrl = `/claims/success?patient=${patientNameForUrl}&payer=${encodeURIComponent(draft.payerName)}&amount=${totalCharge.toFixed(2)}${insertedClaimId ? `&id=${insertedClaimId}` : ""}`;
      router.push(successUrl);
    } catch (err: any) {
      const friendly = err?.data?.message || err?.message || "Submit failed. Please adjust test data and retry.";
      setError(friendly);
      setResult(err?.data);
    } finally {
      setLoading(false);
    }
  };

  const summary = buildPayload();

  const steps = [
    { id: 1 as StepId, label: "Patient Info", icon: "person" },
    { id: 2 as StepId, label: "Insurance", icon: "shield" },
    { id: 3 as StepId, label: "Provider", icon: "medical_services" },
    { id: 4 as StepId, label: "Diagnoses", icon: "clinical_notes" },
    { id: 5 as StepId, label: "Services", icon: "receipt_long" },
    { id: 6 as StepId, label: "Review", icon: "fact_check" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <AnimatedBackground />
      
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
                <h1 className="text-lg font-bold text-white">Create New Claim</h1>
                <p className="text-xs text-slate-400">Step {step} of 6</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              {[
                { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
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
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <StepIndicator steps={steps} currentStep={step} onStepClick={setStep} />
          </aside>

          {/* Content */}
          <div className="lg:col-span-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6"
              >
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-white">Patient Information</h2>
                      <p className="text-sm text-slate-300 mt-1">Enter patient demographics and identification</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <FormField label="Patient Name" value={draft.patientName} onChange={(v) => setDraft((p) => ({ ...p, patientName: v }))} placeholder="JANE DOE" icon="person" />
                      </div>
                      <FormField label="Date of Birth" value={draft.dob} onChange={(v) => setDraft((p) => ({ ...p, dob: v }))} placeholder="YYYY-MM-DD" type="date" icon="calendar_today" />
                      <FormField label="Member ID" value={draft.memberId} onChange={(v) => setDraft((p) => ({ ...p, memberId: v }))} placeholder="AETNA12345" icon="badge" />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-white">Insurance Details</h2>
                      <p className="text-sm text-slate-300 mt-1">Enter payer and insurance plan information</p>
                    </div>
                    
                    {/* Payer Selection */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-slate-300">Select Payer</label>
                      <div className="grid grid-cols-2 gap-3">
                        {/* Stedi Test Payer - Highlighted */}
                        <button
                          type="button"
                          onClick={() => setDraft((p) => ({ 
                            ...p, 
                            payerName: "Stedi Test Payer",
                            memberId: p.memberId.includes("AETNA") ? "STEDI-TEST-001" : p.memberId
                          }))}
                          className={`relative p-4 rounded-xl border text-left transition-all ${
                            draft.payerName?.toLowerCase().includes("stedi") 
                              ? "border-violet-500 bg-violet-500/10" 
                              : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                          }`}
                        >
                          {draft.payerName?.toLowerCase().includes("stedi") && (
                            <span className="absolute top-2 right-2 material-symbols-outlined text-violet-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          )}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-violet-400" style={{ fontVariationSettings: "'FILL' 1" }}>science</span>
                            <span className="font-semibold text-white">Stedi Test Payer</span>
                          </div>
                          <p className="text-xs text-slate-400">Receive mock 835 ERAs</p>
                        </button>
                        
                        {/* Real Payer Option */}
                        <button
                          type="button"
                          onClick={() => setDraft((p) => ({ 
                            ...p, 
                            payerName: "Aetna",
                            memberId: p.memberId.includes("STEDI") ? "AETNA12345" : p.memberId
                          }))}
                          className={`relative p-4 rounded-xl border text-left transition-all ${
                            draft.payerName === "Aetna" 
                              ? "border-sky-500 bg-sky-500/10" 
                              : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                          }`}
                        >
                          {draft.payerName === "Aetna" && (
                            <span className="absolute top-2 right-2 material-symbols-outlined text-sky-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          )}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-sky-400">shield</span>
                            <span className="font-semibold text-white">Aetna</span>
                          </div>
                          <p className="text-xs text-slate-400">Real payer (no mock ERA)</p>
                        </button>
                      </div>
                      
                      {/* Custom payer input */}
                      <div className="pt-2">
                        <FormField 
                          label="Or enter custom payer" 
                          value={draft.payerName} 
                          onChange={(v) => setDraft((p) => ({ ...p, payerName: v }))} 
                          placeholder="Enter payer name" 
                          icon="edit" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField label="Member ID" value={draft.memberId} onChange={(v) => setDraft((p) => ({ ...p, memberId: v }))} placeholder="MEMBER-001" icon="badge" />
                      <FormField label="Policy Number" value={draft.policyNumber} onChange={(v) => setDraft((p) => ({ ...p, policyNumber: v }))} placeholder="POLICY-001" icon="policy" />
                      <FormField label="Group Number" value={draft.groupNumber} onChange={(v) => setDraft((p) => ({ ...p, groupNumber: v }))} placeholder="GRP-001" icon="group" />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-white">Provider & Facility</h2>
                      <p className="text-sm text-slate-300 mt-1">Enter billing provider information</p>
                    </div>
                    
                    {/* NPI Enrollment Notice for Test Payer */}
                    {draft.payerName?.toLowerCase().includes("stedi") && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10"
                      >
                        <span className="material-symbols-outlined text-amber-400">info</span>
                        <div>
                          <p className="text-sm font-medium text-white">Important: NPI must match Stedi enrollment</p>
                          <p className="text-xs text-slate-300 mt-1">
                            To receive mock 835 ERAs, the NPI and Tax ID below must match the provider enrolled with the 
                            <a href="https://portal.stedi.com/app/healthcare/enrollments" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline ml-1">Stedi Test Payer</a>.
                          </p>
                        </div>
                      </motion.div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <FormField label="Billing Provider" value={draft.billingProvider} onChange={(v) => setDraft((p) => ({ ...p, billingProvider: v }))} placeholder="Clinix AI Demo Practice" icon="local_hospital" />
                      </div>
                      <FormField label="NPI Number" value={draft.billingNpi} onChange={(v) => setDraft((p) => ({ ...p, billingNpi: v }))} placeholder="1999999984" icon="pin" />
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Place of Service</label>
                        <select
                          className="w-full h-12 rounded-xl border border-slate-700 bg-slate-800/50 px-4 text-white outline-none focus:border-[#137fec]"
                          value={draft.posCode}
                          onChange={(e) => setDraft((p) => ({ ...p, posCode: e.target.value }))}
                        >
                          <option value="11">11 - Office</option>
                          <option value="22">22 - Hospital Outpatient</option>
                          <option value="21">21 - Hospital Inpatient</option>
                          <option value="23">23 - Emergency Room</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-white">Diagnoses (ICD-10)</h2>
                      <p className="text-sm text-slate-300 mt-1">Add diagnosis codes for medical necessity</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#137fec]/10 border border-[#137fec]/30 text-[#137fec] font-medium text-sm hover:bg-[#137fec]/20 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">add</span>
                      Add Diagnosis
                    </motion.button>
                    <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">Primary</span>
                          <p className="mt-2 text-white font-semibold">M54.2 - Cervicalgia</p>
                          <p className="text-sm text-slate-300">Pain in the cervical spine (neck pain)</p>
                        </div>
                        <button className="p-2 rounded-lg hover:bg-rose-500/10 text-white hover:text-rose-400 transition-colors">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-white">Service Lines</h2>
                      <p className="text-sm text-slate-300 mt-1">Add CPT/HCPCS codes for procedures performed</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#137fec]/10 border border-[#137fec]/30 text-[#137fec] font-medium text-sm hover:bg-[#137fec]/20 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">add</span>
                      Add Service Line
                    </motion.button>
                    <div className="space-y-4">
                      {draft.serviceLines.map((line, idx) => (
                        <div key={idx} className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="text-white font-semibold">Service Line {idx + 1}</h4>
                            <button className="p-2 rounded-lg hover:bg-rose-500/10 text-white hover:text-rose-400 transition-colors">
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-slate-400 mb-1">CPT Code</p>
                              <p className="text-white font-mono">{line.code}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400 mb-1">Description</p>
                              <p className="text-white">{line.description}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400 mb-1">Charge</p>
                              <p className="text-emerald-400 font-semibold">${line.charge.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl bg-gradient-to-r from-[#137fec]/10 to-violet-500/10 border border-[#137fec]/30 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-slate-300">Total Charges</p>
                        <p className="text-2xl font-bold text-white">${totalCharge.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {step === 6 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-white">Review & Submit</h2>
                      <p className="text-sm text-slate-300 mt-1">Verify all details before submitting</p>
                    </div>

                    {/* Stedi Test Payer Notice */}
                    {summary.tradingPartnerServiceId === "STEDI" && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 p-4 rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-500/10 to-indigo-500/10"
                      >
                        <span className="material-symbols-outlined text-violet-400" style={{ fontVariationSettings: "'FILL' 1" }}>science</span>
                        <div>
                          <p className="text-sm font-semibold text-white">Test Mode: Stedi Test Payer</p>
                          <p className="text-xs text-slate-300 mt-1">
                            This claim will be submitted to the <span className="font-semibold text-violet-300">Stedi Test Payer</span> (Payer ID: STEDI). 
                            You will receive a mock 835 ERA within minutes to test the full claim lifecycle.
                          </p>
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Summary cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-4">
                        <p className="text-xs text-slate-400 mb-1">Patient</p>
                        <p className="text-white font-semibold">{summary.subscriber.firstName} {summary.subscriber.lastName}</p>
                      </div>
                      <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-4">
                        <p className="text-xs text-slate-400 mb-1">Payer</p>
                        <p className="text-white font-semibold">{summary.receiver.organizationName}</p>
                        {summary.tradingPartnerServiceId === "STEDI" && (
                          <p className="text-xs text-violet-400 mt-1">Payer ID: STEDI (Test)</p>
                        )}
                      </div>
                      <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-4">
                        <p className="text-xs text-slate-400 mb-1">Provider</p>
                        <p className="text-white font-semibold">{summary.billing.organizationName}</p>
                      </div>
                      <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border border-emerald-500/30 p-4">
                        <p className="text-xs text-emerald-400 mb-1">Total Charges</p>
                        <p className="text-emerald-400 font-bold text-lg">${summary.claimInformation.claimChargeAmount}</p>
                      </div>
                    </div>

                    {/* Service lines summary */}
                    <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-4 space-y-3">
                      <p className="text-sm font-semibold text-white">Service Lines ({draft.serviceLines.length})</p>
                      {draft.serviceLines.map((line, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-slate-300"><span className="font-mono text-white">{line.code}</span> - {line.description}</span>
                          <span className="text-white">${line.charge.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {error && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10">
                        <span className="material-symbols-outlined text-rose-400">error</span>
                        <p className="text-sm text-rose-300">{error}</p>
                      </motion.div>
                    )}
                    {supabaseNote && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
                        <span className="material-symbols-outlined text-amber-400">warning</span>
                        <p className="text-sm text-amber-300">{supabaseNote}</p>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Tip panel */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24 rounded-2xl bg-gradient-to-br from-[#137fec]/10 to-violet-500/10 border border-[#137fec]/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#137fec]" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                <h4 className="text-white font-semibold">Quick Tip</h4>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {step === 1 && "Link to an existing patient by searching their name, or create a new patient record by filling out the form."}
                {step === 2 && (
                  <>
                    <span className="block mb-2">Choose the payer that matches the patient's active insurance plan.</span>
                    <span className="block text-violet-300">💡 For testing: Use "Stedi Test Payer" to receive mock 835 ERA responses and watch the full claim lifecycle.</span>
                  </>
                )}
                {step === 3 && "The billing provider receives payment. NPI must match your Stedi enrollment for test claims. POS codes are mandatory for outpatient claims."}
                {step === 4 && "List the primary diagnosis first. All diagnoses should support the procedures being performed. Up to 12 diagnoses can be added."}
                {step === 5 && "Service lines represent procedures performed. Diagnosis pointers map ICD-10 codes to services. Units affect payment amounts."}
                {step === 6 && "Review all details before submitting. Test claims to the Stedi Test Payer will receive mock ERAs within minutes."}
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 border-t border-slate-800 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setStep((s) => (s > 1 ? ((s - 1) as StepId) : s))}
            disabled={step === 1 || loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (step < 6) setStep((s) => ((s + 1) as StepId));
              else void handleSubmit();
            }}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#137fec] to-indigo-600 text-white font-semibold shadow-lg shadow-[#137fec]/20 hover:shadow-xl transition-all disabled:opacity-60"
          >
            {loading ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Submitting...
              </>
            ) : (
              <>
                {step < 6 ? "Continue" : "Submit Claim"}
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </>
            )}
          </motion.button>
        </div>
      </footer>
    </div>
  );
}
