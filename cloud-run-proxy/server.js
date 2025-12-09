import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import seed from "./seed.json" assert { type: "json" };

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.post("/proxy", async (req, res) => {
  try {
    const { path, method = "POST", idempotencyKey, body } = req.body || {};
    if (!path) return res.status(400).json({ error: "Missing path" });

    const apiKey = process.env.STEDI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "STEDI_API_KEY not set" });

    const base =
      (process.env.STEDI_BASE_URL || process.env.STEDI_API_BASE_URL || "https://core.us.stedi.com").trim();
    const cleanedPath = path.startsWith("/") ? path : `/${path}`;
    const url = path.startsWith("http")
      ? path
      : `${base.replace(/\/+$/, "")}${cleanedPath}`;

    const headers = {
      Authorization: apiKey.trim(),
      "User-Agent": "clinix-ai-stedi-proxy/1.0",
    };
    if (!["GET", "DELETE"].includes(method.toUpperCase())) {
      headers["Content-Type"] = "application/json";
    }
    if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;

    const upstream = await fetch(url, {
      method,
      headers,
      body: ["GET", "DELETE"].includes(method.toUpperCase()) ? undefined : JSON.stringify(body ?? {}),
    });

    const raw = await upstream.text();
    let data = raw;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch (_) {
      data = raw || null;
    }

    res.status(upstream.status).json({
      ok: upstream.ok,
      status: upstream.status,
      statusText: upstream.statusText,
      headers: Object.fromEntries(upstream.headers.entries()),
      data,
      raw,
    });
  } catch (err) {
    res.status(500).json({
      error: err?.message || "Unexpected error",
      name: err?.name,
      code: err?.code,
      stack: err?.stack?.split("\n").slice(0, 3).join("\n"),
    });
  }
});

app.post("/rag/suggest", async (req, res) => {
  try {
    const { payerId, specialty = "primary_care", claim } = req.body || {};
    if (!claim) return res.status(400).json({ error: "Missing claim" });

    const apiKey =
      (process.env.RAG_API_KEY || process.env.OPENAI_API_KEY || "").trim();
    if (!apiKey) {
      return res.status(500).json({ error: "RAG_API_KEY is not set" });
    }

    const model = process.env.RAG_MODEL || "gpt-5.1";
    const provider = (process.env.RAG_PROVIDER || "openai").toLowerCase();
    if (provider !== "openai") {
      return res
        .status(400)
        .json({ error: "Only openai provider is supported in proxy" });
    }

    const rules = (seed?.rules || []).filter(
      (r) =>
        (!r.payerId || r.payerId === payerId || r.payerId === claim?.tradingPartnerId) &&
        (!r.specialty || r.specialty === specialty),
    );
    const exemplars = (seed?.exemplars || []).filter(
      (e) =>
        (!e.payerId || e.payerId === payerId || e.payerId === claim?.tradingPartnerId) &&
        (!e.specialty || e.specialty === specialty),
    );

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

    const context = JSON.stringify({ retrieved: { rules, exemplars } }, null, 2);
    const user = JSON.stringify(
      {
        claim,
        instruction:
          "Return JSON only. No text outside JSON. Preserve existing IDs/NPIs/member IDs. Suggest minimal fixes with high confidence.",
      },
      null,
      2,
    );

    const llmRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "assistant", content: "Context:\n" + context },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
        temperature: 0,
      }),
    });

    if (!llmRes.ok) {
      const errText = await llmRes.text();
      return res
        .status(502)
        .json({ error: "LLM request failed", status: llmRes.status, details: errText });
    }

    const llmJson = await llmRes.json();
    const content = llmJson?.choices?.[0]?.message?.content;
    let parsed;
    try {
      parsed = content ? JSON.parse(content) : null;
    } catch (e) {
      parsed = null;
    }

    if (!parsed || typeof parsed !== "object") {
      return res.status(502).json({ error: "Invalid LLM content" });
    }

    parsed.retrieved = { rules, exemplars };
    parsed.model = model;
    parsed.provider = provider;

    return res.json(parsed);
  } catch (err) {
    res.status(500).json({
      error: err?.message || "Unexpected error",
      name: err?.name,
      code: err?.code,
      stack: err?.stack?.split("\n").slice(0, 3).join("\n"),
    });
  }
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Proxy listening on ${port}`));
