"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, hasSupabaseEnv } from "@/lib/supabaseClient";
import { submitClaim } from "../../lib/stediClient";

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

export default function NewClaimPage() {
  const router = useRouter();
  const [step, setStep] = useState<StepId>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supabaseNote, setSupabaseNote] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [draft, setDraft] = useState<Draft>({
    patientName: "JANE DOE",
    dob: "1970-01-01",
    memberId: "AETNA12345",
    payerName: "Aetna",
    policyNumber: "POLICY-TEST-001",
    groupNumber: "GRP-TEST-001",
    billingProvider: "Demo Clinic",
    billingNpi: "1999999984",
    posCode: "11",
    serviceLines: [
      { code: "99213", description: "Office visit", charge: 180, modifiers: ["25"], from: "2025-01-05", to: "2025-01-05" },
      { code: "97110", description: "Therapeutic exercises", charge: 60, modifiers: ["GP"], from: "2025-01-05", to: "2025-01-05" },
    ],
  });

  const totalCharge = useMemo(() => draft.serviceLines.reduce((sum, l) => sum + (l.charge || 0), 0), [draft.serviceLines]);

  const buildPayload = () => {
    const nameParts = draft.patientName.trim().split(/\s+/);
    const firstName = nameParts[0] || "JANE";
    const lastName = nameParts.slice(1).join(" ") || "DOE";
    return {
      controlNumber: "CLM-AETNA-UI",
      tradingPartnerServiceId: "60054",
      usageIndicator: "T",
      submitter: { organizationName: draft.billingProvider || "Demo Clinic", contactInformation: { phoneNumber: "9999999999" } },
      receiver: { organizationName: draft.payerName || "AETNA" },
      billing: {
        npi: draft.billingNpi || "1999999984",
        employerId: "123456789",
        organizationName: draft.billingProvider || "Demo Clinic",
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
        patientControlNumber: "PCN-AETNA-UI",
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

    // Require Supabase session to ensure claim is persisted and visible on dashboards.
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
      setResult(res.data);

      if (supabase && hasSupabaseEnv) {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const userId = sessionData?.session?.user?.id || null;
          if (userId) {
            await supabase.from("claims").insert({
              user_id: userId,
              patient_name: `${payload.subscriber.firstName} ${payload.subscriber.lastName}`,
              payer_name: payload.receiver.organizationName,
              trading_partner_service_id: payload.tradingPartnerServiceId,
              status: res.data?.status || "submitted",
              claim_charge_amount: Number(payload.claimInformation.claimChargeAmount),
              total_charge: Number(payload.claimInformation.claimChargeAmount),
              service_line_count: payload.claimInformation.serviceLines.length,
              payload,
              stedi_correlation_id: res.data?.claimReference?.correlationId || null,
              stedi_patient_control_number: res.data?.claimReference?.patientControlNumber || null,
            });
          } else {
            setSupabaseNote("Not signed in — claim saved to Stedi; skipped Supabase insert.");
          }
        } catch (e: any) {
          setSupabaseNote(`Saved to Stedi, but Supabase insert failed: ${e?.message || "unknown error"}`);
        }
      }

      // On successful submit, return to dashboard to view the new claim
      router.push("/dashboard");
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
    { id: 1 as StepId, label: "Patient Information" },
    { id: 2 as StepId, label: "Payer & Insurance Details" },
    { id: 3 as StepId, label: "Provider & Facility" },
    { id: 4 as StepId, label: "Diagnoses (ICD-10)" },
    { id: 5 as StepId, label: "Service Lines (CPT/HCPCS)" },
    { id: 6 as StepId, label: "Claim Summary & Submit" },
  ];

  return (
    <main className="min-h-screen bg-[#f6f7f8] text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Step {step} of 6</p>
            <h1 className="text-2xl font-bold text-gray-900">Create Claim From Scratch</h1>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 border border-slate-200 hover:bg-slate-200"
          >
            Back to dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            {steps.map((s) => (
              <button
                key={s.id}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-slate-100 ${
                  step === s.id ? "border border-slate-200 bg-slate-50" : ""
                }`}
                onClick={() => setStep(s.id)}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    step > s.id ? "bg-emerald-100 text-emerald-700" : step === s.id ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {s.id}
                </span>
                <span className="text-sm font-medium text-slate-700">{s.label}</span>
              </button>
            ))}
          </aside>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Patient Information</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormInput label="Patient Name" value={draft.patientName} onChange={(v) => setDraft((p) => ({ ...p, patientName: v }))} />
                  <FormInput label="DOB" value={draft.dob} onChange={(v) => setDraft((p) => ({ ...p, dob: v }))} placeholder="YYYY-MM-DD" />
                  <FormInput label="Member ID" value={draft.memberId} onChange={(v) => setDraft((p) => ({ ...p, memberId: v }))} />
                  <FormInput label="MRN (optional)" value="MRN-TEST-001" onChange={() => {}} placeholder="MRN" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Payer & Insurance</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormInput label="Payer" value={draft.payerName} onChange={(v) => setDraft((p) => ({ ...p, payerName: v }))} />
                  <FormInput label="Plan Type" value="PPO" onChange={() => {}} />
                  <FormInput label="Policy Number" value={draft.policyNumber} onChange={(v) => setDraft((p) => ({ ...p, policyNumber: v }))} />
                  <FormInput label="Group Number" value={draft.groupNumber} onChange={(v) => setDraft((p) => ({ ...p, groupNumber: v }))} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Provider & Facility</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormInput label="Billing Provider" value={draft.billingProvider} onChange={(v) => setDraft((p) => ({ ...p, billingProvider: v }))} />
                  <FormInput label="Billing NPI" value={draft.billingNpi} onChange={(v) => setDraft((p) => ({ ...p, billingNpi: v }))} />
                  <FormInput label="Rendering Provider" value="Dr. Demo" onChange={() => {}} />
                  <FormInput label="POS" value={draft.posCode} onChange={(v) => setDraft((p) => ({ ...p, posCode: v }))} />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">Diagnoses (ICD-10)</h3>
                <p className="text-sm text-gray-600">Prefilled for testing: M54.2 (Cervicalgia).</p>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
                  Diagnosis: ABK / M542
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">Service Lines (CPT/HCPCS)</h3>
                <div className="space-y-3">
                  {draft.serviceLines.map((line, idx) => (
                    <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                      <div className="flex justify-between text-sm font-semibold text-slate-800">
                        <span>{line.code}</span>
                        <span>${line.charge.toFixed(2)}</span>
                      </div>
                      <p className="text-slate-600">{line.description}</p>
                      <p className="text-slate-500 text-xs">
                        DOS {line.from} — Modifiers: {line.modifiers.join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Claim Summary</h3>
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Test mode: prefilled so you can click through. Update patient/member/dates before production.
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm text-gray-800">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="font-semibold text-gray-900 mb-2">Patient & Insurance</p>
                    <p>Patient: {summary.subscriber.firstName} {summary.subscriber.lastName}</p>
                    <p>DOB: {summary.subscriber.dateOfBirth}</p>
                    <p>Member ID: {summary.subscriber.memberId}</p>
                    <p>Payer: {summary.receiver.organizationName}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="font-semibold text-gray-900 mb-2">Provider & Charge</p>
                    <p>Billing: {summary.billing.organizationName}</p>
                    <p>NPI: {summary.billing.npi}</p>
                    <p>POS: {summary.claimInformation.placeOfServiceCode}</p>
                    <p>Charge: ${summary.claimInformation.claimChargeAmount}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-gray-800 max-h-64 overflow-auto">
                  <p className="font-semibold text-gray-900 mb-2">Payload preview</p>
                  <pre>{JSON.stringify(summary, null, 2)}</pre>
                </div>
                {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</p>}
                {supabaseNote && <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">{supabaseNote}</p>}
                {result && (
                  <pre className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="sticky bottom-0 border-t border-slate-200 bg-white/80 backdrop-blur-sm shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <button
            onClick={() => setStep((s) => (s > 1 ? ((s - 1) as StepId) : s))}
            className="rounded-lg px-5 py-2.5 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-100"
            disabled={loading}
          >
            Back
          </button>
          <button
            onClick={() => {
              if (step < 6) setStep((s) => ((s + 1) as StepId));
              else void handleSubmit();
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#137fec] px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-[#0f6acc]"
            disabled={loading}
          >
            <span>{loading ? "Submitting..." : step < 6 ? "Next" : "Create Claim"}</span>
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
      </footer>
    </main>
  );
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-base font-medium text-[#111418]">{label}</span>
      <input
        className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-[#137fec] focus:outline-0 focus:ring-2 focus:ring-[#137fec]/20"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
