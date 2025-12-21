"use client";

import { useState } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("practice-profile");

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#f6f7f8]">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 px-6 sm:px-10 py-3 bg-white">
        <div className="flex items-center gap-4 text-gray-900">
          <svg className="w-6 h-6 text-[#137fec]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" fill="currentColor"></path>
          </svg>
          <h2 className="text-gray-900 text-lg font-bold leading-tight tracking-[-0.015em]">Clinix AI Billing</h2>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link className="text-sm font-medium text-slate-500 hover:text-slate-800" href="/dashboard">Dashboard</Link>
          <Link className="text-sm font-medium text-slate-500 hover:text-slate-800" href="/upload">Upload</Link>
          <Link className="text-sm font-medium text-slate-500 hover:text-slate-800" href="/denials">Denials</Link>
          <Link className="text-sm font-medium text-slate-500 hover:text-slate-800" href="/performance">Reports</Link>
          <Link className="text-sm font-medium text-[#137fec] font-semibold" href="/settings">Settings</Link>
        </nav>
        <div className="flex items-center gap-4">
          <button className="flex cursor-pointer items-center justify-center rounded-lg h-10 w-10 bg-gray-100 text-gray-800">
            <span className="material-symbols-outlined text-xl">notifications</span>
          </button>
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAy8k5E8Bn77IkBWUbc5CYDAlJLGiyGbKc1Cs93iNvWVxRbeI2XLIUg9V1j2NJC0FjoF0u80-NzpZT8wkyFQfGiD-A0JcnF63I4SHwpS6KVbKZ0aUJnbgDOO358KfIxyaHVTDgQSdWB6p1lUe1gNytj4Qb0Wur6i3TEeolibpRyE9oex71UTQpBBa8C1QBJuwZKmlf0LhpKLO78Ll9laRSZTaHHr04Xc4HwA6qYTb5_1-AFHZCcY22Grx6snM0zWQFc5IEC3Xx-TcQ")'}}></div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white p-4">
          <div className="flex h-full flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex gap-3 items-center">
                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBqYiOucAxvSzyaKApSZK90BMVhlsy9SbXv_v9OECakVH1nccf-dywhpmG-_R3bdKErZDAm4roH2KmggT4stOb8_AbMplXFPmclulWnGyRjQJiwAuF1YVXfmah-SqgL1vggtZS4inyXdiszfPPS7qN0PAmsDxv7hoxWG-JpWXJ4rDtnqiKYc32oAdEPBXIfwU46lTwfOO8eZxSaVmkzfhKP89wWUgAafCprEDTQkNPbkiyWlyy-PmuiNjHs6Vr0ZuJCSaihc8uZAB4")'}}></div>
                <div className="flex flex-col">
                  <h1 className="text-gray-900 text-base font-medium leading-normal">Clinix AI</h1>
                  <p className="text-gray-500 text-sm font-normal leading-normal">Admin Hub</p>
                </div>
              </div>
              <nav className="flex flex-col gap-1 mt-4">
                <button 
                  onClick={() => setActiveSection("practice-profile")}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg ${activeSection === "practice-profile" ? "bg-[#137fec]/10 text-[#137fec]" : "text-gray-700 hover:bg-gray-100"}`}
                >
                  <span className="material-symbols-outlined text-xl">account_circle</span>
                  <p className="text-sm font-semibold leading-normal">Practice Profile</p>
                </button>
                <button 
                  onClick={() => setActiveSection("billing-tax")}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg ${activeSection === "billing-tax" ? "bg-[#137fec]/10 text-[#137fec]" : "text-gray-700 hover:bg-gray-100"}`}
                >
                  <span className="material-symbols-outlined text-xl">credit_card</span>
                  <p className="text-sm font-medium leading-normal">Billing & Tax Info</p>
                </button>
                <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
                  <span className="material-symbols-outlined text-xl">business</span>
                  <p className="text-sm font-medium leading-normal">Locations & POS</p>
                </Link>
                <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
                  <span className="material-symbols-outlined text-xl">group</span>
                  <p className="text-sm font-medium leading-normal">Providers & Defaults</p>
                </Link>
              </nav>
            </div>
            <div className="flex flex-col gap-1">
              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
                <span className="material-symbols-outlined text-xl">help</span>
                <p className="text-sm font-medium leading-normal">Help</p>
              </Link>
              <Link href="/login" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
                <span className="material-symbols-outlined text-xl">logout</span>
                <p className="text-sm font-medium leading-normal">Logout</p>
              </Link>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6 lg:p-10 grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 flex flex-col gap-6">
            <header>
              <h1 className="text-gray-900 text-4xl font-black leading-tight tracking-[-0.033em]">Practice Settings</h1>
              <p className="text-gray-500 text-base font-normal leading-normal mt-2">
                Configure practice-level information to auto-populate claims and streamline your billing workflow.
              </p>
              <p className="text-gray-500 text-sm font-normal leading-normal pt-3">
                Last updated: {new Date().toLocaleDateString()} by Admin User
              </p>
            </header>

            <div className="flex flex-col gap-4">
              {activeSection === "practice-profile" && (
                <details className="flex flex-col rounded-xl border border-gray-200 bg-white group" open>
                  <summary className="flex cursor-pointer items-center justify-between gap-6 p-4">
                    <p className="text-gray-900 text-lg font-semibold leading-normal">Practice Profile</p>
                    <span className="material-symbols-outlined text-gray-600 group-open:rotate-180 transition-transform">expand_more</span>
                  </summary>
                  <div className="p-4 pt-0 border-t border-gray-200">
                    <p className="text-gray-500 text-sm font-normal leading-normal pb-4">
                      Used as the primary practice identity on claims and communications.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Practice Legal Name</label>
                        <input className="mt-1 block w-full rounded border-gray-300 bg-white text-gray-900 shadow-sm focus:border-[#137fec] focus:ring-[#137fec]" type="text" defaultValue="Demo Medical Group" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">DBA Name (optional)</label>
                        <input className="mt-1 block w-full rounded border-gray-300 bg-white text-gray-900 shadow-sm focus:border-[#137fec] focus:ring-[#137fec]" type="text" defaultValue="Demo Clinic" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Organization Type</label>
                        <select className="mt-1 block w-full rounded border-gray-300 bg-white text-gray-900 shadow-sm focus:border-[#137fec] focus:ring-[#137fec]">
                          <option>Solo Practice</option>
                          <option selected>Group Practice</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Main Phone</label>
                        <input className="mt-1 block w-full rounded border-gray-300 bg-white text-gray-900 shadow-sm focus:border-[#137fec] focus:ring-[#137fec]" type="tel" defaultValue="(555) 123-4567" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Main Email</label>
                        <input className="mt-1 block w-full rounded border-gray-300 bg-white text-gray-900 shadow-sm focus:border-[#137fec] focus:ring-[#137fec]" type="email" defaultValue="billing@democlinic.com" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Website (optional)</label>
                        <input className="mt-1 block w-full rounded border-gray-300 bg-white text-gray-900 shadow-sm focus:border-[#137fec] focus:ring-[#137fec]" type="url" defaultValue="https://democlinic.com" />
                      </div>
                    </div>
                  </div>
                </details>
              )}

              {activeSection === "billing-tax" && (
                <details className="flex flex-col rounded-xl border border-gray-200 bg-white group" open>
                  <summary className="flex cursor-pointer items-center justify-between gap-6 p-4">
                    <p className="text-gray-900 text-lg font-semibold leading-normal">Billing Entity & Tax Information</p>
                    <span className="material-symbols-outlined text-gray-600 group-open:rotate-180 transition-transform">expand_more</span>
                  </summary>
                  <div className="p-4 pt-0 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Tax ID (EIN / SSN)</label>
                        <input className="mt-1 block w-full rounded border-gray-300 bg-white text-gray-900 shadow-sm focus:border-[#137fec] focus:ring-[#137fec]" type="text" defaultValue="12-3456789" />
                        <p className="mt-1 text-xs text-gray-500">Used for claim adjudication and 1099 reporting.</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Organizational NPI (Type 2)</label>
                        <input className="mt-1 block w-full rounded border-gray-300 bg-white text-gray-900 shadow-sm focus:border-[#137fec] focus:ring-[#137fec]" type="text" defaultValue="1999999984" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Default Taxonomy Code</label>
                        <input className="mt-1 block w-full rounded border-gray-300 bg-white text-gray-900 shadow-sm focus:border-[#137fec] focus:ring-[#137fec]" type="text" defaultValue="207Q00000X - Family Medicine" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">CLIA Number (optional, for labs)</label>
                        <input className="mt-1 block w-full rounded border-gray-300 bg-white text-gray-900 shadow-sm focus:border-[#137fec] focus:ring-[#137fec]" type="text" />
                      </div>
                    </div>
                  </div>
                </details>
              )}
            </div>
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-10 bg-blue-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#137fec] text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>lightbulb</span>
                <h3 className="text-lg font-semibold text-blue-700">Quick Tip</h3>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Practice-level settings are applied automatically whenever you create a new claim, upload claims via CSV/JSON, or integrate an EHR. You can override most values at the individual claim level.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="text-gray-500">•</span>
                  The Default Taxonomy Code populates Box 24j.
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-500">•</span>
                  The Pay-To Address populates Box 33.
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-500">•</span>
                  Assignment of Benefits populates Box 13.
                </li>
              </ul>
            </div>
          </aside>
        </main>
      </div>

      <footer className="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex justify-end items-center gap-3">
          <Link href="/dashboard" className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50">
            Discard Changes
          </Link>
          <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#137fec] hover:bg-[#0f6acc]">
            Save Settings
          </button>
        </div>
      </footer>
    </div>
  );
}

