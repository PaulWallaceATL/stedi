const BASE = (process.env.NEXT_PUBLIC_PROXY_URL || "").replace(/\/+$/, "");

function ensureBase() {
  if (!BASE) {
    throw new Error("NEXT_PUBLIC_PROXY_URL is not set");
  }
}

async function handleJson(res: Response) {
  const raw = await res.text();
  let data: any = raw;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw || null;
  }
  const ok = res.ok || res.status === 302;
  if (!ok) {
    const err = new Error(`Request failed (${res.status})`);
    (err as any).data = data;
    throw err;
  }
  return { data, status: res.status, ok: res.ok };
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
