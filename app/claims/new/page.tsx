"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { ModernNav } from "@/components/ui/ModernNav";

interface ClaimFormData {
  patientFirstName: string;
  patientLastName: string;
  patientDob: string;
  patientGender: string;
  patientAddress: string;
  patientCity: string;
  patientState: string;
  patientZip: string;
  payerName: string;
  payerId: string;
  memberId: string;
  dateOfService: string;
  placeOfService: string;
  procedureCode: string;
  diagnosisCode: string;
  chargeAmount: string;
  renderingProviderNpi: string;
  billingProviderNpi: string;
}

const INITIAL_FORM: ClaimFormData = {
  patientFirstName: "",
  patientLastName: "",
  patientDob: "",
  patientGender: "M",
  patientAddress: "",
  patientCity: "",
  patientState: "",
  patientZip: "",
  payerName: "",
  payerId: "",
  memberId: "",
  dateOfService: "",
  placeOfService: "11",
  procedureCode: "",
  diagnosisCode: "",
  chargeAmount: "",
  renderingProviderNpi: "",
  billingProviderNpi: "",
};

const TEST_DATA: ClaimFormData = {
  patientFirstName: "Jane",
  patientLastName: "Doe",
  patientDob: "1990-01-15",
  patientGender: "F",
  patientAddress: "123 Main St",
  patientCity: "Dallas",
  patientState: "TX",
  patientZip: "75001",
  payerName: "Stedi Test Payer",
  payerId: "STEDI_SBOX",
  memberId: "MEM12345",
  dateOfService: new Date().toISOString().split("T")[0],
  placeOfService: "11",
  procedureCode: "99213",
  diagnosisCode: "J06.9",
  chargeAmount: "240.00",
  renderingProviderNpi: "1234567893",
  billingProviderNpi: "1234567893",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </motion.div>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  options,
}: {
  label: string;
  name: keyof ClaimFormData;
  value: string;
  onChange: (name: keyof ClaimFormData, value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">
        {label}
        {required && <span className="text-rose-400 ml-1">*</span>}
      </label>
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="w-full rounded-lg bg-white/[0.05] border border-white/[0.1] px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900">
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg bg-white/[0.05] border border-white/[0.1] px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      )}
    </div>
  );
}

