"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, hasSupabaseEnv } from "@/lib/supabaseClient";
import { submitClaim } from "@/lib/stediClient";

export default function NewClaimPage() {
  const router = useRouter();
  const [patientName, setPatientName] = useState("JANE DOE");
  const [dob, setDob] = useState("1970-01-01");
  const [memberId, setMemberId] = useState("AETNA12345");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const buildPayload = () => {
    const nameParts = (patientName || "").trim().split(/\s+/);
    const firstName = nameParts[0] || "JANE";
    const lastName = nameParts.slice(1).join(" ") || "DOE";
    return {
      controlNumber: "CLM-AETNA-UI",
      tradingPartnerServiceId: "60054",
      usageIndicator: "T",
      submitter: { organizationName: "Demo Clinic", contactInformation: { phoneNumber: "9999999999" } },
      receiver: { organizationName: "AETNA" },
      billing: {
        npi: "1999999984",
        employerId: "123456789",
        organizationName: "Demo Clinic",
        address: { address1: "123 Main St", city: "Nashville", state: "TN", postalCode: "37201" },
      },
      subscriber: {
        memberId: memberId || "AETNA12345",
        firstName,
        lastName,
        dateOfBirth: (dob || "1970-01-01").replace(/-/g, ""),
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
        claimChargeAmount: "240.00",
        placeOfServiceCode: "11",
        healthCareCodeInformation: [{ diagnosisTypeCode: "ABK", diagnosisCode: "M542" }],
        serviceLines: [
          {
            assignedNumber: "1",
            professionalService: {
              procedureIdentifier: "HC",
              procedureCode: "99213",
              procedureModifiers: ["25"],
              lineItemChargeAmount: "180.00",
              measurementUnit: "UN",
              serviceUnitCount: "1",
              compositeDiagnosisCodePointers: [["1"]],
            },
            serviceDate: "20250105",
          },
          {
            assignedNumber: "2",
            professionalService: {
              procedureIdentifier: "HC",
              procedureCode: "97110",
              procedureModifiers: ["GP"],
              lineItemChargeAmount: "60.00",
              measurementUnit: "UN",
              serviceUnitCount: "1",
              compositeDiagnosisCodePointers: [["1"]],
            },
            serviceDate: "20250105",
          },
        ],
      },
    };
  };

  const handleSubmit = async () => {
    if (!patientName || !dob || !memberId) {
      setError("Patient name, DOB, and Member ID are required.");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
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
            setError("Not signed in — claim saved to Stedi but not persisted to Supabase.");
          }
        } catch (e: any) {
          setError(`Saved to Stedi, but Supabase insert failed: ${e?.message || "unknown error"}`);
        }
      }
    } catch (err: any) {
      const friendly = err?.data?.message || err?.message || "Submit failed. Please adjust test data and retry.";
      setError(friendly);
      setResult(err?.data);
    } finally {
      setSubmitting(false);
    }
  };

  const summary = buildPayload();

  return (
    <main className="min-h-screen bg-[#f6f7f8] text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Step {step} of 4</p>
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
                onClick={() => setStep(s.id as Steps)}
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
                  <FormInput label="Patient Name" value={patientName} onChange={setPatientName} placeholder="Enter patient name" />
                  <FormInput label="DOB" value={dob} onChange={setDob} placeholder="YYYY-MM-DD" />
                  <FormInput label="Member ID" value={memberId} onChange={setMemberId} placeholder="Enter member ID" />
                  <FormInput label="MRN (optional)" value="MRN-TEST-001" onChange={() => {}} placeholder="MRN" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Payer & Insurance</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormInput label="Payer" value="Aetna" onChange={() => {}} placeholder="Payer" />
                  <FormInput label="Plan Type" value="PPO" onChange={() => {}} placeholder="Plan Type" />
                  <FormInput label="Policy Number" value="POLICY-TEST-001" onChange={() => {}} placeholder="Policy" />
                  <FormInput label="Group Number" value="GRP-TEST-001" onChange={() => {}} placeholder="Group" />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Provider & Facility</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormInput label="Billing Provider" value="Demo Clinic" onChange={() => {}} placeholder="Billing Provider" />
                  <FormInput label="Billing NPI" value="1999999984" onChange={() => {}} placeholder="Billing NPI" />
                  <FormInput label="Rendering Provider" value="Dr. Demo" onChange={() => {}} placeholder="Rendering Provider" />
                  <FormInput label="POS" value="11" onChange={() => {}} placeholder="POS" />
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Claim Summary</h3>
                <p className="text-sm text-gray-600">
                  Test mode: prefilled with safe identifiers. Update before production. Submit goes through Cloud Run proxy (NEXT_PUBLIC_PROXY_URL).
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm text-gray-800">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="font-semibold text-gray-900 mb-2">Patient & Insurance</p>
                    <p>Patient: {summaryPayload.subscriber.firstName} {summaryPayload.subscriber.lastName}</p>
                    <p>DOB: {summaryPayload.subscriber.dateOfBirth}</p>
                    <p>Member ID: {summaryPayload.subscriber.memberId}</p>
                    <p>Payer: {summaryPayload.receiver.organizationName}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="font-semibold text-gray-900 mb-2">Provider & Charge</p>
                    <p>Billing: {summaryPayload.billing.organizationName}</p>
                    <p>NPI: {summaryPayload.billing.npi}</p>
                    <p>POS: {summaryPayload.claimInformation.placeOfServiceCode}</p>
                    <p>Charge: ${summaryPayload.claimInformation.claimChargeAmount}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-gray-800">
                  <p className="font-semibold text-gray-900 mb-2">Payload preview</p>
                  <pre className="max-h-64 overflow-auto">{JSON.stringify(summaryPayload, null, 2)}</pre>
                </div>
                {submitError && <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">{submitError}</p>}
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
            onClick={() => setStep((s) => Math.max(1, (s - 1) as Steps))}
            className="rounded-lg px-5 py-2.5 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-100"
            disabled={submitting}
          >
            Back
          </button>
          <button
            onClick={() => {
              if (step < 6) setStep((s) => (s + 1) as Steps);
              else handleSubmit();
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#137fec] px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-[#0f6acc]"
            disabled={submitting}
          >
            <span>{submitting ? "Submitting..." : step < 6 ? "Next" : "Create Claim"}</span>
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
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, hasSupabaseEnv } from "@/lib/supabaseClient";
import { submitClaim } from "@/lib/stediClient";

type Steps = 1 | 2 | 3 | 6;

export default function NewClaimPage() {
  const router = useRouter();
  const [step, setStep] = useState<Steps>(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [draft, setDraft] = useState({
    patientName: "JANE DOE",
    dob: "1970-01-01",
    memberId: "AETNA12345",
  });

  useEffect(() => {
    scrollRef.current && (scrollRef.current.scrollTop = 0);
  }, [step]);

  const steps = [
    { id: 1, label: "Patient Information" },
    { id: 2, label: "Payer & Insurance Details" },
    { id: 3, label: "Provider & Facility" },
    { id: 6, label: "Claim Summary & Submit" },
  ];

  const buildPayload = () => {
    const nameParts = (draft.patientName || "").trim().split(/\s+/);
    const firstName = nameParts[0] || "JANE";
    const lastName = nameParts.slice(1).join(" ") || "DOE";
    const dob = (draft.dob || "1970-01-01").replace(/-/g, "");
    const memberId = draft.memberId || "AETNA12345";

    return {
      controlNumber: "CLM-AETNA-UI",
      tradingPartnerServiceId: "60054",
      usageIndicator: "T",
      submitter: { organizationName: "Demo Clinic", contactInformation: { phoneNumber: "9999999999" } },
      receiver: { organizationName: "AETNA" },
      billing: {
        npi: "1999999984",
        employerId: "123456789",
        organizationName: "Demo Clinic",
        address: { address1: "123 Main St", city: "Nashville", state: "TN", postalCode: "37201" },
      },
      subscriber: {
        memberId,
        firstName,
        lastName,
        dateOfBirth: dob,
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
        claimChargeAmount: "240.00",
        placeOfServiceCode: "11",
        healthCareCodeInformation: [{ diagnosisTypeCode: "ABK", diagnosisCode: "M542" }],
        serviceLines: [
          {
            assignedNumber: "1",
            professionalService: {
              procedureIdentifier: "HC",
              procedureCode: "99213",
              procedureModifiers: ["25"],
              lineItemChargeAmount: "180.00",
              measurementUnit: "UN",
              serviceUnitCount: "1",
              compositeDiagnosisCodePointers: [["1"]],
            },
            serviceDate: "20250105",
          },
          {
            assignedNumber: "2",
            professionalService: {
              procedureIdentifier: "HC",
              procedureCode: "97110",
              procedureModifiers: ["GP"],
              lineItemChargeAmount: "60.00",
              measurementUnit: "UN",
              serviceUnitCount: "1",
              compositeDiagnosisCodePointers: [["1"]],
            },
            serviceDate: "20250105",
          },
        ],
      },
    };
  };

  const handleSubmit = async () => {
    const payload = buildPayload();
    if (!draft.patientName || !draft.dob || !draft.memberId) {
      setSubmitError("Patient name, DOB, and Member ID are required.");
      return;
    }
    try {
      setSubmitting(true);
      setSubmitError(null);
      setSubmitResult(null);
      const res = await submitClaim(payload);
      setSubmitResult(res.data);
      if (supabase && hasSupabaseEnv) {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const userId = sessionData?.session?.user?.id || null;
          if (userId) {
            await supabase.from("claims").insert({
              user_id: userId,
              patient_name: draft.patientName,
              payer_name: payload.receiver?.organizationName || null,
              trading_partner_service_id: payload.tradingPartnerServiceId,
              status: res.data?.status || null,
              claim_charge_amount: Number(payload.claimInformation?.claimChargeAmount) || null,
              total_charge: Number(payload.claimInformation?.claimChargeAmount) || null,
              service_line_count: payload.claimInformation?.serviceLines?.length || null,
              payload,
              stedi_correlation_id: res.data?.claimReference?.correlationId || null,
              stedi_patient_control_number: res.data?.claimReference?.patientControlNumber || null,
            });
          } else {
            setSubmitError("Not signed in — claim saved to Stedi but not persisted to Supabase.");
          }
        } catch (e: any) {
          setSubmitError(`Saved to Stedi, but Supabase insert failed: ${e?.message || "unknown error"}`);
        }
      }
      setStep(6);
    } catch (err: any) {
      const friendly = err?.data?.message || err?.message || "Submit failed. Please try again or adjust the test data.";
      setSubmitError(friendly);
      setSubmitResult(err?.data);
    } finally {
      setSubmitting(false);
    }
  };

  const summaryPayload = buildPayload();

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto bg-[#f6f7f8] text-slate-900 min-h-screen">
      <div className="relative flex min-h-full w-full flex-col">
        <header className="sticky top-0 z-20 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4 text-gray-900">
              <span className="material-symbols-outlined text-primary text-3xl">spark</span>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Clinix AI</p>
                <p className="text-lg font-bold">Create Claim From Scratch</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 border border-slate-200 hover:bg-slate-200"
            >
              Back to dashboard
            </button>
          </div>
        </header>

        <main className="flex-grow">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
              {/* Sidebar */}
              <aside className="lg:col-span-3">
                <div className="sticky top-28 py-2">
                  <div className="flex flex-col gap-1 rounded-xl bg-white p-6 shadow-sm border border-slate-200">
                    {steps.map((s) => {
                      const isActive = step === s.id;
                      const isCompleted = step > s.id;
                      let containerClass = "flex items-center gap-4 rounded-lg px-4 py-3 transition-colors duration-200";
                      let iconClass = "material-symbols-outlined text-lg";
                      let textClass = "text-base font-medium";
                      if (isActive) {
                        containerClass += " border border-primary bg-primary/5 text-primary transition-all";
                        iconClass += " !fill-1 font-bold text-primary";
                        textClass = "text-base font-semibold";
                      } else if (isCompleted) {
                        containerClass += " text-gray-600 hover:bg-gray-50";
                        iconClass += " text-green-500 !fill-1";
                      } else {
                        containerClass += " text-gray-600 hover:bg-gray-50";
                      }
                      const iconName = isCompleted ? "check_circle" : s.id === 1 ? "looks_one" : s.id === 2 ? "looks_two" : s.id === 3 ? "looks_3" : "looks_6";
                      return (
                        <div key={s.id} className={containerClass} onClick={() => setStep(s.id as Steps)}>
                          <span className={iconClass}>{iconName}</span>
                          <p className={textClass}>{s.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </aside>

              {/* Main Form */}
              <div className="lg:col-span-9">
                <div className="relative rounded-xl bg-white p-8 shadow-sm border border-slate-200">
                  {step === 1 && (
                    <div className="space-y-8 animate-in fade-in">
                      <h3 className="text-2xl font-bold text-[#111418]">Patient Information</h3>
                      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className="flex flex-col">
                            <p className="pb-2 text-base font-medium text-[#111418]">Patient Name</p>
                            <div className="relative flex w-full flex-1 items-stretch">
                              <input
                                className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20"
                                placeholder="Search by name"
                                value={draft.patientName}
                                onChange={(e) => setDraft((prev) => ({ ...prev, patientName: e.target.value }))}
                              />
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-[#617589]">
                                <span className="material-symbols-outlined">search</span>
                              </div>
                            </div>
                            <p className="pt-2 text-sm text-gray-500">Start typing to find an existing patient or create a new one.</p>
                          </label>
                        </div>
                        <div>
                          <label className="flex flex-col">
                            <p className="pb-2 text-base font-medium text-[#111418]">Date of Birth (DOB)</p>
                            <div className="relative flex w-full flex-1 items-stretch">
                              <input
                                className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20"
                                placeholder="MM/DD/YYYY"
                                type="date"
                                value={draft.dob}
                                onChange={(e) => setDraft((prev) => ({ ...prev, dob: e.target.value }))}
                              />
                            </div>
                          </label>
                        </div>
                        <div>
                          <label className="flex flex-col">
                            <p className="pb-2 text-base font-medium text-[#111418]">MRN / Patient ID</p>
                            <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Enter Patient ID" defaultValue="MRN-TEST-001" />
                          </label>
                        </div>
                        <div>
                          <label className="flex flex-col">
                            <p className="pb-2 text-base font-medium text-[#111418]">Gender <span className="text-gray-400">(Optional)</span></p>
                            <select className="form-select block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" defaultValue="Female">
                              <option>Select Gender</option>
                              <option>Male</option>
                              <option>Female</option>
                              <option>Other</option>
                            </select>
                          </label>
                        </div>
                        <div>
                          <label className="flex flex-col">
                            <p className="pb-2 text-base font-medium text-[#111418]">Relationship to Subscriber</p>
                            <select className="form-select block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" defaultValue="Self">
                              <option>Self</option>
                              <option>Spouse</option>
                              <option>Child</option>
                              <option>Other</option>
                            </select>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-8 animate-in fade-in">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-[#111418]">Payer & Insurance Details</h3>
                        <p className="text-base text-gray-600">Enter insurance plan information for this claim.</p>
                      </div>
                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-[#111418]">Primary Payer Information</h4>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Payer Name</span>
                              <div className="relative">
                                <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                                <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white pl-11 pr-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Search for a payer..." defaultValue="Aetna" />
                              </div>
                            </label>
                          </div>
                          <div>
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Plan Type</span>
                              <select className="form-select block h-12 w-full appearance-none rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20">
                                <option>PPO</option>
                                <option>HMO</option>
                                <option>Medicare</option>
                              </select>
                            </label>
                          </div>
                          <div>
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Policy Number</span>
                              <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Enter policy number" defaultValue="POLICY-TEST-001" />
                            </label>
                          </div>
                          <div>
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Subscriber ID</span>
                              <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Enter subscriber ID" value={draft.memberId} onChange={(e) => setDraft((prev) => ({ ...prev, memberId: e.target.value }))} />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-12 animate-in fade-in">
                      <div className="space-y-2">
                        <h3 className="col-span-full text-2xl font-bold text-[#111418]">Provider & Facility</h3>
                        <p className="text-base text-gray-600">These details determine who is billing for the service and where the patient was treated.</p>
                      </div>
                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-[#111418]">Provider Information</h4>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Billing Provider</span>
                              <div className="relative">
                                <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                                <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white pl-11 pr-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Search by name or NPI" defaultValue="Demo Clinic" />
                              </div>
                            </label>
                          </div>
                          <div>
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">NPI</span>
                              <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Auto-populated" defaultValue="1999999984" />
                            </label>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Rendering Provider</span>
                              <div className="relative">
                                <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                                <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white pl-11 pr-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Search for a provider" defaultValue="Dr. Demo" />
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-[#111418]">Facility / Place of Service</h4>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Facility Name <span className="text-gray-400">(Optional)</span></span>
                              <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Enter facility name" defaultValue="Demo Clinic Facility" />
                            </label>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Place of Service (POS Code)</span>
                              <select className="form-select block h-12 w-full appearance-none rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" defaultValue="11 - Office">
                                <option>11 - Office</option>
                                <option>22 - Hospital Outpatient</option>
                                <option>21 - Hospital Inpatient</option>
                              </select>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 6 && (
                    <div className="space-y-8 animate-in fade-in">
                      <div className="space-y-2">
                        <h3 className="col-span-full text-2xl font-bold text-[#111418]">Claim Summary</h3>
                        <p className="text-base text-gray-600">
                          Submit to Stedi via the Cloud Run proxy (uses NEXT_PUBLIC_PROXY_URL). Currently prefilled with test identifiers for safe click-through; replace with real data before production.
                        </p>
                      </div>
                      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Test mode: form is prefilled so you can click through. Update patient, member ID, and dates with real values before live use.
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-gray-800">Patient & Insurance</h4>
                          </div>
                          <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 text-sm text-gray-700">
                            <div>
                              <p className="text-gray-500">Patient</p>
                              <p className="font-medium text-gray-900">
                                {summaryPayload.subscriber.firstName} {summaryPayload.subscriber.lastName}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">DOB</p>
                              <p className="font-medium text-gray-900">{summaryPayload.subscriber.dateOfBirth}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Member ID</p>
                              <p className="font-medium font-mono text-gray-900">{summaryPayload.subscriber.memberId}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Payer</p>
                              <p className="font-medium text-gray-900">{summaryPayload.receiver.organizationName}</p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-gray-800">Provider & Facility</h4>
                          </div>
                          <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 text-sm text-gray-700">
                            <div>
                              <p className="text-gray-500">Billing Provider</p>
                              <p className="font-medium text-gray-900">{summaryPayload.billing.organizationName}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Billing NPI</p>
                              <p className="font-medium font-mono text-gray-900">{summaryPayload.billing.npi}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">POS</p>
                              <p className="font-medium text-gray-900">{summaryPayload.claimInformation.placeOfServiceCode}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Charge</p>
                              <p className="font-medium text-gray-900">${summaryPayload.claimInformation.claimChargeAmount}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-gray-800">Diagnoses (ICD-10)</h4>
                          </div>
                          <ul className="mt-3 space-y-2 text-sm text-gray-800">
                            {summaryPayload.claimInformation.healthCareCodeInformation.map((d: any, idx: number) => (
                              <li key={idx} className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-primary">check</span>
                                <span className="font-mono font-semibold">{d.diagnosisCode}</span>
                                <span className="text-gray-500">({d.diagnosisTypeCode})</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-gray-800">Service Lines (CPT/HCPCS)</h4>
                          </div>
                          <ul className="mt-3 space-y-2 text-sm text-gray-800">
                            {summaryPayload.claimInformation.serviceLines.map((s: any, idx: number) => (
                              <li key={idx} className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-primary">medical_services</span>
                                <span className="font-mono font-semibold">{s.professionalService.procedureCode}</span>
                                <span className="text-gray-500">({s.professionalService.lineItemChargeAmount})</span>
                                <span className="text-gray-500">DOS {s.serviceDate}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      {submitError && (
                        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                          {submitError}
                        </div>
                      )}
                      {submitResult && (
                        <pre className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 overflow-x-auto">
                          {JSON.stringify(submitResult, null, 2)}
                        </pre>
                      )}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-gray-600">
                          <p className="font-semibold text-gray-900">Next steps</p>
                          <p>We’ll capture correlationId/rhclaimNumber on success.</p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setStep((s) => Math.max(1, (s - 1) as Steps))}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                            disabled={submitting}
                          >
                            Back
                          </button>
                          <button
                            onClick={handleSubmit}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-70"
                            disabled={submitting}
                          >
                            {submitting ? "Submitting…" : "Create & Submit"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Sticky Footer */}
        <footer className="sticky bottom-0 z-20 mt-auto w-full border-t border-gray-200 bg-white/80 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setStep((s) => Math.max(1, (s - 1) as Steps))}
              className="rounded-lg px-5 py-2.5 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-100"
              disabled={submitting}
            >
              Back
            </button>
            <button
              onClick={() => {
                if (step < 6) {
                  setStep((s) => (s + 1) as Steps);
                } else {
                  handleSubmit();
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-[#137fec] px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-[#0f6acc]"
              disabled={submitting}
            >
              <span>{submitting ? "Submitting..." : step < 6 ? `Next: ${steps.find((x) => x.id === step + 1)?.label || ""}` : "Create Claim"}</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
          {submitError && (
            <div className="mx-auto mt-3 max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="rounded-lg border border-rose-500/50 bg-rose-50 px-4 py-2 text-sm text-rose-700">{submitError}</p>
            </div>
          )}
          {submitResult && (
            <div className="mx-auto mt-3 max-w-7xl px-4 sm:px-6 lg:px-8">
              <pre className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 overflow-x-auto">
                {JSON.stringify(submitResult, null, 2)}
              </pre>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, hasSupabaseEnv } from "@/lib/supabaseClient";
import { submitClaim } from "@/lib/stediClient";

type Steps = 1 | 2 | 3 | 6;

export default function NewClaimPage() {
  const router = useRouter();
  const [step, setStep] = useState<Steps>(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [draft, setDraft] = useState({
    patientName: "JANE DOE",
    dob: "1970-01-01",
    memberId: "AETNA12345",
  });

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [step]);

  const steps = [
    { id: 1, label: "Patient Information" },
    { id: 2, label: "Payer & Insurance Details" },
    { id: 3, label: "Provider & Facility" },
    { id: 6, label: "Claim Summary & Submit" },
  ];

  const buildPayload = () => {
    const nameParts = (draft.patientName || "").trim().split(/\s+/);
    const firstName = nameParts[0] || "JANE";
    const lastName = nameParts.slice(1).join(" ") || "DOE";
    const dob = (draft.dob || "1970-01-01").replace(/-/g, "");
    const memberId = draft.memberId || "AETNA12345";

    return {
      controlNumber: "CLM-AETNA-UI",
      tradingPartnerServiceId: "60054",
      usageIndicator: "T",
      submitter: { organizationName: "Demo Clinic", contactInformation: { phoneNumber: "9999999999" } },
      receiver: { organizationName: "AETNA" },
      billing: {
        npi: "1999999984",
        employerId: "123456789",
        organizationName: "Demo Clinic",
        address: { address1: "123 Main St", city: "Nashville", state: "TN", postalCode: "37201" },
      },
      subscriber: {
        memberId,
        firstName,
        lastName,
        dateOfBirth: dob,
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
        claimChargeAmount: "240.00",
        placeOfServiceCode: "11",
        healthCareCodeInformation: [{ diagnosisTypeCode: "ABK", diagnosisCode: "M542" }],
        serviceLines: [
          {
            assignedNumber: "1",
            professionalService: {
              procedureIdentifier: "HC",
              procedureCode: "99213",
              procedureModifiers: ["25"],
              lineItemChargeAmount: "180.00",
              measurementUnit: "UN",
              serviceUnitCount: "1",
              compositeDiagnosisCodePointers: [["1"]],
            },
            serviceDate: "20250105",
          },
          {
            assignedNumber: "2",
            professionalService: {
              procedureIdentifier: "HC",
              procedureCode: "97110",
              procedureModifiers: ["GP"],
              lineItemChargeAmount: "60.00",
              measurementUnit: "UN",
              serviceUnitCount: "1",
              compositeDiagnosisCodePointers: [["1"]],
            },
            serviceDate: "20250105",
          },
        ],
      },
    };
  };

  const handleSubmit = async () => {
    const payload = buildPayload();
    if (!draft.patientName || !draft.dob || !draft.memberId) {
      setSubmitError("Patient name, DOB, and Member ID are required.");
      return;
    }
    try {
      setSubmitting(true);
      setSubmitError(null);
      setSubmitResult(null);
      const res = await submitClaim(payload);
      setSubmitResult(res.data);
      if (supabase && hasSupabaseEnv) {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const userId = sessionData?.session?.user?.id || null;
          if (userId) {
            await supabase.from("claims").insert({
              user_id: userId,
              patient_name: draft.patientName,
              payer_name: payload.receiver?.organizationName || null,
              trading_partner_service_id: payload.tradingPartnerServiceId,
              status: res.data?.status || null,
              claim_charge_amount: Number(payload.claimInformation?.claimChargeAmount) || null,
              total_charge: Number(payload.claimInformation?.claimChargeAmount) || null,
              service_line_count: payload.claimInformation?.serviceLines?.length || null,
              payload,
              stedi_correlation_id: res.data?.claimReference?.correlationId || null,
              stedi_patient_control_number: res.data?.claimReference?.patientControlNumber || null,
            });
          } else {
            setSubmitError("Not signed in — claim saved to Stedi but not persisted to Supabase.");
          }
        } catch (e: any) {
          setSubmitError(`Saved to Stedi, but Supabase insert failed: ${e?.message || "unknown error"}`);
        }
      }
      setStep(6);
    } catch (err: any) {
      const friendly = err?.data?.message || err?.message || "Submit failed. Please try again or adjust the test data.";
      setSubmitError(friendly);
      setSubmitResult(err?.data);
    } finally {
      setSubmitting(false);
    }
  };

  const summaryPayload = buildPayload();

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto bg-[#f6f7f8] text-slate-900 min-h-screen">
      <div className="relative flex min-h-full w-full flex-col">
        <header className="sticky top-0 z-20 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4 text-gray-900">
              <span className="material-symbols-outlined text-primary text-3xl">spark</span>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Clinix AI</p>
                <p className="text-lg font-bold">Create Claim From Scratch</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 border border-slate-200 hover:bg-slate-200"
            >
              Back to dashboard
            </button>
          </div>
        </header>

        <main className="flex-grow">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
              {/* Sidebar */}
              <aside className="lg:col-span-3">
                <div className="sticky top-28 py-2">
                  <div className="flex flex-col gap-1 rounded-xl bg-white p-6 shadow-sm border border-slate-200">
                    {steps.map((s) => {
                      const isActive = step === s.id;
                      const isCompleted = step > s.id;
                      let containerClass = "flex items-center gap-4 rounded-lg px-4 py-3 transition-colors duration-200";
                      let iconClass = "material-symbols-outlined text-lg";
                      let textClass = "text-base font-medium";
                      if (isActive) {
                        containerClass += " border border-primary bg-primary/5 text-primary transition-all";
                        iconClass += " !fill-1 font-bold text-primary";
                        textClass = "text-base font-semibold";
                      } else if (isCompleted) {
                        containerClass += " text-gray-600 hover:bg-gray-50";
                        iconClass += " text-green-500 !fill-1";
                      } else {
                        containerClass += " text-gray-600 hover:bg-gray-50";
                      }
                      const iconName = isCompleted ? "check_circle" : s.id === 1 ? "looks_one" : s.id === 2 ? "looks_two" : s.id === 3 ? "looks_3" : "looks_6";
                      return (
                        <div key={s.id} className={containerClass} onClick={() => setStep(s.id as Steps)}>
                          <span className={iconClass}>{iconName}</span>
                          <p className={textClass}>{s.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </aside>

              {/* Main Form */}
              <div className="lg:col-span-9">
                <div className="relative rounded-xl bg-white p-8 shadow-sm border border-slate-200">
                  {step === 1 && (
                    <div className="space-y-8 animate-in fade-in">
                      <h3 className="text-2xl font-bold text-[#111418]">Patient Information</h3>
                      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className="flex flex-col">
                            <p className="pb-2 text-base font-medium text-[#111418]">Patient Name</p>
                            <div className="relative flex w-full flex-1 items-stretch">
                              <input
                                className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20"
                                placeholder="Search by name"
                                value={draft.patientName}
                                onChange={(e) => setDraft((prev) => ({ ...prev, patientName: e.target.value }))}
                              />
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-[#617589]">
                                <span className="material-symbols-outlined">search</span>
                              </div>
                            </div>
                            <p className="pt-2 text-sm text-gray-500">Start typing to find an existing patient or create a new one.</p>
                          </label>
                        </div>
                        <div>
                          <label className="flex flex-col">
                            <p className="pb-2 text-base font-medium text-[#111418]">Date of Birth (DOB)</p>
                            <div className="relative flex w-full flex-1 items-stretch">
                              <input
                                className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20"
                                placeholder="MM/DD/YYYY"
                                type="date"
                                value={draft.dob}
                                onChange={(e) => setDraft((prev) => ({ ...prev, dob: e.target.value }))}
                              />
                            </div>
                          </label>
                        </div>
                        <div>
                          <label className="flex flex-col">
                            <p className="pb-2 text-base font-medium text-[#111418]">MRN / Patient ID</p>
                            <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Enter Patient ID" defaultValue="MRN-TEST-001" />
                          </label>
                        </div>
                        <div>
                          <label className="flex flex-col">
                            <p className="pb-2 text-base font-medium text-[#111418]">Gender <span className="text-gray-400">(Optional)</span></p>
                            <select className="form-select block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" defaultValue="Female">
                              <option>Select Gender</option>
                              <option>Male</option>
                              <option>Female</option>
                              <option>Other</option>
                            </select>
                          </label>
                        </div>
                        <div>
                          <label className="flex flex-col">
                            <p className="pb-2 text-base font-medium text-[#111418]">Relationship to Subscriber</p>
                            <select className="form-select block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" defaultValue="Self">
                              <option>Self</option>
                              <option>Spouse</option>
                              <option>Child</option>
                              <option>Other</option>
                            </select>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-8 animate-in fade-in">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-[#111418]">Payer & Insurance Details</h3>
                        <p className="text-base text-gray-600">Enter insurance plan information for this claim.</p>
                      </div>
                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-[#111418]">Primary Payer Information</h4>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Payer Name</span>
                              <div className="relative">
                                <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                                <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white pl-11 pr-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Search for a payer..." defaultValue="Aetna" />
                              </div>
                            </label>
                          </div>
                          <div>
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Plan Type</span>
                              <select className="form-select block h-12 w-full appearance-none rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20">
                                <option>PPO</option>
                                <option>HMO</option>
                                <option>Medicare</option>
                              </select>
                            </label>
                          </div>
                          <div>
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Policy Number</span>
                              <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Enter policy number" defaultValue="POLICY-TEST-001" />
                            </label>
                          </div>
                          <div>
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Subscriber ID</span>
                              <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Enter subscriber ID" value={draft.memberId} onChange={(e) => setDraft((prev) => ({ ...prev, memberId: e.target.value }))} />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-12 animate-in fade-in">
                      <div className="space-y-2">
                        <h3 className="col-span-full text-2xl font-bold text-[#111418]">Provider & Facility</h3>
                        <p className="text-base text-gray-600">These details determine who is billing for the service and where the patient was treated.</p>
                      </div>
                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-[#111418]">Provider Information</h4>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Billing Provider</span>
                              <div className="relative">
                                <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                                <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white pl-11 pr-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Search by name or NPI" defaultValue="Demo Clinic" />
                              </div>
                            </label>
                          </div>
                          <div>
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">NPI</span>
                              <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Auto-populated" defaultValue="1999999984" />
                            </label>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Rendering Provider</span>
                              <div className="relative">
                                <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                                <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white pl-11 pr-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Search for a provider" defaultValue="Dr. Demo" />
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-[#111418]">Facility / Place of Service</h4>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Facility Name <span className="text-gray-400">(Optional)</span></span>
                              <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Enter facility name" defaultValue="Demo Clinic Facility" />
                            </label>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Place of Service (POS Code)</span>
                              <select className="form-select block h-12 w-full appearance-none rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" defaultValue="11 - Office">
                                <option>11 - Office</option>
                                <option>22 - Hospital Outpatient</option>
                                <option>21 - Hospital Inpatient</option>
                              </select>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 6 && (
                    <div className="space-y-8 animate-in fade-in">
                      <div className="space-y-2">
                        <h3 className="col-span-full text-2xl font-bold text-[#111418]">Claim Summary</h3>
                        <p className="text-base text-gray-600">
                          Submit to Stedi via the Cloud Run proxy (uses NEXT_PUBLIC_PROXY_URL). Currently prefilled with test identifiers for safe click-through; replace with real data before production.
                        </p>
                      </div>
                      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Test mode: form is prefilled so you can click through. Update patient, member ID, and dates with real values before live use.
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-gray-800">Patient & Insurance</h4>
                          </div>
                          <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 text-sm text-gray-700">
                            <div>
                              <p className="text-gray-500">Patient</p>
                              <p className="font-medium text-gray-900">
                                {summaryPayload.subscriber.firstName} {summaryPayload.subscriber.lastName}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">DOB</p>
                              <p className="font-medium text-gray-900">{summaryPayload.subscriber.dateOfBirth}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Member ID</p>
                              <p className="font-medium font-mono text-gray-900">{summaryPayload.subscriber.memberId}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Payer</p>
                              <p className="font-medium text-gray-900">{summaryPayload.receiver.organizationName}</p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-gray-800">Provider & Facility</h4>
                          </div>
                          <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 text-sm text-gray-700">
                            <div>
                              <p className="text-gray-500">Billing Provider</p>
                              <p className="font-medium text-gray-900">{summaryPayload.billing.organizationName}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Billing NPI</p>
                              <p className="font-medium font-mono text-gray-900">{summaryPayload.billing.npi}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">POS</p>
                              <p className="font-medium text-gray-900">{summaryPayload.claimInformation.placeOfServiceCode}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Charge</p>
                              <p className="font-medium text-gray-900">${summaryPayload.claimInformation.claimChargeAmount}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-gray-800">Diagnoses (ICD-10)</h4>
                          </div>
                          <ul className="mt-3 space-y-2 text-sm text-gray-800">
                            {summaryPayload.claimInformation.healthCareCodeInformation.map((d: any, idx: number) => (
                              <li key={idx} className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-primary">check</span>
                                <span className="font-mono font-semibold">{d.diagnosisCode}</span>
                                <span className="text-gray-500">({d.diagnosisTypeCode})</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-gray-800">Service Lines (CPT/HCPCS)</h4>
                          </div>
                          <ul className="mt-3 space-y-2 text-sm text-gray-800">
                            {summaryPayload.claimInformation.serviceLines.map((s: any, idx: number) => (
                              <li key={idx} className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-primary">medical_services</span>
                                <span className="font-mono font-semibold">{s.professionalService.procedureCode}</span>
                                <span className="text-gray-500">({s.professionalService.lineItemChargeAmount})</span>
                                <span className="text-gray-500">DOS {s.serviceDate}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      {submitError && (
                        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                          {submitError}
                        </div>
                      )}
                      {submitResult && (
                        <pre className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 overflow-x-auto">
                          {JSON.stringify(submitResult, null, 2)}
                        </pre>
                      )}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-gray-600">
                          <p className="font-semibold text-gray-900">Next steps</p>
                          <p>We’ll capture correlationId/rhclaimNumber on success.</p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setStep((s) => Math.max(1, (s - 1) as Steps))}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                            disabled={submitting}
                          >
                            Back
                          </button>
                          <button
                            onClick={handleSubmit}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-70"
                            disabled={submitting}
                          >
                            {submitting ? "Submitting…" : "Create & Submit"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Sticky Footer */}
        <footer className="sticky bottom-0 z-20 mt-auto w-full border-t border-gray-200 bg-white/80 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setStep((s) => Math.max(1, (s - 1) as Steps))}
              className="rounded-lg px-5 py-2.5 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-100"
              disabled={submitting}
            >
              Back
            </button>
            <button
              onClick={() => {
                if (step < 6) {
                  setStep((s) => (s + 1) as Steps);
                } else {
                  handleSubmit();
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-[#137fec] px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-[#0f6acc]"
              disabled={submitting}
            >
              <span>{submitting ? "Submitting..." : step < 6 ? `Next: ${steps.find((x) => x.id === step + 1)?.label || ""}` : "Create Claim"}</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
          {submitError && (
            <div className="mx-auto mt-3 max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="rounded-lg border border-rose-500/50 bg-rose-50 px-4 py-2 text-sm text-rose-700">{submitError}</p>
            </div>
          )}
          {submitResult && (
            <div className="mx-auto mt-3 max-w-7xl px-4 sm:px-6 lg:px-8">
              <pre className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 overflow-x-auto">
                {JSON.stringify(submitResult, null, 2)}
              </pre>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, hasSupabaseEnv } from "@/lib/supabaseClient";
import { submitClaim } from "@/lib/stediClient";

type Steps = 1 | 2 | 3 | 6;

export default function NewClaimPage() {
  const router = useRouter();
  const [step, setStep] = useState<Steps>(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [draft, setDraft] = useState({
    patientName: "JANE DOE",
    dob: "1970-01-01",
    memberId: "AETNA12345",
  });

  useEffect(() => {
    scrollRef.current && (scrollRef.current.scrollTop = 0);
  }, [step]);

  const steps = [
    { id: 1, label: "Patient Information" },
    { id: 2, label: "Payer & Insurance Details" },
    { id: 3, label: "Provider & Facility" },
    { id: 6, label: "Claim Summary & Submit" },
  ];

  const buildPayload = () => {
    const nameParts = (draft.patientName || "").trim().split(/\s+/);
    const firstName = nameParts[0] || "JANE";
    const lastName = nameParts.slice(1).join(" ") || "DOE";
    const dob = (draft.dob || "1970-01-01").replace(/-/g, "");
    const memberId = draft.memberId || "AETNA12345";

    return {
      controlNumber: "CLM-AETNA-UI",
      tradingPartnerServiceId: "60054",
      usageIndicator: "T",
      submitter: { organizationName: "Demo Clinic", contactInformation: { phoneNumber: "9999999999" } },
      receiver: { organizationName: "AETNA" },
      billing: {
        npi: "1999999984",
        employerId: "123456789",
        organizationName: "Demo Clinic",
        address: { address1: "123 Main St", city: "Nashville", state: "TN", postalCode: "37201" },
      },
      subscriber: {
        memberId,
        firstName,
        lastName,
        dateOfBirth: dob,
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
        claimChargeAmount: "240.00",
        placeOfServiceCode: "11",
        healthCareCodeInformation: [{ diagnosisTypeCode: "ABK", diagnosisCode: "M542" }],
        serviceLines: [
          {
            assignedNumber: "1",
            professionalService: {
              procedureIdentifier: "HC",
              procedureCode: "99213",
              procedureModifiers: ["25"],
              lineItemChargeAmount: "180.00",
              measurementUnit: "UN",
              serviceUnitCount: "1",
              compositeDiagnosisCodePointers: [["1"]],
            },
            serviceDate: "20250105",
          },
          {
            assignedNumber: "2",
            professionalService: {
              procedureIdentifier: "HC",
              procedureCode: "97110",
              procedureModifiers: ["GP"],
              lineItemChargeAmount: "60.00",
              measurementUnit: "UN",
              serviceUnitCount: "1",
              compositeDiagnosisCodePointers: [["1"]],
            },
            serviceDate: "20250105",
          },
        ],
      },
    };
  };

  const handleSubmit = async () => {
    const payload = buildPayload();
    if (!draft.patientName || !draft.dob || !draft.memberId) {
      setSubmitError("Patient name, DOB, and Member ID are required.");
      return;
    }
    try {
      setSubmitting(true);
      setSubmitError(null);
      setSubmitResult(null);
      const res = await submitClaim(payload);
      setSubmitResult(res.data);
      if (supabase && hasSupabaseEnv) {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const userId = sessionData?.session?.user?.id || null;
          if (userId) {
            await supabase.from("claims").insert({
              user_id: userId,
              patient_name: draft.patientName,
              payer_name: payload.receiver?.organizationName || null,
              trading_partner_service_id: payload.tradingPartnerServiceId,
              status: res.data?.status || null,
              claim_charge_amount: Number(payload.claimInformation?.claimChargeAmount) || null,
              total_charge: Number(payload.claimInformation?.claimChargeAmount) || null,
              service_line_count: payload.claimInformation?.serviceLines?.length || null,
              payload,
              stedi_correlation_id: res.data?.claimReference?.correlationId || null,
              stedi_patient_control_number: res.data?.claimReference?.patientControlNumber || null,
            });
          } else {
            setSubmitError("Not signed in — claim saved to Stedi but not persisted to Supabase.");
          }
        } catch (e: any) {
          setSubmitError(`Saved to Stedi, but Supabase insert failed: ${e?.message || "unknown error"}`);
        }
      }
      setStep(6);
    } catch (err: any) {
      const friendly = err?.data?.message || err?.message || "Submit failed. Please try again or adjust the test data.";
      setSubmitError(friendly);
      setSubmitResult(err?.data);
    } finally {
      setSubmitting(false);
    }
  };

  const summaryPayload = buildPayload();

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto bg-[#f6f7f8] text-slate-900 relative h-full min-h-screen">
      <div className="relative flex min-h-full w-full flex-col">
        <header className="sticky top-0 z-20 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4 text-gray-900">
              <span className="material-symbols-outlined text-primary text-3xl">spark</span>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Clinix AI</p>
                <p className="text-lg font-bold">Create Claim From Scratch</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 border border-slate-200 hover:bg-slate-200"
            >
              Back to dashboard
            </button>
          </div>
        </header>

        <main className="flex-grow">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
              {/* Sidebar */}
              <aside className="lg:col-span-3">
                <div className="sticky top-28 py-2">
                  <div className="flex flex-col gap-1 rounded-xl bg-white p-6 shadow-sm border border-slate-200">
                    {steps.map((s) => {
                      const isActive = step === s.id;
                      const isCompleted = step > s.id;
                      let containerClass = "flex items-center gap-4 rounded-lg px-4 py-3 transition-colors duration-200";
                      let iconClass = "material-symbols-outlined text-lg";
                      let textClass = "text-base font-medium";
                      if (isActive) {
                        containerClass += " border border-primary bg-primary/5 text-primary transition-all";
                        iconClass += " !fill-1 font-bold text-primary";
                        textClass = "text-base font-semibold";
                      } else if (isCompleted) {
                        containerClass += " text-gray-600 hover:bg-gray-50";
                        iconClass += " text-green-500 !fill-1";
                      } else {
                        containerClass += " text-gray-600 hover:bg-gray-50";
                      }
                      const iconName = isCompleted ? "check_circle" : s.id === 1 ? "looks_one" : s.id === 2 ? "looks_two" : s.id === 3 ? "looks_3" : "looks_6";
                      return (
                        <div key={s.id} className={containerClass} onClick={() => setStep(s.id as Steps)}>
                          <span className={iconClass}>{iconName}</span>
                          <p className={textClass}>{s.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </aside>

              {/* Main Form */}
              <div className="lg:col-span-9">
                <div className="relative rounded-xl bg-white p-8 shadow-sm border border-slate-200">
                  {step === 1 && (
                    <div className="space-y-8 animate-in fade-in">
                      <h3 className="text-2xl font-bold text-[#111418]">Patient Information</h3>
                      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className="flex flex-col">
                            <p className="pb-2 text-base font-medium text-[#111418]">Patient Name</p>
                            <div className="relative flex w-full flex-1 items-stretch">
                              <input
                                className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20"
                                placeholder="Search by name"
                                value={draft.patientName}
                                onChange={(e) => setDraft((prev) => ({ ...prev, patientName: e.target.value }))}
                              />
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-[#617589]">
                                <span className="material-symbols-outlined">search</span>
                              </div>
                            </div>
                            <p className="pt-2 text-sm text-gray-500">Start typing to find an existing patient or create a new one.</p>
                          </label>
                        </div>
                        <div>
                          <label className="flex flex-col">
                            <p className="pb-2 text-base font-medium text-[#111418]">Date of Birth (DOB)</p>
                            <div className="relative flex w/full flex-1 items-stretch">
                              <input
                                className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20"
                                placeholder="MM/DD/YYYY"
                                type="date"
                                value={draft.dob}
                                onChange={(e) => setDraft((prev) => ({ ...prev, dob: e.target.value }))}
                              />
                            </div>
                          </label>
                        </div>
                        <div>
                          <label className="flex flex-col">
                            <p className="pb-2 text-base font-medium text-[#111418]">MRN / Patient ID</p>
                            <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Enter Patient ID" defaultValue="MRN-TEST-001" />
                          </label>
                        </div>
                        <div>
                          <label className="flex flex-col">
                            <p className="pb-2 text-base font-medium text-[#111418]">Gender <span className="text-gray-400">(Optional)</span></p>
                            <select className="form-select block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" defaultValue="Female">
                              <option>Select Gender</option>
                              <option>Male</option>
                              <option>Female</option>
                              <option>Other</option>
                            </select>
                          </label>
                        </div>
                        <div>
                          <label className="flex flex-col">
                            <p className="pb-2 text-base font-medium text-[#111418]">Relationship to Subscriber</p>
                            <select className="form-select block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" defaultValue="Self">
                              <option>Self</option>
                              <option>Spouse</option>
                              <option>Child</option>
                              <option>Other</option>
                            </select>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-8 animate-in fade-in">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-[#111418]">Payer & Insurance Details</h3>
                        <p className="text-base text-gray-600">Enter insurance plan information for this claim.</p>
                      </div>
                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-[#111418]">Primary Payer Information</h4>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Payer Name</span>
                              <div className="relative">
                                <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                                <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white pl-11 pr-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Search for a payer..." defaultValue="Aetna" />
                              </div>
                            </label>
                          </div>
                          <div>
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Plan Type</span>
                              <select className="form-select block h-12 w-full appearance-none rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20">
                                <option>PPO</option>
                                <option>HMO</option>
                                <option>Medicare</option>
                              </select>
                            </label>
                          </div>
                          <div>
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Policy Number</span>
                              <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Enter policy number" defaultValue="POLICY-TEST-001" />
                            </label>
                          </div>
                          <div>
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Subscriber ID</span>
                              <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Enter subscriber ID" value={draft.memberId} onChange={(e) => setDraft((prev) => ({ ...prev, memberId: e.target.value }))} />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-12 animate-in fade-in">
                      <div className="space-y-2">
                        <h3 className="col-span-full text-2xl font-bold text-[#111418]">Provider & Facility</h3>
                        <p className="text-base text-gray-600">These details determine who is billing for the service and where the patient was treated.</p>
                      </div>
                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-[#111418]">Provider Information</h4>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Billing Provider</span>
                              <div className="relative">
                                <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                                <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white pl-11 pr-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Search by name or NPI" defaultValue="Demo Clinic" />
                              </div>
                            </label>
                          </div>
                          <div>
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">NPI</span>
                              <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Auto-populated" defaultValue="1999999984" />
                            </label>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Rendering Provider</span>
                              <div className="relative">
                                <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                                <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white pl-11 pr-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Search for a provider" defaultValue="Dr. Demo" />
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-[#111418]">Facility / Place of Service</h4>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Facility Name <span className="text-gray-400">(Optional)</span></span>
                              <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Enter facility name" defaultValue="Demo Clinic Facility" />
                            </label>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Place of Service (POS Code)</span>
                              <select className="form-select block h-12 w-full appearance-none rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" defaultValue="11 - Office">
                                <option>11 - Office</option>
                                <option>22 - Hospital Outpatient</option>
                                <option>21 - Hospital Inpatient</option>
                              </select>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 6 && (
                    <div className="space-y-8 animate-in fade-in">
                      <div className="space-y-2">
                        <h3 className="col-span-full text-2xl font-bold text-[#111418]">Claim Summary</h3>
                        <p className="text-base text-gray-600">
                          Submit to Stedi via the Cloud Run proxy (uses NEXT_PUBLIC_PROXY_URL). Currently prefilled with test identifiers for safe click-through; replace with real data before production.
                        </p>
                      </div>
                      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Test mode: form is prefilled so you can click through. Update patient, member ID, and dates with real values before live use.
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-gray-800">Patient & Insurance</h4>
                          </div>
                          <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 text-sm text-gray-700">
                            <div>
                              <p className="text-gray-500">Patient</p>
                              <p className="font-medium text-gray-900">
                                {summaryPayload.subscriber.firstName} {summaryPayload.subscriber.lastName}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">DOB</p>
                              <p className="font-medium text-gray-900">{summaryPayload.subscriber.dateOfBirth}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Member ID</p>
                              <p className="font-medium font-mono text-gray-900">{summaryPayload.subscriber.memberId}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Payer</p>
                              <p className="font-medium text-gray-900">{summaryPayload.receiver.organizationName}</p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-gray-800">Provider & Facility</h4>
                          </div>
                          <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 text-sm text-gray-700">
                            <div>
                              <p className="text-gray-500">Billing Provider</p>
                              <p className="font-medium text-gray-900">{summaryPayload.billing.organizationName}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Billing NPI</p>
                              <p className="font-medium font-mono text-gray-900">{summaryPayload.billing.npi}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">POS</p>
                              <p className="font-medium text-gray-900">{summaryPayload.claimInformation.placeOfServiceCode}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Charge</p>
                              <p className="font-medium text-gray-900">${summaryPayload.claimInformation.claimChargeAmount}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-gray-800">Diagnoses (ICD-10)</h4>
                          </div>
                          <ul className="mt-3 space-y-2 text-sm text-gray-800">
                            {summaryPayload.claimInformation.healthCareCodeInformation.map((d: any, idx: number) => (
                              <li key={idx} className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-primary">check</span>
                                <span className="font-mono font-semibold">{d.diagnosisCode}</span>
                                <span className="text-gray-500">({d.diagnosisTypeCode})</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-gray-800">Service Lines (CPT/HCPCS)</h4>
                          </div>
                          <ul className="mt-3 space-y-2 text-sm text-gray-800">
                            {summaryPayload.claimInformation.serviceLines.map((s: any, idx: number) => (
                              <li key={idx} className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-primary">medical_services</span>
                                <span className="font-mono font-semibold">{s.professionalService.procedureCode}</span>
                                <span className="text-gray-500">({s.professionalService.lineItemChargeAmount})</span>
                                <span className="text-gray-500">DOS {s.serviceDate}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      {submitError && (
                        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                          {submitError}
                        </div>
                      )}
                      {submitResult && (
                        <pre className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 overflow-x-auto">
                          {JSON.stringify(submitResult, null, 2)}
                        </pre>
                      )}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-gray-600">
                          <p className="font-semibold text-gray-900">Next steps</p>
                          <p>We’ll capture correlationId/rhclaimNumber on success.</p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setStep((s) => Math.max(1, (s - 1) as Steps))}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                            disabled={submitting}
                          >
                            Back
                          </button>
                          <button
                            onClick={handleSubmit}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-70"
                            disabled={submitting}
                          >
                            {submitting ? "Submitting…" : "Create & Submit"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Sticky Footer */}
        <footer className="sticky bottom-0 z-20 mt-auto w-full border-t border-gray-200 bg-white/80 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setStep((s) => Math.max(1, (s - 1) as Steps))}
              className="rounded-lg px-5 py-2.5 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-100"
              disabled={submitting}
            >
              Back
            </button>
            <button
              onClick={() => {
                if (step < 6) {
                  setStep((s) => (s + 1) as Steps);
                } else {
                  handleSubmit();
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-[#137fec] px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-[#0f6acc]"
              disabled={submitting}
            >
              <span>{submitting ? "Submitting..." : step < 6 ? `Next: ${steps.find((x) => x.id === step + 1)?.label || ""}` : "Create Claim"}</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
          {submitError && (
            <div className="mx-auto mt-3 max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="rounded-lg border border-rose-500/50 bg-rose-50 px-4 py-2 text-sm text-rose-700">{submitError}</p>
            </div>
          )}
          {submitResult && (
            <div className="mx-auto mt-3 max-w-7xl px-4 sm:px-6 lg:px-8">
              <pre className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 overflow-x-auto">
                {JSON.stringify(submitResult, null, 2)}
              </pre>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase, hasSupabaseEnv } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { submitClaim } from "@/lib/stediClient";

export default function NewClaimPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [draft, setDraft] = useState({
    patientName: "JANE DOE",
    dob: "1970-01-01",
    memberId: "AETNA12345",
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [step]);

  const steps = [
    { id: 1, label: "Patient Information" },
    { id: 2, label: "Payer & Insurance Details" },
    { id: 3, label: "Provider & Facility" },
    { id: 4, label: "Diagnoses (ICD-10)" },
    { id: 5, label: "Service Lines (CPT/HCPCS)" },
    { id: 6, label: "Claim Summary & Submit" },
  ];

  const buildPayload = () => {
    const nameParts = (draft.patientName || "").trim().split(/\s+/);
    const firstName = nameParts[0] || "JANE";
    const lastName = nameParts.slice(1).join(" ") || "DOE";
    const dob = (draft.dob || "1970-01-01").replace(/-/g, "");
    const memberId = draft.memberId || "AETNA12345";

    return {
      controlNumber: "CLM-AETNA-UI",
      tradingPartnerServiceId: "60054",
      usageIndicator: "T",
      submitter: { organizationName: "Demo Clinic", contactInformation: { phoneNumber: "9999999999" } },
      receiver: { organizationName: "AETNA" },
      billing: {
        npi: "1999999984",
        employerId: "123456789",
        organizationName: "Demo Clinic",
        address: { address1: "123 Main St", city: "Nashville", state: "TN", postalCode: "37201" },
      },
      subscriber: {
        memberId,
        firstName,
        lastName,
        dateOfBirth: dob,
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
        claimChargeAmount: "240.00",
        placeOfServiceCode: "11",
        healthCareCodeInformation: [{ diagnosisTypeCode: "ABK", diagnosisCode: "M542" }],
        serviceLines: [
          {
            assignedNumber: "1",
            professionalService: {
              procedureIdentifier: "HC",
              procedureCode: "99213",
              procedureModifiers: ["25"],
              lineItemChargeAmount: "180.00",
              measurementUnit: "UN",
              serviceUnitCount: "1",
              compositeDiagnosisCodePointers: [["1"]],
            },
            serviceDate: "20250105",
          },
          {
            assignedNumber: "2",
            professionalService: {
              procedureIdentifier: "HC",
              procedureCode: "97110",
              procedureModifiers: ["GP"],
              lineItemChargeAmount: "60.00",
              measurementUnit: "UN",
              serviceUnitCount: "1",
              compositeDiagnosisCodePointers: [["1"]],
            },
            serviceDate: "20250105",
          },
        ],
      },
    };
  };

  const handleSubmit = async () => {
    const payload = buildPayload();
    if (!draft.patientName || !draft.dob || !draft.memberId) {
      setSubmitError("Patient name, DOB, and Member ID are required.");
      return;
    }
    try {
      setSubmitting(true);
      setSubmitError(null);
      setSubmitResult(null);
      const res = await submitClaim(payload);
      setSubmitResult(res.data);
      if (supabase && hasSupabaseEnv) {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const userId = sessionData?.session?.user?.id || null;
          if (userId) {
            await supabase.from("claims").insert({
              user_id: userId,
              patient_name: draft.patientName,
              payer_name: payload.receiver?.organizationName || null,
              trading_partner_service_id: payload.tradingPartnerServiceId,
              status: res.data?.status || null,
              claim_charge_amount: Number(payload.claimInformation?.claimChargeAmount) || null,
              total_charge: Number(payload.claimInformation?.claimChargeAmount) || null,
              service_line_count: payload.claimInformation?.serviceLines?.length || null,
              payload,
              stedi_correlation_id: res.data?.claimReference?.correlationId || null,
              stedi_patient_control_number: res.data?.claimReference?.patientControlNumber || null,
            });
          } else {
            setSubmitError("Not signed in — claim saved to Stedi but not persisted to Supabase.");
          }
        } catch (e: any) {
          setSubmitError(`Saved to Stedi, but Supabase insert failed: ${e?.message || "unknown error"}`);
        }
      }
      setStep(6);
    } catch (err: any) {
      const friendly = err?.data?.message || err?.message || "Submit failed. Please try again or adjust the test data.";
      setSubmitError(friendly);
      setSubmitResult(err?.data);
    } finally {
      setSubmitting(false);
    }
  };

  const summaryPayload = buildPayload();

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto bg-[#f6f7f8] text-slate-900 relative h-full min-h-screen">
      <div className="relative flex min-h-full w-full flex-col">
        <header className="sticky top-0 z-20 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4 text-gray-900">
              <span className="material-symbols-outlined text-primary text-3xl">spark</span>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Clinix AI</p>
                <p className="text-lg font-bold">Create Claim From Scratch</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 border border-slate-200 hover:bg-slate-200"
            >
              Back to dashboard
            </button>
          </div>
        </header>

        <main className="flex-grow">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
              {/* Sidebar */}
              <aside className="lg:col-span-3">
                <div className="sticky top-28 py-2">
                  <div className="flex flex-col gap-1 rounded-xl bg-white p-6 shadow-sm border border-slate-200">
                    {steps.map((s) => {
                      const isActive = step === s.id;
                      const isCompleted = step > s.id;
                      let containerClass = "flex items-center gap-4 rounded-lg px-4 py-3 transition-colors duration-200";
                      let iconClass = "material-symbols-outlined text-lg";
                      let textClass = "text-base font-medium";
                      if (isActive) {
                        containerClass += " border border-primary bg-primary/5 text-primary transition-all";
                        iconClass += " !fill-1 font-bold text-primary";
                        textClass = "text-base font-semibold";
                      } else if (isCompleted) {
                        containerClass += " text-gray-600 hover:bg-gray-50";
                        iconClass += " text-green-500 !fill-1";
                      } else {
                        containerClass += " text-gray-600 hover:bg-gray-50";
                      }
                      const iconName = isCompleted ? "check_circle" : s.id === 1 ? "looks_one" : s.id === 2 ? "looks_two" : s.id === 3 ? "looks_3" : s.id === 4 ? "looks_4" : s.id === 5 ? "looks_5" : "looks_6";
                      return (
                        <div key={s.id} className={containerClass} onClick={() => setStep(s.id)}>
                          <span className={iconClass}>{iconName}</span>
                          <p className={textClass}>{s.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </aside>

              {/* Main Form */}
              <div className="lg:col-span-9">
                <div className="relative rounded-xl bg-white p-8 shadow-sm border border-slate-200">
                  {step === 1 && (
                    <div className="space-y-8 animate-in fade-in">
                      <h3 className="text-2xl font-bold text-[#111418]">Patient Information</h3>
                      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className="flex flex-col">
                            <p className="pb-2 text-base font-medium text-[#111418]">Patient Name</p>
                            <div className="relative flex w-full flex-1 items-stretch">
                              <input
                                className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20"
                                placeholder="Search by name"
                                value={draft.patientName}
                                onChange={(e) => setDraft((prev) => ({ ...prev, patientName: e.target.value }))}
                              />
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-[#617589]">
                                <span className="material-symbols-outlined">search</span>
                              </div>
                            </div>
                            <p className="pt-2 text-sm text-gray-500">Start typing to find an existing patient or create a new one.</p>
                          </label>
                        </div>
                        <div>
                          <label className="flex flex-col">
                            <p className="pb-2 text-base font-medium text-[#111418]">Date of Birth (DOB)</p>
                            <div className="relative flex w-full flex-1 items-stretch">
                              <input
                                className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20"
                                placeholder="MM/DD/YYYY"
                                type="date"
                                value={draft.dob}
                                onChange={(e) => setDraft((prev) => ({ ...prev, dob: e.target.value }))}
                              />
                            </div>
                          </label>
                        </div>
                        <div>
                          <label className="flex flex-col">
                            <p className="pb-2 text-base font-medium text-[#111418]">MRN / Patient ID</p>
                            <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Enter Patient ID" defaultValue="MRN-TEST-001" />
                          </label>
                        </div>
                        <div>
                          <label className="flex flex-col">
                            <p className="pb-2 text-base font-medium text-[#111418]">Gender <span className="text-gray-400">(Optional)</span></p>
                            <select className="form-select block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" defaultValue="Female">
                              <option>Select Gender</option>
                              <option>Male</option>
                              <option>Female</option>
                              <option>Other</option>
                            </select>
                          </label>
                        </div>
                        <div>
                          <label className="flex flex-col">
                            <p className="pb-2 text-base font-medium text-[#111418]">Relationship to Subscriber</p>
                            <select className="form-select block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" defaultValue="Self">
                              <option>Self</option>
                              <option>Spouse</option>
                              <option>Child</option>
                              <option>Other</option>
                            </select>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-8 animate-in fade-in">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-[#111418]">Payer & Insurance Details</h3>
                        <p className="text-base text-gray-600">Enter insurance plan information for this claim.</p>
                      </div>
                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-[#111418]">Primary Payer Information</h4>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Payer Name</span>
                              <div className="relative">
                                <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                                <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white pl-11 pr-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Search for a payer..." defaultValue="Aetna" />
                              </div>
                            </label>
                          </div>
                          <div>
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Plan Type</span>
                              <select className="form-select block h-12 w-full appearance-none rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20">
                                <option>PPO</option>
                                <option>HMO</option>
                                <option>Medicare</option>
                              </select>
                            </label>
                          </div>
                          <div>
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Policy Number</span>
                              <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Enter policy number" defaultValue="POLICY-TEST-001" />
                            </label>
                          </div>
                          <div>
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Subscriber ID</span>
                              <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Enter subscriber ID" value={draft.memberId} onChange={(e) => setDraft((prev) => ({ ...prev, memberId: e.target.value }))} />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-12 animate-in fade-in">
                      <div className="space-y-2">
                        <h3 className="col-span-full text-2xl font-bold text-[#111418]">Provider & Facility</h3>
                        <p className="text-base text-gray-600">These details determine who is billing for the service and where the patient was treated.</p>
                      </div>
                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-[#111418]">Provider Information</h4>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Billing Provider</span>
                              <div className="relative">
                                <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                                <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white pl-11 pr-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Search by name or NPI" defaultValue="Demo Clinic" />
                              </div>
                            </label>
                          </div>
                          <div>
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">NPI</span>
                            />
                              <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Auto-populated" defaultValue="1999999984" />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Rendering Provider</span>
                              <div className="relative">
                                <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                                <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white pl-11 pr-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Search for a provider" defaultValue="Dr. Demo" />
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-[#111418]">Facility / Place of Service</h4>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Facility Name <span className="text-gray-400">(Optional)</span></span>
                              <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" placeholder="Enter facility name" defaultValue="Demo Clinic Facility" />
                            </label>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Place of Service (POS Code)</span>
                              <select className="form-select block h-12 w-full appearance-none rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20" defaultValue="11 - Office">
                                <option>11 - Office</option>
                                <option>22 - Hospital Outpatient</option>
                                <option>21 - Hospital Inpatient</option>
                              </select>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 6 && (
                    <div className="space-y-8 animate-in fade-in">
                      <div className="space-y-2">
                        <h3 className="col-span-full text-2xl font-bold text-[#111418]">Claim Summary</h3>
                        <p className="text-base text-gray-600">
                          Submit to Stedi via the Cloud Run proxy (uses NEXT_PUBLIC_PROXY_URL). Currently prefilled with test identifiers for safe click-through; replace with real data before production.
                        </p>
                      </div>
                      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Test mode: form is prefilled so you can click through. Update patient, member ID, and dates with real values before live use.
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-gray-800">Patient & Insurance</h4>
                          </div>
                          <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 text-sm text-gray-700">
                            <div>
                              <p className="text-gray-500">Patient</p>
                              <p className="font-medium text-gray-900">
                                {summaryPayload.subscriber.firstName} {summaryPayload.subscriber.lastName}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">DOB</p>
                              <p className="font-medium text-gray-900">{summaryPayload.subscriber.dateOfBirth}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Member ID</p>
                              <p className="font-medium font-mono text-gray-900">{summaryPayload.subscriber.memberId}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Payer</p>
                              <p className="font-medium text-gray-900">{summaryPayload.receiver.organizationName}</p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-gray-800">Provider & Facility</h4>
                          </div>
                          <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 text-sm text-gray-700">
                            <div>
                              <p className="text-gray-500">Billing Provider</p>
                              <p className="font-medium text-gray-900">{summaryPayload.billing.organizationName}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Billing NPI</p>
                              <p className="font-medium font-mono text-gray-900">{summaryPayload.billing.npi}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">POS</p>
                              <p className="font-medium text-gray-900">{summaryPayload.claimInformation.placeOfServiceCode}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Charge</p>
                              <p className="font-medium text-gray-900">${summaryPayload.claimInformation.claimChargeAmount}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-gray-800">Diagnoses (ICD-10)</h4>
                          </div>
                          <ul className="mt-3 space-y-2 text-sm text-gray-800">
                            {summaryPayload.claimInformation.healthCareCodeInformation.map((d: any, idx: number) => (
                              <li key={idx} className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-primary">check</span>
                                <span className="font-mono font-semibold">{d.diagnosisCode}</span>
                                <span className="text-gray-500">({d.diagnosisTypeCode})</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-gray-800">Service Lines (CPT/HCPCS)</h4>
                          </div>
                          <ul className="mt-3 space-y-2 text-sm text-gray-800">
                            {summaryPayload.claimInformation.serviceLines.map((s: any, idx: number) => (
                              <li key={idx} className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-primary">medical_services</span>
                                <span className="font-mono font-semibold">{s.professionalService.procedureCode}</span>
                                <span className="text-gray-500">({s.professionalService.lineItemChargeAmount})</span>
                                <span className="text-gray-500">DOS {s.serviceDate}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      {submitError && (
                        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                          {submitError}
                        </div>
                      )}
                      {submitResult && (
                        <pre className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 overflow-x-auto">
                          {JSON.stringify(submitResult, null, 2)}
                        </pre>
                      )}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-gray-600">
                          <p className="font-semibold text-gray-900">Next steps</p>
                          <p>We’ll capture correlationId/rhclaimNumber on success.</p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setStep((s) => Math.max(1, s - 1))}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                            disabled={submitting}
                          >
                            Back
                          </button>
                          <button
                            onClick={handleSubmit}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-70"
                            disabled={submitting}
                          >
                            {submitting ? "Submitting…" : "Create & Submit"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Sticky Footer */}
        <footer className="sticky bottom-0 z-20 mt-auto w-full border-t border-gray-200 bg-white/80 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="rounded-lg px-5 py-2.5 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-100"
              disabled={submitting}
            >
              Back
            </button>
            <button
              onClick={() => {
                if (step < 6) {
                  setStep((s) => s + 1);
                } else {
                  handleSubmit();
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-[#137fec] px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-[#0f6acc]"
              disabled={submitting}
            >
              <span>{submitting ? "Submitting..." : step < 6 ? `Next: ${steps[step] ? steps[step].label : ""}` : "Create Claim"}</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
          {submitError && (
            <div className="mx-auto mt-3 max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="rounded-lg border border-rose-500/50 bg-rose-50 px-4 py-2 text-sm text-rose-700">{submitError}</p>
            </div>
          )}
          {submitResult && (
            <div className="mx-auto mt-3 max-w-7xl px-4 sm:px-6 lg:px-8">
              <pre className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 overflow-x-auto">
                {JSON.stringify(submitResult, null, 2)}
              </pre>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}
"use client";

import { useMemo, useState } from "react";
import { supabase, hasSupabaseEnv } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { submitClaim } from "@/lib/stediClient";

type PatientInfo = {
  name?: string;
  dob?: string;
  mrn?: string;
  gender?: string;
  relationship?: string;
};

type InsuranceInfo = {
  payerName?: string;
  planType?: string;
  policyNumber?: string;
  groupNumber?: string;
  subscriberId?: string;
  relationship?: string;
  priorAuthRequired?: boolean;
  priorAuthNumber?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
};

type ProviderFacility = {
  billingProvider?: string;
  billingNpi?: string;
  taxonomyCode?: string;
  billingAddress1?: string;
  billingAddress2?: string;
  billingCity?: string;
  billingState?: string;
  billingZip?: string;
  renderingProvider?: string;
  renderingNpi?: string;
  specialty?: string;
  facilityName?: string;
  facilityAddress?: string;
  posCode?: string;
  claimChargeAmount?: string;
};

type Diagnosis = {
  code: string;
  description?: string;
  priority: number;
};

type ServiceLine = {
  code: string;
  description?: string;
  modifiers: string[];
  dxPointers: number[];
  from: string;
  to: string;
  units: number;
  charge: number;
};

type ClaimDraft = {
  patient: PatientInfo;
  insurance: InsuranceInfo;
  provider: ProviderFacility;
  diagnoses: Diagnosis[];
  serviceLines: ServiceLine[];
  clinicalNotes?: string;
};

const steps = [
  { id: 1, label: "Patient Information" },
  { id: 2, label: "Payer & Insurance Details" },
  { id: 3, label: "Provider & Facility" },
  { id: 4, label: "Diagnoses (ICD-10)" },
  { id: 5, label: "Service Lines (CPT/HCPCS)" },
  { id: 6, label: "Claim Summary & Submit" },
];

export default function NewClaimPage() {
  const [draft, setDraft] = useState<ClaimDraft>({
    patient: {
      name: "JANE DOE",
      dob: "1970-01-01",
      mrn: "MRN-TEST-001",
      gender: "F",
      relationship: "Self",
    },
    insurance: {
      payerName: "Aetna",
      planType: "PPO",
      policyNumber: "POLICY-TEST-001",
      groupNumber: "GRP-TEST-001",
      subscriberId: "AETNA12345",
      relationship: "Self",
      priorAuthRequired: false,
      priorAuthNumber: "",
      address1: "100 Payer Way",
      city: "Hartford",
      state: "CT",
      zip: "06103",
    },
    provider: {
      billingProvider: "Demo Clinic",
      billingNpi: "1999999984",
      billingAddress1: "123 Main St",
      billingCity: "Nashville",
      billingState: "TN",
      billingZip: "37201",
      renderingProvider: "Dr. Demo",
      renderingNpi: "1999999984",
      posCode: "11",
      claimChargeAmount: "240.00",
    },
    diagnoses: [
      { code: "M542", description: "Cervicalgia", priority: 1 },
    ],
    serviceLines: [
      {
        code: "99213",
        description: "Office or other outpatient visit",
        modifiers: ["25", "", "", ""],
        dxPointers: [1],
        from: "2025-01-05",
        to: "2025-01-05",
        units: 1,
        charge: 180,
      },
      {
        code: "97110",
        description: "Therapeutic exercises",
        modifiers: ["GP", "", "", ""],
        dxPointers: [1],
        from: "2025-01-05",
        to: "2025-01-05",
        units: 1,
        charge: 60,
      },
    ],
    clinicalNotes: "Test claim prefill for Stedi integration.",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const router = useRouter();

  const supabaseMissing = !hasSupabaseEnv || !supabase;

  const stepSubtitle = useMemo(() => {
    switch (currentStep) {
      case 1:
        return "Step 1 of 6: Patient Information";
      case 2:
        return "Step 2 of 6: Payer & Insurance Details";
      case 3:
        return "Step 3 of 6: Provider & Facility";
      case 4:
        return "Step 4 of 6: Diagnoses (ICD-10)";
      case 5:
        return "Step 5 of 6: Service Lines (CPT/HCPCS)";
      case 6:
        return "Step 6 of 6: Claim Summary & Submit";
      default:
        return "";
    }
  }, [currentStep]);

  const totalCharge = useMemo(
    () => draft.serviceLines.reduce((sum, line) => sum + (line.charge || 0), 0),
    [draft.serviceLines],
  );

  const draftJson = useMemo(
    () =>
      JSON.stringify(
        {
          ...draft,
          provider: { ...draft.provider, claimChargeAmount: draft.provider.claimChargeAmount || totalCharge || undefined },
          totals: { totalCharge: totalCharge || null },
        },
        null,
        2,
      ),
    [draft, totalCharge],
  );

  const updateNested = <K extends keyof ClaimDraft>(section: K, key: keyof ClaimDraft[K], value: any) => {
    setDraft((prev) => {
      const prevSection = (prev[section] as Record<string, unknown>) || {};
      return { ...prev, [section]: { ...prevSection, [key]: value } };
    });
  };

  const addDiagnosis = () => {
    setDraft((prev) => ({
      ...prev,
      diagnoses: [...prev.diagnoses, { code: "", description: "", priority: prev.diagnoses.length + 1 }],
    }));
  };

  const updateDiagnosis = (index: number, key: keyof Diagnosis, value: any) => {
    setDraft((prev) => {
      const next = [...prev.diagnoses];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, diagnoses: next };
    });
  };

  const addServiceLine = () => {
    setDraft((prev) => ({
      ...prev,
      serviceLines: [
        ...prev.serviceLines,
        {
          code: "",
          description: "",
          modifiers: ["", "", "", ""],
          dxPointers: [],
          from: "",
          to: "",
          units: 1,
          charge: 0,
        },
      ],
    }));
  };

  const updateServiceLine = (index: number, key: keyof ServiceLine, value: any) => {
    setDraft((prev) => {
      const next = [...prev.serviceLines];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, serviceLines: next };
    });
  };

  const toggleDxPointer = (lineIndex: number, dx: number) => {
    setDraft((prev) => {
      const next = [...prev.serviceLines];
      const current = next[lineIndex].dxPointers || [];
      const exists = current.includes(dx);
      next[lineIndex] = {
        ...next[lineIndex],
        dxPointers: exists ? current.filter((d) => d !== dx) : [...current, dx],
      };
      return { ...prev, serviceLines: next };
    });
  };

  const submit = async () => {
    setError(null);
    setLoading(true);
    setSubmitResult(null);
    try {
      // Build Stedi 837P payload from the draft (prefilled defaults already in state)
      const payload = {
        controlNumber: "CLM-MAIN-UI",
        tradingPartnerServiceId: "60054",
        usageIndicator: "T",
        submitter: { organizationName: draft.provider.billingProvider || "Demo Clinic", contactInformation: { phoneNumber: "9999999999" } },
        receiver: { organizationName: draft.insurance.payerName || "AETNA" },
        billing: {
          npi: draft.provider.billingNpi || "1999999984",
          employerId: "123456789",
          organizationName: draft.provider.billingProvider || "Demo Clinic",
          address: {
            address1: draft.provider.billingAddress1 || "123 Main St",
            city: draft.provider.billingCity || "Nashville",
            state: draft.provider.billingState || "TN",
            postalCode: draft.provider.billingZip || "37201",
          },
        },
        subscriber: {
          memberId: draft.insurance.subscriberId || "AETNA12345",
          firstName: (draft.patient.name || "JANE DOE").split(" ")[0],
          lastName: (draft.patient.name || "JANE DOE").split(" ").slice(1).join(" ") || "DOE",
          dateOfBirth: (draft.patient.dob || "1970-01-01").replace(/-/g, ""),
          gender: (draft.patient.gender || "F").toUpperCase(),
        },
        claimInformation: {
          claimFilingCode: "CI",
          claimFrequencyCode: "1",
          signatureIndicator: "Y",
          planParticipationCode: "A",
          benefitsAssignmentCertificationIndicator: "Y",
          releaseInformationCode: "Y",
          patientControlNumber: "PCN-MAIN-UI",
          claimChargeAmount: String(totalCharge || 0),
          placeOfServiceCode: draft.provider.posCode || "11",
          healthCareCodeInformation:
            draft.diagnoses.length > 0
              ? draft.diagnoses.map((d) => ({ diagnosisTypeCode: "ABK", diagnosisCode: d.code || "M542" }))
              : [{ diagnosisTypeCode: "ABK", diagnosisCode: "M542" }],
          serviceLines:
            draft.serviceLines.length > 0
              ? draft.serviceLines.map((line, idx) => ({
                  assignedNumber: String(idx + 1),
                  professionalService: {
                    procedureIdentifier: "HC",
                    procedureCode: line.code || "99213",
                    procedureModifiers: line.modifiers.filter(Boolean),
                    lineItemChargeAmount: (line.charge || 0).toFixed(2),
                    measurementUnit: "UN",
                    serviceUnitCount: String(line.units || 1),
                    compositeDiagnosisCodePointers: [line.dxPointers.map((d) => String(d))],
                  },
                  serviceDate: (line.from || line.to || "2025-01-05").replace(/-/g, ""),
                }))
              : [
                  {
                    assignedNumber: "1",
                    professionalService: {
                      procedureIdentifier: "HC",
                      procedureCode: "99213",
                      procedureModifiers: ["25"],
                      lineItemChargeAmount: "180.00",
                      measurementUnit: "UN",
                      serviceUnitCount: "1",
                      compositeDiagnosisCodePointers: [["1"]],
                    },
                    serviceDate: "20250105",
                  },
                  {
                    assignedNumber: "2",
                    professionalService: {
                      procedureIdentifier: "HC",
                      procedureCode: "97110",
                      procedureModifiers: ["GP"],
                      lineItemChargeAmount: "60.00",
                      measurementUnit: "UN",
                      serviceUnitCount: "1",
                      compositeDiagnosisCodePointers: [["1"]],
                    },
                    serviceDate: "20250105",
                  },
                ],
        },
      };

      const stediRes = await submitClaim(payload);
      setSubmitResult(stediRes.data);

      if (supabase && hasSupabaseEnv) {
        const { data: session } = await supabase.auth.getSession();
        const userId = session.session?.user?.id || null;
        if (userId) {
          await supabase.from("claims").insert({
            user_id: userId,
            patient_name: draft.patient.name || null,
            payer_name: payload.receiver.organizationName || null,
            date_of_service: draft.serviceLines[0]?.from || draft.serviceLines[0]?.to || null,
            trading_partner_name: draft.provider.billingProvider || null,
            trading_partner_service_id: payload.tradingPartnerServiceId,
            claim_charge_amount: Number(payload.claimInformation?.claimChargeAmount) || null,
            total_charge: Number(payload.claimInformation?.claimChargeAmount) || null,
            status: stediRes.data?.status || "submitted",
            service_line_count: payload.claimInformation?.serviceLines?.length || null,
            payload,
            stedi_correlation_id: stediRes.data?.claimReference?.correlationId || null,
            stedi_patient_control_number: stediRes.data?.claimReference?.patientControlNumber || null,
          });
        } else {
          setError("Not signed in — claim submitted to Stedi but not saved to Supabase.");
        }
      }

      router.push("/dashboard");
    } catch (err: any) {
      const friendly = err?.data?.message || err?.message || "Submit failed. Please adjust test data and retry.";
      setError(friendly);
    } finally {
      setLoading(false);
    }
  };

  const getTip = (step: number) => {
    switch (step) {
      case 1:
        return "Search an existing patient or create a new one with core demographics.";
      case 2:
        return "Pick the active payer and capture subscriber IDs exactly as on the card.";
      case 3:
        return "Billing provider submits the claim; rendering provider performed the service.";
      case 4:
        return "Primary diagnosis (priority 1) drives reimbursement; order matters.";
      case 5:
        return "Map each service line to diagnoses and include required modifiers.";
      case 6:
        return "Resolve errors before creation; warnings help reduce denials.";
      default:
        return "";
    }
  };

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <div className="space-y-8">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-[#111418]">Patient Information</h3>
            <p className="text-base text-gray-600">Link or create a patient with core demographics.</p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <FormInput label="Patient Name" value={draft.patient.name || ""} onChange={(v) => updateNested("patient", "name", v)} placeholder="Search or enter name" />
            <FormInput label="Date of Birth (DOB)" value={draft.patient.dob || ""} onChange={(v) => updateNested("patient", "dob", v)} placeholder="YYYY-MM-DD" />
            <FormInput label="MRN / Patient ID" value={draft.patient.mrn || ""} onChange={(v) => updateNested("patient", "mrn", v)} placeholder="Patient ID" />
            <FormSelect
              label="Gender (Optional)"
              value={draft.patient.gender || ""}
              onChange={(v) => updateNested("patient", "gender", v)}
              options={["", "Male", "Female", "Other", "Decline to Answer"]}
            />
            <FormSelect
              label="Relationship to Subscriber"
              value={draft.patient.relationship || ""}
              onChange={(v) => updateNested("patient", "relationship", v)}
              options={["Self", "Spouse", "Child", "Other"]}
            />
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="space-y-10">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-[#111418]">Payer & Insurance Details</h3>
            <p className="text-base text-gray-600">Plan details, subscriber info, and prior auth.</p>
          </div>
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-[#111418]">Primary Payer Information</h4>
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
              <FormField
                label="Payer Name"
                icon="search"
                value={draft.insurance.payerName || ""}
                onChange={(v) => updateNested("insurance", "payerName", v)}
                placeholder="Search for a payer..."
              />
              <FormSelect
                label="Plan Type"
                value={draft.insurance.planType || ""}
                onChange={(v) => updateNested("insurance", "planType", v)}
                options={["PPO", "HMO", "Medicare", "Medicaid", "Commercial"]}
              />
              <FormInput label="Policy Number" value={draft.insurance.policyNumber || ""} onChange={(v) => updateNested("insurance", "policyNumber", v)} />
              <FormInput label="Group Number (Optional)" value={draft.insurance.groupNumber || ""} onChange={(v) => updateNested("insurance", "groupNumber", v)} />
              <FormInput
                label="Subscriber ID"
                value={draft.insurance.subscriberId || ""}
                onChange={(v) => updateNested("insurance", "subscriberId", v)}
                placeholder="Enter exactly as on card"
              />
              <FormSelect
                label="Relationship to Subscriber"
                value={draft.insurance.relationship || ""}
                onChange={(v) => updateNested("insurance", "relationship", v)}
                options={["Self", "Spouse", "Child", "Other"]}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-[#111418]">Coverage & Claim Requirements</h4>
            <div className="flex items-center gap-3">
              <TogglePill
                label="Prior Auth Required"
                active={!!draft.insurance.priorAuthRequired}
                onChange={(val) => updateNested("insurance", "priorAuthRequired", val)}
              />
              <FormInput
                label="Prior Authorization Number"
                value={draft.insurance.priorAuthNumber || ""}
                onChange={(v) => updateNested("insurance", "priorAuthNumber", v)}
                placeholder="If applicable"
              />
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
              <FormInput label="Payer Address Line 1" value={draft.insurance.address1 || ""} onChange={(v) => updateNested("insurance", "address1", v)} />
              <FormInput label="Address Line 2 (Optional)" value={draft.insurance.address2 || ""} onChange={(v) => updateNested("insurance", "address2", v)} />
              <FormInput label="City" value={draft.insurance.city || ""} onChange={(v) => updateNested("insurance", "city", v)} />
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="State" value={draft.insurance.state || ""} onChange={(v) => updateNested("insurance", "state", v)} />
                <FormInput label="ZIP" value={draft.insurance.zip || ""} onChange={(v) => updateNested("insurance", "zip", v)} />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === 3) {
      return (
        <div className="space-y-12">
          <div className="space-y-2">
            <h3 className="col-span-full text-2xl font-bold text-[#111418]">Provider & Facility</h3>
            <p className="text-base text-gray-600">Who is billing, who rendered, and where it happened.</p>
          </div>

          <div className="space-y-8">
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-[#111418]">Provider Information</h4>
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FormField
                    label="Billing Provider"
                    helper="Billing provider is the entity submitting the claim."
                    icon="search"
                    value={draft.provider.billingProvider || ""}
                    onChange={(v) => updateNested("provider", "billingProvider", v)}
                    placeholder="Search by name or NPI"
                  />
                </div>
                <FormInput label="NPI" value={draft.provider.billingNpi || ""} onChange={(v) => updateNested("provider", "billingNpi", v)} placeholder="Auto-populated" />
                <FormInput
                  label="Taxonomy Code (Optional)"
                  value={draft.provider.taxonomyCode || ""}
                  onChange={(v) => updateNested("provider", "taxonomyCode", v)}
                  placeholder="Enter taxonomy code"
                />

                <div className="sm:col-span-2 space-y-6">
                  <h5 className="text-base font-medium text-[#111418]">Billing Address</h5>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                    <FormInput label="Address Line 1" value={draft.provider.billingAddress1 || ""} onChange={(v) => updateNested("provider", "billingAddress1", v)} />
                    <FormInput
                      label="Address Line 2 (Optional)"
                      value={draft.provider.billingAddress2 || ""}
                      onChange={(v) => updateNested("provider", "billingAddress2", v)}
                    />
                    <FormInput label="City" value={draft.provider.billingCity || ""} onChange={(v) => updateNested("provider", "billingCity", v)} />
                    <div className="grid grid-cols-2 gap-x-4">
                      <FormInput label="State" value={draft.provider.billingState || ""} onChange={(v) => updateNested("provider", "billingState", v)} />
                      <FormInput label="ZIP" value={draft.provider.billingZip || ""} onChange={(v) => updateNested("provider", "billingZip", v)} />
                    </div>
                  </div>
                </div>
              </div>
              <FormField
                label="Rendering Provider"
                helper="Rendering provider is the clinician who performed the service."
                icon="search"
                value={draft.provider.renderingProvider || ""}
                onChange={(v) => updateNested("provider", "renderingProvider", v)}
                placeholder="Search for a provider"
              />
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-3">
                <FormInput label="Rendering NPI" value={draft.provider.renderingNpi || ""} onChange={(v) => updateNested("provider", "renderingNpi", v)} />
                <FormInput label="Specialty (Optional)" value={draft.provider.specialty || ""} onChange={(v) => updateNested("provider", "specialty", v)} />
                <FormInput
                  label="Claim charge amount"
                  value={draft.provider.claimChargeAmount || ""}
                  onChange={(v) => updateNested("provider", "claimChargeAmount", v)}
                  placeholder="$0.00"
                />
              </div>
            </div>

            <hr className="border-gray-200" />

            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-[#111418]">Facility / Place of Service</h4>
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                <FormInput label="Facility Name (Optional)" value={draft.provider.facilityName || ""} onChange={(v) => updateNested("provider", "facilityName", v)} />
                <FormInput
                  label="Facility Address (Optional)"
                  value={draft.provider.facilityAddress || ""}
                  onChange={(v) => updateNested("provider", "facilityAddress", v)}
                />
                <div className="sm:col-span-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-base font-medium text-[#111418]">Place of Service (POS Code)</span>
                    <select
                      className="form-select block h-12 w-full appearance-none rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-[#137fec] focus:outline-0 focus:ring-2 focus:ring-[#137fec]/20 sm:max-w-xs"
                      value={draft.provider.posCode || ""}
                      onChange={(e) => updateNested("provider", "posCode", e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="11">11 - Office</option>
                      <option value="22">22 - Hospital Outpatient</option>
                      <option value="21">21 - Hospital Inpatient</option>
                      <option value="23">23 - Emergency Room</option>
                    </select>
                    <p className="text-sm text-gray-500">POS determines payer reimbursement rules and may affect CPT/HCPCS requirements.</p>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === 4) {
      return (
        <div className="space-y-10">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-[#111418]">Diagnoses (ICD-10 Codes)</h3>
            <p className="text-base text-gray-600">Add diagnoses; order matters for billing.</p>
          </div>

          <div className="flex items-center gap-3">
            <FormInput
              label="Add Diagnosis"
              value=""
              onChange={() => undefined}
              placeholder="Use the buttons to add codes"
            />
            <button
              type="button"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#137fec]/10 px-6 text-base font-semibold text-[#137fec] shadow-sm transition-colors hover:bg-[#137fec]/20"
              onClick={addDiagnosis}
            >
              Add Diagnosis
            </button>
          </div>

          <div className="space-y-4">
            {draft.diagnoses.length === 0 && <p className="text-sm text-gray-500">No diagnoses yet. Add at least one.</p>}
            {draft.diagnoses.map((dx, idx) => (
              <div key={idx} className="rounded-lg bg-gray-50 p-4">
                <div className="grid grid-cols-12 items-start gap-x-4 gap-y-3">
                  <div className="col-span-12 sm:col-span-3">
                    <FormInput label="ICD-10 Code" value={dx.code} onChange={(v) => updateDiagnosis(idx, "code", v)} />
                  </div>
                  <div className="col-span-12 sm:col-span-6">
                    <FormInput label="Description" value={dx.description || ""} onChange={(v) => updateDiagnosis(idx, "description", v)} />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <FormSelect
                      label="Priority"
                      value={String(dx.priority)}
                      onChange={(v) => updateDiagnosis(idx, "priority", Number(v || 1))}
                      options={["1", "2", "3", "4", "5", "6"]}
                    />
                  </div>
                  <div className="col-span-6 flex h-11 items-end justify-end gap-2 sm:col-span-1">
                    <button
                      className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-red-100 hover:text-red-600"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          diagnoses: prev.diagnoses.filter((_, i) => i !== idx).map((d, i) => ({ ...d, priority: i + 1 })),
                        }))
                      }
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <label className="flex flex-col gap-2">
              <span className="text-base font-medium text-[#111418]">Clinical Notes (Optional)</span>
              <textarea
                className="form-textarea block w-full rounded-xl border border-[#dbe0e6] bg-white px-4 py-3 text-base text-[#111418] placeholder:text-[#617589] focus:border-[#137fec] focus:outline-0 focus:ring-2 focus:ring-[#137fec]/20"
                rows={3}
                value={draft.clinicalNotes || ""}
                onChange={(e) => setDraft((prev) => ({ ...prev, clinicalNotes: e.target.value }))}
              />
            </label>
            <p className="text-sm text-gray-500">A short note to clarify diagnosis-related details (not submitted on the claim).</p>
          </div>
        </div>
      );
    }

    if (currentStep === 5) {
      return (
        <div className="space-y-10">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-[#111418]">Service Lines (CPT/HCPCS Codes)</h3>
            <p className="text-base text-gray-600">Add service lines performed for this encounter.</p>
          </div>

          <button
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#137fec] px-6 text-base font-semibold text-white shadow-md transition-colors hover:bg-[#0f6acc] sm:w-auto"
            onClick={addServiceLine}
          >
            <span className="material-symbols-outlined">add</span>
            <span>Add Service Line</span>
          </button>

          <div className="space-y-6">
            {draft.serviceLines.length === 0 && <p className="text-sm text-gray-500">No service lines yet. Add at least one.</p>}
            {draft.serviceLines.map((line, idx) => (
              <div key={idx} className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-start justify-between">
                  <h4 className="text-lg font-bold text-gray-800">Service Line {idx + 1}</h4>
                  <div className="flex items-center gap-1">
                    <button
                      className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-red-100 hover:text-red-600"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          serviceLines: prev.serviceLines.filter((_, i) => i !== idx),
                        }))
                      }
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-12">
                  <div className="sm:col-span-3">
                    <FormInput label="CPT / HCPCS Code" value={line.code} onChange={(v) => updateServiceLine(idx, "code", v)} />
                  </div>
                  <div className="sm:col-span-9">
                    <FormInput label="Description" value={line.description || ""} onChange={(v) => updateServiceLine(idx, "description", v)} />
                  </div>
                  <div className="sm:col-span-7">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-gray-700">Modifiers</span>
                      <div className="flex h-11 items-center gap-2">
                        {line.modifiers.map((mod, mi) => (
                          <input
                            key={mi}
                            className="form-input block w-16 rounded-lg border border-[#dbe0e6] bg-white px-3 text-center text-base uppercase text-[#111418] placeholder:text-[#617589] focus:border-[#137fec] focus:outline-0 focus:ring-2 focus:ring-[#137fec]/20"
                            maxLength={2}
                            placeholder="M"
                            value={mod}
                            onChange={(e) =>
                              setDraft((prev) => {
                                const next = [...prev.serviceLines];
                                const mods = [...next[idx].modifiers];
                                mods[mi] = e.target.value.toUpperCase();
                                next[idx] = { ...next[idx], modifiers: mods };
                                return { ...prev, serviceLines: next };
                              })
                            }
                          />
                        ))}
                      </div>
                    </label>
                  </div>
                  <div className="sm:col-span-5">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-gray-700">Diagnosis Pointers</span>
                      <div className="flex h-11 items-center gap-4">
                        {[1, 2, 3, 4].map((d) => (
                          <label key={d} className="flex items-center gap-2">
                            <input
                              className="form-checkbox h-5 w-5 rounded border-gray-300 text-[#137fec] focus:ring-[#137fec]/50"
                              type="checkbox"
                              checked={line.dxPointers.includes(d)}
                              onChange={() => toggleDxPointer(idx, d)}
                            />
                            <span className="text-sm">{d}</span>
                          </label>
                        ))}
                      </div>
                    </label>
                  </div>
                  <div className="sm:col-span-3">
                    <FormInput label="Service Date From" value={line.from} onChange={(v) => updateServiceLine(idx, "from", v)} placeholder="YYYY-MM-DD" />
                  </div>
                    <div className="sm:col-span-3">
                    <FormInput label="Service Date To" value={line.to} onChange={(v) => updateServiceLine(idx, "to", v)} placeholder="YYYY-MM-DD" />
                  </div>
                  <div className="sm:col-span-2">
                    <FormInput label="Units" value={String(line.units)} onChange={(v) => updateServiceLine(idx, "units", Number(v || 0))} />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-gray-700">Charge Amount</span>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500">$</span>
                        <input
                          className="form-input block h-11 w-full rounded-lg border border-[#dbe0e6] bg-white pl-7 pr-3 text-base text-[#111418] placeholder:text-[#617589] focus:border-[#137fec] focus:outline-0 focus:ring-2 focus:ring-[#137fec]/20"
                          value={line.charge || ""}
                          onChange={(e) => updateServiceLine(idx, "charge", Number(e.target.value || 0))}
                        />
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 rounded-lg bg-gray-50 p-4">
            <h4 className="text-lg font-bold text-gray-800">Service Line Summary</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Charges</p>
                <p className="text-xl font-bold text-gray-900">${(totalCharge || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Number of Service Lines</p>
                <p className="text-xl font-bold text-gray-900">{draft.serviceLines.length}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-[#111418]">Claim Summary</h3>
          <p className="text-base text-gray-600">Review before creating the claim. You can still go back.</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-gray-800">Patient & Insurance</h4>
            <span className="text-sm font-semibold text-[#137fec]">Edit in Steps 1–2</span>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 text-sm">
            <SummaryItem label="Patient" value={draft.patient.name || "—"} />
            <SummaryItem label="DOB" value={draft.patient.dob || "—"} />
            <SummaryItem label="MRN" value={draft.patient.mrn || "—"} />
            <SummaryItem label="Payer" value={draft.insurance.payerName || "—"} />
            <SummaryItem label="Policy" value={draft.insurance.policyNumber || "—"} />
            <SummaryItem label="Subscriber ID" value={draft.insurance.subscriberId || "—"} />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-gray-800">Provider & Facility</h4>
            <span className="text-sm font-semibold text-[#137fec]">Edit in Step 3</span>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 text-sm">
            <SummaryItem label="Billing Provider" value={draft.provider.billingProvider || "—"} />
            <SummaryItem label="Billing NPI" value={draft.provider.billingNpi || "—"} />
            <SummaryItem label="Rendering Provider" value={draft.provider.renderingProvider || "—"} />
            <SummaryItem label="Rendering NPI" value={draft.provider.renderingNpi || "—"} />
            <SummaryItem label="Facility" value={draft.provider.facilityName || "—"} />
            <SummaryItem label="POS" value={draft.provider.posCode || "—"} />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-gray-800">Diagnoses (ICD-10)</h4>
            <span className="text-sm font-semibold text-[#137fec]">Edit in Step 4</span>
          </div>
          <div className="mt-4">
            {draft.diagnoses.length === 0 && <p className="text-sm text-gray-500">No diagnoses added.</p>}
            <ol className="list-decimal space-y-1 pl-5 text-sm">
              {draft.diagnoses.map((dx) => (
                <li key={dx.priority} className="text-gray-700">
                  <span className="font-mono font-medium text-gray-900">{dx.code || "—"}</span>: {dx.description || "—"}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-gray-800">Service Lines</h4>
            <span className="text-sm font-semibold text-[#137fec]">Edit in Step 5</span>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            {draft.serviceLines.length === 0 && <p className="text-sm text-gray-500">No service lines added.</p>}
            {draft.serviceLines.map((line, idx) => (
              <div key={idx} className="rounded-md border border-gray-200 p-3">
                <p className="font-semibold text-gray-800">
                  {idx + 1}. <span className="font-mono">{line.code || "—"}</span> - {line.description || "—"}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 pl-2 sm:grid-cols-4">
                  <p className="text-gray-600">DOS: <span className="font-medium text-gray-800">{line.from || "—"}</span></p>
                  <p className="text-gray-600">Dx Ptrs: <span className="font-medium text-gray-800">{line.dxPointers.join(", ") || "—"}</span></p>
                  <p className="text-gray-600">Units: <span className="font-medium text-gray-800">{line.units || "—"}</span></p>
                  <p className="text-gray-600">Charge: <span className="font-medium text-gray-800">${line.charge?.toFixed(2) || "0.00"}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
          <h4 className="text-lg font-bold text-gray-800">Financial Summary</h4>
          <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-3 text-sm">
            <SummaryItem label="Total Charges" value={`$${(totalCharge || 0).toFixed(2)}`} />
            <SummaryItem label="Est. Allowed Amount" value="—" />
            <SummaryItem label="Patient Responsibility" value="—" />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-gray-800">Draft JSON (for API)</h4>
            <button
              className="text-sm font-semibold text-[#137fec] underline-offset-4 hover:underline"
              type="button"
              onClick={() => navigator.clipboard?.writeText(draftJson)}
            >
              Copy JSON
            </button>
          </div>
          <pre className="mt-3 max-h-64 overflow-auto rounded-md bg-slate-900/90 p-3 text-xs text-slate-100">{draftJson}</pre>
        </div>
      </div>
    );
  };

  if (supabaseMissing) {
    return (
      <main className="min-h-screen bg-[#f6f7f8] text-slate-900 flex items-center justify-center px-4">
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
          Supabase environment variables are not configured. Cannot create new claims.
        </div>
      </main>
    );
  }

  return (
    <div className="bg-[#f6f7f8] text-[#111418]">
      <header className="sticky top-0 z-30 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3 py-4 text-gray-900">
            <span className="text-[#137fec]">
              <svg className="h-7 w-7" viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" />
              </svg>
            </span>
            <h2 className="text-lg font-bold">Clinix AI Billing</h2>
          </div>
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={() => router.push("/dashboard")}
          >
            Back to dashboard
          </button>
        </div>
      </header>

      <main className="flex-grow">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-4xl font-black leading-tight tracking-tight text-[#111418]">Create Claim From Scratch</p>
            <p className="text-lg font-normal leading-normal text-[#617589]">{stepSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <aside className="lg:col-span-3">
              <div className="sticky top-24 py-2">
                <div className="flex flex-col gap-2 rounded-xl bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] ring-1 ring-slate-200">
                  {steps.map((step) => {
                    const status = step.id === currentStep ? "current" : step.id < currentStep ? "complete" : "upcoming";
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => setCurrentStep(step.id)}
                        className={`group flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left transition-colors duration-200 ${
                          status === "current"
                            ? "border border-[#137fec] bg-[#137fec]/8 text-[#0f3a71] font-semibold"
                            : status === "complete"
                              ? "text-gray-600 hover:bg-gray-50"
                              : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold ${
                            status === "current"
                              ? "border-[#137fec] bg-white text-[#137fec]"
                              : status === "complete"
                                ? "border-green-500 bg-green-50 text-green-600"
                                : "border-slate-300 bg-slate-100 text-slate-600"
                          }`}
                        >
                          {step.id}
                        </span>
                        <p className="text-base font-medium">{step.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            <div className="lg:col-span-9">
              <div className="grid grid-cols-1 gap-10 xl:grid-cols-3">
                <section className="relative rounded-xl bg-white p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] xl:col-span-2">
                  {renderStepContent()}
                </section>

                <aside className="xl:col-span-1">
                  <div className="sticky top-24 rounded-xl bg-[#e6f2ff] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-xl text-[#007bff]">lightbulb</span>
                      <h4 className="text-lg font-semibold text-[#0f3a71]">Quick Tip</h4>
                    </div>
                    <p className="mt-4 text-base leading-relaxed text-[#0f3a71]">{getTip(currentStep)}</p>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="sticky bottom-0 mt-auto w-full border-t border-gray-200 bg-white/90 py-5 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            className="rounded-lg px-5 py-2.5 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-100"
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
          >
            Back
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={() => router.push("/dashboard")}
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-[#137fec] px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-[#0f6acc] disabled:opacity-70"
              onClick={() => {
                if (currentStep < 6) {
                  setCurrentStep((s) => s + 1);
                } else {
                  submit();
                }
              }}
              disabled={loading}
            >
              <span>
                {loading
                  ? "Saving..."
                  : currentStep < 6
                    ? `Next: ${steps.find((s) => s.id === currentStep + 1)?.label || ""}`
                    : "Create Claim"}
              </span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </div>
        {error && (
          <div className="mx-auto mt-3 max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="rounded-lg border border-rose-500/50 bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</p>
          </div>
        )}
      </footer>
    </div>
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

function FormField({
  label,
  helper,
  icon,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  helper?: string;
  icon?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-base font-medium text-[#111418]">{label}</span>
      <div className="relative">
        {icon && <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
        <input
          className={`form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-[#137fec] focus:outline-0 focus:ring-2 focus:ring-[#137fec]/20 ${icon ? "pl-11" : ""}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
      {helper && <p className="text-sm text-gray-500">{helper}</p>}
    </label>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-base font-medium text-[#111418]">{label}</span>
      <select
        className="form-select block h-12 w-full appearance-none rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-[#137fec] focus:outline-0 focus:ring-2 focus:ring-[#137fec]/20"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt, idx) => (
          <option key={`${opt}-${idx}`} value={opt}>
            {opt === "" ? "Select" : opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function TogglePill({ label, active, onChange }: { label: string; active: boolean; onChange: (val: boolean) => void }) {
  return (
    <button
      type="button"
      className={`rounded-full px-4 py-2 text-sm font-semibold ${active ? "bg-[#137fec]/10 text-[#137fec]" : "bg-white text-gray-600 border border-slate-200"}`}
      onClick={() => onChange(!active)}
    >
      {label}
    </button>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm">
      <p className="text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  );
}

