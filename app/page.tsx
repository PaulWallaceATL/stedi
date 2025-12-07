"use client";

import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import gsap from "gsap";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type MeshRef = THREE.Mesh | null;

class HelixCurve extends THREE.Curve<THREE.Vector3> {
  scale: number;
  constructor(scale = 1) {
    super();
    this.scale = scale;
  }
  getPoint(t: number, optionalTarget = new THREE.Vector3()) {
    const turns = 3.5;
    const angle = 2 * Math.PI * turns * t;
    const radius = 1;
    const x = Math.cos(angle) * radius * this.scale;
    const y = (t - 0.5) * 5 * this.scale;
    const z = Math.sin(angle) * radius * this.scale;
    return optionalTarget.set(x, y, z);
  }
}

function HeroHelix() {
  const ref = useRef<MeshRef>(null);
  const geometry = useMemo(
    () => new THREE.TubeGeometry(new HelixCurve(1), 320, 0.12, 24, false),
    [],
  );
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0f7bdc",
        emissive: "#0b6bb8",
        emissiveIntensity: 0.6,
        roughness: 0.18,
        metalness: 0.55,
      }),
    [],
  );

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.3;
      ref.current.rotation.x += delta * 0.15;
    }
  });

  return <mesh ref={ref} geometry={geometry} material={material} />;
}

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

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const playbookRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.from(heroRef.current, { y: 40, opacity: 0, duration: 0.8 })
      .from(statsRef.current?.children || [], {
        y: 20,
        opacity: 0,
        stagger: 0.08,
        duration: 0.4,
      })
      .from(playbookRef.current?.children || [], {
        y: 18,
        opacity: 0,
        stagger: 0.08,
        duration: 0.4,
      }, "-=0.2")
      .from(spotlightRef.current?.children || [], {
        y: 14,
        opacity: 0,
        stagger: 0.06,
        duration: 0.35,
      }, "-=0.2");
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
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-white via-sky-50 to-cyan-50">
        <div className="pointer-events-none absolute inset-0 opacity-80 [background:radial-gradient(circle_at_18%_18%,rgba(14,182,163,0.18),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(15,123,220,0.18),transparent_32%)]" />
        <div className="absolute -left-32 top-24 h-64 w-64 rounded-full bg-white/70 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-52 w-52 rounded-full bg-cyan-100/70 blur-3xl" />
        <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
          <div className="space-y-7" ref={heroRef}>
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700 shadow-sm">
              Eligibility • Claims • Status • Appeals
            </span>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {heroCopy.title}
            </h1>
            <p className="max-w-2xl text-lg text-slate-600">{heroCopy.subtitle}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/api"
                className="rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/25 transition hover:-translate-y-0.5 hover:bg-sky-500"
              >
                Launch API Workbench
              </Link>
              <Link
                href="#workflow"
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-700"
              >
                See the workflow
              </Link>
            </div>
            <div
              ref={statsRef}
              className="grid grid-cols-2 gap-4 text-sm text-slate-700 sm:grid-cols-3"
            >
              <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <p className="text-2xl font-semibold text-slate-900">270/271</p>
                <p className="text-xs uppercase tracking-wide text-sky-700">
                  Eligibility guardrails
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <p className="text-2xl font-semibold text-slate-900">837P</p>
                <p className="text-xs uppercase tracking-wide text-sky-700">
                  Clean claim automation
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <p className="text-2xl font-semibold text-slate-900">835</p>
                <p className="text-xs uppercase tracking-wide text-sky-700">
                  Remits & appeals
                </p>
              </div>
            </div>
          </div>
          <div className="relative h-[420px] rounded-3xl border border-slate-200 bg-white shadow-xl shadow-sky-500/10">
            <Canvas camera={{ position: [0, 0, 4] }}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[4, 4, 4]} intensity={1} />
              <HeroHelix />
              <Environment preset="city" />
              <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>
            <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/60" />
            <div className="pointer-events-none absolute inset-x-10 bottom-6 h-20 rounded-full bg-sky-100 blur-3xl" />
          </div>
        </div>
      </section>

      <section id="workflow" className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 space-y-6">
          <p className="text-sm uppercase tracking-[0.22em] text-sky-700">
            End-to-end product workflow
          </p>
          <h2 className="text-3xl font-semibold text-slate-900">From eligibility to appeals</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {workflow.map((item, idx) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-sky-500/10"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                  Step {idx + 1}
                </p>
                <p className="mt-2 text-sm text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-16 lg:grid-cols-2">
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.22em] text-sky-700">
              What powers denial prevention
            </p>
            <h3 className="text-2xl font-semibold text-slate-900">
              Learn from historical claims and real-time signals
            </h3>
            <p className="text-slate-600">
              Clinix AI ingests 6–12 months of 837/835/276/277/270/271 plus EMR encounters to map
              payer quirks, CARC/RARC patterns, frequency limits, and documentation needs. Every
              submission sharpens the model and keeps staff out of rework.
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {bullets.slice(0, 6).map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm"
                >
                  <span className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/api"
                className="rounded-full bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-sky-600/25 transition hover:-translate-y-0.5 hover:bg-sky-500"
              >
                Try the API workbench
              </Link>
              <Link
                href="/rag"
                className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-700"
              >
                Explore RAG
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-sky-500/10">
            <h4 className="text-lg font-semibold text-slate-900">X12 coverage</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
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

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 space-y-8">
          <div className="flex flex-col gap-2">
            <p className="text-sm uppercase tracking-[0.18em] text-sky-700">Playbooks</p>
            <h3 className="text-2xl font-semibold text-slate-900">
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
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md shadow-sky-500/10"
              >
                <h4 className="text-lg font-semibold text-slate-900">{pb.title}</h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {pb.points.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-16 space-y-8">
          <div className="flex flex-col gap-2">
            <p className="text-sm uppercase tracking-[0.18em] text-sky-700">Spotlight</p>
            <h3 className="text-2xl font-semibold text-slate-900">
              Built to stop denials before they start
            </h3>
            <p className="max-w-3xl text-slate-600">
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
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md shadow-sky-500/10"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                  {item.label}
                </p>
                <p className="mt-2 text-sm text-slate-700">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-sky-600 via-sky-600 to-teal-500">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-sky-900/30 backdrop-blur">
            <h3 className="text-2xl font-semibold text-white">
              Ready to reduce denials and automate your billing stack?
            </h3>
            <p className="mt-3 max-w-3xl text-white/80">
              Drop in your Stedi keys, hit the workbench, and plug the engine into your EMR.
              Every 277 and 835 makes the model smarter—and your claims cleaner.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/api"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-sky-700 shadow-lg shadow-white/20 transition hover:-translate-y-0.5 hover:bg-sky-50"
              >
                Launch API workbench
              </Link>
              <Link
                href="/mocks"
                className="rounded-full border border-white/50 px-5 py-3 text-sm font-semibold text-white hover:-translate-y-0.5 hover:border-white"
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
