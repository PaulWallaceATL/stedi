import React, { useState } from 'react';

type Tab = 'profile' | 'billing' | 'locations' | 'providers' | 'payers' | 'rules';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const navItems: { id: Tab; label: string; icon: string }[] = [
    { id: 'profile', label: 'Practice Profile', icon: 'account_circle' },
    { id: 'billing', label: 'Billing & Tax Info', icon: 'credit_card' },
    { id: 'locations', label: 'Locations & POS', icon: 'store' },
    { id: 'providers', label: 'Providers & Directory', icon: 'group' },
    { id: 'payers', label: 'Payer IDs & Enrollment', icon: 'folder_managed' },
    { id: 'rules', label: 'Claim Rules & Defaults', icon: 'rule' },
  ];

  return (
    <div className="flex flex-1 h-[calc(100vh-65px)] overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Settings Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 overflow-y-auto hidden lg:flex flex-col h-full">
        <div className="flex flex-col gap-6">
          <div className="flex gap-3 items-center px-2">
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 shrink-0 border border-slate-200 dark:border-slate-600" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBqYiOucAxvSzyaKApSZK90BMVhlsy9SbXv_v9OECakVH1nccf-dywhpmG-_R3bdKErZDAm4roH2KmggT4stOb8_AbMplXFPmclulWnGyRjQJiwAuF1YVXfmah-SqgL1vggtZS4inyXdiszfPPS7qN0PAmsDxv7hoxWG-JpWXJ4rDtnqiKYc32oAdEPBXIfwU46lTwfOO8eZxSaVmkzfhKP89wWUgAafCprEDTQkNPbkiyWlyy-PmuiNjHs6Vr0ZuJCSaihc8uZAB4")'}}></div>
            <div className="flex flex-col overflow-hidden">
              <h1 className="text-slate-900 dark:text-white text-base font-bold leading-tight truncate">Clinix AI</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Admin Hub</p>
            </div>
          </div>
          
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span className={`material-symbols-outlined text-xl ${activeTab === item.id ? 'fill-1' : ''}`}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto flex flex-col gap-1 pt-6 border-t border-slate-200 dark:border-slate-700">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-medium transition-colors">
            <span className="material-symbols-outlined text-xl">help</span>
            Help & Support
          </button>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-medium transition-colors">
            <span className="material-symbols-outlined text-xl">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto scroll-smooth">
        <div className="p-6 lg:p-10 max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 flex flex-col gap-6">
            <header>
              <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">Practice Settings</h1>
              <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-relaxed mt-2">
                Configure practice-level information to auto-populate claims and streamline your billing workflow.
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-medium mt-4">Last updated: Oct 26, 2023 by Admin User</p>
            </header>

            <div className="flex flex-col gap-4">
              
              {/* Practice Profile Tab */}
              {activeTab === 'profile' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <details className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 group" open>
                    <summary className="flex cursor-pointer items-center justify-between gap-6 p-5 select-none">
                      <p className="text-slate-900 dark:text-white text-lg font-bold">Practice Profile</p>
                      <span className="material-symbols-outlined text-slate-500 group-open:rotate-180 transition-transform">expand_more</span>
                    </summary>
                    <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-700/50">
                      <p className="text-slate-500 dark:text-slate-400 text-sm py-4">Used as the primary practice identity on claims and communications.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Practice Legal Name</label>
                            <input className="form-input block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary" type="text" defaultValue="Springfield General Medical Group" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">DBA Name (optional)</label>
                            <input className="form-input block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary" type="text" defaultValue="Springfield Primary Care" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Organization Type</label>
                            <select className="form-select block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary">
                                <option>Group Practice</option>
                                <option>Solo Practice</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Main Phone</label>
                            <input className="form-input block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary" type="tel" defaultValue="555-123-4567" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Main Fax (optional)</label>
                            <input className="form-input block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary" type="tel" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Main Email</label>
                            <input className="form-input block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary" type="email" defaultValue="admin@springfield.com" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Website (optional)</label>
                            <input className="form-input block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary" type="url" defaultValue="https://springfieldmedical.io" />
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
                  <details className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 group" open>
                    <summary className="flex cursor-pointer items-center justify-between gap-6 p-5 select-none">
                      <p className="text-slate-900 dark:text-white text-lg font-bold">Billing Entity Details</p>
                      <span className="material-symbols-outlined text-slate-500 group-open:rotate-180 transition-transform">expand_more</span>
                    </summary>
                    <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-700/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Billing Entity Legal Name</label>
                                <input className="form-input block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white shadow-sm" defaultValue="Springfield General Medical Group" />
                                <p className="mt-1 text-xs text-slate-500">As registered with IRS; appears as billing provider name.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tax ID (EIN)</label>
                                <input className="form-input block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white shadow-sm" defaultValue="12-3456789" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Organizational NPI (Type 2)</label>
                                <input className="form-input block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white shadow-sm" defaultValue="1234567890" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Default Taxonomy Code</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                                    <input className="form-input block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white shadow-sm pl-10" defaultValue="207Q00000X - Family Medicine" />
                                </div>
                            </div>
                        </div>
                    </div>
                  </details>

                  <details className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 group" open>
                    <summary className="flex cursor-pointer items-center justify-between gap-6 p-5 select-none">
                      <p className="text-slate-900 dark:text-white text-lg font-bold">Pay-To / Remittance Address</p>
                      <span className="material-symbols-outlined text-slate-500 group-open:rotate-180 transition-transform">expand_more</span>
                    </summary>
                    <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-700/50">
                        <div className="mt-4 flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Use Practice Profile Address as Pay-To Address</label>
                            <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-primary transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                                <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Preferred Remittance Type</label>
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                        <input type="radio" name="remittance" className="text-primary focus:ring-primary" defaultChecked /> ERA + EFT
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                        <input type="radio" name="remittance" className="text-primary focus:ring-primary" /> Paper EOB + Check
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                  </details>
                </div>
              )}

              {/* Locations Tab */}
              {activeTab === 'locations' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                   <details className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 group" open>
                    <summary className="flex cursor-pointer items-center justify-between gap-6 p-5 select-none">
                      <p className="text-slate-900 dark:text-white text-lg font-bold">Service Locations</p>
                      <span className="material-symbols-outlined text-slate-500 group-open:rotate-180 transition-transform">expand_more</span>
                    </summary>
                    <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-700/50">
                        <div className="flex flex-col gap-4 pt-4">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-slate-900 dark:text-white">Springfield General Medical</h4>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 uppercase">Primary</span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">123 Main Street, Springfield, IL 62704</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 text-slate-500 hover:text-primary transition-colors"><span className="material-symbols-outlined">edit</span></button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700">
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">Springfield West Clinic</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">456 Oak Avenue, Springfield, IL 62705</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 text-slate-500 hover:text-primary transition-colors"><span className="material-symbols-outlined">edit</span></button>
                                    <button className="p-2 text-slate-500 hover:text-danger transition-colors"><span className="material-symbols-outlined">delete</span></button>
                                </div>
                            </div>
                            <button className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">
                                <span className="material-symbols-outlined">add</span>
                                Add Service Location
                            </button>
                        </div>
                    </div>
                  </details>
                </div>
              )}

              {/* Providers Tab */}
              {activeTab === 'providers' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
                   <details className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 group" open>
                    <summary className="flex cursor-pointer items-center justify-between gap-6 p-5 select-none">
                      <p className="text-slate-900 dark:text-white text-lg font-bold">Provider Directory</p>
                      <span className="material-symbols-outlined text-slate-500 group-open:rotate-180 transition-transform">expand_more</span>
                    </summary>
                    <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-700/50">
                        <div className="flex flex-col gap-4 pt-4">
                            <div className="flex flex-wrap gap-3 items-center justify-between">
                                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                                    <div className="relative w-full">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                        <input className="form-input block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/50 pl-10 text-sm" placeholder="Search providers..." type="search" />
                                    </div>
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary/90 transition-colors shadow-sm">
                                    <span className="material-symbols-outlined text-lg">add</span>
                                    Add Provider
                                </button>
                            </div>
                            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase text-slate-500 dark:text-slate-400 font-bold">
                                        <tr>
                                            <th className="px-4 py-3">Provider Name</th>
                                            <th className="px-4 py-3">Credentials</th>
                                            <th className="px-4 py-3">Specialty</th>
                                            <th className="px-4 py-3">NPI</th>
                                            <th className="px-4 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer">
                                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">Dr. Emily Carter</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">MD</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Cardiology</td>
                                            <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">1234567890</td>
                                            <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-bold text-green-700 dark:text-green-300">Active</span></td>
                                        </tr>
                                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer">
                                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">Dr. Benjamin Lee</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">DO</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Pediatrics</td>
                                            <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">0987654321</td>
                                            <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-bold text-green-700 dark:text-green-300">Active</span></td>
                                        </tr>
                                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer">
                                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">Sarah Jenkins</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">NP</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Family Med</td>
                                            <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">1122334455</td>
                                            <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-xs font-bold text-red-700 dark:text-red-300">Inactive</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                  </details>

                  <details className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 group">
                    <summary className="flex cursor-pointer items-center justify-between gap-6 p-5 select-none">
                      <p className="text-slate-900 dark:text-white text-lg font-bold">Default Billing Rules</p>
                      <span className="material-symbols-outlined text-slate-500 group-open:rotate-180 transition-transform">expand_more</span>
                    </summary>
                    <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-700/50">
                        <div className="pt-4 space-y-6">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Use provider as default rendering provider on all claims</label>
                                <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-primary transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                                    <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Taxonomy Code Default</label>
                                    <input className="form-input block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white shadow-sm" defaultValue="207Q00000X - Family Medicine" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Default Modifiers</label>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                            -25 <button className="hover:text-red-500"><span className="material-symbols-outlined text-sm">close</span></button>
                                        </span>
                                        <button className="text-xs text-primary font-bold hover:underline">+ Add</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  </details>
                </div>
              )}

              {/* Payers Tab */}
              {activeTab === 'payers' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
                   <details className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 group" open>
                    <summary className="flex cursor-pointer items-center justify-between gap-6 p-5 select-none">
                      <p className="text-slate-900 dark:text-white text-lg font-bold">National Identifiers</p>
                      <span className="material-symbols-outlined text-slate-500 group-open:rotate-180 transition-transform">expand_more</span>
                    </summary>
                    <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-700/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                            <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tax ID (EIN/SSN)</label><input className="form-input block w-full rounded-lg border-slate-300 dark:border-slate-600" defaultValue="**-***4321" /></div>
                            <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Organizational NPI</label><input className="form-input block w-full rounded-lg border-slate-300 dark:border-slate-600" defaultValue="1234567890" /></div>
                            <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Medicare PTAN</label><input className="form-input block w-full rounded-lg border-slate-300 dark:border-slate-600" /></div>
                            <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">CLIA Number</label><input className="form-input block w-full rounded-lg border-slate-300 dark:border-slate-600" /></div>
                        </div>
                    </div>
                  </details>

                  <details className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 group" open>
                    <summary className="flex cursor-pointer items-center justify-between gap-6 p-5 select-none">
                      <p className="text-slate-900 dark:text-white text-lg font-bold">Commercial Payer Enrollment</p>
                      <span className="material-symbols-outlined text-slate-500 group-open:rotate-180 transition-transform">expand_more</span>
                    </summary>
                    <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-700/50">
                        <div className="flex flex-col gap-4 pt-4">
                            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase text-slate-500 dark:text-slate-400 font-bold">
                                        <tr>
                                            <th className="px-4 py-3">Payer Name</th>
                                            <th className="px-4 py-3">Payer ID</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Connection</th>
                                            <th className="px-4 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        <tr>
                                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">Aetna</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">60054</td>
                                            <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-bold text-green-700 dark:text-green-300">Active</span></td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">EDI Clearinghouse</td>
                                            <td className="px-4 py-3 text-primary font-medium cursor-pointer hover:underline">Edit</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">Cigna</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">62308</td>
                                            <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 text-xs font-bold text-yellow-700 dark:text-yellow-300">Pending</span></td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Direct Portal</td>
                                            <td className="px-4 py-3 text-primary font-medium cursor-pointer hover:underline">Edit</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <button className="flex items-center gap-2 self-start text-sm font-bold text-primary hover:underline mt-2">
                                <span className="material-symbols-outlined text-lg">add</span>
                                Add Payer Enrollment
                            </button>
                        </div>
                    </div>
                  </details>
                </div>
              )}

              {/* Rules Tab */}
              {activeTab === 'rules' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
                   <details className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 group" open>
                    <summary className="flex cursor-pointer items-center justify-between gap-6 p-5 select-none">
                      <p className="text-slate-900 dark:text-white text-lg font-bold">Global Claim Defaults</p>
                      <span className="material-symbols-outlined text-slate-500 group-open:rotate-180 transition-transform">expand_more</span>
                    </summary>
                    <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-700/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Default POS Code</label>
                                <select className="form-select block w-full rounded-lg border-slate-300 dark:border-slate-600"><option>11 - Office</option><option>02 - Telehealth</option></select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Default Rendering Provider</label>
                                <select className="form-select block w-full rounded-lg border-slate-300 dark:border-slate-600"><option>Dr. Emily Carter</option></select>
                            </div>
                            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/30">
                                    <label className="text-sm font-medium">Default Signature on File (Box 13)</label>
                                    <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-primary transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                                        <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/30">
                                    <label className="text-sm font-medium">Accept Assignment (Box 27)</label>
                                    <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-primary transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                                        <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  </details>

                  <details className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 group" open>
                    <summary className="flex cursor-pointer items-center justify-between gap-6 p-5 select-none">
                      <p className="text-slate-900 dark:text-white text-lg font-bold">AI Automation Rules</p>
                      <span className="material-symbols-outlined text-slate-500 group-open:rotate-180 transition-transform">expand_more</span>
                    </summary>
                    <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-700/50">
                        <div className="pt-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="font-medium text-slate-700 dark:text-slate-300">Enable AI Auto-Correction for Common Errors</label>
                                <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-primary transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                                    <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-400 pl-4 border-l-2 border-primary/20">
                                <label className="flex items-center gap-2"><input type="checkbox" className="rounded text-primary focus:ring-primary" defaultChecked /> Modifier mismatches</label>
                                <label className="flex items-center gap-2"><input type="checkbox" className="rounded text-primary focus:ring-primary" defaultChecked /> POS conflicts</label>
                                <label className="flex items-center gap-2"><input type="checkbox" className="rounded text-primary focus:ring-primary" defaultChecked /> Invalid CPT/ICD combos</label>
                                <label className="flex items-center gap-2"><input type="checkbox" className="rounded text-primary focus:ring-primary" defaultChecked /> Telehealth compliance</label>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <label className="font-medium text-slate-700 dark:text-slate-300">Enable AI to Suggest Missing Codes</label>
                                <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-primary transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                                    <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                  </details>
                </div>
              )}

            </div>
          </div>

          <div className="hidden xl:block">
            <div className="sticky top-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-primary text-2xl">tips_and_updates</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quick Tip</h3>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-3">
                    {activeTab === 'profile' && <p>Keeping your practice profile up-to-date ensures accurate claim headers and reduces administrative denials.</p>}
                    {activeTab === 'billing' && <p>Ensure your Tax ID and NPI match exactly what is on file with payers to prevent payment delays.</p>}
                    {activeTab === 'locations' && <p>Add all service locations to ensure the correct Place of Service (POS) code is automatically selected.</p>}
                    {activeTab === 'providers' && <p>Provider NPIs and Taxonomy codes auto-populate Box 24J and Box 33J on CMS-1500 forms.</p>}
                    {activeTab === 'payers' && <p>Enrollment IDs are critical for electronic claim submission. Missing IDs often lead to "Provider Not Authorized" rejections.</p>}
                    {activeTab === 'rules' && <p>AI Automation Rules act as a first line of defense, correcting common errors before claims even reach the clearinghouse.</p>}
                    
                    <ul className="list-disc pl-4 space-y-1 mt-4 text-xs">
                        <li>Changes are auto-saved to draft.</li>
                        <li>Audit logs track all modifications.</li>
                    </ul>
                </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 p-4 z-10">
        <div className="max-w-[1600px] mx-auto flex justify-end items-center gap-3">
            <button className="px-4 py-2 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">Discard Changes</button>
            <button className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary/90 shadow-sm transition-colors">Save Settings</button>
        </div>
      </footer>
    </div>
  );
};