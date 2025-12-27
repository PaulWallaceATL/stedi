"use client";

import gsap from "gsap";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
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
    icon: "shield",
    points: [
      "Frequency/age checks from 270/271",
      "Modifier requirements by payer",
      "Same-day conflict detection (exam + treatment)",
      "Auto documentation prompts before submission",
    ],
  },
  {
    title: "Cash Flow Control",
    icon: "account_balance",
    points: [
      "Expected allowable from historical 835s",
      "Patient responsibility prediction",
      "CARC/RARC clustering for root causes",
      "Proactive secondary + attachment routing",
    ],
  },
  {
    title: "Appeal Automation",
    icon: "gavel",
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
    icon: "verified_user",
    copy: "Surfaced plan rules, copay/coinsurance, frequency limits, and prior-auth warnings from 270/271 to stop denials upstream.",
  },
  {
    label: "Clean Claim Engine",
    icon: "description",
    copy: "837P with payer-aware modifiers, POS validation, ICD ↔ CPT pointers, units/time sanity, and dual insurance routing.",
  },
  {
    label: "Live Status + Remits",
    icon: "sync",
    copy: "276/277 + 277CA for real-time acceptance; 835 parsing to learn CARC/RARC patterns and trigger fixes or appeals.",
  },
  {
    label: "Appeal Intelligence",
    icon: "psychology",
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

// Anirul Eye Component for Landing
function AnirulEye({ size = "lg" }: { size?: "md" | "lg" | "xl" }) {
  const sizes = {
    md: "w-20 h-20",
    lg: "w-28 h-28",
    xl: "w-36 h-36",
  };

  return (
    <motion.div
      className={`${sizes[size]} relative`}
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#c97435]/40 to-[#8b5a2b]/40 blur-xl" />
      
      {/* Main orb */}
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#1a1512] via-[#2a2018] to-[#0a0908] border-2 border-[#c97435]/50 shadow-2xl shadow-[#c97435]/30">
        {/* Inner ring */}
        <div className="absolute inset-3 rounded-full border border-[#c97435]/30" />
        
        {/* Eye center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c97435] to-[#8b5a2b] flex items-center justify-center shadow-lg shadow-[#c97435]/50"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="material-symbols-outlined text-[#0a0908] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              visibility
            </span>
          </motion.div>
        </div>
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#c97435]/60"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
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
      title: "Clinix AI",
      subtitle: "Claims Intelligence & Automated Billing",
      description:
        "Eligibility checks, clean claims, denial learning, and Stedi-powered submission & remittance. A self-improving billing layer that plugs into any EMR.",
    }),
    [],
  );

  return (
    <main className="min-h-screen bg-[#0a0908] text-[#e8dcc8]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#c97435]/10 min-h-[720px] sm:min-h-[760px] lg:min-h-[820px] bg-[#0a0908] pt-10">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,116,53,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(139,90,43,0.1),transparent_50%)]" />
        
        <Particles
          className="absolute inset-0 z-20 opacity-60 mix-blend-screen pointer-events-none"
          particleCount={280}
          particleColors={["#c97435", "#a67c52", "#e8dcc8", "#8b5a2b"]}
          particleSpread={12}
          particleBaseSize={100}
          sizeRandomness={0.9}
          cameraDistance={20}
          speed={0.04}
          alphaParticles
        />

        <div className="relative z-30 mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-6 pt-32 pb-28 text-center sm:pt-36 sm:pb-32 lg:pt-40 lg:pb-36">
          <div className="space-y-7" ref={heroRef}>
            {/* Anirul Eye */}
            <div className="flex justify-center mb-4">
              <AnirulEye size="lg" />
            </div>
            
            <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#c97435]/30 bg-[#c97435]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#c97435] shadow-sm shadow-[#c97435]/20 backdrop-blur">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              Eligibility • Claims • Status • Appeals
            </span>
            <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-[#e8dcc8] via-[#c97435] to-[#a67c52] bg-clip-text text-transparent">
                {heroCopy.title}
              </span>
            </h1>
            <p className="text-2xl font-semibold text-[#a67c52] sm:text-3xl">
              {heroCopy.subtitle}
            </p>
            <p className="mx-auto max-w-3xl text-lg text-[#8b7355] sm:text-xl">
              {heroCopy.description}
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link
                href="/dashboard"
                className="group rounded-xl bg-gradient-to-r from-[#c97435] to-[#8b5a2b] px-8 py-4 text-base font-semibold text-[#0a0908] shadow-lg shadow-[#c97435]/30 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#c97435]/40 flex items-center gap-2"
              >
                <span className="material-symbols-outlined">dashboard</span>
                Launch Dashboard
              </Link>
              <Link
                href="/claims/new"
                className="rounded-xl border border-[#c97435]/30 bg-[#1a1512]/80 px-8 py-4 text-base font-semibold text-[#e8dcc8] shadow-sm transition hover:-translate-y-1 hover:border-[#c97435]/60 hover:bg-[#1a1512] flex items-center gap-2"
              >
                <span className="material-symbols-outlined">add_circle</span>
                Create New Claim
              </Link>
              <Link
                href="#workflow"
                className="rounded-xl border border-[#c97435]/20 bg-transparent px-8 py-4 text-base font-semibold text-[#a67c52] transition hover:-translate-y-1 hover:border-[#c97435]/40 hover:text-[#e8dcc8] flex items-center gap-2"
              >
                <span className="material-symbols-outlined">expand_more</span>
                See the workflow
              </Link>
            </div>
            <div
              ref={statsRef}
              className="mx-auto grid max-w-4xl grid-cols-1 gap-4 text-sm sm:grid-cols-3 pt-8"
            >
              <motion.div 
                whileHover={{ scale: 1.02, y: -4 }}
                className="rounded-2xl border border-[#c97435]/20 bg-[#1a1512]/60 backdrop-blur p-6 shadow-lg shadow-black/40 transition duration-300"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#c97435]/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#c97435]">verified_user</span>
                  </div>
                  <p className="text-2xl font-bold text-[#e8dcc8]">270/271</p>
                </div>
                <p className="text-sm text-[#a67c52]">Eligibility guardrails</p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02, y: -4 }}
                className="rounded-2xl border border-[#c97435]/20 bg-[#1a1512]/60 backdrop-blur p-6 shadow-lg shadow-black/40 transition duration-300"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-emerald-400">description</span>
                  </div>
                  <p className="text-2xl font-bold text-[#e8dcc8]">837P</p>
                </div>
                <p className="text-sm text-[#a67c52]">Clean claim automation</p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02, y: -4 }}
                className="rounded-2xl border border-[#c97435]/20 bg-[#1a1512]/60 backdrop-blur p-6 shadow-lg shadow-black/40 transition duration-300"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-amber-400">payments</span>
                  </div>
                  <p className="text-2xl font-bold text-[#e8dcc8]">835</p>
                </div>
                <p className="text-sm text-[#a67c52]">Remits & appeals</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="workflow"
        ref={workflowReveal.ref}
        className={`relative overflow-hidden border-b border-[#c97435]/10 bg-[#0a0908] transition duration-700 ${
          workflowReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[conic-gradient(from_90deg_at_20%_20%,rgba(201,116,53,0.06),transparent_32%),conic-gradient(from_210deg_at_80%_60%,rgba(139,90,43,0.05),transparent_34%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-18 space-y-6 sm:py-20 lg:py-24">
          <p className="text-sm uppercase tracking-[0.24em] text-[#c97435]">
            End-to-end product workflow
          </p>
          <h2 className="text-3xl font-bold text-[#e8dcc8] sm:text-4xl">From eligibility to appeals</h2>

          <ScrollStack className="space-y-0">
            {workflow.map((item, idx) => (
              <ScrollStackItem
                key={item}
                itemClassName={`rounded-2xl border p-7 md:p-8 min-h-[230px] md:min-h-[250px] text-left shadow-lg shadow-black/40 ${
                  idx % 2 === 0
                    ? "border-[#c97435]/30 bg-[#1a1512]/80"
                    : "border-emerald-500/25 bg-[#1a1512]/70"
                }`}
              >
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c97435]">
                  Step {idx + 1}
                </p>
                <p className="mt-3 text-xl font-semibold text-[#e8dcc8]">{item}</p>
                <p className="mt-3 text-sm text-[#8b7355]">
                  Upstream validation, payer-specific rules, and ML prompts keep this step clean.
                </p>
              </ScrollStackItem>
            ))}
          </ScrollStack>
        </div>
      </section>

      <section
        ref={denialReveal.ref}
        className={`relative overflow-hidden border-b border-[#c97435]/10 bg-[#0a0908] transition duration-700 ${
          denialReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_10%,rgba(201,116,53,0.08),transparent_35%),radial-gradient(circle_at_90%_20%,rgba(139,90,43,0.06),transparent_36%)]" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-18 lg:grid-cols-2 lg:py-20">
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.22em] text-[#c97435]">
              What powers denial prevention
            </p>
            <h3 className="text-3xl font-bold text-[#e8dcc8] sm:text-4xl">
              Learn from historical claims and real-time signals
            </h3>
            <p className="text-lg text-[#a67c52]">
              Clinix AI ingests 6–12 months of 837/835/276/277/270/271 plus EMR encounters to map
              payer quirks, CARC/RARC patterns, frequency limits, and documentation needs. Every
              submission sharpens the model and keeps staff out of rework.
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {bullets.slice(0, 6).map((item) => (
                <motion.div
                  key={item}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="flex items-start gap-3 rounded-xl border border-[#c97435]/20 bg-[#1a1512]/70 p-4 text-base text-[#a67c52] shadow-md shadow-black/30 transition duration-300"
                >
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#c97435]" />
                  <span>{item}</span>
                </motion.div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/dashboard"
                className="rounded-xl bg-gradient-to-r from-[#c97435] to-[#8b5a2b] px-6 py-3 text-sm font-semibold text-[#0a0908] shadow-md shadow-[#c97435]/30 transition hover:-translate-y-1 hover:shadow-lg flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">rocket_launch</span>
                Get Started
              </Link>
              <Link
                href="/rag"
                className="rounded-xl border border-[#c97435]/30 bg-[#1a1512] px-6 py-3 text-sm font-semibold text-[#e8dcc8] shadow-sm transition hover:-translate-y-1 hover:border-[#c97435]/60 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">psychology</span>
                Explore RAG
              </Link>
            </div>
          </div>
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="rounded-2xl border border-[#c97435]/20 bg-[#1a1512]/80 p-6 shadow-2xl shadow-black/40 transition duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#c97435]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-[#c97435]">code</span>
              </div>
              <h4 className="text-xl font-bold text-[#e8dcc8]">X12 Coverage</h4>
            </div>
            <ul className="space-y-3 text-base text-[#a67c52]">
              {[
                { code: "837P/837I/837D", desc: "Clean claim generation & submission" },
                { code: "270/271", desc: "Eligibility with frequency/age limits" },
                { code: "276/277/277CA", desc: "Real-time status, rejection labeling" },
                { code: "835", desc: "Remittance parsing, CARC/RARC learning" },
                { code: "275", desc: "Attachments for appeals and secondary" },
                { code: "999/997", desc: "Syntax and envelope validation" },
                { code: "278", desc: "Pre-auth where required" },
              ].map((item) => (
                <li key={item.code} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#c97435]/5 transition-colors">
                  <span className="font-mono text-sm font-bold text-[#c97435] bg-[#c97435]/10 px-2 py-1 rounded">{item.code}</span>
                  <span>{item.desc}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      <section
        ref={playbookReveal.ref}
        className={`relative overflow-hidden border-b border-[#c97435]/10 bg-[#0a0908] transition duration-700 ${
          playbookReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[conic-gradient(from_45deg_at_25%_25%,rgba(201,116,53,0.05),transparent_32%),conic-gradient(from_180deg_at_80%_70%,rgba(139,90,43,0.05),transparent_34%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-18 space-y-8 sm:py-20 lg:py-24">
          <div className="flex flex-col gap-3">
            <p className="text-sm uppercase tracking-[0.18em] text-[#c97435]">Playbooks</p>
            <h3 className="text-3xl font-bold text-[#e8dcc8] sm:text-4xl">
              Denials, cash flow, and appeals—handled by design
            </h3>
            <p className="max-w-3xl text-[#8b7355] text-lg">
              Layered guidance for front-desk, coding, and revenue ops. Each playbook couples payer
              rules, ML risk, and attachment prompts so teams ship cleaner claims without extra clicks.
            </p>
          </div>
          <div
            ref={playbookRef}
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {playbooks.map((pb, idx) => (
              <motion.div
                key={pb.title}
                whileHover={{ scale: 1.02, y: -4 }}
                className="rounded-2xl border border-[#c97435]/20 bg-[#1a1512]/80 p-6 shadow-xl shadow-black/40 transition duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    idx === 0 ? "bg-rose-500/20" : idx === 1 ? "bg-emerald-500/20" : "bg-amber-500/20"
                  }`}>
                    <span className={`material-symbols-outlined text-2xl ${
                      idx === 0 ? "text-rose-400" : idx === 1 ? "text-emerald-400" : "text-amber-400"
                    }`}>{pb.icon}</span>
                  </div>
                  <h4 className="text-xl font-bold text-[#e8dcc8]">{pb.title}</h4>
                </div>
                <ul className="space-y-2 text-base text-[#a67c52]">
                  {pb.points.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#c97435]" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 pt-4 border-t border-[#c97435]/10 flex items-center justify-between text-xs text-[#6b5a45]">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">bolt</span>
                    Live rules + prompts
                  </span>
                  <Link href="/performance" className="text-[#c97435] hover:text-[#e8dcc8] transition-colors flex items-center gap-1">
                    View signals
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { label: "Front desk guardrails", icon: "support_agent" },
              { label: "Coder QA boosts", icon: "code" },
              { label: "Appeal accelerators", icon: "speed" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                whileHover={{ scale: 1.02 }}
                className={`rounded-xl border p-6 text-base shadow-md shadow-black/30 min-h-[150px] ${
                  i % 2 === 0 ? "border-[#c97435]/30 bg-[#1a1512]/70" : "border-emerald-500/20 bg-[#1a1512]/70"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[#c97435]">{item.icon}</span>
                  <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#a67c52]">{item.label}</p>
                </div>
                <p className="text-[#8b7355]">
                  Surface payer edits, modifier hints, and attachment asks at the moment of data entry.
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={spotlightReveal.ref}
        className={`relative overflow-hidden border-b border-[#c97435]/10 bg-[#0a0908] transition duration-700 ${
          spotlightReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(201,116,53,0.05),transparent_36%),radial-gradient(circle_at_80%_70%,rgba(139,90,43,0.06),transparent_32%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-18 space-y-8 sm:py-20 lg:py-24">
          <div className="flex flex-col gap-3">
            <p className="text-sm uppercase tracking-[0.18em] text-[#c97435]">Spotlight</p>
            <h3 className="text-3xl font-bold text-[#e8dcc8] sm:text-4xl">
              Built to stop denials before they start
            </h3>
            <p className="max-w-3xl text-lg text-[#a67c52]">
              Clinix AI combines Stedi rails, payer-specific rules, and ML signals from eligibility,
              status, and remits. The result: fewer reworks, cleaner cash, and faster appeals—with
              traceability from 270 through 835.
            </p>
          </div>
          <div
            ref={spotlightRef}
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
          >
            {spotlight.map((item, idx) => (
              <motion.div
                key={item.label}
                whileHover={{ scale: 1.02, y: -4 }}
                className={`rounded-2xl border p-6 shadow-xl shadow-black/40 transition duration-300 min-h-[220px] ${
                  idx % 2 === 0 ? "border-[#c97435]/30 bg-[#1a1512]/80" : "border-emerald-500/20 bg-[#1a1512]/75"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    idx % 2 === 0 ? "bg-[#c97435]/20" : "bg-emerald-500/20"
                  }`}>
                    <span className={`material-symbols-outlined text-xl ${
                      idx % 2 === 0 ? "text-[#c97435]" : "text-emerald-400"
                    }`}>{item.icon}</span>
                  </div>
                  <p className="text-sm font-bold uppercase tracking-wide text-[#c97435]">
                    {item.label}
                  </p>
                </div>
                <p className="text-base text-[#a67c52]">{item.copy}</p>
                <p className="mt-3 text-xs text-[#6b5a45]">
                  AI-backed guardrails, payer playbooks, and attachment prompts reduce back-and-forth.
                </p>
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { text: "Audit trail: every ML prompt and payer rule is logged for compliance.", icon: "history" },
              { text: "Attachment readiness: capture 275 artifacts before payer asks.", icon: "attach_file" },
              { text: "Revenue clarity: expected vs paid tracked with CARC/RARC clustering.", icon: "analytics" },
            ].map((item, i) => (
              <motion.div
                key={item.text}
                whileHover={{ scale: 1.02 }}
                className={`rounded-xl border p-6 text-base shadow-md shadow-black/30 min-h-[160px] ${
                  i % 2 === 0 ? "border-[#c97435]/25 bg-[#1a1512]/70" : "border-emerald-500/20 bg-[#1a1512]/70"
                }`}
              >
                <span className="material-symbols-outlined text-[#c97435] mb-2">{item.icon}</span>
                <p className="text-[#8b7355]">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={ctaReveal.ref}
        className={`relative overflow-hidden bg-[#0a0908] transition duration-700 ${
          ctaReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(201,116,53,0.06),transparent_38%),conic-gradient(from_180deg_at_60%_40%,rgba(139,90,43,0.04),transparent_36%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-18 sm:py-20 lg:py-24">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="rounded-3xl border border-[#c97435]/30 bg-gradient-to-br from-[#1a1512] via-[#0a0908] to-[#1a1512] p-10 shadow-2xl shadow-black/50"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <AnirulEye size="xl" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-3xl font-bold text-[#e8dcc8] sm:text-4xl">
                  Ready to reduce denials and automate your billing stack?
                </h3>
                <p className="mt-3 max-w-3xl text-lg text-[#a67c52]">
                  Drop in your Stedi keys, hit the workbench, and plug the engine into your EMR.
                  Every 277 and 835 makes the model smarter—and your claims cleaner.
                </p>
                <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4">
                  <Link
                    href="/dashboard"
                    className="rounded-xl bg-gradient-to-r from-[#c97435] to-[#8b5a2b] px-8 py-4 text-base font-semibold text-[#0a0908] shadow-lg shadow-[#c97435]/30 transition hover:-translate-y-1 hover:shadow-xl flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">rocket_launch</span>
                    Launch Dashboard
                  </Link>
                  <Link
                    href="/claims/new"
                    className="rounded-xl border border-[#c97435]/30 bg-[#1a1512] px-8 py-4 text-base font-semibold text-[#e8dcc8] hover:-translate-y-1 hover:border-[#c97435]/60 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">add_circle</span>
                    Create Your First Claim
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#c97435]/10 bg-[#0a0908] py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c97435] to-[#8b5a2b] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#0a0908] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                visibility
              </span>
            </div>
            <span className="text-lg font-bold text-[#e8dcc8]">Clinix AI</span>
          </div>
          <p className="text-sm text-[#6b5a45]">
            © 2025 Clinix AI. Medical-grade claims intelligence.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-[#a67c52] hover:text-[#e8dcc8] transition-colors">
              Sign In
            </Link>
            <Link href="/dashboard" className="text-sm text-[#a67c52] hover:text-[#e8dcc8] transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>

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
