// Use NEXT_PUBLIC_PROXY_URL if set, otherwise fallback to local API routes
const BASE = (process.env.NEXT_PUBLIC_PROXY_URL || "/api/stedi").replace(/\/+$/, "");

function ensureBase() {
  // BASE will always have a value now (either env var or fallback)
  return true;
}

async function handleJson(res: Response) {
  const raw = await res.text();
  let data: any = raw;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw || null;
  }
  const ok = res.ok || res.status === 302 || res.status === 200;
  if (!ok) {
    // Extract error message from the response
    const errorMsg = data?.error || 
                    data?.data?.errors?.[0]?.message || 
                    data?.message || 
                    `Request failed (${res.status})`;
    const err = new Error(errorMsg);
    (err as any).data = data;
    (err as any).status = res.status;
    throw err;
  }
  return { data, status: res.status, ok };
}

export async function submitClaim(body: any, idempotencyKey?: string) {
  ensureBase();
  const res = await fetch(`${BASE}/proxy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: "/2024-04-01/change/medicalnetwork/professionalclaims/v3/submission",
      method: "POST",
      idempotencyKey,
      body,
    }),
  });
  return handleJson(res);
}

export async function claimStatus(body: any) {
  ensureBase();
  const res = await fetch(`${BASE}/proxy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: "/2024-04-01/change/medicalnetwork/claimstatus/v2",
      method: "POST",
      body,
    }),
  });
  return handleJson(res);
}

export async function createAttachment(body: any) {
  ensureBase();
  const res = await fetch(`${BASE}/attachments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleJson(res);
}

export async function listTransactions() {
  ensureBase();
  const res = await fetch(`${BASE}/transactions/list`, { method: "GET" });
  return handleJson(res);
}

export async function getTransactionOutput(transactionId: string) {
  ensureBase();
  const res = await fetch(`${BASE}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transactionId }),
  });
  return handleJson(res);
}

export async function ragSuggest(payload: any) {
  // RAG suggest has its own route at /api/rag/suggest
  const ragBase = process.env.NEXT_PUBLIC_PROXY_URL 
    ? `${process.env.NEXT_PUBLIC_PROXY_URL.replace(/\/+$/, "")}/rag/suggest`
    : "/api/rag/suggest";
  const res = await fetch(ragBase, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleJson(res);
}
