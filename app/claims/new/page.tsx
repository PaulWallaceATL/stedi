"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { submitClaim } from "@/lib/stediClient";
import AnirulClaimAnalyzer from "@/components/AnirulClaimAnalyzer";

// Types
interface PatientInfo {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  mrn: string;
  relationship: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

interface InsuranceInfo {
  payerName: string;
  payerId: string;
  planType: string;
  policyNumber: string;
  groupNumber: string;
  subscriberId: string;
  subscriberRelationship: string;
  priorAuthRequired: boolean;
  priorAuthNumber: string;
}

interface ProviderInfo {
  billingProviderName: string;
  billingNpi: string;
  billingTaxId: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  renderingProviderName: string;
  renderingNpi: string;
  taxonomyCode: string;
  facilityName: string;
  facilityNpi: string;
  posCode: string;
}

interface Diagnosis {
  id: string;
  code: string;
  description: string;
  priority: number;
}

interface ServiceLine {
  id: string;
  code: string;
  description: string;
  modifiers: string[];
  dxPointers: number[];
  fromDate: string;
  toDate: string;
  units: number;
  charge: number;
}

interface ClaimDraft {
  patient: PatientInfo;
  insurance: InsuranceInfo;
  provider: ProviderInfo;
  diagnoses: Diagnosis[];
  serviceLines: ServiceLine[];
}

const INITIAL_DRAFT: ClaimDraft = {
  patient: {
    firstName: "",
    lastName: "",
    dob: "",
    gender: "F",
    mrn: "",
    relationship: "self",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  },
  insurance: {
    payerName: "",
    payerId: "",
    planType: "PPO",
    policyNumber: "",
    groupNumber: "",
    subscriberId: "",
    subscriberRelationship: "self",
    priorAuthRequired: false,
    priorAuthNumber: "",
  },
  provider: {
    billingProviderName: "Clinix AI Demo Practice",
    billingNpi: "1999999984",
    billingTaxId: "123456789",
    billingAddress: "456 Provider Way",
    billingCity: "Dallas",
    billingState: "TX",
    billingZip: "75201",
    renderingProviderName: "Dr. John Smith",
    renderingNpi: "1999999984",
    taxonomyCode: "207Q00000X",
    facilityName: "Clinix AI Demo Facility",
    facilityNpi: "1999999984",
    posCode: "11",
  },
  diagnoses: [],
  serviceLines: [],
};

// Common CPT codes for random test data generation
const CPT_CODES = [
  { code: "99213", description: "Office visit, established patient, level 3", charge: 150 },
  { code: "99214", description: "Office visit, established patient, level 4", charge: 200 },
  { code: "99215", description: "Office visit, established patient, level 5", charge: 275 },
  { code: "99203", description: "Office visit, new patient, level 3", charge: 175 },
  { code: "99204", description: "Office visit, new patient, level 4", charge: 250 },
  { code: "99385", description: "Preventive visit, 18-39 years, new", charge: 225 },
  { code: "99395", description: "Preventive visit, 18-39 years, established", charge: 195 },
  { code: "97110", description: "Therapeutic exercises", charge: 90 },
  { code: "97140", description: "Manual therapy techniques", charge: 85 },
  { code: "97530", description: "Therapeutic activities", charge: 80 },
  { code: "90837", description: "Psychotherapy, 60 minutes", charge: 175 },
  { code: "90834", description: "Psychotherapy, 45 minutes", charge: 135 },
  { code: "36415", description: "Venipuncture", charge: 15 },
  { code: "81002", description: "Urinalysis, non-automated", charge: 10 },
  { code: "93000", description: "Electrocardiogram, complete", charge: 65 },
  { code: "71046", description: "Chest X-ray, 2 views", charge: 85 },
  { code: "20610", description: "Joint injection, major", charge: 125 },
  { code: "11102", description: "Skin biopsy, tangential", charge: 145 },
  { code: "17000", description: "Destruction, premalignant lesion", charge: 95 },
  { code: "69210", description: "Ear wax removal", charge: 75 },
];

const ICD10_CODES = [
  { code: "M542", description: "Low back pain" },
  { code: "R519", description: "Fever, unspecified" },
  { code: "J069", description: "Acute upper respiratory infection" },
  { code: "K219", description: "Gastroesophageal reflux disease" },
  { code: "I10", description: "Essential hypertension" },
  { code: "E119", description: "Type 2 diabetes mellitus" },
  { code: "F329", description: "Major depressive disorder" },
  { code: "G439", description: "Migraine, unspecified" },
  { code: "M791", description: "Myalgia" },
  { code: "R109", description: "Abdominal pain, unspecified" },
  { code: "J209", description: "Acute bronchitis, unspecified" },
  { code: "N390", description: "Urinary tract infection" },
  { code: "L309", description: "Dermatitis, unspecified" },
  { code: "H109", description: "Conjunctivitis, unspecified" },
  { code: "M255", description: "Joint pain" },
];

const PATIENT_NAMES = [
  { first: "JANE", last: "DOE" },
  { first: "JOHN", last: "SMITH" },
  { first: "MARIA", last: "GARCIA" },
  { first: "DAVID", last: "JOHNSON" },
  { first: "SARAH", last: "WILLIAMS" },
  { first: "MICHAEL", last: "BROWN" },
  { first: "EMILY", last: "DAVIS" },
  { first: "ROBERT", last: "MILLER" },
];

// Function to generate random test data
function generateTestData(): ClaimDraft {
  const today = new Date().toISOString().split("T")[0];
  const patient = PATIENT_NAMES[Math.floor(Math.random() * PATIENT_NAMES.length)];
  
  // Pick 1-3 random diagnoses
  const numDx = Math.floor(Math.random() * 3) + 1;
  const shuffledDx = [...ICD10_CODES].sort(() => Math.random() - 0.5);
  const diagnoses = shuffledDx.slice(0, numDx).map((dx, i) => ({
    id: `dx${i + 1}`,
    code: dx.code,
    description: dx.description,
    priority: i + 1,
  }));
  
  // Pick 1-3 random service lines
  const numSl = Math.floor(Math.random() * 3) + 1;
  const shuffledCpt = [...CPT_CODES].sort(() => Math.random() - 0.5);
  const serviceLines = shuffledCpt.slice(0, numSl).map((cpt, i) => ({
    id: `sl${i + 1}`,
    code: cpt.code,
    description: cpt.description,
    modifiers: i === 0 && numSl > 1 ? ["25", "", "", ""] : ["", "", "", ""],
    dxPointers: [1],
    fromDate: today,
    toDate: today,
    units: Math.floor(Math.random() * 2) + 1,
    charge: cpt.charge,
  }));
  
  return {
    patient: {
      firstName: patient.first,
      lastName: patient.last,
      dob: `19${70 + Math.floor(Math.random() * 30)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
      gender: Math.random() > 0.5 ? "F" : "M",
      mrn: `MRN-${String(Math.floor(Math.random() * 999999)).padStart(6, "0")}`,
      relationship: "self",
      address: `${Math.floor(Math.random() * 9999) + 100} Main Street`,
      city: "Dallas",
      state: "TX",
      zip: "75201",
      phone: `555${String(Math.floor(Math.random() * 9999999)).padStart(7, "0")}`,
    },
    insurance: {
      payerName: "Stedi Test Payer",
      payerId: "STEDI",
      planType: "PPO",
      policyNumber: `POL-${String(Math.floor(Math.random() * 999999)).padStart(6, "0")}`,
      groupNumber: `GRP-${String(Math.floor(Math.random() * 999)).padStart(3, "0")}`,
      subscriberId: `STEDI-TEST-${String(Math.floor(Math.random() * 999)).padStart(3, "0")}`,
      subscriberRelationship: "self",
      priorAuthRequired: false,
      priorAuthNumber: "",
    },
    provider: {
      billingProviderName: "Clinix AI Demo Practice",
      billingNpi: "1999999984",
      billingTaxId: "123456789",
      billingAddress: "456 Provider Way",
      billingCity: "Dallas",
      billingState: "TX",
      billingZip: "75201",
      renderingProviderName: "Dr. John Smith",
      renderingNpi: "1999999984",
      taxonomyCode: "207Q00000X",
      facilityName: "Clinix AI Demo Facility",
      facilityNpi: "1999999984",
      posCode: "11",
    },
    diagnoses,
    serviceLines,
  };
}

const STEPS = [
  { id: 1, label: "Patient Information", icon: "person" },
  { id: 2, label: "Payer & Insurance", icon: "health_and_safety" },
  { id: 3, label: "Provider & Facility", icon: "local_hospital" },
  { id: 4, label: "Diagnoses (ICD-10)", icon: "medical_information" },
  { id: 5, label: "Service Lines (CPT)", icon: "receipt_long" },
  { id: 6, label: "Review & Submit", icon: "fact_check" },
];

const TIPS = [
  "Enter patient information exactly as it appears on the insurance card to avoid claim rejections.",
  "Verify the payer ID matches your clearinghouse configuration. Check for prior authorization requirements.",
  "The billing provider receives payment. Rendering provider performs the service. They may be different.",
  "Primary diagnosis (priority 1) is the main reason for the visit. Add secondary diagnoses to justify services.",
  "Each service line needs at least one diagnosis pointer. Ensure modifiers are appropriate for the payer.",
  "Review all details before submitting. Most rejections come from data entry errors.",
];

// Form Input Component with Dune Theme
function FormInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  options,
  className = "",
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-[#a67c52] mb-1.5">
        {label}
        {required && <span className="text-rose-400 ml-1">*</span>}
      </label>
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-12 rounded-xl bg-[#0a0908]/60 border border-[#c97435]/20 px-4 text-[#e8dcc8] focus:outline-none focus:ring-2 focus:ring-[#c97435]/50 focus:border-[#c97435] transition-all"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0a0908]">
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-12 rounded-xl bg-[#0a0908]/60 border border-[#c97435]/20 px-4 text-[#e8dcc8] placeholder-[#6b5a45] focus:outline-none focus:ring-2 focus:ring-[#c97435]/50 focus:border-[#c97435] transition-all"
        />
      )}
    </div>
  );
}

// Step Sidebar Component
function StepSidebar({ currentStep, onStepClick }: { currentStep: number; onStepClick: (step: number) => void }) {
  return (
    <div className="sticky top-24 space-y-2">
      {STEPS.map((step) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;

        return (
          <button
            key={step.id}
            onClick={() => onStepClick(step.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
              isActive
                ? "bg-[#c97435]/20 border border-[#c97435]/50 text-[#e8dcc8]"
                : isCompleted
                ? "text-[#8b7355] hover:bg-[#1a1512]/50"
                : "text-[#6b5a45] hover:bg-[#1a1512]/30"
            }`}
          >
            <span
              className={`material-symbols-outlined text-lg ${
                isCompleted ? "text-emerald-400" : isActive ? "text-[#c97435]" : ""
              }`}
              style={{ fontVariationSettings: isCompleted ? "'FILL' 1" : "" }}
            >
              {isCompleted ? "check_circle" : step.icon}
            </span>
            <span className={`text-sm font-medium ${isActive ? "font-semibold" : ""}`}>{step.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Quick Tip Component
function QuickTip({ step }: { step: number }) {
  return (
    <div className="sticky top-24 rounded-xl bg-[#c97435]/10 border border-[#c97435]/20 p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-[#c97435]" style={{ fontVariationSettings: "'FILL' 1" }}>
          lightbulb
        </span>
        <h4 className="font-semibold text-[#c97435]">Quick Tip</h4>
      </div>
      <p className="text-sm text-[#a67c52] leading-relaxed">{TIPS[step - 1]}</p>
    </div>
  );
}

export default function NewClaimPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<ClaimDraft>(INITIAL_DRAFT);
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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const totalCharge = useMemo(
    () => draft.serviceLines.reduce((sum, line) => sum + line.charge * line.units, 0),
    [draft.serviceLines]
  );

  const loadTestData = () => {
    setDraft(generateTestData());
  };

  const nextStep = () => {
    if (step < 6) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const goToStep = (targetStep: number) => {
    setStep(targetStep);
  };

  // Update functions
  const updatePatient = (key: keyof PatientInfo, value: string) => {
    setDraft((prev) => ({ ...prev, patient: { ...prev.patient, [key]: value } }));
  };

  const updateInsurance = (key: keyof InsuranceInfo, value: string | boolean) => {
    setDraft((prev) => ({ ...prev, insurance: { ...prev.insurance, [key]: value } }));
  };

  const updateProvider = (key: keyof ProviderInfo, value: string) => {
    setDraft((prev) => ({ ...prev, provider: { ...prev.provider, [key]: value } }));
  };

  const addDiagnosis = () => {
    const newDx: Diagnosis = {
      id: `dx-${Date.now()}`,
      code: "",
      description: "",
      priority: draft.diagnoses.length + 1,
    };
    setDraft((prev) => ({ ...prev, diagnoses: [...prev.diagnoses, newDx] }));
  };

  const updateDiagnosis = (id: string, key: keyof Diagnosis, value: string | number) => {
    setDraft((prev) => ({
      ...prev,
      diagnoses: prev.diagnoses.map((dx) => (dx.id === id ? { ...dx, [key]: value } : dx)),
    }));
  };

  const removeDiagnosis = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      diagnoses: prev.diagnoses.filter((dx) => dx.id !== id).map((dx, i) => ({ ...dx, priority: i + 1 })),
    }));
  };

