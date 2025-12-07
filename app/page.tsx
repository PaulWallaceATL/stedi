"use client";

import gsap from "gsap";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const bullets = [
  "Real-time eligibility (270/271) with payer guardrails and plan rules",
  "Clean claims (837P) with payer-aware modifiers, POS, units, and pointers",
  "Status tracking (276/277 + 277CA) with rejection labeling",
  "Remits (835) to learn CARC/RARC patterns and automate appeals",
  "Attachments (275) with narratives, imaging, and primary EOBs",
  "6–12 months of historical claims to tune denial prevention",
];

const workflow = [
  "Ingest patient, subscriber, encounter, provider, schedule, and historical claims",
  "Run eligibility to surface coverage, copay, coinsurance, frequency, and plan rules",
  "Generate scrubbed 837P with ICD-10 ↔ CPT pointers, POS, units/time, modifiers",
  "Pre-submit ML validation to predict denials and request missing documentation",
  "Submit via Stedi; collect 999/277CA/277 status and push to EMR",
  "Parse 835s to learn CARC/RARC patterns, write-offs, and appeal viability",
  "Automate appeals with 275 attachments and specialty-specific narratives",
];

const playbooks = [
  {
    title: "Denial Defense",
    points: [
      "Frequency/age checks from 270/271",
      "Modifier requirements by payer",
      "Same-day conflict detection (exam + treatment)",
      "Auto documentation prompts before submission",
    ],
  },
  {
    title: "Cash Flow Control",
    points: [
      "Expected allowable from historical 835s",
      "Patient responsibility prediction",
      "CARC/RARC clustering for root causes",
      "Proactive secondary + attachment routing",
    ],
  },
  {
    title: "Appeal Automation",
    points: [
      "Auto-drafted narratives",
      "275 attachments (PDF, imaging, EOB)",
      "Payer-specific appeal formats",
      "Overturn likelihood scoring",
    ],
  },
];

const spotlight = [
  {
    label: "Eligibility Guardrails",
    copy: "Surfaced plan rules, copay/coinsurance, frequency limits, and prior-auth warnings from 270/271 to stop denials upstream.",
  },
  {
    label: "Clean Claim Engine",
    copy: "837P with payer-aware modifiers, POS validation, ICD ↔ CPT pointers, units/time sanity, and dual insurance routing.",
  },
  {
    label: "Live Status + Remits",
    copy: "276/277 + 277CA for real-time acceptance; 835 parsing to learn CARC/RARC patterns and trigger fixes or appeals.",
  },
  {
    label: "Appeal Intelligence",
    copy: "Template the right 275 attachments, narratives, and evidence; track overturn rates to prioritize what actually wins.",
  },
];

