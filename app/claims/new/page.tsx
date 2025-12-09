"use client";

import { useMemo, useState } from "react";
import { supabase, hasSupabaseEnv } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

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
    patient: {},
    insurance: {},
    provider: {},
    diagnoses: [],
    serviceLines: [],
    clinicalNotes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(3);
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
    setDraft((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
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
    if (!supabase || !hasSupabaseEnv) {
      setError("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      setLoading(false);
      return;
    }
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user?.id;
    if (!userId) {
      setError("Please sign in.");
      setLoading(false);
      return;
    }

    const payload = {
      patient: draft.patient,
      insurance: draft.insurance,
      provider: draft.provider,
      diagnoses: draft.diagnoses,
      serviceLines: draft.serviceLines,
      clinicalNotes: draft.clinicalNotes,
      totals: { totalCharge },
    };

    const { error: err } = await supabase.from("claims").insert({
      user_id: userId,
      trading_partner_name: draft.provider.billingProvider,
      trading_partner_service_id: draft.provider.billingNpi,
      claim_charge_amount: totalCharge || null,
      status: "draft",
      payload,
    });
    if (err) setError(err.message);
    else router.push("/dashboard");
    setLoading(false);
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