export default function NewClaimPage() {
  const router = useRouter();
  const [form, setForm] = useState<ClaimFormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      setUserId(data.session?.user?.id || null);
    };
    checkAuth();
  }, []);

  const handleChange = (name: keyof ClaimFormData, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const loadTestData = () => {
    setForm(TEST_DATA);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const patientControlNumber = `CLM${Date.now().toString().slice(-12)}`;
      
      const claimPayload = {
        tradingPartnerServiceId: form.payerId || "STEDI_SBOX",
        submitter: {
          organizationName: "Clinix AI Billing",
          contactInformation: {
            name: "Billing Department",
            phoneNumber: "5551234567",
          },
        },
        receiver: {
          organizationName: form.payerName || "Stedi Test Payer",
        },
        billing: {
          providerType: "BillingProvider",
          npi: form.billingProviderNpi,
          organizationName: "Clinix Medical Practice",
          address: {
            address1: "456 Provider Way",
            city: "Dallas",
            state: "TX",
            postalCode: "75201",
          },
        },
        subscriber: {
          memberId: form.memberId,
          firstName: form.patientFirstName,
          lastName: form.patientLastName,
          gender: form.patientGender,
          dateOfBirth: form.patientDob,
          address: {
            address1: form.patientAddress,
            city: form.patientCity,
            state: form.patientState,
            postalCode: form.patientZip,
          },
        },
        claimInformation: {
          claimFilingCode: "CI",
          patientControlNumber,
          claimChargeAmount: form.chargeAmount,
          placeOfServiceCode: form.placeOfService,
          claimFrequencyCode: "1",
          signatureIndicator: "Y",
          planParticipationCode: "A",
          releaseInformationCode: "Y",
          benefitsAssignmentCertificationIndicator: "Y",
          healthCareCodeInformation: [
            {
              diagnosisTypeCode: "ABK",
              diagnosisCode: form.diagnosisCode,
            },
          ],
          serviceFacilityLocation: {
            organizationName: "Clinix Medical Practice",
            address: {
              address1: "456 Provider Way",
              city: "Dallas",
              state: "TX",
              postalCode: "75201",
            },
          },
          serviceLines: [
            {
              serviceDate: form.dateOfService.replace(/-/g, ""),
              professionalService: {
                procedureCode: form.procedureCode,
                procedureModifiers: [],
                lineItemChargeAmount: form.chargeAmount,
                measurementUnit: "UN",
                serviceUnitCount: "1",
                compositeDiagnosisCodePointers: {
                  diagnosisCodePointers: ["1"],
                },
              },
            },
          ],
        },
        rendering: {
          providerType: "RenderingProvider",
          npi: form.renderingProviderNpi,
          firstName: "John",
          lastName: "Smith",
          taxonomyCode: "207Q00000X",
        },
      };

      const response = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: "https://healthcare.us.stedi.com/2024-04-01/change/professionalclaims/v3/submission",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: claimPayload,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to submit claim");
      }

      // Store in Supabase
      if (supabase && userId) {
        const claimData = {
          user_id: userId,
          patient_name: `${form.patientFirstName} ${form.patientLastName}`,
          payer_name: form.payerName,
          payer_id: form.payerId,
          date_of_service: form.dateOfService,
          claim_charge_amount: parseFloat(form.chargeAmount),
          procedure_code: form.procedureCode,
          diagnosis_code: form.diagnosisCode,
          status: "submitted",
          stedi_claim_id: result.claimId || patientControlNumber,
          patient_control_number: patientControlNumber,
          raw_response: result,
        };

        await supabase.from("claims").insert(claimData);
      }

      router.push(`/claims/success?claimId=${result.claimId || patientControlNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  if (!userId && supabase) {
    return (
      <AuroraBackground className="flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-8 shadow-2xl text-center space-y-6"
        >
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-blue-400">lock</span>
          </div>
          <div>
            <p className="text-xl font-semibold text-white">Sign In Required</p>
            <p className="text-sm text-slate-300 mt-1">Create and submit claims</p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold hover:shadow-xl transition-all"
          >
            Sign In
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </motion.div>
      </AuroraBackground>
    );
  }

  return (
    <AuroraBackground>
      <ModernNav />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">New Claim</h1>
            <p className="text-slate-400 mt-1">Submit a professional healthcare claim</p>
          </div>
          <button
            onClick={loadTestData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all"
          >
            <span className="material-symbols-outlined text-lg">science</span>
            Load Test Data
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Section title="Patient Information">
            <FormField label="First Name" name="patientFirstName" value={form.patientFirstName} onChange={handleChange} required />
            <FormField label="Last Name" name="patientLastName" value={form.patientLastName} onChange={handleChange} required />
            <FormField label="Date of Birth" name="patientDob" value={form.patientDob} onChange={handleChange} type="date" required />
            <FormField
              label="Gender"
              name="patientGender"
              value={form.patientGender}
              onChange={handleChange}
              options={[
                { value: "M", label: "Male" },
                { value: "F", label: "Female" },
              ]}
            />
            <FormField label="Address" name="patientAddress" value={form.patientAddress} onChange={handleChange} />
            <FormField label="City" name="patientCity" value={form.patientCity} onChange={handleChange} />
            <FormField label="State" name="patientState" value={form.patientState} onChange={handleChange} placeholder="TX" />
            <FormField label="ZIP Code" name="patientZip" value={form.patientZip} onChange={handleChange} placeholder="75001" />
          </Section>

          <Section title="Insurance Information">
            <FormField label="Payer Name" name="payerName" value={form.payerName} onChange={handleChange} required placeholder="e.g., Stedi Test Payer" />
            <FormField label="Payer ID" name="payerId" value={form.payerId} onChange={handleChange} required placeholder="e.g., STEDI_SBOX" />
            <FormField label="Member ID" name="memberId" value={form.memberId} onChange={handleChange} required placeholder="e.g., MEM12345" />
          </Section>

          <Section title="Service Details">
            <FormField label="Date of Service" name="dateOfService" value={form.dateOfService} onChange={handleChange} type="date" required />
            <FormField
              label="Place of Service"
              name="placeOfService"
              value={form.placeOfService}
              onChange={handleChange}
              options={[
                { value: "11", label: "11 - Office" },
                { value: "21", label: "21 - Inpatient Hospital" },
                { value: "22", label: "22 - Outpatient Hospital" },
                { value: "23", label: "23 - Emergency Room" },
              ]}
            />
            <FormField label="Procedure Code (CPT)" name="procedureCode" value={form.procedureCode} onChange={handleChange} required placeholder="e.g., 99213" />
            <FormField label="Diagnosis Code (ICD-10)" name="diagnosisCode" value={form.diagnosisCode} onChange={handleChange} required placeholder="e.g., J06.9" />
            <FormField label="Charge Amount" name="chargeAmount" value={form.chargeAmount} onChange={handleChange} required placeholder="e.g., 240.00" />
          </Section>

          <Section title="Provider Information">
            <FormField label="Rendering Provider NPI" name="renderingProviderNpi" value={form.renderingProviderNpi} onChange={handleChange} required placeholder="10-digit NPI" />
            <FormField label="Billing Provider NPI" name="billingProviderNpi" value={form.billingProviderNpi} onChange={handleChange} required placeholder="10-digit NPI" />
          </Section>

          <div className="flex items-center justify-end gap-4 pt-4">
            <Link href="/dashboard" className="px-6 py-3 rounded-xl border border-white/[0.1] text-slate-300 hover:bg-white/[0.05] transition-all">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-xl disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="material-symbols-outlined text-lg"
                  >
                    progress_activity
                  </motion.span>
                  Submitting...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">send</span>
                  Submit Claim
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </AuroraBackground>
  );
}


import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { ModernNav } from "@/components/ui/ModernNav";

interface ClaimFormData {
  patientFirstName: string;
  patientLastName: string;
  patientDob: string;
  patientGender: string;
  patientAddress: string;
  patientCity: string;
  patientState: string;
  patientZip: string;
  payerName: string;
  payerId: string;
  memberId: string;
  dateOfService: string;
  placeOfService: string;
  procedureCode: string;
  diagnosisCode: string;
  chargeAmount: string;
  renderingProviderNpi: string;
  billingProviderNpi: string;
}

const INITIAL_FORM: ClaimFormData = {
  patientFirstName: "",
  patientLastName: "",
  patientDob: "",
  patientGender: "M",
  patientAddress: "",
  patientCity: "",
  patientState: "",
  patientZip: "",
  payerName: "",
  payerId: "",
  memberId: "",
  dateOfService: "",
  placeOfService: "11",
  procedureCode: "",
  diagnosisCode: "",
  chargeAmount: "",
  renderingProviderNpi: "",
  billingProviderNpi: "",
};

const TEST_DATA: ClaimFormData = {
  patientFirstName: "Jane",
  patientLastName: "Doe",
  patientDob: "1990-01-15",
  patientGender: "F",
  patientAddress: "123 Main St",
  patientCity: "Dallas",
  patientState: "TX",
  patientZip: "75001",
  payerName: "Stedi Test Payer",
  payerId: "STEDI_SBOX",
  memberId: "MEM12345",
  dateOfService: new Date().toISOString().split("T")[0],
  placeOfService: "11",
  procedureCode: "99213",
  diagnosisCode: "J06.9",
  chargeAmount: "240.00",
  renderingProviderNpi: "1234567893",
  billingProviderNpi: "1234567893",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </motion.div>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  options,
}: {
  label: string;
  name: keyof ClaimFormData;
  value: string;
  onChange: (name: keyof ClaimFormData, value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">
        {label}
        {required && <span className="text-rose-400 ml-1">*</span>}
      </label>
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="w-full rounded-lg bg-white/[0.05] border border-white/[0.1] px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900">
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg bg-white/[0.05] border border-white/[0.1] px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      )}
    </div>
  );
}

export default function NewClaimPage() {
  const router = useRouter();
  const [form, setForm] = useState<ClaimFormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      setUserId(data.session?.user?.id || null);
    };
    checkAuth();
  }, []);

  const handleChange = (name: keyof ClaimFormData, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const loadTestData = () => {
    setForm(TEST_DATA);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const patientControlNumber = `CLM${Date.now().toString().slice(-12)}`;
      
      const claimPayload = {
        tradingPartnerServiceId: form.payerId || "STEDI_SBOX",
        submitter: {
          organizationName: "Clinix AI Billing",
          contactInformation: {
            name: "Billing Department",
            phoneNumber: "5551234567",
          },
        },
        receiver: {
          organizationName: form.payerName || "Stedi Test Payer",
        },
        billing: {
          providerType: "BillingProvider",
          npi: form.billingProviderNpi,
          organizationName: "Clinix Medical Practice",
          address: {
            address1: "456 Provider Way",
            city: "Dallas",
            state: "TX",
            postalCode: "75201",
          },
        },
        subscriber: {
          memberId: form.memberId,
          firstName: form.patientFirstName,
          lastName: form.patientLastName,
          gender: form.patientGender,
          dateOfBirth: form.patientDob,
          address: {
            address1: form.patientAddress,
            city: form.patientCity,
            state: form.patientState,
            postalCode: form.patientZip,
          },
        },
        claimInformation: {
          claimFilingCode: "CI",
          patientControlNumber,
          claimChargeAmount: form.chargeAmount,
          placeOfServiceCode: form.placeOfService,
          claimFrequencyCode: "1",
          signatureIndicator: "Y",
          planParticipationCode: "A",
          releaseInformationCode: "Y",
          benefitsAssignmentCertificationIndicator: "Y",
          healthCareCodeInformation: [
            {
              diagnosisTypeCode: "ABK",
              diagnosisCode: form.diagnosisCode,
            },
          ],
          serviceFacilityLocation: {
            organizationName: "Clinix Medical Practice",
            address: {
              address1: "456 Provider Way",
              city: "Dallas",
              state: "TX",
              postalCode: "75201",
            },
          },
          serviceLines: [
            {
              serviceDate: form.dateOfService.replace(/-/g, ""),
              professionalService: {
                procedureCode: form.procedureCode,
                procedureModifiers: [],
                lineItemChargeAmount: form.chargeAmount,
                measurementUnit: "UN",
                serviceUnitCount: "1",
                compositeDiagnosisCodePointers: {
                  diagnosisCodePointers: ["1"],
                },
              },
            },
          ],
        },
        rendering: {
          providerType: "RenderingProvider",
          npi: form.renderingProviderNpi,
          firstName: "John",
          lastName: "Smith",
          taxonomyCode: "207Q00000X",
        },
      };

      const response = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: "https://healthcare.us.stedi.com/2024-04-01/change/professionalclaims/v3/submission",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: claimPayload,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to submit claim");
      }

      // Store in Supabase
      if (supabase && userId) {
        const claimData = {
          user_id: userId,
          patient_name: `${form.patientFirstName} ${form.patientLastName}`,
          payer_name: form.payerName,
          payer_id: form.payerId,
          date_of_service: form.dateOfService,
          claim_charge_amount: parseFloat(form.chargeAmount),
          procedure_code: form.procedureCode,
          diagnosis_code: form.diagnosisCode,
          status: "submitted",
          stedi_claim_id: result.claimId || patientControlNumber,
          patient_control_number: patientControlNumber,
          raw_response: result,
        };

        await supabase.from("claims").insert(claimData);
      }

      router.push(`/claims/success?claimId=${result.claimId || patientControlNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  if (!userId && supabase) {
    return (
      <AuroraBackground className="flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-8 shadow-2xl text-center space-y-6"
        >
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-blue-400">lock</span>
          </div>
          <div>
            <p className="text-xl font-semibold text-white">Sign In Required</p>
            <p className="text-sm text-slate-300 mt-1">Create and submit claims</p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold hover:shadow-xl transition-all"
          >
            Sign In
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </motion.div>
      </AuroraBackground>
    );
  }

  return (
    <AuroraBackground>
      <ModernNav />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">New Claim</h1>
            <p className="text-slate-400 mt-1">Submit a professional healthcare claim</p>
          </div>
          <button
            onClick={loadTestData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all"
          >
            <span className="material-symbols-outlined text-lg">science</span>
            Load Test Data
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Section title="Patient Information">
            <FormField label="First Name" name="patientFirstName" value={form.patientFirstName} onChange={handleChange} required />
            <FormField label="Last Name" name="patientLastName" value={form.patientLastName} onChange={handleChange} required />
            <FormField label="Date of Birth" name="patientDob" value={form.patientDob} onChange={handleChange} type="date" required />
            <FormField
              label="Gender"
              name="patientGender"
              value={form.patientGender}
              onChange={handleChange}
              options={[
                { value: "M", label: "Male" },
                { value: "F", label: "Female" },
              ]}
            />
            <FormField label="Address" name="patientAddress" value={form.patientAddress} onChange={handleChange} />
            <FormField label="City" name="patientCity" value={form.patientCity} onChange={handleChange} />
            <FormField label="State" name="patientState" value={form.patientState} onChange={handleChange} placeholder="TX" />
            <FormField label="ZIP Code" name="patientZip" value={form.patientZip} onChange={handleChange} placeholder="75001" />
          </Section>

          <Section title="Insurance Information">
            <FormField label="Payer Name" name="payerName" value={form.payerName} onChange={handleChange} required placeholder="e.g., Stedi Test Payer" />
            <FormField label="Payer ID" name="payerId" value={form.payerId} onChange={handleChange} required placeholder="e.g., STEDI_SBOX" />
            <FormField label="Member ID" name="memberId" value={form.memberId} onChange={handleChange} required placeholder="e.g., MEM12345" />
          </Section>

          <Section title="Service Details">
            <FormField label="Date of Service" name="dateOfService" value={form.dateOfService} onChange={handleChange} type="date" required />
            <FormField
              label="Place of Service"
              name="placeOfService"
              value={form.placeOfService}
              onChange={handleChange}
              options={[
                { value: "11", label: "11 - Office" },
                { value: "21", label: "21 - Inpatient Hospital" },
                { value: "22", label: "22 - Outpatient Hospital" },
                { value: "23", label: "23 - Emergency Room" },
              ]}
            />
            <FormField label="Procedure Code (CPT)" name="procedureCode" value={form.procedureCode} onChange={handleChange} required placeholder="e.g., 99213" />
            <FormField label="Diagnosis Code (ICD-10)" name="diagnosisCode" value={form.diagnosisCode} onChange={handleChange} required placeholder="e.g., J06.9" />
            <FormField label="Charge Amount" name="chargeAmount" value={form.chargeAmount} onChange={handleChange} required placeholder="e.g., 240.00" />
          </Section>

          <Section title="Provider Information">
            <FormField label="Rendering Provider NPI" name="renderingProviderNpi" value={form.renderingProviderNpi} onChange={handleChange} required placeholder="10-digit NPI" />
            <FormField label="Billing Provider NPI" name="billingProviderNpi" value={form.billingProviderNpi} onChange={handleChange} required placeholder="10-digit NPI" />
          </Section>

          <div className="flex items-center justify-end gap-4 pt-4">
            <Link href="/dashboard" className="px-6 py-3 rounded-xl border border-white/[0.1] text-slate-300 hover:bg-white/[0.05] transition-all">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-xl disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="material-symbols-outlined text-lg"
                  >
                    progress_activity
                  </motion.span>
                  Submitting...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">send</span>
                  Submit Claim
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </AuroraBackground>
  );
}


import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { ModernNav } from "@/components/ui/ModernNav";

interface ClaimFormData {
  patientFirstName: string;
  patientLastName: string;
  patientDob: string;
  patientGender: string;
  patientAddress: string;
  patientCity: string;
  patientState: string;
  patientZip: string;
  payerName: string;
  payerId: string;
  memberId: string;
  dateOfService: string;
  placeOfService: string;
  procedureCode: string;
  diagnosisCode: string;
  chargeAmount: string;
  renderingProviderNpi: string;
  billingProviderNpi: string;
}

const INITIAL_FORM: ClaimFormData = {
  patientFirstName: "",
  patientLastName: "",
  patientDob: "",
  patientGender: "M",
  patientAddress: "",
  patientCity: "",
  patientState: "",
  patientZip: "",
  payerName: "",
  payerId: "",
  memberId: "",
  dateOfService: "",
  placeOfService: "11",
  procedureCode: "",
  diagnosisCode: "",
  chargeAmount: "",
  renderingProviderNpi: "",
  billingProviderNpi: "",
};

const TEST_DATA: ClaimFormData = {
  patientFirstName: "Jane",
  patientLastName: "Doe",
  patientDob: "1990-01-15",
  patientGender: "F",
  patientAddress: "123 Main St",
  patientCity: "Dallas",
  patientState: "TX",
  patientZip: "75001",
  payerName: "Stedi Test Payer",
  payerId: "STEDI_SBOX",
  memberId: "MEM12345",
  dateOfService: new Date().toISOString().split("T")[0],
  placeOfService: "11",
  procedureCode: "99213",
  diagnosisCode: "J06.9",
  chargeAmount: "240.00",
  renderingProviderNpi: "1234567893",
  billingProviderNpi: "1234567893",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </motion.div>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  options,
}: {
  label: string;
  name: keyof ClaimFormData;
  value: string;
  onChange: (name: keyof ClaimFormData, value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">
        {label}
        {required && <span className="text-rose-400 ml-1">*</span>}
      </label>
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="w-full rounded-lg bg-white/[0.05] border border-white/[0.1] px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900">
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg bg-white/[0.05] border border-white/[0.1] px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      )}
    </div>
  );
}

export default function NewClaimPage() {
  const router = useRouter();
  const [form, setForm] = useState<ClaimFormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      setUserId(data.session?.user?.id || null);
    };
    checkAuth();
  }, []);

  const handleChange = (name: keyof ClaimFormData, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const loadTestData = () => {
    setForm(TEST_DATA);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const patientControlNumber = `CLM${Date.now().toString().slice(-12)}`;
      
      const claimPayload = {
        tradingPartnerServiceId: form.payerId || "STEDI_SBOX",
        submitter: {
          organizationName: "Clinix AI Billing",
          contactInformation: {
            name: "Billing Department",
            phoneNumber: "5551234567",
          },
        },
        receiver: {
          organizationName: form.payerName || "Stedi Test Payer",
        },
        billing: {
          providerType: "BillingProvider",
          npi: form.billingProviderNpi,
          organizationName: "Clinix Medical Practice",
          address: {
            address1: "456 Provider Way",
            city: "Dallas",
            state: "TX",
            postalCode: "75201",
          },
        },
        subscriber: {
          memberId: form.memberId,
          firstName: form.patientFirstName,
          lastName: form.patientLastName,
          gender: form.patientGender,
          dateOfBirth: form.patientDob,
          address: {
            address1: form.patientAddress,
            city: form.patientCity,
            state: form.patientState,
            postalCode: form.patientZip,
          },
        },
        claimInformation: {
          claimFilingCode: "CI",
          patientControlNumber,
          claimChargeAmount: form.chargeAmount,
          placeOfServiceCode: form.placeOfService,
          claimFrequencyCode: "1",
          signatureIndicator: "Y",
          planParticipationCode: "A",
          releaseInformationCode: "Y",
          benefitsAssignmentCertificationIndicator: "Y",
          healthCareCodeInformation: [
            {
              diagnosisTypeCode: "ABK",
              diagnosisCode: form.diagnosisCode,
            },
          ],
          serviceFacilityLocation: {
            organizationName: "Clinix Medical Practice",
            address: {
              address1: "456 Provider Way",
              city: "Dallas",
              state: "TX",
              postalCode: "75201",
            },
          },
          serviceLines: [
            {
              serviceDate: form.dateOfService.replace(/-/g, ""),
              professionalService: {
                procedureCode: form.procedureCode,
                procedureModifiers: [],
                lineItemChargeAmount: form.chargeAmount,
                measurementUnit: "UN",
                serviceUnitCount: "1",
                compositeDiagnosisCodePointers: {
                  diagnosisCodePointers: ["1"],
                },
              },
            },
          ],
        },
        rendering: {
          providerType: "RenderingProvider",
          npi: form.renderingProviderNpi,
          firstName: "John",
          lastName: "Smith",
          taxonomyCode: "207Q00000X",
        },
      };

      const response = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: "https://healthcare.us.stedi.com/2024-04-01/change/professionalclaims/v3/submission",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: claimPayload,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to submit claim");
      }

      // Store in Supabase
      if (supabase && userId) {
        const claimData = {
          user_id: userId,
          patient_name: `${form.patientFirstName} ${form.patientLastName}`,
          payer_name: form.payerName,
          payer_id: form.payerId,
          date_of_service: form.dateOfService,
          claim_charge_amount: parseFloat(form.chargeAmount),
          procedure_code: form.procedureCode,
          diagnosis_code: form.diagnosisCode,
          status: "submitted",
          stedi_claim_id: result.claimId || patientControlNumber,
          patient_control_number: patientControlNumber,
          raw_response: result,
        };

        await supabase.from("claims").insert(claimData);
      }

      router.push(`/claims/success?claimId=${result.claimId || patientControlNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  if (!userId && supabase) {
    return (
      <AuroraBackground className="flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-8 shadow-2xl text-center space-y-6"
        >
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-blue-400">lock</span>
          </div>
          <div>
            <p className="text-xl font-semibold text-white">Sign In Required</p>
            <p className="text-sm text-slate-300 mt-1">Create and submit claims</p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold hover:shadow-xl transition-all"
          >
            Sign In
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </motion.div>
      </AuroraBackground>
    );
  }

  return (
    <AuroraBackground>
      <ModernNav />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">New Claim</h1>
            <p className="text-slate-400 mt-1">Submit a professional healthcare claim</p>
          </div>
          <button
            onClick={loadTestData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all"
          >
            <span className="material-symbols-outlined text-lg">science</span>
            Load Test Data
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Section title="Patient Information">
            <FormField label="First Name" name="patientFirstName" value={form.patientFirstName} onChange={handleChange} required />
            <FormField label="Last Name" name="patientLastName" value={form.patientLastName} onChange={handleChange} required />
            <FormField label="Date of Birth" name="patientDob" value={form.patientDob} onChange={handleChange} type="date" required />
            <FormField
              label="Gender"
              name="patientGender"
              value={form.patientGender}
              onChange={handleChange}
              options={[
                { value: "M", label: "Male" },
                { value: "F", label: "Female" },
              ]}
            />
            <FormField label="Address" name="patientAddress" value={form.patientAddress} onChange={handleChange} />
            <FormField label="City" name="patientCity" value={form.patientCity} onChange={handleChange} />
            <FormField label="State" name="patientState" value={form.patientState} onChange={handleChange} placeholder="TX" />
            <FormField label="ZIP Code" name="patientZip" value={form.patientZip} onChange={handleChange} placeholder="75001" />
          </Section>

          <Section title="Insurance Information">
            <FormField label="Payer Name" name="payerName" value={form.payerName} onChange={handleChange} required placeholder="e.g., Stedi Test Payer" />
            <FormField label="Payer ID" name="payerId" value={form.payerId} onChange={handleChange} required placeholder="e.g., STEDI_SBOX" />
            <FormField label="Member ID" name="memberId" value={form.memberId} onChange={handleChange} required placeholder="e.g., MEM12345" />
          </Section>

          <Section title="Service Details">
            <FormField label="Date of Service" name="dateOfService" value={form.dateOfService} onChange={handleChange} type="date" required />
            <FormField
              label="Place of Service"
              name="placeOfService"
              value={form.placeOfService}
              onChange={handleChange}
              options={[
                { value: "11", label: "11 - Office" },
                { value: "21", label: "21 - Inpatient Hospital" },
                { value: "22", label: "22 - Outpatient Hospital" },
                { value: "23", label: "23 - Emergency Room" },
              ]}
            />
            <FormField label="Procedure Code (CPT)" name="procedureCode" value={form.procedureCode} onChange={handleChange} required placeholder="e.g., 99213" />
            <FormField label="Diagnosis Code (ICD-10)" name="diagnosisCode" value={form.diagnosisCode} onChange={handleChange} required placeholder="e.g., J06.9" />
            <FormField label="Charge Amount" name="chargeAmount" value={form.chargeAmount} onChange={handleChange} required placeholder="e.g., 240.00" />
          </Section>

          <Section title="Provider Information">
            <FormField label="Rendering Provider NPI" name="renderingProviderNpi" value={form.renderingProviderNpi} onChange={handleChange} required placeholder="10-digit NPI" />
            <FormField label="Billing Provider NPI" name="billingProviderNpi" value={form.billingProviderNpi} onChange={handleChange} required placeholder="10-digit NPI" />
          </Section>

          <div className="flex items-center justify-end gap-4 pt-4">
            <Link href="/dashboard" className="px-6 py-3 rounded-xl border border-white/[0.1] text-slate-300 hover:bg-white/[0.05] transition-all">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-xl disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="material-symbols-outlined text-lg"
                  >
                    progress_activity
                  </motion.span>
                  Submitting...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">send</span>
                  Submit Claim
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </AuroraBackground>
  );
}

