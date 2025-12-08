"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const metrics = [
  { key: "submitted", label: "Claims submitted (24h)", value: "1,284", delta: "+12%", desc: "Total claims sent to payers in the last 24 hours." },
  { key: "clean", label: "Clean claim rate", value: "97.8%", delta: "+0.6%", desc: "Claims with no edits or rejections on first pass." },
  { key: "adjudication", label: "Avg adjudication time", value: "6.2 days", delta: "-0.4d", desc: "Mean days from submission to remit." },
  { key: "denial", label: "Denial rate", value: "2.1%", delta: "-0.3%", desc: "Percent of claims denied after adjudication." },
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
  { id: "CLM-98231", payer: "Aetna", status: "Paid", amount: "$842.10", age: "4d", note: "Paid; CARC 45 contractual" },
  { id: "CLM-98202", payer: "BCBS", status: "In Process", amount: "$412.55", age: "2d", note: "Awaiting 277; predicted clean" },
  { id: "CLM-98177", payer: "UHC", status: "Acknowledged", amount: "$1,120.00", age: "1d", note: "277CA clean; expect remit in 3d" },
  { id: "CLM-98144", payer: "Cigna", status: "Submitted", amount: "$286.00", age: "8h", note: "Missing attachment risk: imaging" },
];

const trendSeries = [
  { label: "Mon", value: 840 },
  { label: "Tue", value: 910 },
  { label: "Wed", value: 990 },
  { label: "Thu", value: 1040 },
  { label: "Fri", value: 1120 },
];

const denialSeries = [
  { label: "CARC 96", value: 18 },
  { label: "CO 45", value: 12 },
  { label: "CO 197", value: 9 },
  { label: "CO 16", value: 6 },
  { label: "PR 1", value: 5 },
];

function SparkBar({ series }: { series: { label: string; value: number }[] }) {
  const max = Math.max(...series.map((s) => s.value));
  return (
    <div className="flex items-end gap-2">
      {series.map((s) => (
        <div key={s.label} className="flex flex-col items-center gap-1">
          <div
            className="w-8 rounded-lg bg-gradient-to-b from-sky-400 to-sky-600"
            style={{ height: `${Math.max(18, (s.value / max) * 70)}px` }}
            title={`${s.label}: ${s.value}`}
          />
          <span className="text-[10px] text-slate-400">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function SparkLine({ series }: { series: { label: string; value: number }[] }) {
  const max = Math.max(...series.map((s) => s.value));
  const min = Math.min(...series.map((s) => s.value));
  return (
    <div className="relative h-20 w-full rounded-xl bg-slate-900/60 p-3 ring-1 ring-slate-800/60">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-500/10 to-transparent rounded-xl" />
      <div className="relative flex h-full items-end gap-3">
        {series.map((s, idx) => {
          const pct = (s.value - min) / Math.max(1, max - min);
          return (
            <div key={s.label} className="flex-1 flex flex-col items-center">
              <div
                className="w-full rounded-t-lg bg-sky-400/80"
                style={{ height: `${Math.max(10, pct * 70)}px` }}
              />
              <span className="mt-1 text-[10px] text-slate-400">{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [selectedMetric, setSelectedMetric] = useState(metrics[0]);
  const [selectedClaim, setSelectedClaim] = useState(recentClaims[0]);

  const detailBlurb = useMemo(() => {
    if (selectedMetric.key === "clean") {
      return "Clean claims continue to rise. Keep using payer-aware prompts and attachment reminders to hold this line.";
    }
    if (selectedMetric.key === "denial") {
      return "Denials are trending lower. Focus on CARC 96 and COB-related edits to reduce residual issues.";
    }
    if (selectedMetric.key === "adjudication") {
      return "Adjudication time improved; accelerate by auto-posting 835s and nudging slow payers.";
    }
    return "Submission throughput is healthy; maintain schedule validation and POS checks to prevent loops.";
  }, [selectedMetric]);

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
            moving from submission through remittance. Click any card to drill into details.
          </p>
        </div>
      </section>

      <section className="border-b border-slate-900 bg-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <button
              type="button"
              key={m.label}
              onClick={() => setSelectedMetric(m)}
              className={`rounded-2xl border p-4 text-left shadow-md shadow-black/30 transition ${
                selectedMetric.key === m.key
                  ? "border-sky-500/60 bg-slate-900/80"
                  : "border-slate-800 bg-slate-900/60 hover:border-sky-500/40"
              }`}
            >
              <p className="text-xs uppercase tracking-wide text-slate-400">{m.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{m.value}</p>
              <p className="text-xs text-emerald-300">{m.delta} vs prior</p>
              <p className="mt-2 text-xs text-slate-400">{m.desc}</p>
            </button>
          ))}
        </div>
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 pb-8 lg:flex-row">
          <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-md shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-sky-300">Trend</p>
                <h3 className="text-xl font-semibold text-white">{selectedMetric.label}</h3>
              </div>
              <span className="text-xs text-slate-400">Past 5 days</span>
            </div>
            <div className="mt-4">
              <SparkLine series={trendSeries} />
            </div>
            <p className="mt-3 text-sm text-slate-200">{detailBlurb}</p>
          </div>
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-md shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-sky-300">Denial mix</p>
                <h3 className="text-lg font-semibold text-white">Top CARC/RARC</h3>
              </div>
              <span className="text-xs text-slate-400">This week</span>
            </div>
            <div className="mt-4">
              <SparkBar series={denialSeries} />
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Focus on eligibility (96), COB (197), and pricing (45) edits for fastest lift.
            </p>
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
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setSelectedClaim(c)}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 transition ${
                    selectedClaim.id === c.id
                      ? "border-sky-500/60 bg-slate-900/80"
                      : "border-slate-800/80 bg-slate-900/60 hover:border-sky-500/40"
                  }`}
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
                </button>
              ))}
            </div>
            <div className="rounded-xl border border-sky-500/40 bg-slate-900/70 p-4 text-sm text-slate-200 shadow-inner shadow-sky-900/40">
              <p className="text-xs uppercase tracking-[0.18em] text-sky-300">Claim detail</p>
              <p className="mt-1 font-semibold text-white">
                {selectedClaim.id} · {selectedClaim.payer}
              </p>
              <p className="text-xs text-slate-400">
                Status: {selectedClaim.status} · Value: {selectedClaim.amount} · Age: {selectedClaim.age}
              </p>
              <p className="mt-2 text-slate-200">{selectedClaim.note}</p>
              <p className="mt-2 text-xs text-slate-400">
                Next step: surface payer rules, prompt attachments (if any), and monitor 277 for movement.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