  const addServiceLine = () => {
    const newLine: ServiceLine = {
      id: `sl-${Date.now()}`,
      code: "",
      description: "",
      modifiers: ["", "", "", ""],
      dxPointers: [],
      fromDate: new Date().toISOString().split("T")[0],
      toDate: new Date().toISOString().split("T")[0],
      units: 1,
      charge: 0,
    };
    setDraft((prev) => ({ ...prev, serviceLines: [...prev.serviceLines, newLine] }));
  };

  const updateServiceLine = (id: string, key: keyof ServiceLine, value: any) => {
    setDraft((prev) => ({
      ...prev,
      serviceLines: prev.serviceLines.map((sl) => (sl.id === id ? { ...sl, [key]: value } : sl)),
    }));
  };

  const toggleDxPointer = (lineId: string, dxPriority: number) => {
    setDraft((prev) => ({
      ...prev,
      serviceLines: prev.serviceLines.map((sl) => {
        if (sl.id !== lineId) return sl;
        const current = sl.dxPointers || [];
        const exists = current.includes(dxPriority);
        return { ...sl, dxPointers: exists ? current.filter((p) => p !== dxPriority) : [...current, dxPriority] };
      }),
    }));
  };

  const removeServiceLine = (id: string) => {
    setDraft((prev) => ({ ...prev, serviceLines: prev.serviceLines.filter((sl) => sl.id !== id) }));
  };

