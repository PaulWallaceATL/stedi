"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { ModernNav } from "@/components/ui/ModernNav";

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
      <label className="text-sm font-medium text-[#a67c52]">{label}</label>
      <input
        type={type}
        defaultValue={value}
        className="w-full h-12 rounded-xl border border-[#c97435]/20 bg-[#0a0908]/50 px-4 text-[#e8dcc8] placeholder-[#6b5a45] outline-none focus:border-[#c97435] focus:ring-2 focus:ring-[#c97435]/20 transition-all"
      />
      {description && <p className="text-xs text-[#6b5a45]">{description}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("practice");

  return (
    <AuroraBackground>
      <ModernNav />

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#e8dcc8]">Practice Settings</h2>
            <p className="text-[#8b7355] mt-1">Configure your practice to auto-populate claims and streamline workflows</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c97435] to-[#8b5a2b] text-[#0a0908] font-semibold shadow-lg shadow-[#c97435]/20"
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
                      ? "bg-[#c97435]/10 border border-[#c97435]/30 text-[#c97435]"
                      : "bg-[#1a1512]/30 border border-[#c97435]/10 text-[#e8dcc8] hover:text-[#e8dcc8] hover:bg-[#1a1512]/50"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  <div>
                    <p className={`text-sm ${activeSection === item.id ? "font-semibold" : "font-medium"}`}>{item.label}</p>
                    <p className="text-xs text-[#6b5a45] hidden lg:block">{item.description}</p>
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
                className="rounded-2xl bg-[#1a1512]/50 border border-[#c97435]/10 overflow-hidden"
              >
                <div className="p-6 border-b border-[#c97435]/10">
                  <h3 className="text-lg font-semibold text-[#e8dcc8]">Practice Profile</h3>
                  <p className="text-sm text-[#8b7355]">Primary practice identity on claims and communications</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SettingsInput label="Practice Legal Name" value="Demo Medical Group" />
                    <SettingsInput label="DBA Name (optional)" value="Demo Clinic" />
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#a67c52]">Organization Type</label>
                      <select 
                        defaultValue="Group Practice"
                        className="w-full h-12 rounded-xl border border-[#c97435]/20 bg-[#0a0908]/50 px-4 text-[#e8dcc8] outline-none focus:border-[#c97435]"
                      >
                        <option value="Solo Practice">Solo Practice</option>
                        <option value="Group Practice">Group Practice</option>
                        <option value="Hospital">Hospital</option>
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
                className="rounded-2xl bg-[#1a1512]/50 border border-[#c97435]/10 overflow-hidden"
              >
                <div className="p-6 border-b border-[#c97435]/10">
                  <h3 className="text-lg font-semibold text-[#e8dcc8]">Billing & Tax Information</h3>
                  <p className="text-sm text-[#8b7355]">Tax IDs, NPIs, and billing credentials</p>
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
                        <p className="text-sm text-amber-400 font-medium">Important</p>
                        <p className="text-xs text-amber-300/70 mt-1">These identifiers are used for all claim submissions. Ensure they are accurate to avoid rejections.</p>
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
                className="rounded-2xl bg-[#1a1512]/50 border border-[#c97435]/10 overflow-hidden"
              >
                <div className="p-6 border-b border-[#c97435]/10 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#e8dcc8]">Service Locations</h3>
                    <p className="text-sm text-[#8b7355]">Manage where services are rendered</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c97435]/10 border border-[#c97435]/30 text-[#c97435] font-medium text-sm">
                    <span className="material-symbols-outlined text-lg">add</span>
                    Add Location
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { name: "Main Office", address: "123 Main St, Nashville, TN 37201", pos: "11", default: true },
                    { name: "Downtown Clinic", address: "456 Broadway, Nashville, TN 37203", pos: "11", default: false },
                  ].map((loc, idx) => (
                    <div key={idx} className="rounded-xl bg-[#0a0908]/30 border border-[#c97435]/10 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#c97435]/10 flex items-center justify-center text-[#c97435]">
                            <span className="material-symbols-outlined">location_on</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-[#e8dcc8] font-semibold">{loc.name}</p>
                              {loc.default && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">Default</span>
                              )}
                            </div>
                            <p className="text-sm text-[#8b7355]">{loc.address}</p>
                            <p className="text-xs text-[#6b5a45] mt-1">POS Code: {loc.pos}</p>
                          </div>
                        </div>
                        <button className="p-2 rounded-lg hover:bg-[#c97435]/10 text-[#8b7355] hover:text-[#e8dcc8] transition-colors">
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
                className="rounded-2xl bg-[#1a1512]/50 border border-[#c97435]/10 overflow-hidden"
              >
                <div className="p-6 border-b border-[#c97435]/10 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#e8dcc8]">Providers</h3>
                    <p className="text-sm text-[#8b7355]">Rendering and referring provider profiles</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c97435]/10 border border-[#c97435]/30 text-[#c97435] font-medium text-sm">
                    <span className="material-symbols-outlined text-lg">add</span>
                    Add Provider
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { name: "Dr. Sarah Johnson", npi: "1234567890", specialty: "Family Medicine", default: true },
                    { name: "Dr. Michael Chen", npi: "0987654321", specialty: "Internal Medicine", default: false },
                  ].map((provider, idx) => (
                    <div key={idx} className="rounded-xl bg-[#0a0908]/30 border border-[#c97435]/10 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c97435]/20 to-[#8b5a2b]/20 flex items-center justify-center text-[#c97435] font-semibold">
                            {provider.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-[#e8dcc8] font-semibold">{provider.name}</p>
                              {provider.default && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">Default</span>
                              )}
                            </div>
                            <p className="text-sm text-[#8b7355]">{provider.specialty}</p>
                            <p className="text-xs text-[#6b5a45] mt-1 font-mono">NPI: {provider.npi}</p>
                          </div>
                        </div>
                        <button className="p-2 rounded-lg hover:bg-[#c97435]/10 text-[#8b7355] hover:text-[#e8dcc8] transition-colors">
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
                <div className="rounded-2xl bg-[#1a1512]/50 border border-[#c97435]/10 overflow-hidden">
                  <div className="p-6 border-b border-[#c97435]/10">
                    <h3 className="text-lg font-semibold text-[#e8dcc8]">Stedi Integration</h3>
                    <p className="text-sm text-[#8b7355]">Healthcare clearinghouse connection</p>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <span className="material-symbols-outlined text-2xl">check_circle</span>
                      </div>
                      <div>
                        <p className="text-[#e8dcc8] font-semibold">Connected</p>
                        <p className="text-sm text-[#8b7355]">Stedi API is active and operational</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <SettingsInput label="API Key" value="••••••••••••••••" type="password" description="Contact support to rotate API keys" />
                      <SettingsInput label="Proxy URL" value="https://stedi-proxy-*.run.app" description="Cloud Run proxy endpoint" />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#1a1512]/50 border border-[#c97435]/10 overflow-hidden">
                  <div className="p-6 border-b border-[#c97435]/10">
                    <h3 className="text-lg font-semibold text-[#e8dcc8]">AI Services</h3>
                    <p className="text-sm text-[#8b7355]">AI-powered claim optimization</p>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c97435]/20 to-[#8b5a2b]/20 flex items-center justify-center text-[#c97435]">
                        <span className="material-symbols-outlined text-2xl">psychology</span>
                      </div>
                      <div>
                        <p className="text-[#e8dcc8] font-semibold">AI Claim Intelligence</p>
                        <p className="text-sm text-[#8b7355]">RAG-powered optimization engine</p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-[#c97435]/5 border border-[#c97435]/20 p-4">
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-[#c97435]">auto_awesome</span>
                        <div>
                          <p className="text-sm text-[#c97435] font-medium">AI Features Active</p>
                          <p className="text-xs text-[#8b7355] mt-1">Claim scrubbing, denial prediction, and optimization suggestions are enabled.</p>
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
    </AuroraBackground>
  );
}
