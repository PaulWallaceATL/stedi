"use client";

import { useState } from "react";
import { supabase, hasSupabaseEnv } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type ClaimPayload = {
  tradingPartnerName?: string;
  tradingPartnerServiceId?: string;
  claimChargeAmount?: string;
  memberId?: string;
  patientControlNumber?: string;
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
  const [payload, setPayload] = useState<ClaimPayload>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(3);
  const router = useRouter();

  const supabaseMissing = !hasSupabaseEnv || !supabase;

  const onChange = (key: keyof ClaimPayload, value: string) => {
    setPayload((prev) => ({ ...prev, [key]: value }));
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
    const { error: err } = await supabase.from("claims").insert({
      user_id: userId,
      trading_partner_name: payload.tradingPartnerName,
      trading_partner_service_id: payload.tradingPartnerServiceId,
      claim_charge_amount: payload.claimChargeAmount ? Number(payload.claimChargeAmount) : null,
      status: "draft",
      payload,
    });
    if (err) setError(err.message);
    else router.push("/dashboard");
    setLoading(false);
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
          <div className="mb-10">
            <p className="text-4xl font-black leading-tight tracking-tight text-[#111418]">Create Claim From Scratch</p>
            <p className="text-lg font-normal leading-normal text-[#617589]">Step 3 of 6: Provider & Facility</p>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <aside className="lg:col-span-3">
              <div className="sticky top-24 py-2">
                <div className="flex flex-col gap-2 rounded-xl bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] ring-1 ring-slate-200">
                  {steps.map((step) => {
                    const status =
                      step.id === currentStep
                        ? "current"
                        : step.id < currentStep
                          ? "complete"
                          : "upcoming";
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
                  <div className="space-y-12">
                    <div className="space-y-2">
                      <h3 className="col-span-full text-2xl font-bold text-[#111418]">Provider & Facility</h3>
                      <p className="text-base text-gray-600">
                        These details determine who is billing for the service and where the patient was treated.
                      </p>
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
                              value={payload.billingProvider || ""}
                              onChange={(v) => onChange("billingProvider", v)}
                              placeholder="Search by name or NPI"
                            />
                          </div>
                          <FormInput
                            label="NPI"
                            value={payload.billingNpi || ""}
                            onChange={(v) => onChange("billingNpi", v)}
                            placeholder="Auto-populated"
                          />
                          <FormInput
                            label="Taxonomy Code (Optional)"
                            value={payload.taxonomyCode || ""}
                            onChange={(v) => onChange("taxonomyCode", v)}
                            placeholder="Enter taxonomy code"
                          />

                          <div className="sm:col-span-2 space-y-6">
                            <h5 className="text-base font-medium text-[#111418]">Billing Address</h5>
                            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                              <FormInput
                                label="Address Line 1"
                                value={payload.billingAddress1 || ""}
                                onChange={(v) => onChange("billingAddress1", v)}
                              />
                              <FormInput
                                label="Address Line 2 (Optional)"
                                value={payload.billingAddress2 || ""}
                                onChange={(v) => onChange("billingAddress2", v)}
                              />
                              <FormInput
                                label="City"
                                value={payload.billingCity || ""}
                                onChange={(v) => onChange("billingCity", v)}
                              />
                              <div className="grid grid-cols-2 gap-x-4">
                                <FormInput
                                  label="State"
                                  value={payload.billingState || ""}
                                  onChange={(v) => onChange("billingState", v)}
                                />
                                <FormInput
                                  label="ZIP"
                                  value={payload.billingZip || ""}
                                  onChange={(v) => onChange("billingZip", v)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <FormField
                          label="Rendering Provider"
                          helper="Rendering provider is the clinician who performed the service."
                          icon="search"
                          value={payload.renderingProvider || ""}
                          onChange={(v) => onChange("renderingProvider", v)}
                          placeholder="Search for a provider"
                        />
                        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-3">
                          <FormInput
                            label="Rendering NPI"
                            value={payload.renderingNpi || ""}
                            onChange={(v) => onChange("renderingNpi", v)}
                          />
                          <FormInput
                            label="Specialty (Optional)"
                            value={payload.specialty || ""}
                            onChange={(v) => onChange("specialty", v)}
                          />
                          <FormInput
                            label="Claim charge amount"
                            value={payload.claimChargeAmount || ""}
                            onChange={(v) => onChange("claimChargeAmount", v)}
                            placeholder="$0.00"
                          />
                        </div>
                      </div>

                      <hr className="border-gray-200" />

                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-[#111418]">Facility / Place of Service</h4>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                          <FormInput
                            label="Facility Name (Optional)"
                            value={payload.facilityName || ""}
                            onChange={(v) => onChange("facilityName", v)}
                          />
                          <FormInput
                            label="Facility Address (Optional)"
                            value={payload.facilityAddress || ""}
                            onChange={(v) => onChange("facilityAddress", v)}
                          />
                          <div className="sm:col-span-2">
                            <label className="flex flex-col gap-2">
                              <span className="text-base font-medium text-[#111418]">Place of Service (POS Code)</span>
                              <select
                                className="form-select block h-12 w-full appearance-none rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-[#137fec] focus:outline-0 focus:ring-2 focus:ring-[#137fec]/20 sm:max-w-xs"
                                value={payload.posCode || ""}
                                onChange={(e) => onChange("posCode", e.target.value)}
                              >
                                <option value="">Select</option>
                                <option value="11">11 - Office</option>
                                <option value="22">22 - Hospital Outpatient</option>
                                <option value="21">21 - Hospital Inpatient</option>
                                <option value="23">23 - Emergency Room</option>
                              </select>
                              <p className="text-sm text-gray-500">
                                POS determines payer reimbursement rules and may affect CPT/HCPCS requirements.
                              </p>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <aside className="xl:col-span-1">
                  <div className="sticky top-24 rounded-xl bg-[#e6f2ff] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-xl text-[#007bff]">lightbulb</span>
                      <h4 className="text-lg font-semibold text-[#0f3a71]">Quick Tip</h4>
                    </div>
                    <p className="mt-4 text-base leading-relaxed text-[#0f3a71]">
                      Billing and rendering providers aren’t always the same. Select the billing provider that will
                      receive payment, and the rendering provider who actually performed the service.
                    </p>
                    <ul className="mt-4 list-disc space-y-2 pl-5 text-base text-[#0f3a71]">
                      <li>NPI auto-fills for most providers</li>
                      <li>POS codes are mandatory for outpatient claims</li>
                      <li>Facility address is optional unless required by payer</li>
                    </ul>
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
            onClick={() => router.back()}
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
              onClick={submit}
              disabled={loading}
            >
              <span>{loading ? "Saving..." : "Next: Diagnoses (ICD-10)"}</span>
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

