"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// Animated background
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0a0f]" />
      <motion.div
        className="absolute top-0 right-0 w-1/2 h-1/2 rounded-full bg-gradient-to-l from-violet-600/10 via-purple-600/10 to-indigo-600/10 blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-1/2 h-1/2 rounded-full bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 blur-3xl"
        animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

type Section = "practice" | "billing" | "locations" | "providers" | "integrations";

const menuItems: { id: Section; label: string; icon: string; description: string }[] = [
  { id: "practice", label: "Practice Profile", icon: "business", description: "Organization details and branding" },
  { id: "billing", label: "Billing & Tax Info", icon: "receipt_long", description: "NPI, Tax ID, and payment settings" },
  { id: "locations", label: "Locations & POS", icon: "location_on", description: "Service locations and place of service" },
  { id: "providers", label: "Providers", icon: "group", description: "Rendering providers and defaults" },
  { id: "integrations", label: "Integrations", icon: "hub", description: "API keys and third-party connections" },
];

function SettingsInput({ label, value, description, type = "text" }: { label: string; value: string; description?: string; type?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <input
        type={type}
        defaultValue={value}
        className="w-full h-12 rounded-xl border border-slate-700 bg-slate-800/50 px-4 text-white placeholder-slate-500 outline-none focus:border-[#137fec] focus:ring-2 focus:ring-[#137fec]/20 transition-all"
      />
      {description && <p className="text-xs text-slate-400">{description}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("practice");

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#137fec] to-indigo-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 48 48">
                  <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" fill="currentColor" />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-white">Clinix AI</h1>
                <p className="text-xs text-slate-400">Settings</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              {[
                { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
                { href: "/claims/new", label: "New Claim", icon: "add_circle" },
                { href: "/upload", label: "Upload", icon: "upload_file" },
                { href: "/denials", label: "Denials", icon: "error" },
                { href: "/performance", label: "Reports", icon: "analytics" },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800/50 transition-colors">
                  <span className="material-symbols-outlined text-lg" style={{ color: '#ffffff' }}>{item.icon}</span>
                  <span style={{ color: '#ffffff' }}>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-xl hover:bg-slate-800 text-white hover:text-white transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                C
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Practice Settings</h2>
            <p className="text-slate-400 mt-1">Configure your practice to auto-populate claims and streamline workflows</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#137fec] to-indigo-600 text-white font-semibold shadow-lg shadow-[#137fec]/20"
          >
            <span className="material-symbols-outlined text-lg">save</span>
            Save Changes
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-2">
              {menuItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  whileHover={{ x: 4 }}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeSection === item.id
                      ? "bg-[#137fec]/10 border border-[#137fec]/30 text-[#137fec]"
                      : "bg-slate-800/30 border border-slate-700/50 text-white hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  <div>
                    <p className={`text-sm ${activeSection === item.id ? "font-semibold" : "font-medium"}`}>{item.label}</p>
                    <p className="text-xs text-slate-400 hidden lg:block">{item.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {activeSection === "practice" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-800">
                  <h3 className="text-lg font-semibold text-white">Practice Profile</h3>
                  <p className="text-sm text-slate-300">Primary practice identity on claims and communications</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SettingsInput label="Practice Legal Name" value="Demo Medical Group" />
                    <SettingsInput label="DBA Name (optional)" value="Demo Clinic" />
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Organization Type</label>
                      <select className="w-full h-12 rounded-xl border border-slate-700 bg-slate-800/50 px-4 text-white outline-none focus:border-[#137fec]">
                        <option>Solo Practice</option>
                        <option selected>Group Practice</option>
                        <option>Hospital</option>
                      </select>
                    </div>
                    <SettingsInput label="Main Phone" value="(555) 123-4567" type="tel" />
                    <SettingsInput label="Main Email" value="billing@democlinic.com" type="email" />
                    <SettingsInput label="Website (optional)" value="https://democlinic.com" type="url" />
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === "billing" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-800">
                  <h3 className="text-lg font-semibold text-white">Billing & Tax Information</h3>
                  <p className="text-sm text-slate-300">Tax IDs, NPIs, and billing credentials</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SettingsInput label="Tax ID (EIN / SSN)" value="12-3456789" description="Used for claim adjudication and 1099 reporting" />
                    <SettingsInput label="Organizational NPI (Type 2)" value="1999999984" />
                    <SettingsInput label="Default Taxonomy Code" value="207Q00000X - Family Medicine" />
                    <SettingsInput label="CLIA Number (optional)" value="" description="Required for lab billing" />
                  </div>
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-amber-400">info</span>
                      <div>
                        <p className="text-sm text-amber-300 font-medium">Important</p>
                        <p className="text-xs text-amber-200/70 mt-1">These identifiers are used for all claim submissions. Ensure they are accurate to avoid rejections.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === "locations" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Service Locations</h3>
                    <p className="text-sm text-slate-300">Manage where services are rendered</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#137fec]/10 border border-[#137fec]/30 text-[#137fec] font-medium text-sm">
                    <span className="material-symbols-outlined text-lg">add</span>
                    Add Location
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { name: "Main Office", address: "123 Main St, Nashville, TN 37201", pos: "11", default: true },
                    { name: "Downtown Clinic", address: "456 Broadway, Nashville, TN 37203", pos: "11", default: false },
                  ].map((loc, idx) => (
                    <div key={idx} className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#137fec]/10 flex items-center justify-center text-[#137fec]">
                            <span className="material-symbols-outlined">location_on</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-white font-semibold">{loc.name}</p>
                              {loc.default && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">Default</span>
                              )}
                            </div>
                            <p className="text-sm text-slate-300">{loc.address}</p>
                            <p className="text-xs text-slate-400 mt-1">POS Code: {loc.pos}</p>
                          </div>
                        </div>
                        <button className="p-2 rounded-lg hover:bg-slate-700 text-white hover:text-white transition-colors">
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeSection === "providers" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Providers</h3>
                    <p className="text-sm text-slate-300">Rendering and referring provider profiles</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#137fec]/10 border border-[#137fec]/30 text-[#137fec] font-medium text-sm">
                    <span className="material-symbols-outlined text-lg">add</span>
                    Add Provider
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { name: "Dr. Sarah Johnson", npi: "1234567890", specialty: "Family Medicine", default: true },
                    { name: "Dr. Michael Chen", npi: "0987654321", specialty: "Internal Medicine", default: false },
                  ].map((provider, idx) => (
                    <div key={idx} className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center text-violet-400 font-semibold">
                            {provider.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-white font-semibold">{provider.name}</p>
                              {provider.default && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">Default</span>
                              )}
                            </div>
                            <p className="text-sm text-slate-300">{provider.specialty}</p>
                            <p className="text-xs text-slate-400 mt-1 font-mono">NPI: {provider.npi}</p>
                          </div>
                        </div>
                        <button className="p-2 rounded-lg hover:bg-slate-700 text-white hover:text-white transition-colors">
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeSection === "integrations" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden">
                  <div className="p-6 border-b border-slate-800">
                    <h3 className="text-lg font-semibold text-white">Stedi Integration</h3>
                    <p className="text-sm text-slate-300">Healthcare clearinghouse connection</p>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <span className="material-symbols-outlined text-2xl">check_circle</span>
                      </div>
                      <div>
                        <p className="text-white font-semibold">Connected</p>
                        <p className="text-sm text-slate-300">Stedi API is active and operational</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <SettingsInput label="API Key" value="••••••••••••••••" type="password" description="Contact support to rotate API keys" />
                      <SettingsInput label="Proxy URL" value="https://stedi-proxy-*.run.app" description="Cloud Run proxy endpoint" />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden">
                  <div className="p-6 border-b border-slate-800">
                    <h3 className="text-lg font-semibold text-white">AI Services</h3>
                    <p className="text-sm text-slate-300">AI-powered claim optimization</p>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center text-violet-400">
                        <span className="material-symbols-outlined text-2xl">psychology</span>
                      </div>
                      <div>
                        <p className="text-white font-semibold">AI Claim Intelligence</p>
                        <p className="text-sm text-slate-300">RAG-powered optimization engine</p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-[#137fec]/5 border border-[#137fec]/20 p-4">
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-[#137fec]">auto_awesome</span>
                        <div>
                          <p className="text-sm text-[#137fec] font-medium">AI Features Active</p>
                          <p className="text-xs text-slate-400 mt-1">Claim scrubbing, denial prediction, and optimization suggestions are enabled.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
