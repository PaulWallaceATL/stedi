import { NextResponse } from "next/server";
import seed from "@/rag/corpus/seed.json";
import { validateClaim } from "@/rag/schema/claim";
import { RAG_API_KEY, RAG_MODEL, RAG_PROVIDER } from "@/rag/config";

type SuggestRequest = {
  payerId?: string;
  specialty?: string;
  claim: unknown;
};

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

    if (!RAG_API_KEY) {
      return NextResponse.json(
        { error: "RAG_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const system = `
You are a claim scrubber. Return ONLY JSON, no prose. If you cannot comply, return the original claim unchanged with confidence 0.
Rules:
- Do NOT invent member IDs, NPIs, tax IDs, payer IDs, dates, or any identifiers.
- Only adjust structure/codes: POS, modifiers, diagnosisPointers, priorAuthRefNumber, required fields.
- Output must be EXACTLY:
{
  "claim": <ClaimPayload>,
  "changes": [ { "path": string, "before": any, "after": any, "reason": string } ],
  "confidence": number,
  "rationale": string
}
- No text outside the JSON object.
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

    const user = JSON.stringify(
      {
        claim: body.claim,
        instruction:
        "Return JSON only. No text outside JSON. Preserve existing IDs/NPIs/member IDs. Suggest minimal fixes with high confidence.",
      },
      null,
      2,
    );

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



