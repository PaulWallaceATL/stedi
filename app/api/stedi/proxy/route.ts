import { NextResponse } from "next/server";

type IncomingBody = {
  path?: string;
  method?: string;
  idempotencyKey?: string;
  body?: unknown;
};

export async function POST(request: Request) {
  try {
    const { path, method = "POST", idempotencyKey, body }: IncomingBody =
      await request.json();

    if (!path) {
      return NextResponse.json({ error: "Missing path" }, { status: 400 });
    }

    const apiKey = process.env.STEDI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "STEDI_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const base =
      process.env.STEDI_BASE_URL ||
      process.env.STEDI_API_BASE_URL ||
      "https://core.us.stedi.com";
    const url = path.startsWith("http") ? path : `${base}${path}`;

    const headers: Record<string, string> = {
      Authorization: apiKey,
    };

    if (!["GET", "DELETE"].includes(method.toUpperCase())) {
      headers["Content-Type"] = "application/json";
    }
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }

    const upstream = await fetch(url, {
      method,
      headers,
      body:
        ["GET", "DELETE"].includes(method.toUpperCase()) || body === undefined
          ? undefined
          : JSON.stringify(body),
      cache: "no-store",
    });

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

