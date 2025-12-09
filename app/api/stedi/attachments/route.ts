import { NextResponse } from "next/server";

type AttachmentRequest = {
  tradingPartnerServiceId: string;
  controlNumber: string;
  submitter: unknown;
  receiver: unknown;
  claim: unknown;
  contentType: string;
  fileName: string;
  fileContent: string; // base64
  description?: string;
  type?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AttachmentRequest;
    const apiKey = process.env.STEDI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: "STEDI_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const {
      tradingPartnerServiceId,
      controlNumber,
      submitter,
      receiver,
      claim,
      contentType,
      fileName,
      fileContent,
      description,
      type,
    } = body;

    if (!tradingPartnerServiceId || !controlNumber || !contentType || !fileName || !fileContent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Step 1: Create attachment
    const createRes = await fetch(
      "https://claims.us.stedi.com/2025-03-07/claim-attachments/file",
      {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tradingPartnerServiceId,
          controlNumber,
          submitter,
          receiver,
          claim,
          contentType,
          fileName,
          description,
          type,
        }),
      },
    );

    const createText = await createRes.text();
    let createJson: any = createText;
    try {
      createJson = createText ? JSON.parse(createText) : null;
    } catch {
      createJson = createText || null;
    }

    if (!createRes.ok) {
      return NextResponse.json(
        { error: "Create attachment failed", status: createRes.status, details: createJson },
        { status: createRes.status },
      );
    }

    const uploadUrl = createJson?.uploadUrl;
    if (!uploadUrl) {
      return NextResponse.json(
        { error: "Missing uploadUrl from attachment create response" },
        { status: 500 },
      );
    }

    // Step 2: Upload file content to presigned URL
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
      },
      body: Buffer.from(fileContent, "base64"),
    });

    if (!uploadRes.ok) {
      const uploadText = await uploadRes.text();
      return NextResponse.json(
        {
          error: "Upload failed",
          status: uploadRes.status,
          statusText: uploadRes.statusText,
          details: uploadText,
        },
        { status: uploadRes.status },
      );
    }

    return NextResponse.json(
      {
        attachmentId: createJson?.attachmentId,
        upload: { status: uploadRes.status, statusText: uploadRes.statusText },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}
