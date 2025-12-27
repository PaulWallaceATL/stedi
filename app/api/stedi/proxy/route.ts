import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IncomingBody = {
  path?: string;
  method?: string;
  idempotencyKey?: string;
  body?: unknown;
};

// Generate mock responses for testing when API key is not available
function generateMockResponse(path: string, body: any) {
  const now = new Date().toISOString();
  const claimId = `MOCK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  
  // Mock claim submission response
  if (path.includes("professionalclaims") || path.includes("submission")) {
    return {
      ok: true,
      status: 200,
      statusText: "OK (Mock)",
      headers: {},
      data: {
        claimId,
        controlNumber: body?.controlNumber || claimId,
        transactionSetId: `ST${Date.now()}`,
        status: "accepted",
        submittedAt: now,
        mockMode: true,
        message: "Mock submission successful - no actual claim was submitted to Stedi",
      },
    };
  }
  
  // Mock claim status response (277)
  if (path.includes("claimstatus")) {
    return {
      ok: true,
      status: 200,
      statusText: "OK (Mock)",
      headers: {},
      data: {
        controlNumber: body?.controlNumber || "MOCK-CONTROL",
        statusInformation: [{
          claimStatusCategoryCode: "1",
          claimStatusCategoryCodeValue: "Accepted",
          statusCode: "1",
          statusCodeValue: "For payer use only",
        }],
        tradingPartnerServiceId: body?.tradingPartnerServiceId || "STEDI",
        submittedAt: now,
        mockMode: true,
      },
    };
  }
  
  // Generic mock response
  return {
    ok: true,
    status: 200,
    statusText: "OK (Mock)",
    headers: {},
    data: {
      mockMode: true,
      message: "Mock response - STEDI_API_KEY not configured",
      requestedPath: path,
    },
  };
}

export async function POST(request: Request) {
  try {
    const { path, method = "POST", idempotencyKey, body }: IncomingBody =
      await request.json();

    if (!path) {
      return NextResponse.json({ error: "Missing path" }, { status: 400 });
    }

    const cleanedPath = path.startsWith("/") ? path : `/${path}`;

    const apiKey = process.env.STEDI_API_KEY?.trim();
    
    // If no API key, return mock response for testing
    if (!apiKey) {
      console.log("[Stedi Proxy] No API key configured - returning mock response for:", cleanedPath);
      const mockResponse = generateMockResponse(cleanedPath, body);
      return NextResponse.json(mockResponse, { status: mockResponse.status });
    }

    const base =
      (
        process.env.STEDI_HEALTHCARE_BASE_URL ||
        process.env.STEDI_BASE_URL ||
        process.env.STEDI_API_BASE_URL ||
        ""
      ).trim() || "https://healthcare.us.stedi.com";

    const url = path.startsWith("http")
      ? path
      : `${base.replace(/\/+$/, "")}${cleanedPath}`;

    const headers: Record<string, string> = {
      // Pass through exactly what you set in STEDI_API_KEY (test_ or prod key).
      Authorization: apiKey.trim(),
      "User-Agent": "clinix-ai-stedi-proxy/1.0",
    };

    if (!["GET", "DELETE"].includes(method.toUpperCase())) {
      headers["Content-Type"] = "application/json";
    }
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }

    let upstream;
    try {
      upstream = await fetch(url, {
        method,
        headers,
        body:
          ["GET", "DELETE"].includes(method.toUpperCase()) || body === undefined
            ? undefined
            : JSON.stringify(body),
        cache: "no-store",
      });
    } catch (fetchError) {
      const err = fetchError as
        | (Error & { code?: string; cause?: unknown })
        | undefined;
      return NextResponse.json(
        {
          error: err?.message || "fetch failed (unknown)",
          code: err?.code,
          name: err?.name,
          cause: err?.cause ?? null,
          stack: err?.stack ? err.stack.split("\n").slice(0, 3).join("\n") : null,
          url,
          method,
          path,
          base,
          hasApiKey: Boolean(apiKey),
        },
        { status: 502 },
      );
    }

    const raw = await upstream.text();
    let data: unknown = raw;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = raw || null;
    }
    const responseHeaders = Object.fromEntries(upstream.headers.entries());

    return NextResponse.json(
      {
        ok: upstream.ok,
        status: upstream.status,
        statusText: upstream.statusText,
        headers: responseHeaders,
        data,
        raw,
      },
      { status: upstream.status },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected error occurred",
      },
      { status: 500 },
    );
  }
}

