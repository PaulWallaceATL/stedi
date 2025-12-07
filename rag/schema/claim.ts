// Canonical Claim Schema (TypeScript) for RAG and validation.
export type ClaimServiceLine = {
  procedureCode: string;
  modifiers?: string[];
  chargeAmount: string;
  unitCount: number;
  diagnosisPointers: number[];
  serviceDate: string;
};

export type ClaimPayload = {
  usageIndicator?: "T" | "P"; // T=test, P=production
  tradingPartnerId: string;
  controlNumber?: string;
  billingProvider: {
    npi: string;
    taxId?: string;
    name: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
    };
  };
  subscriber: {
    id?: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    relationship?: string;
    memberId?: string;
  };
  patient?: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
  };
  claim: {
    patientControlNumber: string;
    totalChargeAmount: string;
    placeOfServiceCode: string;
    diagnosisCodes: string[];
    serviceLines: ClaimServiceLine[];
    priorAuthRefNumber?: string;
    attachments?: Array<{
      type: string;
      description?: string;
      contentType?: string;
      content?: string; // base64 if populated
    }>;
  };
};

// Minimal runtime validation
export function validateClaim(payload: any): { ok: boolean; error?: string } {
  try {
    if (!payload || typeof payload !== "object") return { ok: false, error: "Payload must be an object" };
    if (!payload.tradingPartnerId) return { ok: false, error: "tradingPartnerId is required" };
    if (!payload.billingProvider?.npi) return { ok: false, error: "billingProvider.npi is required" };
    if (!payload.subscriber?.firstName || !payload.subscriber?.lastName) {
      return { ok: false, error: "subscriber firstName/lastName required" };
    }
    if (!payload.claim?.serviceLines || !Array.isArray(payload.claim.serviceLines) || payload.claim.serviceLines.length === 0) {
      return { ok: false, error: "At least one serviceLine is required" };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
