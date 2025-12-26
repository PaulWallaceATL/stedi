import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.STEDI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: "STEDI_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const res = await fetch("https://core.us.stedi.com/2023-08-01/transactions", {
      method: "GET",
      headers: {
        Authorization: apiKey,
      },
    });

    const text = await res.text();
    let json: any = text;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = text || null;
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: "List transactions failed", status: res.status, details: json },
        { status: res.status },
      );
    }

    return NextResponse.json(json, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}


import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.STEDI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: "STEDI_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const res = await fetch("https://core.us.stedi.com/2023-08-01/transactions", {
      method: "GET",
      headers: {
        Authorization: apiKey,
      },
    });

    const text = await res.text();
    let json: any = text;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = text || null;
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: "List transactions failed", status: res.status, details: json },
        { status: res.status },
      );
    }

    return NextResponse.json(json, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}


import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.STEDI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: "STEDI_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const res = await fetch("https://core.us.stedi.com/2023-08-01/transactions", {
      method: "GET",
      headers: {
        Authorization: apiKey,
      },
    });

    const text = await res.text();
    let json: any = text;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = text || null;
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: "List transactions failed", status: res.status, details: json },
        { status: res.status },
      );
    }

    return NextResponse.json(json, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}


