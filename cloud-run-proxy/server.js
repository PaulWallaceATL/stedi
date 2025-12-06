import express from "express";
import cors from "cors";
import fetch from "node-fetch";

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

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Proxy listening on ${port}`));
