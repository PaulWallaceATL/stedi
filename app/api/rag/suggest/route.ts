import { NextResponse } from "next/server";
import seed from "../../../../rag/corpus/seed.json";
import { validateClaim } from "../../../../rag/schema/claim";
import { RAG_API_KEY, RAG_MODEL, RAG_PROVIDER } from "../../../../rag/config";

type SuggestRequest = {
  payerId?: string;
  specialty?: string;
  claim: unknown;
};

// Generate intelligent mock response when API key is not configured
function generateMockResponse(claim: any, rules: any[], exemplars: any[]) {
  const mockChanges: any[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  const claimData = claim as any;
  
  // Extract claim data from various possible structures
  const serviceLines = claimData?.claim?.serviceLines || claimData?.claimInformation?.serviceLines || [];
  const diagnosisCodes = claimData?.claim?.diagnosisCodes || 
    claimData?.claimInformation?.healthCareCodeInformation?.map((c: any) => c.diagnosisCode) || [];
  const placeOfService = claimData?.claim?.placeOfServiceCode || claimData?.claimInformation?.placeOfServiceCode || "11";
  const totalCharge = parseFloat(claimData?.claim?.totalChargeAmount || claimData?.claimInformation?.claimChargeAmount || "0");
  const billingNpi = claimData?.billingProvider?.npi || claimData?.billing?.npi || "";
  const renderingNpi = claimData?.renderingProvider?.npi || claimData?.rendering?.npi || "";
  
  // Intelligent analysis based on actual claim data
  
  // 1. E/M Code analysis (99211-99215)
  serviceLines.forEach((line: any, idx: number) => {
    const procCode = line?.procedureCode || line?.professionalService?.procedureCode || "";
    const modifiers = line?.modifiers || line?.professionalService?.procedureModifiers || [];
    const lineCharge = parseFloat(line?.chargeAmount || line?.professionalService?.lineItemChargeAmount || "0");
    
    // Check for telehealth modifier when POS is telehealth
    if (placeOfService === "02" && !modifiers.includes("95") && !modifiers.includes("GT")) {
      mockChanges.push({
        path: `claim.serviceLines[${idx}].modifiers`,
        before: modifiers,
        after: [...modifiers, "95"],
        reason: "CMS requires modifier 95 or GT for telehealth services (POS 02). Without this modifier, the claim will likely be denied."
      });
    }
    
    // Check for modifier 25 on E/M with procedures on same day
    if (procCode.startsWith("992") && serviceLines.length > 1) {
      const hasOtherProcs = serviceLines.some((sl: any, i: number) => {
        const otherCode = sl?.procedureCode || sl?.professionalService?.procedureCode || "";
        return i !== idx && !otherCode.startsWith("992");
      });
      if (hasOtherProcs && !modifiers.includes("25")) {
        mockChanges.push({
          path: `claim.serviceLines[${idx}].modifiers`,
          before: modifiers,
          after: [...modifiers, "25"],
          reason: "When billing E/M code with other procedures on the same day, modifier 25 is required to indicate significant, separately identifiable evaluation. Without it, the E/M may be bundled and denied."
        });
      }
    }
    
    // Check for physical therapy modifiers
    if (["97110", "97140", "97530", "97542"].includes(procCode)) {
      if (!modifiers.includes("GP") && !modifiers.includes("GO") && !modifiers.includes("GN")) {
        mockChanges.push({
          path: `claim.serviceLines[${idx}].modifiers`,
          before: modifiers,
          after: [...modifiers, "GP"],
          reason: "Medicare and most payers require therapy plan modifiers (GP, GO, or GN) for physical therapy services. GP indicates services under a physical therapy plan of care."
        });
      }
    }
  });
  
  // 2. Diagnosis pointer validation
  serviceLines.forEach((line: any, idx: number) => {
    const pointers = line?.diagnosisPointers || 
      line?.professionalService?.compositeDiagnosisCodePointers?.diagnosisCodePointers || [];
    if (pointers.length === 0 && diagnosisCodes.length > 0) {
      mockChanges.push({
        path: `claim.serviceLines[${idx}].diagnosisPointers`,
        before: [],
        after: ["1"],
        reason: "Every service line must have at least one diagnosis pointer. Missing diagnosis pointers will result in claim rejection."
      });
    }
  });
  
  // 3. Generate warnings
  if (!billingNpi || billingNpi.length !== 10) {
    warnings.push("Billing NPI appears invalid or missing. Verify it's a valid 10-digit NPI.");
  }
  if (billingNpi !== renderingNpi && renderingNpi && renderingNpi.length === 10) {
    warnings.push("Billing and rendering NPIs differ - ensure both providers are properly credentialed with the payer.");
  }
  if (diagnosisCodes.length === 0) {
    warnings.push("No diagnosis codes found. At least one ICD-10 code is required for claim submission.");
  }
  if (totalCharge === 0) {
    warnings.push("Total charge amount is $0.00. Verify charges are correctly entered.");
  }
  
  // 4. Generate recommendations
  if (serviceLines.length > 3) {
    recommendations.push("Consider breaking this into multiple claims if procedures span different dates of service or treatment episodes.");
  }
  if (diagnosisCodes.length === 1) {
    recommendations.push("Adding secondary diagnoses can improve claim specificity and provide medical necessity support for multiple services.");
  }
  recommendations.push("Verify all procedure codes have current AMA CPT validity for the date of service.");
  
  // Calculate confidence based on claim quality
  let confidence = 0.70;
  if (diagnosisCodes.length > 0) confidence += 0.08;
  if (serviceLines.length > 0) confidence += 0.08;
  if (billingNpi && billingNpi.length === 10) confidence += 0.05;
  if (warnings.length === 0) confidence += 0.05;
  if (mockChanges.length === 0) confidence += 0.04;
  confidence = Math.min(confidence, 0.96);
  
  const rationale = mockChanges.length > 0
    ? `Claim analysis complete. Found ${mockChanges.length} optimization${mockChanges.length > 1 ? 's' : ''} that will improve first-pass acceptance rate. ${warnings.length > 0 ? `${warnings.length} warning${warnings.length > 1 ? 's' : ''} require attention.` : 'No critical issues detected.'}`
    : warnings.length > 0
    ? `Claim structure is acceptable but ${warnings.length} warning${warnings.length > 1 ? 's' : ''} should be reviewed before submission.`
    : "Excellent claim structure. This claim follows best practices and has a high probability of first-pass acceptance.";
  
  return {
    claim: claim,
    changes: mockChanges,
    confidence: confidence,
    rationale: rationale,
    warnings: warnings,
    recommendations: recommendations,
    retrieved: { rules, exemplars },
    model: "anirul-demo",
    provider: "clinix-ai",
    mockMode: true
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SuggestRequest;
    const validation = validateClaim(body.claim);
    if (!validation.ok) {
      return NextResponse.json(
        { error: validation.error ?? "Invalid claim payload" },
        { status: 400 },
      );
    }

    const payerId = body.payerId || (body.claim as any)?.tradingPartnerId;
    const specialty = body.specialty || "primary_care";

    const rules = (seed as any).rules.filter(
      (r: any) =>
        (!r.payerId || r.payerId === payerId) &&
        (!r.specialty || r.specialty === specialty),
    );
    const exemplars = (seed as any).exemplars.filter(
      (e: any) =>
        (!e.payerId || e.payerId === payerId) &&
        (!e.specialty || e.specialty === specialty),
    );

    // If no API key, return mock response for demo/testing
    if (!RAG_API_KEY) {
      console.log("[RAG Suggest] No API key configured - returning mock response");
      const mockResponse = generateMockResponse(body.claim, rules, exemplars);
      return NextResponse.json(mockResponse);
    }

    const system = `
You are ANIRUL, an expert medical billing AI assistant specializing in claim optimization, denial prevention, and revenue cycle management. You have deep knowledge of:
- CMS-1500 professional claim forms
- CPT, HCPCS, and ICD-10 coding guidelines
- Payer-specific rules and requirements (Medicare, Medicaid, commercial insurers)
- Medical necessity documentation requirements
- Modifier usage (25, 59, 76, 77, 95, GT, etc.)
- Place of service codes and their billing implications
- Prior authorization requirements
- Clean claim submission best practices

TASK: Analyze the provided claim and suggest specific, actionable optimizations to:
1. Reduce denial risk
2. Ensure proper reimbursement
3. Fix coding errors or inconsistencies
4. Add required modifiers
5. Align diagnosis pointers correctly
6. Identify missing or incorrect information

RULES:
- Do NOT invent or change member IDs, NPIs, tax IDs, payer IDs, dates, or patient identifiers
- Only suggest changes to: modifiers, diagnosis pointers, POS codes, coding combinations, missing fields
- Be specific about WHY each change reduces denial risk or improves reimbursement
- Reference actual payer rules or CMS guidelines when applicable
- Confidence should reflect claim quality (0.95+ = excellent, 0.80-0.94 = good with minor issues, <0.80 = significant concerns)

OUTPUT FORMAT (JSON only, no text outside):
{
  "claim": <original or modified ClaimPayload>,
  "changes": [
    {
      "path": "specific.field.path",
      "before": <current value>,
      "after": <recommended value>,
      "reason": "Detailed explanation citing rule/guideline"
    }
  ],
  "confidence": <0.0-1.0>,
  "rationale": "Overall assessment of claim quality and denial risk",
  "warnings": ["List of potential issues that may cause delays or denials"],
  "recommendations": ["Additional best practice suggestions"]
}
`;

    const context = JSON.stringify(
      {
        retrieved: {
          rules,
          exemplars,
        },
      },
      null,
      2,
    );

    // Helper function to calculate patient age
    const calculatePatientAge = (dob: string | undefined): number | null => {
      if (!dob) return null;
      const dobDate = new Date(dob.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"));
      const today = new Date();
      let age = today.getFullYear() - dobDate.getFullYear();
      const monthDiff = today.getMonth() - dobDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
        age--;
      }
      return age;
    };

    // Build comprehensive claim analysis request
    const claimData = body.claim as any;
    const analysisRequest = {
      claim: body.claim,
      analysisContext: {
        payerId: payerId,
        specialty: specialty,
        serviceLines: claimData?.claim?.serviceLines || claimData?.claimInformation?.serviceLines || [],
        diagnosisCodes: claimData?.claim?.diagnosisCodes || claimData?.claimInformation?.healthCareCodeInformation?.map((c: any) => c.diagnosisCode) || [],
        placeOfService: claimData?.claim?.placeOfServiceCode || claimData?.claimInformation?.placeOfServiceCode || "11",
        totalCharge: claimData?.claim?.totalChargeAmount || claimData?.claimInformation?.claimChargeAmount || "0",
        billingNpi: claimData?.billingProvider?.npi || claimData?.billing?.npi || "",
        renderingNpi: claimData?.renderingProvider?.npi || claimData?.rendering?.npi || "",
        patientAge: calculatePatientAge(claimData?.subscriber?.dateOfBirth),
      },
      instructions: [
        "Analyze this claim for denial risk factors",
        "Check modifier requirements based on POS code and procedure combinations",
        "Verify diagnosis pointers are correctly linked to service lines",
        "Identify any missing required fields for the specified payer",
        "Check for common coding errors (unbundling, duplicate services, etc.)",
        "Preserve all existing identifiers - only suggest coding/structural changes",
        "Return JSON only with detailed explanations"
      ]
    };

    const user = JSON.stringify(analysisRequest, null, 2);

    const openaiPayload = {
      model: RAG_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "assistant", content: "Context:\n" + context },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      temperature: 0,
    };

    const llmRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RAG_API_KEY}`,
      },
      body: JSON.stringify(openaiPayload),
    });

    if (!llmRes.ok) {
      const errText = await llmRes.text();
      return NextResponse.json(
        { error: "LLM request failed", status: llmRes.status, details: errText },
        { status: 502 },
      );
    }

    const llmJson = await llmRes.json();
    const content = llmJson?.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "No content from LLM" },
        { status: 502 },
      );
    }

    // Attempt to parse the model JSON; fallback to original claim if parsing fails
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {
        claim: body.claim,
        changes: [],
        confidence: 0,
        rationale: "LLM returned non-JSON content",
      };
    }

    // Ensure claim present; otherwise fallback to original
    if (!parsed.claim) {
      parsed.claim = body.claim;
    }

    // Attach retrieval + model info for debugging
    parsed.retrieved = { rules, exemplars };
    parsed.model = RAG_MODEL;
    parsed.provider = RAG_PROVIDER;

    return NextResponse.json(parsed);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}





