"use client";

import Link from "next/link";

const metrics = [
  { label: "Claims submitted (24h)", value: "1,284", delta: "+12%" },
  { label: "Clean claim rate", value: "97.8%", delta: "+0.6%" },
  { label: "Avg adjudication time", value: "6.2 days", delta: "-0.4d" },
  { label: "Denial rate", value: "2.1%", delta: "-0.3%" },
];

const stages = [
  { stage: "Submitted", pct: 100, detail: "All claims delivered to payers" },
  { stage: "Acknowledged (999/277CA)", pct: 98, detail: "Accepted envelopes and validation" },
  { stage: "In Process (277)", pct: 86, detail: "Adjudication in progress" },
  { stage: "Paid (835)", pct: 74, detail: "Remits received and posted" },
];

const insights = [
  "Orthopedics denials trending down 0.8% w/w after modifier prompts.",
  "Top payer-specific hold: missing NPI on referring provider in 277CA rejections.",
  "AI predicts 7.4% of pending claims will deny without attachments; prompt users to add 275 imaging.",
  "Secondary submission latency improved 1.2 days after automated COB routing.",
];

const recentClaims = [
  { id: "CLM-98231", payer: "Aetna", status: "Paid", amount: "$842.10", age: "4d" },
  { id: "CLM-98202", payer: "BCBS", status: "In Process", amount: "$412.55", age: "2d" },
  { id: "CLM-98177", payer: "UHC", status: "Acknowledged", amount: "$1,120.00", age: "1d" },
  { id: "CLM-98144", payer: "Cigna", status: "Submitted", amount: "$286.00", age: "8h" },
];

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <section className="border-b border-slate-900 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-16 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
            Analytics & AI insights
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Claims performance</h1>
            <Link
              href="/"
              className="text-xs text-slate-300 underline underline-offset-4 hover:text-white"
            >
              Back to home
            </Link>
          </div>
          <p className="max-w-3xl text-slate-300">
            Monitor throughput, clean claim rate, denial trends, and AI guidance to keep each claim
            moving from submission through remittance.
          </p>
        </div>
      </section>

      <section className="border-b border-slate-900 bg-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-md shadow-black/30"
            >
              <p className="text-xs uppercase tracking-wide text-slate-400">{m.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{m.value}</p>
              <p className="text-xs text-emerald-300">{m.delta} vs prior</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-slate-900 bg-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-sky-300">Pipeline</p>
              <h2 className="text-2xl font-semibold text-white">Claim tracking stages</h2>
            </div>
            <span className="text-xs text-slate-400">Live from submission to 835</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {stages.map((s) => (
              <div
                key={s.stage}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-md shadow-black/30"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{s.stage}</p>
                  <p className="text-sm text-sky-300">{s.pct}%</p>
                </div>
                <p className="text-xs text-slate-400">{s.detail}</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-sky-500"
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-900 bg-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-10 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-md shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-sky-300">AI insights</p>
                <h3 className="text-xl font-semibold text-white">Risk & opportunity</h3>
              </div>
              <span className="text-xs text-slate-400">Auto-refreshed hourly</span>
            </div>
            <ul className="space-y-3 text-sm text-slate-200">
              {insights.map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-md shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-sky-300">Recent claims</p>
                <h3 className="text-lg font-semibold text-white">Latest movement</h3>
              </div>
              <Link href="/api" className="text-xs text-sky-300 underline underline-offset-4">
                Open workbench
              </Link>
            </div>
            <div className="space-y-2 text-sm text-slate-200">
              {recentClaims.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/60 px-3 py-2"
                >
                  <div>
                    <p className="font-semibold text-white">{c.id}</p>
                    <p className="text-xs text-slate-400">{c.payer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-sky-200">{c.status}</p>
                    <p className="text-xs text-slate-400">
                      {c.amount} · {c.age}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

