"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
      const rawStatus = typeof res.data?.status === "string" ? res.data.status.toLowerCase() : null;
      const normalizedStatus = rawStatus === "success" ? "accepted" : rawStatus || "submitted";

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
              status: normalizedStatus,
              claim_charge_amount: Number(payload.claimInformation.claimChargeAmount),
              total_charge: Number(payload.claimInformation.claimChargeAmount),
              service_line_count: payload.claimInformation.serviceLines.length,
              payload,
            });
          } else {
            setSupabaseNote("Not signed in — claim saved to Stedi; skipped Supabase insert.");
          }
        } catch (e: any) {
          setSupabaseNote(`Saved to Stedi, but Supabase insert failed: ${e?.message || "unknown error"}`);
        }
      }

      // On successful submit, go to success page with claim details
      const nameParts = draft.patientName.trim().split(/\s+/);
      const patientNameForUrl = encodeURIComponent(`${nameParts[0]} ${nameParts.slice(1).join(" ") || "DOE"}`);
      router.push(`/claims/success?patient=${patientNameForUrl}&payer=${encodeURIComponent(draft.payerName)}&amount=${totalCharge.toFixed(2)}`);
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
    { id: 1 as StepId, label: "Patient Information", icon: "looks_one" },
    { id: 2 as StepId, label: "Payer & Insurance Details", icon: "looks_two" },
    { id: 3 as StepId, label: "Provider & Facility", icon: "looks_3" },
    { id: 4 as StepId, label: "Diagnoses (ICD-10)", icon: "looks_4" },
    { id: 5 as StepId, label: "Service Lines (CPT/HCPCS)", icon: "looks_5" },
    { id: 6 as StepId, label: "Claim Summary & Submit", icon: "looks_6" },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f6f7f8]">
      <header className="sticky top-0 z-10 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-4 text-gray-900">
            <svg className="w-6 h-6 text-[#137fec]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" fill="currentColor"></path>
            </svg>
            <h2 className="text-lg font-bold">Clinix AI Billing</h2>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link className="text-sm font-medium text-slate-500 hover:text-slate-800" href="/dashboard">Dashboard</Link>
            <Link className="text-sm font-medium text-slate-500 hover:text-slate-800" href="/upload">Upload</Link>
            <Link className="text-sm font-medium text-slate-500 hover:text-slate-800" href="/denials">Denials</Link>
            <Link className="text-sm font-medium text-slate-500 hover:text-slate-800" href="/performance">Reports</Link>
            <Link className="text-sm font-medium text-slate-500 hover:text-slate-800" href="/settings">Settings</Link>
          </nav>
          <div className="flex items-center gap-4">
            <button className="flex cursor-pointer items-center justify-center rounded-lg h-10 w-10 bg-gray-100 text-gray-800">
              <span className="material-symbols-outlined text-xl">notifications</span>
            </button>
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAo26DySMBL37uyyFxr2SZsBgv_9bZgBqxg4Hcye7R9T5aR1R4uO2DDnTWYCEPT0KrSg7LkmEh-WjktqZZBOYx7JmuNBHY7Hv3UEYe-aTBBzJ7mwjsUvhp64pCcCEid15VCuLJVK9pRQO3BzCjdj6953fO4SEvGQ_KVbHkuDK4sUN5LlEnBPnBmVfuD2GOMyP1CGZ-wmLx4v0NzlE2GyThneMjSybEVobsNuw1Zk0immZQYf-H__5ROO_WhN2lCwowjtq9tKo3jul4")'}}></div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-4xl font-black leading-tight tracking-tight text-[#111418]">Create Claim From Scratch</p>
            <p className="text-lg font-normal leading-normal text-[#617589]">Step {step} of 6: {steps.find(s => s.id === step)?.label}</p>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Sidebar */}
            <aside className="lg:col-span-3">
              <div className="sticky top-28 py-2">
                <div className="flex flex-col gap-1 rounded-xl bg-white p-6 shadow-lg">
                  {steps.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStep(s.id)}
                      className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-all duration-200 ${
                        step === s.id
                          ? "border border-[#137fec] bg-[#137fec]/5 text-[#137fec]"
                          : step > s.id
                          ? "text-gray-600 hover:bg-gray-50"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {step > s.id ? (
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-lg">{s.id}</span>
                      )}
                      <p className={`text-base ${step === s.id ? 'font-semibold' : 'font-medium'}`}>{s.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-9">
              <div className="grid grid-cols-1 gap-10 xl:grid-cols-3">
                <div className="relative rounded-xl bg-white p-8 shadow-lg xl:col-span-2">
                  {step === 1 && (
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-[#111418]">Patient Information</h3>
                        <p className="text-base text-gray-600">Enter patient demographics and identification.</p>
                      </div>
                      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className="flex flex-col gap-2">
                            <span className="text-base font-medium text-[#111418]">Patient Name</span>
                            <div className="relative">
                              <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                              <input
                                className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-[#137fec] focus:outline-0 focus:ring-2 focus:ring-[#137fec]/20"
                                placeholder="Search by name"
                                value={draft.patientName}
                                onChange={(e) => setDraft((p) => ({ ...p, patientName: e.target.value }))}
                              />
                            </div>
                            <p className="text-sm text-gray-500">Start typing to find an existing patient or create a new one.</p>
                          </label>
                        </div>
                        <FormInput label="Date of Birth (DOB)" value={draft.dob} onChange={(v) => setDraft((p) => ({ ...p, dob: v }))} placeholder="YYYY-MM-DD" />
                        <FormInput label="MRN / Patient ID" value={draft.memberId} onChange={(v) => setDraft((p) => ({ ...p, memberId: v }))} placeholder="Enter Patient ID" />
                        <div>
                          <label className="flex flex-col gap-2">
                            <span className="text-base font-medium text-[#111418]">Gender <span className="text-gray-400">(Optional)</span></span>
                            <select className="form-select block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] focus:border-[#137fec] focus:outline-0 focus:ring-2 focus:ring-[#137fec]/20">
                              <option>Select Gender</option>
                              <option>Male</option>
                              <option>Female</option>
                              <option>Other</option>
                            </select>
                          </label>
                        </div>
                        <div>
                          <label className="flex flex-col gap-2">
                            <span className="text-base font-medium text-[#111418]">Relationship to Subscriber</span>
                            <select className="form-select block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] focus:border-[#137fec] focus:outline-0 focus:ring-2 focus:ring-[#137fec]/20">
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
                    <div className="space-y-8">
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
                                <input
                                  className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white pl-11 pr-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-[#137fec] focus:outline-0 focus:ring-2 focus:ring-[#137fec]/20"
                                  placeholder="Search for a payer..."
                                  value={draft.payerName}
                                  onChange={(e) => setDraft((p) => ({ ...p, payerName: e.target.value }))}
                                />
                              </div>
                            </label>
                          </div>
                          <div>
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Plan Type</span>
                              <select className="form-select block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] focus:border-[#137fec] focus:outline-0 focus:ring-2 focus:ring-[#137fec]/20">
                                <option>PPO</option>
                                <option>HMO</option>
                                <option>Medicare</option>
                                <option>Medicaid</option>
                                <option>Commercial</option>
                              </select>
                            </label>
                          </div>
                          <FormInput label="Policy Number" value={draft.policyNumber} onChange={(v) => setDraft((p) => ({ ...p, policyNumber: v }))} placeholder="Enter policy number" />
                          <FormInput label="Group Number" value={draft.groupNumber} onChange={(v) => setDraft((p) => ({ ...p, groupNumber: v }))} placeholder="Enter group number" />
                          <FormInput label="Subscriber ID" value={draft.memberId} onChange={(v) => setDraft((p) => ({ ...p, memberId: v }))} placeholder="Enter subscriber ID" />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-[#111418]">Provider & Facility</h3>
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
                                <input
                                  className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white pl-11 pr-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-[#137fec] focus:outline-0 focus:ring-2 focus:ring-[#137fec]/20"
                                  placeholder="Search by name or NPI"
                                  value={draft.billingProvider}
                                  onChange={(e) => setDraft((p) => ({ ...p, billingProvider: e.target.value }))}
                                />
                              </div>
                            </label>
                          </div>
                          <FormInput label="Billing NPI" value={draft.billingNpi} onChange={(v) => setDraft((p) => ({ ...p, billingNpi: v }))} placeholder="Auto-populated" />
                          <FormInput label="Taxonomy Code (Optional)" value="" onChange={() => {}} placeholder="Enter taxonomy code" />
                        </div>
                        <hr className="border-gray-200" />
                        <h4 className="text-lg font-semibold text-[#111418]">Facility / Place of Service</h4>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                          <FormInput label="Facility Name (Optional)" value="" onChange={() => {}} placeholder="Enter facility name" />
                          <div>
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Place of Service (POS Code)</span>
                              <select 
                                className="form-select block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] focus:border-[#137fec] focus:outline-0 focus:ring-2 focus:ring-[#137fec]/20"
                                value={draft.posCode}
                                onChange={(e) => setDraft((p) => ({ ...p, posCode: e.target.value }))}
                              >
                                <option value="11">11 - Office</option>
                                <option value="22">22 - Hospital Outpatient</option>
                                <option value="21">21 - Hospital Inpatient</option>
                                <option value="23">23 - Emergency Room</option>
                              </select>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-[#111418]">Diagnoses (ICD-10)</h3>
                        <p className="text-base text-gray-600">Add diagnosis codes that support the services being billed.</p>
                      </div>
                      <button className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#137fec] px-6 text-base font-semibold text-white shadow-md hover:bg-[#137fec]/90">
                        <span className="material-symbols-outlined">add</span>
                        <span>Add Diagnosis</span>
                      </button>
                      <div className="rounded-lg bg-gray-50 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="inline-flex items-center rounded-full bg-[#137fec]/10 px-2 py-1 text-xs font-medium text-[#137fec]">Primary</span>
                            <p className="mt-2 text-base font-semibold text-gray-900">M54.2 - Cervicalgia</p>
                            <p className="text-sm text-gray-600">Pain in the cervical spine (neck pain)</p>
                          </div>
                          <button className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-red-100 hover:text-red-600">
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 5 && (
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-[#111418]">Service Lines (CPT/HCPCS Codes)</h3>
                        <p className="text-base text-gray-600">Add one or more service lines that describe the procedures performed.</p>
                      </div>
                      <button className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#137fec] px-6 text-base font-semibold text-white shadow-md hover:bg-[#137fec]/90">
                        <span className="material-symbols-outlined">add</span>
                        <span>Add Service Line</span>
                      </button>
                      <div className="space-y-6">
                        {draft.serviceLines.map((line, idx) => (
                          <div key={idx} className="rounded-lg bg-gray-50 p-4">
                            <div className="flex items-start justify-between mb-4">
                              <h4 className="text-lg font-bold text-gray-800">Service Line {idx + 1}</h4>
                              <div className="flex items-center gap-1">
                                <button className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-200">
                                  <span className="material-symbols-outlined text-lg">content_copy</span>
                                </button>
                                <button className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-red-100 hover:text-red-600">
                                  <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-12 gap-4">
                              <div className="col-span-3">
                                <label className="flex flex-col gap-1.5">
                                  <span className="text-sm font-medium text-gray-700">CPT / HCPCS Code</span>
                                  <input className="form-input block h-11 w-full rounded-lg border border-[#dbe0e6] bg-white px-3 text-base" value={line.code} readOnly />
                                </label>
                              </div>
                              <div className="col-span-9">
                                <label className="flex flex-col gap-1.5">
                                  <span className="text-sm font-medium text-gray-700">Description</span>
                                  <input className="form-input block h-11 w-full rounded-lg border border-[#dbe0e6] bg-white/50 px-3 text-base" value={line.description} readOnly />
                                </label>
                              </div>
                              <div className="col-span-6">
                                <label className="flex flex-col gap-1.5">
                                  <span className="text-sm font-medium text-gray-700">Service Date</span>
                                  <input type="date" className="form-input block h-11 w-full rounded-lg border border-[#dbe0e6] bg-white px-3 text-base" value={line.from} readOnly />
                                </label>
                              </div>
                              <div className="col-span-2">
                                <label className="flex flex-col gap-1.5">
                                  <span className="text-sm font-medium text-gray-700">Units</span>
                                  <input className="form-input block h-11 w-full rounded-lg border border-[#dbe0e6] bg-white px-3 text-base" value="1" readOnly />
                                </label>
                              </div>
                              <div className="col-span-4">
                                <label className="flex flex-col gap-1.5">
                                  <span className="text-sm font-medium text-gray-700">Charge Amount</span>
                                  <div className="relative">
                                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500">$</span>
                                    <input className="form-input block h-11 w-full rounded-lg border border-[#dbe0e6] bg-white pl-7 pr-3 text-base" value={line.charge.toFixed(2)} readOnly />
                                  </div>
                                </label>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-lg bg-gray-50 p-4">
                        <h4 className="text-lg font-bold text-gray-800">Service Line Summary</h4>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-sm text-gray-600">Total Charges</p>
                            <p className="text-xl font-bold text-gray-900">${totalCharge.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Number of Service Lines</p>
                            <p className="text-xl font-bold text-gray-900">{draft.serviceLines.length}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 6 && (
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-[#111418]">Claim Summary</h3>
                        <p className="text-base text-gray-600">Review all details before creating this claim.</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-4">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
                          <div className="flex items-start gap-2.5">
                            <span className="material-symbols-outlined mt-0.5 text-lg text-gray-500">person</span>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Patient Name</p>
                              <p className="font-semibold text-gray-800">{summary.subscriber.firstName} {summary.subscriber.lastName}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <span className="material-symbols-outlined mt-0.5 text-lg text-gray-500">cake</span>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Date of Birth</p>
                              <p className="font-semibold text-gray-800">{draft.dob}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <span className="material-symbols-outlined mt-0.5 text-lg text-gray-500">shield</span>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Payer & Plan</p>
                              <p className="font-semibold text-gray-800">{summary.receiver.organizationName}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <span className="material-symbols-outlined mt-0.5 text-lg text-gray-500">medical_services</span>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Total Charges</p>
                              <p className="font-semibold text-gray-800">${summary.claimInformation.claimChargeAmount}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <span className="material-symbols-outlined mt-0.5 text-lg text-gray-500">calendar_month</span>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Service Lines</p>
                              <p className="font-semibold text-gray-800">{draft.serviceLines.length}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-gray-800">Patient & Insurance</h4>
                            <button onClick={() => setStep(1)} className="text-sm font-semibold text-[#137fec] hover:underline">Edit in Step 1–2</button>
                          </div>
                          <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 text-sm">
                            <div><p className="text-gray-500">Patient</p><p className="font-medium text-gray-900">{summary.subscriber.firstName} {summary.subscriber.lastName}</p></div>
                            <div><p className="text-gray-500">Member ID</p><p className="font-medium text-gray-900">{summary.subscriber.memberId}</p></div>
                            <div><p className="text-gray-500">Payer</p><p className="font-medium text-gray-900">{summary.receiver.organizationName}</p></div>
                            <div><p className="text-gray-500">Policy #</p><p className="font-medium text-gray-900">{draft.policyNumber}</p></div>
                          </div>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-gray-800">Provider & Facility</h4>
                            <button onClick={() => setStep(3)} className="text-sm font-semibold text-[#137fec] hover:underline">Edit in Step 3</button>
                          </div>
                          <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 text-sm">
                            <div><p className="text-gray-500">Billing Provider</p><p className="font-medium text-gray-900">{summary.billing.organizationName} (NPI: {summary.billing.npi})</p></div>
                            <div><p className="text-gray-500">Place of Service</p><p className="font-medium text-gray-900">POS {summary.claimInformation.placeOfServiceCode}</p></div>
                          </div>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-gray-800">Service Lines</h4>
                            <button onClick={() => setStep(5)} className="text-sm font-semibold text-[#137fec] hover:underline">Edit in Step 5</button>
                          </div>
                          <div className="mt-4 space-y-3 text-sm">
                            {draft.serviceLines.map((line, idx) => (
                              <div key={idx} className="rounded-md border border-gray-200 p-3">
                                <p className="font-semibold text-gray-800">{idx + 1}. <span className="font-mono">{line.code}</span> - {line.description}</p>
                                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 pl-5 sm:grid-cols-4 text-gray-500">
                                  <p>DOS: <span className="font-medium text-gray-700">{line.from}</span></p>
                                  <p>Units: <span className="font-medium text-gray-700">1</span></p>
                                  <p>Charge: <span className="font-medium text-gray-700">${line.charge.toFixed(2)}</span></p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
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

                {/* Quick Tip Panel */}
                <div className="xl:col-span-1">
                  <div className="sticky top-28 rounded-xl bg-blue-50 p-6">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-xl text-blue-600" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                      <h4 className="text-lg font-semibold text-blue-700">Quick Tip</h4>
                    </div>
                    {step === 1 && (
                      <p className="mt-4 text-base leading-relaxed text-gray-700">You can link to an existing patient by searching their name or create a new one by filling out the form.</p>
                    )}
                    {step === 2 && (
                      <>
                        <p className="mt-4 text-base leading-relaxed text-gray-700">Choose the payer that matches the patient&apos;s active insurance plan.</p>
                        <ul className="mt-4 list-disc space-y-2 pl-5 text-base text-gray-700">
                          <li>Prior auth affects claim acceptance</li>
                          <li>Group number may be optional</li>
                          <li>Ensure subscriber ID matches the policy</li>
                        </ul>
                      </>
                    )}
                    {step === 3 && (
                      <>
                        <p className="mt-4 text-base leading-relaxed text-gray-700">Billing and rendering providers aren&apos;t always the same. Select the billing provider that will receive payment.</p>
                        <ul className="mt-4 list-disc space-y-2 pl-5 text-base text-gray-700">
                          <li>NPI auto-fills for most providers</li>
                          <li>POS codes are mandatory for outpatient claims</li>
                        </ul>
                      </>
                    )}
                    {step === 4 && (
                      <>
                        <p className="mt-4 text-base leading-relaxed text-gray-700">List the primary diagnosis first. All diagnoses should support the procedures being performed.</p>
                        <ul className="mt-4 list-disc space-y-2 pl-5 text-base text-gray-700">
                          <li>Primary diagnosis determines medical necessity</li>
                          <li>Up to 12 diagnoses can be added</li>
                        </ul>
                      </>
                    )}
                    {step === 5 && (
                      <>
                        <p className="mt-4 text-base leading-relaxed text-gray-700">Service lines represent the procedures performed. Be sure each CPT/HCPCS code connects to the appropriate diagnosis.</p>
                        <ul className="mt-4 list-disc space-y-2 pl-5 text-base text-gray-700">
                          <li>Diagnosis pointers map ICD-10 codes to services</li>
                          <li>Units affect payment amounts</li>
                          <li>Modifiers change reimbursement rules</li>
                        </ul>
                      </>
                    )}
                    {step === 6 && (
                      <>
                        <p className="mt-4 text-base leading-relaxed text-gray-700">Use this summary to spot obvious issues before the claim is created.</p>
                        <ul className="mt-4 list-disc space-y-2 pl-5 text-base text-gray-700">
                          <li>Click any section&apos;s Edit link to jump back</li>
                          <li>Review diagnosis-to-service line mapping</li>
                          <li>Confirm payer and prior auth details</li>
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

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





