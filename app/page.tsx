"use client";

import gsap from "gsap";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import ScrollStack, { ScrollStackItem } from "./components/ScrollStack";
import Particles from "./components/Particles";

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
      {/* Hero with animated dark veil background (React Bits dark-veil inspired) */}
      <section
        className="relative overflow-hidden border-b border-slate-900"
        style={{
          background:
            "radial-gradient(140% 120% at 0% 0%, rgba(59,130,246,0.20), rgba(5,7,12,0)), radial-gradient(120% 120% at 100% 20%, rgba(14,165,233,0.18), rgba(5,7,12,0)), radial-gradient(120% 120% at 70% 80%, rgba(6,182,212,0.12), rgba(5,7,12,0)), #05070c",
        }}
      >
        <Particles
          className="absolute inset-0 z-0 opacity-70 pointer-events-none"
          particleCount={260}
          particleColors={["#7dd3fc", "#38bdf8", "#a5b4fc", "#ffffff"]}
          particleSpread={12}
          particleBaseSize={120}
          sizeRandomness={1.1}
          cameraDistance={22}
          speed={0.12}
          alphaParticles
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.06),transparent_32%),radial-gradient(circle_at_82%_12%,rgba(255,255,255,0.04),transparent_30%)] mix-blend-screen opacity-80 veil-animate" />
        <div className="pointer-events-none veil-animate-slow absolute inset-0 bg-[conic-gradient(from_120deg_at_30%_40%,rgba(59,130,246,0.08),transparent_30%),conic-gradient(from_240deg_at_70%_60%,rgba(14,165,233,0.06),transparent_32%)]" />

        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-6 py-18 text-center sm:py-20 lg:py-24">
          <div className="space-y-7" ref={heroRef}>
            <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-700 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-sky-200 shadow-sm shadow-sky-900/40 backdrop-blur">
              Eligibility • Claims • Status • Appeals
            </span>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {heroCopy.title}
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-slate-200 sm:text-[1.15rem]">
              {heroCopy.subtitle}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/api"
                className="rounded-full bg-sky-500 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/40 transition hover:-translate-y-1 hover:bg-sky-400"
              >
                Launch API Workbench
              </Link>
              <Link
                href="#workflow"
                className="rounded-full border border-slate-700 bg-slate-900 px-6 py-3.5 text-sm font-semibold text-slate-100 shadow-sm transition hover:-translate-y-1 hover:border-sky-500/60 hover:text-white"
              >
                See the workflow
              </Link>
            </div>
            <div
              ref={statsRef}
              className="mx-auto grid max-w-4xl grid-cols-1 gap-4 text-sm text-slate-200 sm:grid-cols-3"
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
        </div>
      </section>

      <section
        id="workflow"
        ref={workflowReveal.ref}
        className={`relative overflow-hidden border-b border-slate-900 bg-slate-950 transition duration-700 ${
          workflowReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="pointer-events-none veil-animate absolute inset-0 bg-[conic-gradient(from_90deg_at_20%_20%,rgba(59,130,246,0.06),transparent_32%),conic-gradient(from_210deg_at_80%_60%,rgba(6,182,212,0.05),transparent_34%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-18 space-y-6 sm:py-20 lg:py-24">
          <p className="text-sm uppercase tracking-[0.24em] text-sky-300">
            End-to-end product workflow
          </p>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">From eligibility to appeals</h2>

          <ScrollStack className="space-y-0">
            {workflow.map((item, idx) => (
              <ScrollStackItem
                key={item}
                itemClassName={`rounded-2xl border p-7 md:p-8 min-h-[230px] md:min-h-[250px] text-left shadow-lg shadow-black/40 ${
                  idx % 2 === 0
                    ? "border-sky-500/30 bg-slate-900/80"
                    : "border-emerald-500/25 bg-slate-900/70"
                }`}
              >
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-200">
                  Step {idx + 1}
                </p>
                <p className="mt-3 text-xl font-semibold text-white">{item}</p>
                <p className="mt-3 text-sm text-slate-300">
                  Upstream validation, payer-specific rules, and ML prompts keep this step clean.
                </p>
              </ScrollStackItem>
            ))}
          </ScrollStack>
        </div>
      </section>

      <section
        ref={denialReveal.ref}
        className={`relative overflow-hidden border-b border-slate-900 bg-slate-950 transition duration-700 ${
          denialReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="pointer-events-none veil-animate absolute inset-0 bg-[radial-gradient(circle_at_16%_10%,rgba(59,130,246,0.08),transparent_35%),radial-gradient(circle_at_90%_20%,rgba(6,182,212,0.06),transparent_36%)]" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-18 lg:grid-cols-2 lg:py-20">
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.22em] text-sky-300">
              What powers denial prevention
            </p>
            <h3 className="text-3xl font-semibold text-white sm:text-4xl">
              Learn from historical claims and real-time signals
            </h3>
            <p className="text-lg text-slate-200">
              Clinix AI ingests 6–12 months of 837/835/276/277/270/271 plus EMR encounters to map
              payer quirks, CARC/RARC patterns, frequency limits, and documentation needs. Every
              submission sharpens the model and keeps staff out of rework.
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {bullets.slice(0, 6).map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 rounded-lg border border-slate-800 bg-slate-900/70 p-4 text-base text-slate-200 shadow-md shadow-black/30 transition duration-300 hover:-translate-y-1 hover:border-sky-500/60"
                >
                  <span className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/api"
                className="rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-md shadow-sky-600/30 transition hover:-translate-y-1 hover:bg-sky-400"
              >
                Try the API workbench
              </Link>
              <Link
                href="/rag"
                className="rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-100 shadow-sm transition hover:-translate-y-1 hover:border-sky-500/60 hover:text-white"
              >
                Explore RAG
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/40 transition duration-300 hover:-translate-y-1 hover:border-sky-500/60">
            <h4 className="text-xl font-semibold text-white">X12 coverage</h4>
            <ul className="mt-3 space-y-2 text-base text-slate-200">
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
        className={`relative overflow-hidden border-b border-slate-900 bg-slate-950 transition duration-700 ${
          playbookReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="pointer-events-none veil-animate-slow absolute inset-0 bg-[conic-gradient(from_45deg_at_25%_25%,rgba(59,130,246,0.05),transparent_32%),conic-gradient(from_180deg_at_80%_70%,rgba(14,165,233,0.05),transparent_34%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-18 space-y-8 sm:py-20 lg:py-24">
          <div className="flex flex-col gap-3">
            <p className="text-sm uppercase tracking-[0.18em] text-sky-300">Playbooks</p>
            <h3 className="text-3xl font-semibold text-white sm:text-4xl">
              Denials, cash flow, and appeals—handled by design
            </h3>
            <p className="max-w-3xl text-slate-300 text-lg">
              Layered guidance for front-desk, coding, and revenue ops. Each playbook couples payer
              rules, ML risk, and attachment prompts so teams ship cleaner claims without extra clicks.
            </p>
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
                <h4 className="text-xl font-semibold text-white">{pb.title}</h4>
                <ul className="mt-3 space-y-2 text-base text-slate-200">
                  {pb.points.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span>Live rules + prompts</span>
                  <Link href="/analytics" className="text-sky-300 underline underline-offset-4">
                    View signals
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {["Front desk guardrails", "Coder QA boosts", "Appeal accelerators"].map((label, i) => (
              <div
                key={label}
                className={`rounded-xl border p-6 text-base shadow-md shadow-black/30 min-h-[150px] ${
                  i % 2 === 0 ? "border-sky-500/30 bg-slate-900/70" : "border-emerald-500/30 bg-slate-900/70"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">{label}</p>
                <p className="mt-2 text-slate-200">
                  Surface payer edits, modifier hints, and attachment asks at the moment of data entry.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={spotlightReveal.ref}
        className={`relative overflow-hidden border-b border-slate-900 bg-slate-950 transition duration-700 ${
          spotlightReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="pointer-events-none veil-animate absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.05),transparent_36%),radial-gradient(circle_at_80%_70%,rgba(6,182,212,0.06),transparent_32%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-18 space-y-8 sm:py-20 lg:py-24">
          <div className="flex flex-col gap-3">
            <p className="text-sm uppercase tracking-[0.18em] text-sky-300">Spotlight</p>
            <h3 className="text-3xl font-semibold text-white sm:text-4xl">
              Built to stop denials before they start
            </h3>
            <p className="max-w-3xl text-lg text-slate-200">
              Clinix AI combines Stedi rails, payer-specific rules, and ML signals from eligibility,
              status, and remits. The result: fewer reworks, cleaner cash, and faster appeals—with
              traceability from 270 through 835.
            </p>
          </div>
          <div
            ref={spotlightRef}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            {spotlight.map((item, idx) => (
              <div
                key={item.label}
                className={`rounded-2xl border p-6 shadow-xl shadow-black/40 transition duration-300 hover:-translate-y-1 min-h-[180px] ${
                  idx % 2 === 0 ? "border-sky-500/30 bg-slate-900/80" : "border-emerald-500/30 bg-slate-900/75"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-200">
                  {item.label}
                </p>
                <p className="mt-2 text-base text-slate-200">{item.copy}</p>
                <p className="mt-3 text-xs text-slate-400">
                  AI-backed guardrails, payer playbooks, and attachment prompts reduce back-and-forth.
                </p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {[
              "Audit trail: every ML prompt and payer rule is logged for compliance.",
              "Attachment readiness: capture 275 artifacts before payer asks.",
              "Revenue clarity: expected vs paid tracked with CARC/RARC clustering.",
            ].map((copy, i) => (
              <div
                key={copy}
                className={`rounded-xl border p-6 text-base shadow-md shadow-black/30 min-h-[140px] ${
                  i % 2 === 0 ? "border-sky-500/25 bg-slate-900/70" : "border-emerald-500/25 bg-slate-900/70"
                }`}
              >
                {copy}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={ctaReveal.ref}
        className={`relative overflow-hidden bg-slate-950 transition duration-700 ${
          ctaReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="pointer-events-none veil-animate-slow absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(59,130,246,0.06),transparent_38%),conic-gradient(from_180deg_at_60%_40%,rgba(6,182,212,0.04),transparent_36%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-18 sm:py-20 lg:py-24">
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-10 shadow-2xl shadow-black/50">
            <h3 className="text-3xl font-semibold text-white sm:text-4xl">
              Ready to reduce denials and automate your billing stack?
            </h3>
            <p className="mt-3 max-w-3xl text-lg text-slate-200">
              Drop in your Stedi keys, hit the workbench, and plug the engine into your EMR.
              Every 277 and 835 makes the model smarter—and your claims cleaner.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/api"
                className="rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-600/30 transition hover:-translate-y-1 hover:bg-sky-400"
              >
                Launch API workbench
              </Link>
              <Link
                href="/mocks"
                className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 hover:-translate-y-1 hover:border-sky-500/60"
              >
                View mock payloads
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes veilFloat {
          0% { transform: translate3d(0px, 0px, 0) scale(1); opacity: 0.9; }
          50% { transform: translate3d(10px, -8px, 0) scale(1.02); opacity: 0.95; }
          100% { transform: translate3d(-10px, 6px, 0) scale(1.01); opacity: 0.9; }
        }
        .veil-animate { animation: veilFloat 14s ease-in-out infinite alternate; }
        .veil-animate-slow { animation: veilFloat 20s ease-in-out infinite alternate; }
      `}</style>
    </main>
  );
}
