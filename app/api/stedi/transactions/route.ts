import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { transactionId?: string; path?: string };
    const transactionId = body.transactionId?.trim();
    if (!transactionId) {
      return NextResponse.json({ error: "transactionId is required" }, { status: 400 });
    }

    const apiKey = process.env.STEDI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: "STEDI_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const url = `https://core.us.stedi.com/2023-08-01/transactions/${transactionId}/output`;

    const upstream = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: apiKey,
      },
      redirect: "manual", // keep 302 and expose documentDownloadUrl
    });

    // Handle 302 to expose the document download URL
    if (upstream.status === 302) {
      const location = upstream.headers.get("location");
      return NextResponse.json(
        {
          status: upstream.status,
          statusText: upstream.statusText,
          documentDownloadUrl: location,
        },
        { status: 200 },
      );
    }

    const text = await upstream.text();
    let data: unknown = text;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text || null;
    }

    return NextResponse.json(
      {
        ok: upstream.ok,
        status: upstream.status,
        statusText: upstream.statusText,
        headers: Object.fromEntries(upstream.headers.entries()),
        data,
        raw: text,
      },
      { status: upstream.ok ? 200 : upstream.status },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}

