import React, { useState, useEffect, useRef } from 'react';
import { ViewState } from '../types';

interface Props {
  setView: (view: ViewState) => void;
}

export const ClaimWizard: React.FC<Props> = ({ setView }) => {
  const [step, setStep] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to top when step changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [step]);

  const nextStep = () => {
    if (step < 6) setStep(step + 1);
    else setView(ViewState.SUCCESS);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
    else setView(ViewState.CLAIM_METHOD);
  };

  const steps = [
    { id: 1, label: "Patient Information" },
    { id: 2, label: "Payer & Insurance Details" },
    { id: 3, label: "Provider & Facility" },
    { id: 4, label: "Diagnoses (ICD-10)" },
    { id: 5, label: "Service Lines (CPT/HCPCS)" },
    { id: 6, label: "Claim Summary & Submit" }
  ];

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark font-display relative h-full">
      <div className="relative flex min-h-full w-full flex-col">
        {/* Wizard Header */}
        <header className="sticky top-0 z-20 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-background-dark/80">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 py-4 text-gray-900 dark:text-white">
              <span className="material-symbols-outlined text-primary text-3xl">spark</span>
              <h2 className="text-lg font-bold">Clinix AI Billing</h2>
            </div>
          </div>
        </header>

        <main className="flex-grow">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-10">
              <p className="text-4xl font-black leading-tight tracking-tight text-[#111418] dark:text-gray-100">Create Claim From Scratch</p>
              <p className="text-lg font-normal leading-normal text-[#617589] dark:text-gray-400">Step {step} of 6: {steps[step - 1].label}</p>
            </div>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
              {/* Sidebar */}
              <aside className="lg:col-span-3">
                <div className="sticky top-28 py-2">
                  <div className="flex flex-col gap-1 rounded-xl bg-white p-6 shadow-soft-lg dark:bg-gray-900/50">
                    {steps.map((s) => {
                      const isActive = step === s.id;
                      const isCompleted = step > s.id;
                      
                      let containerClass = "flex items-center gap-4 rounded-lg px-4 py-3 transition-colors duration-200";
                      let iconClass = "material-symbols-outlined text-lg";
                      let textClass = "text-base font-medium";
                      
                      if (isActive) {
                        containerClass += " border border-primary bg-primary/5 text-primary transition-all";
                        iconClass += " !fill-1 font-bold text-primary";
                        textClass = "text-base font-semibold";
                      } else if (isCompleted) {
                        containerClass += " text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800";
                        iconClass += " text-green-500 !fill-1";
                      } else {
                         containerClass += " text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800";
                      }

                      const iconName = isCompleted ? "check_circle" : 
                                       s.id === 1 ? "looks_one" : 
                                       s.id === 2 ? "looks_two" : 
                                       s.id === 3 ? "looks_3" : 
                                       s.id === 4 ? "looks_4" : 
                                       s.id === 5 ? "looks_5" : "looks_6";

                      return (
                        <div key={s.id} className={containerClass}>
                          <span className={iconClass}>{iconName}</span>
                          <p className={textClass}>{s.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </aside>

              {/* Main Form Content */}
              <div className="lg:col-span-9">
                <div className="grid grid-cols-1 gap-10 xl:grid-cols-3">
                  <div className="relative rounded-xl bg-white p-8 shadow-soft-lg dark:bg-gray-900/50 xl:col-span-2">
                    {step === 1 && (
                       <div className="space-y-8 animate-in fade-in">
                          <h3 className="text-2xl font-bold text-[#111418] dark:text-gray-100">Patient Information</h3>
                          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                              <label className="flex flex-col">
                                <p className="pb-2 text-base font-medium text-[#111418] dark:text-gray-200">Patient Name</p>
                                <div className="relative flex w-full flex-1 items-stretch">
                                  <input className="form-input block h-12 w-full min-w-0 flex-1 rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-primary" placeholder="Search by name" />
                                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-[#617589] dark:text-gray-400">
                                    <span className="material-symbols-outlined">search</span>
                                  </div>
                                </div>
                                <p className="pt-2 text-sm text-gray-500 dark:text-gray-400">Start typing to find an existing patient or create a new one.</p>
                              </label>
                            </div>
                            <div>
                              <label className="flex flex-col">
                                <p className="pb-2 text-base font-medium text-[#111418] dark:text-gray-200">Date of Birth (DOB)</p>
                                <div className="relative flex w-full flex-1 items-stretch">
                                  <input className="form-input block h-12 w-full min-w-0 flex-1 rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-primary" placeholder="MM/DD/YYYY" type="date" />
                                </div>
                              </label>
                            </div>
                            <div>
                              <label className="flex flex-col">
                                <p className="pb-2 text-base font-medium text-[#111418] dark:text-gray-200">MRN / Patient ID</p>
                                <input className="form-input block h-12 w-full min-w-0 flex-1 rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-primary" placeholder="Enter Patient ID" />
                              </label>
                            </div>
                            <div>
                              <label className="flex flex-col">
                                <p className="pb-2 text-base font-medium text-[#111418] dark:text-gray-200">Gender <span className="text-gray-400">(Optional)</span></p>
                                <select className="form-select block h-12 w-full min-w-0 flex-1 appearance-none rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-primary">
                                  <option>Select Gender</option>
                                  <option>Male</option>
                                  <option>Female</option>
                                  <option>Other</option>
                                </select>
                              </label>
                            </div>
                            <div>
                              <label className="flex flex-col">
                                <p className="pb-2 text-base font-medium text-[#111418] dark:text-gray-200">Relationship to Subscriber</p>
                                <select className="form-select block h-12 w-full min-w-0 flex-1 appearance-none rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-primary">
                                  <option>Self</option>
                                  <option>Spouse</option>
                                  <option>Child</option>
                                  <option>Other</option>
                                </select>
                              </label>
                            </div>
                          </div>
                       </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-[#111418] dark:text-gray-100">Payer & Insurance Details</h3>
                                <p className="text-base text-gray-600 dark:text-gray-400">Enter insurance plan information for this claim.</p>
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-lg font-semibold text-[#111418] dark:text-gray-100">Primary Payer Information</h4>
                                <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label className="flex flex-col gap-2">
                                            <span className="text-base font-medium text-[#111418] dark:text-gray-200">Payer Name</span>
                                            <div className="relative">
                                                <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                                                <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white pl-11 pr-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-primary" placeholder="Search for a payer..." />
                                            </div>
                                        </label>
                                    </div>
                                    <div>
                                        <label className="flex flex-col gap-2"><span className="text-base font-medium text-[#111418] dark:text-gray-200">Plan Type</span>
                                        <select className="form-select block h-12 w-full appearance-none rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-primary"><option>PPO</option><option>HMO</option><option>Medicare</option></select></label>
                                    </div>
                                    <div><label className="flex flex-col gap-2"><span className="text-base font-medium text-[#111418] dark:text-gray-200">Policy Number</span><input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-primary" placeholder="Enter policy number"/></label></div>
                                    <div><label className="flex flex-col gap-2"><span className="text-base font-medium text-[#111418] dark:text-gray-200">Subscriber ID</span><input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-primary" placeholder="Enter subscriber ID"/></label></div>
                                    <div className="sm:col-span-2"><label className="flex flex-col gap-2"><span className="text-base font-medium text-[#111418] dark:text-gray-200">Relationship to Subscriber</span><select className="form-select block h-12 w-full appearance-none rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-primary sm:max-w-xs"><option>Self</option><option>Spouse</option><option>Child</option></select></label></div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-lg font-semibold text-[#111418] dark:text-gray-100">Coverage & Claim Requirements</h4>
                                <div><p className="text-base font-medium text-[#111418] dark:text-gray-200">Is Prior Authorization Required?</p><div className="mt-2 flex items-center gap-4"><button className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary dark:bg-primary/20">Yes</button><button className="rounded-full px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">No</button></div></div>
                                <div><label className="flex flex-col gap-2"><span className="text-base font-medium text-[#111418] dark:text-gray-200">Prior Authorization Number</span><input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-primary sm:max-w-xs" placeholder="Enter authorization number"/></label></div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-12 animate-in fade-in">
                            <div className="space-y-2">
                                <h3 className="col-span-full text-2xl font-bold text-[#111418] dark:text-gray-100">Provider & Facility</h3>
                                <p className="text-base text-gray-600 dark:text-gray-400">These details determine who is billing for the service and where the patient was treated.</p>
                            </div>
                            <div className="space-y-8">
                                <div className="space-y-6">
                                    <h4 className="text-lg font-semibold text-[#111418] dark:text-gray-100">Provider Information</h4>
                                    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                                        <div className="sm:col-span-2"><label className="flex flex-col gap-2"><span className="text-base font-medium text-[#111418] dark:text-gray-200">Billing Provider</span><div className="relative"><span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span><input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white pl-11 pr-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-primary" placeholder="Search by name or NPI"/></div></label></div>
                                        <div><label className="flex flex-col gap-2"><span className="text-base font-medium text-[#111418] dark:text-gray-200">NPI</span><input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-primary" placeholder="Auto-populated"/></label></div>
                                        <div className="sm:col-span-2"><label className="flex flex-col gap-2"><span className="text-base font-medium text-[#111418] dark:text-gray-200">Rendering Provider</span><div className="relative"><span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span><input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white pl-11 pr-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-primary" placeholder="Search for a provider"/></div></label></div>
                                    </div>
                                </div>
                                <hr className="border-gray-200 dark:border-gray-700"/>
                                <div className="space-y-6">
                                    <h4 className="text-lg font-semibold text-[#111418] dark:text-gray-100">Facility / Place of Service</h4>
                                    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                                         <div className="sm:col-span-2"><label className="flex flex-col gap-2"><span className="text-base font-medium text-[#111418] dark:text-gray-200">Facility Name <span className="text-gray-400">(Optional)</span></span><input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-primary" placeholder="Enter facility name"/></label></div>
                                         <div className="sm:col-span-2"><label className="flex flex-col gap-2"><span className="text-base font-medium text-[#111418] dark:text-gray-200">Place of Service (POS Code)</span><select className="form-select block h-12 w-full appearance-none rounded-xl border border-[#dbe0e6] bg-white px-4 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-primary sm:max-w-xs"><option>11 - Office</option><option>22 - Hospital Outpatient</option><option>21 - Hospital Inpatient</option></select></label></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-8 animate-in fade-in">
                            <div className="space-y-2">
                                <h3 className="col-span-full text-2xl font-bold text-[#111418] dark:text-gray-100">Diagnoses (ICD-10 Codes)</h3>
                                <p className="text-base text-gray-600 dark:text-gray-400">Add one or more diagnosis codes that justify the services rendered.</p>
                            </div>
                            <div className="space-y-6">
                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <div className="relative flex-grow">
                                        <input className="form-input block h-12 w-full rounded-xl border border-[#dbe0e6] bg-white py-2 pl-4 pr-11 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-primary" placeholder="Search ICD-10 codes or enter manually…"/>
                                        <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                                    </div>
                                    <button className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary/10 px-6 text-base font-semibold text-primary shadow-sm transition-colors hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30"><span>Add Diagnosis</span></button>
                                </div>
                                <div className="space-y-4">
                                     <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                                         <div className="grid grid-cols-12 items-start gap-x-4 gap-y-3">
                                            <div className="col-span-12 sm:col-span-3"><label className="flex flex-col gap-1.5"><span className="text-sm font-medium text-gray-700 dark:text-gray-300">ICD-10 Code</span><input className="form-input block h-11 w-full rounded-lg border border-[#dbe0e6] bg-white px-3 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" defaultValue="R05"/></label></div>
                                            <div className="col-span-12 sm:col-span-6"><label className="flex flex-col gap-1.5"><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</span><input className="form-input block h-11 w-full rounded-lg border border-[#dbe0e6] bg-white px-3 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" defaultValue="Cough"/></label></div>
                                            <div className="col-span-6 sm:col-span-2"><label className="flex flex-col gap-1.5"><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority</span><select className="form-select block h-11 w-full appearance-none rounded-lg border border-[#dbe0e6] bg-white px-3 text-base text-[#111418] placeholder:text-[#617589] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"><option>1</option></select></label></div>
                                            <div className="col-span-6 flex h-11 items-end justify-end gap-2 sm:col-span-1"><button className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-red-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/50 dark:hover:text-red-400"><span className="material-symbols-outlined text-lg">delete</span></button></div>
                                         </div>
                                     </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-8 animate-in fade-in">
                            <div className="space-y-2">
                                <h3 className="col-span-full text-2xl font-bold text-[#111418] dark:text-gray-100">Service Lines (CPT/HCPCS Codes)</h3>
                                <p className="text-base text-gray-600 dark:text-gray-400">Add one or more service lines describing procedures performed.</p>
                            </div>
                            <button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-base font-semibold text-white shadow-md transition-colors hover:bg-primary/90 sm:w-auto"><span className="material-symbols-outlined">add</span><span>Add Service Line</span></button>
                            <div className="space-y-6">
                                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                                    <div className="flex items-start justify-between">
                                        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">Service Line 1</h4>
                                        <button className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-red-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/50 dark:hover:text-red-400"><span className="material-symbols-outlined text-lg">delete</span></button>
                                    </div>
                                    <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-12">
                                        <div className="sm:col-span-3"><label className="flex flex-col gap-1.5"><span className="text-sm font-medium text-gray-700 dark:text-gray-300">CPT / HCPCS</span><input className="form-input block h-11 w-full rounded-lg border border-[#dbe0e6] bg-white px-3 text-base text-[#111418] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" defaultValue="99213"/></label></div>
                                        <div className="sm:col-span-9"><label className="flex flex-col gap-1.5"><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</span><input className="form-input block h-11 w-full rounded-lg border border-[#dbe0e6] bg-white/50 px-3 text-base text-[#111418] dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-100" readOnly defaultValue="Office or other outpatient visit"/></label></div>
                                        <div className="sm:col-span-4"><label className="flex flex-col gap-1.5"><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Charge</span><div className="relative"><span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500">$</span><input className="form-input block h-11 w-full rounded-lg border border-[#dbe0e6] bg-white pl-7 pr-3 text-base text-[#111418] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" defaultValue="150.00"/></div></label></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 6 && (
                        <div className="space-y-8 animate-in fade-in">
                            <div className="space-y-2">
                                <h3 className="col-span-full text-2xl font-bold text-[#111418] dark:text-gray-100">Claim Summary</h3>
                                <p className="text-base text-gray-600 dark:text-gray-400">Review all details before creating this claim.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/30"><span className="material-symbols-outlined flex-shrink-0 text-2xl text-red-600 dark:text-red-400">error</span><div className="flex-grow"><h4 className="font-semibold text-red-800 dark:text-red-200">Errors (must fix before creation)</h4><ul className="mt-2 list-disc pl-5 text-sm text-red-700 dark:text-red-300"><li>Missing primary diagnosis.</li></ul></div></div>
                                <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/40"><div className="flex items-center justify-between"><h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">Patient & Insurance</h4><button className="text-sm font-semibold text-primary hover:underline">Edit</button></div><div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2"><div className="text-sm"><p className="text-gray-500 dark:text-gray-400">Patient</p><p className="font-medium text-gray-900 dark:text-white">Eleanor Vance (MRN: 789123)</p></div><div className="text-sm"><p className="text-gray-500 dark:text-gray-400">Payer</p><p className="font-medium text-gray-900 dark:text-white">Aetna PPO</p></div></div></div>
                                <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/40"><h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">Financial Summary</h4><div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-3"><div className="text-sm"><p className="text-gray-500 dark:text-gray-400">Total Charges</p><p className="text-lg font-bold text-gray-900 dark:text-white">$150.00</p></div></div></div>
                            </div>
                        </div>
                    )}
                  </div>
                  
                  {/* Quick Tip Sidebar */}
                  <div className="xl:col-span-1">
                    <div className="sticky top-28 rounded-xl bg-accent-blue-bg p-6 dark:bg-blue-950/40">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-xl !fill-1 text-accent-blue-text dark:text-blue-300">lightbulb</span>
                        <h4 className="text-lg font-semibold text-accent-blue-text dark:text-blue-200">Quick Tip</h4>
                      </div>
                      <p className="mt-4 text-base leading-relaxed text-gray-700 dark:text-gray-300">
                        {step === 1 && "You can link to an existing patient by searching their name or create a new one. Ensure the name matches the insurance card exactly."}
                        {step === 2 && "Choose the payer that matches the patient's active insurance plan. Check for prior authorization requirements."}
                        {step === 3 && "Billing and rendering providers aren’t always the same. Select the billing provider that will receive payment."}
                        {step === 4 && "The primary diagnosis (priority 1) should reflect the main reason for the encounter. Secondary diagnoses help justify additional services."}
                        {step === 5 && "Service lines represent the procedures performed. Be sure each CPT/HCPCS code connects to the appropriate diagnosis."}
                        {step === 6 && "Use this summary to spot obvious issues before the claim is created. Errors must be resolved before submission."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        {/* Sticky Footer */}
        <footer className="sticky bottom-0 z-20 mt-auto w-full border-t border-gray-200 bg-white/80 py-5 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm dark:border-gray-800 dark:bg-background-dark/80">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <button 
              onClick={prevStep} 
              className="rounded-lg px-5 py-2.5 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {step === 1 ? "Cancel" : "Back"}
            </button>
            <button 
              onClick={nextStep} 
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-primary/90"
            >
              <span>{step === 6 ? "Create Claim & Submit" : `Next: ${steps[step] ? steps[step].label.split('(')[0].trim() : ''}`}</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};