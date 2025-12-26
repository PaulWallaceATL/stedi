import { NextResponse } from "next/server";

// Lightweight webhook handler for Stedi transaction events (e.g., 277/835).
// Configure your Stedi webhook to POST here. We simply log and echo.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Minimal persistence: log to console. In production, store to DB/queue.
    console.log("Stedi webhook event", body);
    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}