  // Handle AI suggestion application
  const handleApplyAISuggestion = (path: string, value: any) => {
    // Parse the path to determine what to update
    // Common paths: claim.serviceLines[0].modifiers, claim.diagnosisCodes, etc.
    const match = path.match(/claim\.serviceLines\[(\d+)\]\.(\w+)/);
    if (match) {
      const [, indexStr, field] = match;
      const index = parseInt(indexStr, 10);
      
      setDraft((prev) => {
        if (index >= prev.serviceLines.length) return prev;
        
        const updatedLines = [...prev.serviceLines];
        const line = { ...updatedLines[index] };
        
        // Map RAG schema fields to our draft fields
        if (field === "modifiers") {
          // Value is an array of modifiers
          const newModifiers = Array.isArray(value) ? value : [];
          // Pad to 4 slots
          line.modifiers = [...newModifiers, "", "", "", ""].slice(0, 4);
        } else if (field === "diagnosisPointers") {
          line.dxPointers = Array.isArray(value) ? value : [1];
        } else if (field === "procedureCode") {
          line.code = value;
        } else if (field === "unitCount") {
          line.units = typeof value === "number" ? value : parseInt(value, 10) || 1;
        }
        
        updatedLines[index] = line;
        return { ...prev, serviceLines: updatedLines };
      });
    }
    
    // Handle diagnosis code updates
    const dxMatch = path.match(/claim\.diagnosisCodes\[(\d+)\]/);
    if (dxMatch) {
      const [, indexStr] = dxMatch;
      const index = parseInt(indexStr, 10);
      
      setDraft((prev) => {
        if (index >= prev.diagnoses.length) return prev;
        const updatedDx = [...prev.diagnoses];
        updatedDx[index] = { ...updatedDx[index], code: String(value).replace(".", "") };
        return { ...prev, diagnoses: updatedDx };
      });
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const controlNumber = `C${crypto.randomUUID().replace(/-/g, "").slice(0, 32)}`;
      const dobFormatted = draft.patient.dob.replace(/-/g, "");

      const claimPayload = {
        controlNumber,
        tradingPartnerServiceId: draft.insurance.payerId || "STEDI",
        submitter: {
          organizationName: draft.provider.billingProviderName,
          contactInformation: { name: "Billing Department", phoneNumber: "5551234567" },
        },
        receiver: { organizationName: draft.insurance.payerName },
        billing: {
          providerType: "BillingProvider",
          npi: draft.provider.billingNpi,
          employerId: draft.provider.billingTaxId,
          organizationName: draft.provider.billingProviderName,
          address: {
            address1: draft.provider.billingAddress,
            city: draft.provider.billingCity,
            state: draft.provider.billingState,
            postalCode: draft.provider.billingZip,
          },
        },
        subscriber: {
          memberId: draft.insurance.subscriberId,
          firstName: draft.patient.firstName.toUpperCase(),
          lastName: draft.patient.lastName.toUpperCase(),
          gender: draft.patient.gender,
          dateOfBirth: dobFormatted,
          address: {
            address1: draft.patient.address,
            city: draft.patient.city,
            state: draft.patient.state,
            postalCode: draft.patient.zip,
          },
        },
        claimInformation: {
          claimFilingCode: "CI",
          patientControlNumber: controlNumber.slice(0, 20),
          claimChargeAmount: totalCharge.toFixed(2),
          placeOfServiceCode: draft.provider.posCode,
          claimFrequencyCode: "1",
          signatureIndicator: "Y",
          planParticipationCode: "A",
          releaseInformationCode: "Y",
          benefitsAssignmentCertificationIndicator: "Y",
          healthCareCodeInformation: draft.diagnoses.map((dx) => ({
            diagnosisTypeCode: dx.priority === 1 ? "ABK" : "ABF",
            diagnosisCode: dx.code.replace(".", ""),
          })),
          serviceFacilityLocation: {
            organizationName: draft.provider.facilityName,
            npi: draft.provider.facilityNpi,
            address: {
              address1: draft.provider.billingAddress,
              city: draft.provider.billingCity,
              state: draft.provider.billingState,
              postalCode: draft.provider.billingZip,
            },
          },
          serviceLines: draft.serviceLines.map((sl, idx) => ({
            assignedNumber: String(idx + 1),
            serviceDate: sl.fromDate.replace(/-/g, ""),
            professionalService: {
              procedureIdentifier: "HC",
              procedureCode: sl.code,
              procedureModifiers: sl.modifiers.filter((m) => m),
              lineItemChargeAmount: (sl.charge * sl.units).toFixed(2),
              measurementUnit: "UN",
              serviceUnitCount: String(sl.units),
              compositeDiagnosisCodePointers: { diagnosisCodePointers: sl.dxPointers.map(String) },
            },
          })),
        },
        rendering: {
          providerType: "RenderingProvider",
          npi: draft.provider.renderingNpi,
          firstName: draft.provider.renderingProviderName.split(" ")[1] || "John",
          lastName: draft.provider.renderingProviderName.split(" ").pop() || "Smith",
          taxonomyCode: draft.provider.taxonomyCode,
        },
      };

      const result = await submitClaim(claimPayload, controlNumber);
      const responseData = result.data?.data || result.data;

      if (!result.ok && result.status >= 400) {
        throw new Error(responseData?.errors?.[0]?.message || responseData?.error || "Failed to submit claim");
      }

      const claimId = responseData?.claimId || responseData?.transactionSetId || controlNumber;

      if (supabase && userId) {
        await supabase.from("claims").insert({
          user_id: userId,
          patient_name: `${draft.patient.firstName.toUpperCase()} ${draft.patient.lastName.toUpperCase()}`,
          payer_name: draft.insurance.payerName,
          trading_partner_service_id: draft.insurance.payerId,
          claim_charge_amount: totalCharge,
          total_charge: totalCharge,
          date_of_service: draft.serviceLines[0]?.fromDate || new Date().toISOString().split("T")[0],
          status: "submitted",
          payload: claimPayload,
        });
      }

      const successParams = new URLSearchParams({
        claimId,
        patient: `${draft.patient.firstName} ${draft.patient.lastName}`,
        payer: draft.insurance.payerName,
        amount: totalCharge.toFixed(2),
      });
      router.push(`/claims/success?${successParams.toString()}`);
    } catch (err: any) {
      console.error("Claim submission error:", err);
      setError(err?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={scrollRef} className="min-h-screen bg-[#0a0908] overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#c97435]/10 bg-[#0a0908]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 rounded-lg hover:bg-[#c97435]/10 transition-colors">
              <span className="material-symbols-outlined text-[#8b7355]">arrow_back</span>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-[#e8dcc8]">Create New Claim</h1>
              <p className="text-sm text-[#6b5a45]">
                Step {step} of 6: {STEPS[step - 1].label}
              </p>
            </div>
          </div>
          <button
            onClick={loadTestData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all"
          >
            <span className="material-symbols-outlined text-lg">science</span>
            Load Test Data
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Sidebar - Steps */}
          <div className="col-span-3 hidden lg:block">
            <StepSidebar currentStep={step} onStepClick={goToStep} />
          </div>

          {/* Center - Form Content */}
          <div className="col-span-12 lg:col-span-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl bg-[#1a1512]/40 border border-[#c97435]/10 backdrop-blur-sm p-8"
              >
                {/* Step 1: Patient Information */}
                {step === 1 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-[#e8dcc8]">Patient Information</h2>
                      <p className="text-[#8b7355] mt-1">Enter the patient's demographic details</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormInput label="First Name" value={draft.patient.firstName} onChange={(v) => updatePatient("firstName", v)} required placeholder="JANE" />
                      <FormInput label="Last Name" value={draft.patient.lastName} onChange={(v) => updatePatient("lastName", v)} required placeholder="DOE" />
                      <FormInput label="Date of Birth" value={draft.patient.dob} onChange={(v) => updatePatient("dob", v)} type="date" required />
                      <FormInput
                        label="Gender"
                        value={draft.patient.gender}
                        onChange={(v) => updatePatient("gender", v)}
                        options={[
                          { value: "M", label: "Male" },
                          { value: "F", label: "Female" },
                          { value: "U", label: "Unknown" },
                        ]}
                      />
                      <FormInput label="MRN / Patient ID" value={draft.patient.mrn} onChange={(v) => updatePatient("mrn", v)} placeholder="MRN-001234" />
                      <FormInput
                        label="Relationship to Subscriber"
                        value={draft.patient.relationship}
                        onChange={(v) => updatePatient("relationship", v)}
                        options={[
                          { value: "self", label: "Self" },
                          { value: "spouse", label: "Spouse" },
                          { value: "child", label: "Child" },
                          { value: "other", label: "Other" },
                        ]}
                      />
                      <FormInput label="Street Address" value={draft.patient.address} onChange={(v) => updatePatient("address", v)} placeholder="123 Main St" className="sm:col-span-2" />
                      <FormInput label="City" value={draft.patient.city} onChange={(v) => updatePatient("city", v)} placeholder="Dallas" />
                      <div className="grid grid-cols-2 gap-4">
                        <FormInput label="State" value={draft.patient.state} onChange={(v) => updatePatient("state", v)} placeholder="TX" />
                        <FormInput label="ZIP" value={draft.patient.zip} onChange={(v) => updatePatient("zip", v)} placeholder="75201" />
                      </div>
                      <FormInput label="Phone Number" value={draft.patient.phone} onChange={(v) => updatePatient("phone", v)} placeholder="5551234567" />
                    </div>
                  </div>
                )}

                {/* Step 2: Payer & Insurance */}
                {step === 2 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-[#e8dcc8]">Payer & Insurance Details</h2>
                      <p className="text-[#8b7355] mt-1">Enter insurance plan information for this claim</p>
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-[#c97435]">Primary Payer</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormInput label="Payer Name" value={draft.insurance.payerName} onChange={(v) => updateInsurance("payerName", v)} required placeholder="Stedi Test Payer" className="sm:col-span-2" />
                        <FormInput label="Payer ID" value={draft.insurance.payerId} onChange={(v) => updateInsurance("payerId", v)} required placeholder="STEDI" />
                        <FormInput
                          label="Plan Type"
                          value={draft.insurance.planType}
                          onChange={(v) => updateInsurance("planType", v)}
                          options={[
                            { value: "PPO", label: "PPO" },
                            { value: "HMO", label: "HMO" },
                            { value: "Medicare", label: "Medicare" },
                            { value: "Medicaid", label: "Medicaid" },
                            { value: "Other", label: "Other" },
                          ]}
                        />
                        <FormInput label="Policy Number" value={draft.insurance.policyNumber} onChange={(v) => updateInsurance("policyNumber", v)} placeholder="POL-987654" />
                        <FormInput label="Group Number" value={draft.insurance.groupNumber} onChange={(v) => updateInsurance("groupNumber", v)} placeholder="GRP-123" />
                        <FormInput label="Subscriber ID / Member ID" value={draft.insurance.subscriberId} onChange={(v) => updateInsurance("subscriberId", v)} required placeholder="STEDI-TEST-001" className="sm:col-span-2" />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-[#c97435]">Prior Authorization</h3>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-[#a67c52]">Is Prior Auth Required?</span>
                        <button
                          onClick={() => updateInsurance("priorAuthRequired", true)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${draft.insurance.priorAuthRequired ? "bg-[#c97435] text-[#0a0908]" : "bg-[#1a1512] text-[#8b7355] hover:bg-[#c97435]/20"}`}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => updateInsurance("priorAuthRequired", false)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!draft.insurance.priorAuthRequired ? "bg-[#c97435] text-[#0a0908]" : "bg-[#1a1512] text-[#8b7355] hover:bg-[#c97435]/20"}`}
                        >
                          No
                        </button>
                      </div>
                      {draft.insurance.priorAuthRequired && (
                        <FormInput label="Prior Authorization Number" value={draft.insurance.priorAuthNumber} onChange={(v) => updateInsurance("priorAuthNumber", v)} placeholder="AUTH-12345" />
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Provider & Facility */}
                {step === 3 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-[#e8dcc8]">Provider & Facility</h2>
                      <p className="text-[#8b7355] mt-1">Configure billing and rendering provider details</p>
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-[#c97435]">Billing Provider</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormInput label="Organization Name" value={draft.provider.billingProviderName} onChange={(v) => updateProvider("billingProviderName", v)} required className="sm:col-span-2" />
                        <FormInput label="NPI" value={draft.provider.billingNpi} onChange={(v) => updateProvider("billingNpi", v)} required placeholder="1999999984" />
                        <FormInput label="Tax ID (EIN)" value={draft.provider.billingTaxId} onChange={(v) => updateProvider("billingTaxId", v)} required placeholder="123456789" />
                        <FormInput label="Address" value={draft.provider.billingAddress} onChange={(v) => updateProvider("billingAddress", v)} className="sm:col-span-2" />
                        <FormInput label="City" value={draft.provider.billingCity} onChange={(v) => updateProvider("billingCity", v)} />
                        <div className="grid grid-cols-2 gap-4">
                          <FormInput label="State" value={draft.provider.billingState} onChange={(v) => updateProvider("billingState", v)} />
                          <FormInput label="ZIP" value={draft.provider.billingZip} onChange={(v) => updateProvider("billingZip", v)} />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-[#c97435]">Rendering Provider</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormInput label="Provider Name" value={draft.provider.renderingProviderName} onChange={(v) => updateProvider("renderingProviderName", v)} className="sm:col-span-2" />
                        <FormInput label="NPI" value={draft.provider.renderingNpi} onChange={(v) => updateProvider("renderingNpi", v)} />
                        <FormInput label="Taxonomy Code" value={draft.provider.taxonomyCode} onChange={(v) => updateProvider("taxonomyCode", v)} placeholder="207Q00000X" />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-[#c97435]">Service Facility</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormInput label="Facility Name" value={draft.provider.facilityName} onChange={(v) => updateProvider("facilityName", v)} className="sm:col-span-2" />
                        <FormInput label="Facility NPI" value={draft.provider.facilityNpi} onChange={(v) => updateProvider("facilityNpi", v)} />
                        <FormInput
                          label="Place of Service (POS)"
                          value={draft.provider.posCode}
                          onChange={(v) => updateProvider("posCode", v)}
                          options={[
                            { value: "11", label: "11 - Office" },
                            { value: "12", label: "12 - Home" },
                            { value: "21", label: "21 - Inpatient Hospital" },
                            { value: "22", label: "22 - Outpatient Hospital" },
                            { value: "23", label: "23 - Emergency Room" },
                            { value: "02", label: "02 - Telehealth" },
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Diagnoses */}
                {step === 4 && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-[#e8dcc8]">Diagnoses (ICD-10)</h2>
                        <p className="text-[#8b7355] mt-1">Add diagnosis codes that justify the services</p>
                      </div>
                      <button onClick={addDiagnosis} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c97435] text-[#0a0908] font-semibold hover:bg-[#c97435]/90 transition-all">
                        <span className="material-symbols-outlined">add</span>
                        Add Diagnosis
                      </button>
                    </div>
                    {draft.diagnoses.length === 0 ? (
                      <div className="text-center py-12 text-[#6b5a45]">
                        <span className="material-symbols-outlined text-4xl mb-2">medical_information</span>
                        <p>No diagnoses added yet</p>
                        <p className="text-sm mt-1">Click "Add Diagnosis" to begin</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {draft.diagnoses.map((dx) => (
                          <div key={dx.id} className="rounded-xl bg-[#0a0908]/40 border border-[#c97435]/10 p-4">
                            <div className="flex items-start justify-between mb-4">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#c97435]/20 text-[#c97435] font-bold text-sm">
                                {dx.priority}
                              </span>
                              <button onClick={() => removeDiagnosis(dx.id)} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors">
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                            </div>
                            <div className="grid grid-cols-12 gap-4">
                              <div className="col-span-4">
                                <FormInput label="ICD-10 Code" value={dx.code} onChange={(v) => updateDiagnosis(dx.id, "code", v)} required placeholder="M542" />
                              </div>
                              <div className="col-span-6">
                                <FormInput label="Description" value={dx.description} onChange={(v) => updateDiagnosis(dx.id, "description", v)} placeholder="Low back pain" />
                              </div>
                              <div className="col-span-2">
                                <FormInput
                                  label="Priority"
                                  value={dx.priority}
                                  onChange={(v) => updateDiagnosis(dx.id, "priority", parseInt(v) || 1)}
                                  options={draft.diagnoses.map((_, i) => ({ value: String(i + 1), label: String(i + 1) }))}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 5: Service Lines */}
                {step === 5 && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-[#e8dcc8]">Service Lines (CPT/HCPCS)</h2>
                        <p className="text-[#8b7355] mt-1">Add procedures and services performed</p>
                      </div>
                      <button onClick={addServiceLine} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c97435] text-[#0a0908] font-semibold hover:bg-[#c97435]/90 transition-all">
                        <span className="material-symbols-outlined">add</span>
                        Add Service Line
                      </button>
                    </div>
                    {draft.serviceLines.length === 0 ? (
                      <div className="text-center py-12 text-[#6b5a45]">
                        <span className="material-symbols-outlined text-4xl mb-2">receipt_long</span>
                        <p>No service lines added yet</p>
                        <p className="text-sm mt-1">Click "Add Service Line" to begin</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {draft.serviceLines.map((sl, idx) => (
                          <div key={sl.id} className="rounded-xl bg-[#0a0908]/40 border border-[#c97435]/10 p-5">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-semibold text-[#e8dcc8]">Service Line {idx + 1}</h4>
                              <button onClick={() => removeServiceLine(sl.id)} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors">
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                            </div>
                            <div className="grid grid-cols-12 gap-4">
                              <div className="col-span-3">
                                <FormInput label="CPT/HCPCS Code" value={sl.code} onChange={(v) => updateServiceLine(sl.id, "code", v)} required placeholder="99213" />
                              </div>
                              <div className="col-span-9">
                                <FormInput label="Description" value={sl.description} onChange={(v) => updateServiceLine(sl.id, "description", v)} placeholder="Office visit, established patient" />
                              </div>
                              <div className="col-span-6">
                                <label className="block text-sm font-medium text-[#a67c52] mb-1.5">Modifiers</label>
                                <div className="grid grid-cols-4 gap-2">
                                  {sl.modifiers.map((mod, modIdx) => (
                                    <input
                                      key={modIdx}
                                      type="text"
                                      maxLength={2}
                                      value={mod}
                                      onChange={(e) => {
                                        const newMods = [...sl.modifiers];
                                        newMods[modIdx] = e.target.value.toUpperCase();
                                        updateServiceLine(sl.id, "modifiers", newMods);
                                      }}
                                      placeholder={`M${modIdx + 1}`}
                                      className="w-full h-10 rounded-lg bg-[#0a0908]/60 border border-[#c97435]/20 px-3 text-center text-[#e8dcc8] placeholder-[#6b5a45] focus:outline-none focus:ring-2 focus:ring-[#c97435]/50"
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="col-span-6">
                                <label className="block text-sm font-medium text-[#a67c52] mb-1.5">Link to Diagnoses</label>
                                <div className="flex flex-wrap gap-2">
                                  {draft.diagnoses.map((dx) => (
                                    <button
                                      key={dx.id}
                                      type="button"
                                      onClick={() => toggleDxPointer(sl.id, dx.priority)}
                                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                        sl.dxPointers.includes(dx.priority)
                                          ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400"
                                          : "bg-[#1a1512] border border-[#c97435]/20 text-[#8b7355] hover:border-[#c97435]/40"
                                      }`}
                                    >
                                      {dx.priority}: {dx.code || "---"}
                                    </button>
                                  ))}
                                  {draft.diagnoses.length === 0 && <span className="text-sm text-[#6b5a45]">Add diagnoses first</span>}
                                </div>
                              </div>
                              <div className="col-span-3">
                                <FormInput label="From Date" value={sl.fromDate} onChange={(v) => updateServiceLine(sl.id, "fromDate", v)} type="date" />
                              </div>
                              <div className="col-span-3">
                                <FormInput label="To Date" value={sl.toDate} onChange={(v) => updateServiceLine(sl.id, "toDate", v)} type="date" />
                              </div>
                              <div className="col-span-3">
                                <FormInput label="Units" value={sl.units} onChange={(v) => updateServiceLine(sl.id, "units", parseInt(v) || 1)} type="number" />
                              </div>
                              <div className="col-span-3">
                                <FormInput label="Charge ($)" value={sl.charge} onChange={(v) => updateServiceLine(sl.id, "charge", parseFloat(v) || 0)} type="number" />
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="text-right">
                          <p className="text-lg font-semibold text-[#e8dcc8]">
                            Total Charges: <span className="text-emerald-400">${totalCharge.toFixed(2)}</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 6: Review & Submit */}
                {step === 6 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-[#e8dcc8]">Review & Submit</h2>
                      <p className="text-[#8b7355] mt-1">Verify all information before submitting the claim</p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Patient Summary */}
                      <div className="rounded-xl bg-[#0a0908]/40 border border-[#c97435]/10 p-4">
                        <h3 className="font-semibold text-[#c97435] mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg">person</span>
                          Patient
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#6b5a45]">Name</span>
                            <span className="text-[#e8dcc8] font-medium">{draft.patient.firstName} {draft.patient.lastName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#6b5a45]">DOB</span>
                            <span className="text-[#e8dcc8]">{draft.patient.dob}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#6b5a45]">Member ID</span>
                            <span className="text-[#e8dcc8] font-mono">{draft.insurance.subscriberId}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payer Summary */}
                      <div className="rounded-xl bg-[#0a0908]/40 border border-[#c97435]/10 p-4">
                        <h3 className="font-semibold text-[#c97435] mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg">health_and_safety</span>
                          Payer
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#6b5a45]">Name</span>
                            <span className="text-[#e8dcc8] font-medium">{draft.insurance.payerName || "—"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#6b5a45]">Payer ID</span>
                            <span className="text-[#e8dcc8] font-mono">{draft.insurance.payerId || "—"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#6b5a45]">Plan Type</span>
                            <span className="text-[#e8dcc8]">{draft.insurance.planType}</span>
                          </div>
                        </div>
                      </div>

                      {/* Provider Summary */}
                      <div className="rounded-xl bg-[#0a0908]/40 border border-[#c97435]/10 p-4">
                        <h3 className="font-semibold text-[#c97435] mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg">local_hospital</span>
                          Provider
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#6b5a45]">Billing</span>
                            <span className="text-[#e8dcc8]">{draft.provider.billingProviderName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#6b5a45]">NPI</span>
                            <span className="text-[#e8dcc8] font-mono">{draft.provider.billingNpi}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#6b5a45]">POS</span>
                            <span className="text-[#e8dcc8]">{draft.provider.posCode}</span>
                          </div>
                        </div>
                      </div>

                      {/* Charges Summary */}
                      <div className="rounded-xl bg-[#0a0908]/40 border border-[#c97435]/10 p-4">
                        <h3 className="font-semibold text-[#c97435] mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg">payments</span>
                          Charges
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#6b5a45]">Service Lines</span>
                            <span className="text-[#e8dcc8]">{draft.serviceLines.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#6b5a45]">Diagnoses</span>
                            <span className="text-[#e8dcc8]">{draft.diagnoses.length}</span>
                          </div>
                          <div className="flex justify-between text-base font-semibold">
                            <span className="text-[#a67c52]">Total</span>
                            <span className="text-emerald-400">${totalCharge.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Diagnoses List */}
                    <div className="rounded-xl bg-[#0a0908]/40 border border-[#c97435]/10 p-4">
                      <h3 className="font-semibold text-[#c97435] mb-3">Diagnoses</h3>
                      <div className="flex flex-wrap gap-2">
                        {draft.diagnoses.map((dx) => (
                          <span key={dx.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1512] text-sm">
                            <span className="font-mono text-[#c97435]">{dx.code}</span>
                            <span className="text-[#8b7355]">{dx.description || "—"}</span>
                          </span>
                        ))}
                        {draft.diagnoses.length === 0 && <span className="text-[#6b5a45] text-sm">No diagnoses</span>}
                      </div>
                    </div>

                    {/* Service Lines List */}
                    <div className="rounded-xl bg-[#0a0908]/40 border border-[#c97435]/10 p-4">
                      <h3 className="font-semibold text-[#c97435] mb-3">Service Lines</h3>
                      <div className="space-y-2">
                        {draft.serviceLines.map((sl, idx) => (
                          <div key={sl.id} className="flex items-center justify-between py-2 border-b border-[#c97435]/10 last:border-0">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded bg-[#c97435]/20 flex items-center justify-center text-xs font-bold text-[#c97435]">{idx + 1}</span>
                              <span className="font-mono text-[#e8dcc8]">{sl.code}</span>
                              <span className="text-[#8b7355] text-sm">{sl.description || "—"}</span>
                            </div>
                            <span className="text-[#e8dcc8] font-medium">${(sl.charge * sl.units).toFixed(2)}</span>
                          </div>
                        ))}
                        {draft.serviceLines.length === 0 && <span className="text-[#6b5a45] text-sm">No service lines</span>}
                      </div>
                    </div>

                    {/* Anirul AI Pre-Submission Analysis */}
                    <AnirulClaimAnalyzer 
                      draft={draft} 
                      totalCharge={totalCharge}
                      onApplySuggestion={handleApplyAISuggestion}
                    />

                    {/* Error Display */}
                    {error && (
                      <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-rose-400">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined">error</span>
                          <span>{error}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Sidebar - Quick Tips */}
          <div className="col-span-3 hidden lg:block">
            <QuickTip step={step} />
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="sticky bottom-0 border-t border-[#c97435]/10 bg-[#0a0908]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={step === 1 ? () => router.push("/dashboard") : prevStep}
            className="px-5 py-2.5 rounded-xl border border-[#c97435]/20 text-[#a67c52] hover:bg-[#c97435]/10 transition-all"
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>
          {step < 6 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c97435] to-[#8b5a2b] text-[#0a0908] font-semibold hover:shadow-lg hover:shadow-[#c97435]/20 transition-all"
            >
              Next: {STEPS[step]?.label.split(" ")[0]}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-xl disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="material-symbols-outlined">
                    progress_activity
                  </motion.span>
                  Submitting...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">send</span>
                  Submit Claim
                </>
              )}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