function useReveal() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
          }
        });
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const playbookRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const workflowReveal = useReveal();
  const denialReveal = useReveal();
  const playbookReveal = useReveal();
  const spotlightReveal = useReveal();
  const ctaReveal = useReveal();

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.from(heroRef.current, { y: 40, opacity: 0, duration: 0.8 })
      .from(statsRef.current?.children || [], {
        y: 20,
        opacity: 0,
        stagger: 0.08,
        duration: 0.4,
      })
      .from(
        playbookRef.current?.children || [],
        {
          y: 18,
          opacity: 0,
          stagger: 0.08,
          duration: 0.4,
        },
        "-=0.2",
      )
      .from(
        spotlightRef.current?.children || [],
        {
          y: 14,
          opacity: 0,
          stagger: 0.06,
          duration: 0.35,
        },
        "-=0.2",
      );
  }, []);

  const heroCopy = useMemo(
    () => ({
      title: "Clinix AI — Claims Intelligence & Automated Billing",
      subtitle:
        "Eligibility checks, clean claims, denial learning, and Stedi-powered submission & remittance. A self-improving billing layer that plugs into any EMR.",
    }),
    [],
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Dark veil hero inspired by React Bits dark-veil */}
      <section
        className="relative overflow-hidden border-b border-slate-900"
        style={{
          background:
            "radial-gradient(140% 120% at 0% 0%, rgba(59,130,246,0.20), rgba(5,7,12,0)), radial-gradient(120% 120% at 100% 20%, rgba(14,165,233,0.18), rgba(5,7,12,0)), radial-gradient(120% 120% at 70% 80%, rgba(6,182,212,0.12), rgba(5,7,12,0)), #05070c",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.06),transparent_32%),radial-gradient(circle_at_82%_12%,rgba(255,255,255,0.04),transparent_30%)] mix-blend-screen opacity-80" />
        <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
          <div className="space-y-7" ref={heroRef}>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-200 shadow-sm shadow-sky-900/40 backdrop-blur">
              Eligibility • Claims • Status • Appeals
            </span>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
              {heroCopy.title}
            </h1>
            <p className="max-w-2xl text-lg text-slate-200">{heroCopy.subtitle}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/api"
                className="rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/40 transition hover:-translate-y-1 hover:bg-sky-400"
              >
                Launch API Workbench
              </Link>
              <Link
                href="#workflow"
                className="rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-100 shadow-sm transition hover:-translate-y-1 hover:border-sky-500/60 hover:text-white"
              >
                See the workflow
              </Link>
            </div>
            <div
              ref={statsRef}
              className="grid grid-cols-2 gap-4 text-sm text-slate-200 sm:grid-cols-3"
            >
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-md shadow-black/40 transition duration-300 hover:-translate-y-1 hover:border-sky-500/60">
                <p className="text-2xl font-semibold text-white">270/271</p>
                <p className="text-xs uppercase tracking-wide text-sky-200">
                  Eligibility guardrails
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-md shadow-black/40 transition duration-300 hover:-translate-y-1 hover:border-sky-500/60">
                <p className="text-2xl font-semibold text-white">837P</p>
                <p className="text-xs uppercase tracking-wide text-sky-200">
                  Clean claim automation
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-md shadow-black/40 transition duration-300 hover:-translate-y-1 hover:border-sky-500/60">
                <p className="text-2xl font-semibold text-white">835</p>
                <p className="text-xs uppercase tracking-wide text-sky-200">
                  Remits & appeals
                </p>
              </div>
            </div>
          </div>
          <div className="relative h-[420px] overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-black shadow-2xl shadow-sky-900/40">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.25),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.20),transparent_32%),radial-gradient(circle_at_60%_80%,rgba(6,182,212,0.16),transparent_34%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.06),transparent_30%),linear-gradient(240deg,rgba(255,255,255,0.04),transparent_35%)] mix-blend-screen" />
            <div className="absolute inset-x-8 bottom-8 h-28 rounded-full bg-sky-500/20 blur-3xl" />
            <div className="relative z-10 flex h-full items-center justify-center text-center text-slate-200">
              <div className="max-w-sm space-y-3 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-xl shadow-black/40 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.3em] text-sky-200">Dark Veil</p>
                <p className="text-2xl font-semibold text-white">Medical-grade calm</p>
                <p className="text-sm text-slate-200/80">
                  Replacing the 3D helix with a focused dark veil canvas inspired by React Bits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="workflow"
        ref={workflowReveal.ref}
        className={`border-b border-slate-900 bg-slate-950 transition duration-700 ${
          workflowReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="mx-auto max-w-6xl px-6 py-16 space-y-6">
          <p className="text-sm uppercase tracking-[0.22em] text-sky-300">
            End-to-end product workflow
          </p>
          <h2 className="text-3xl font-semibold text-white">From eligibility to appeals</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {workflow.map((item, idx) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-md shadow-black/40 transition duration-300 hover:-translate-y-1 hover:border-sky-500/60"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-200">
                  Step {idx + 1}
                </p>
                <p className="mt-2 text-sm text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={denialReveal.ref}
        className={`border-b border-slate-900 bg-slate-950 transition duration-700 ${
          denialReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-16 lg:grid-cols-2">
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.22em] text-sky-300">
              What powers denial prevention
            </p>
            <h3 className="text-2xl font-semibold text-white">
              Learn from historical claims and real-time signals
            </h3>
            <p className="text-slate-200">
              Clinix AI ingests 6–12 months of 837/835/276/277/270/271 plus EMR encounters to map
              payer quirks, CARC/RARC patterns, frequency limits, and documentation needs. Every
              submission sharpens the model and keeps staff out of rework.
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {bullets.slice(0, 6).map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 rounded-lg border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-200 shadow-md shadow-black/30 transition duration-300 hover:-translate-y-1 hover:border-sky-500/60"
                >
                  <span className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/api"
                className="rounded-full bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-md shadow-sky-600/30 transition hover:-translate-y-1 hover:bg-sky-400"
              >
                Try the API workbench
              </Link>
              <Link
                href="/rag"
                className="rounded-full border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100 shadow-sm transition hover:-translate-y-1 hover:border-sky-500/60 hover:text-white"
              >
                Explore RAG
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/40 transition duration-300 hover:-translate-y-1 hover:border-sky-500/60">
            <h4 className="text-lg font-semibold text-white">X12 coverage</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              <li>837P/837I/837D — clean claim generation & submission</li>
              <li>270/271 — eligibility with frequency/age limits surfaced</li>
              <li>276/277/277CA — real-time status, rejection labeling</li>
              <li>835 — remittance parsing, CARC/RARC learning</li>
              <li>275 — attachments for appeals and secondary billing</li>
              <li>999/997 — syntax and envelope validation early</li>
              <li>278 — pre-auth where required</li>
            </ul>
          </div>
        </div>
      </section>

      <section
        ref={playbookReveal.ref}
        className={`border-b border-slate-900 bg-slate-950 transition duration-700 ${
          playbookReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="mx-auto max-w-6xl px-6 py-16 space-y-8">
          <div className="flex flex-col gap-2">
            <p className="text-sm uppercase tracking-[0.18em] text-sky-300">Playbooks</p>
            <h3 className="text-2xl font-semibold text-white">
              Denials, cash flow, and appeals—handled by design
            </h3>
          </div>
          <div
            ref={playbookRef}
            className="grid grid-cols-1 gap-4 md:grid-cols-3"
          >
            {playbooks.map((pb) => (
              <div
                key={pb.title}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-black/40 transition duration-300 hover:-translate-y-1 hover:border-sky-500/60"
              >
                <h4 className="text-lg font-semibold text-white">{pb.title}</h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-200">
                  {pb.points.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={spotlightReveal.ref}
        className={`border-b border-slate-900 bg-slate-950 transition duration-700 ${
          spotlightReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="mx-auto max-w-6xl px-6 py-16 space-y-8">
          <div className="flex flex-col gap-2">
            <p className="text-sm uppercase tracking-[0.18em] text-sky-300">Spotlight</p>
            <h3 className="text-2xl font-semibold text-white">
              Built to stop denials before they start
            </h3>
            <p className="max-w-3xl text-slate-200">
              Clinix AI combines Stedi rails, payer-specific rules, and ML signals from eligibility,
              status, and remits. The result: fewer reworks, cleaner cash, and faster appeals.
            </p>
          </div>
          <div
            ref={spotlightRef}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            {spotlight.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-black/40 transition duration-300 hover:-translate-y-1 hover:border-sky-500/60"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-200">
                  {item.label}
                </p>
                <p className="mt-2 text-sm text-slate-200">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={ctaReveal.ref}
        className={`bg-slate-950 transition duration-700 ${
          ctaReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-8 shadow-2xl shadow-black/50">
            <h3 className="text-2xl font-semibold text-white">
              Ready to reduce denials and automate your billing stack?
            </h3>
            <p className="mt-3 max-w-3xl text-slate-200">
              Drop in your Stedi keys, hit the workbench, and plug the engine into your EMR.
              Every 277 and 835 makes the model smarter—and your claims cleaner.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/api"
                className="rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-600/30 transition hover:-translate-y-1 hover:bg-sky-400"
              >
                Launch API workbench
              </Link>
              <Link
                href="/mocks"
                className="rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 hover:-translate-y-1 hover:border-sky-500/60"
              >
                View mock payloads
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
