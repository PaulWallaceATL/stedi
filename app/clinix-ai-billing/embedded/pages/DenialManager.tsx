import React from 'react';
import { ViewState } from '../types';

interface Props {
  setView: (view: ViewState) => void;
}

export const DenialManager: React.FC<Props> = () => {
  return (
    <main className="flex flex-col h-[calc(100vh-65px)] w-full overflow-hidden">
      {/* Top Filters Bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 shrink-0 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm z-20 w-full">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold mr-4">
          <span className="material-symbols-outlined">filter_list</span>
          <span>Filters</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-sm font-medium border border-transparent hover:border-red-300 transition-colors whitespace-nowrap">
            <span>❌ Rejected</span>
            <span className="bg-red-200 dark:bg-red-800/50 px-1.5 rounded-full text-xs">12</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium border border-transparent hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors whitespace-nowrap">
            <span>⚠️ Denied</span>
            <span className="bg-slate-200 dark:bg-slate-600 px-1.5 rounded-full text-xs">8</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium border border-transparent hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors whitespace-nowrap">
            <span>🔄 Needs Correction</span>
            <span className="bg-slate-200 dark:bg-slate-600 px-1.5 rounded-full text-xs">4</span>
          </button>
        </div>

        <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 hidden sm:block mx-2"></div>

        <div className="flex items-center gap-4 flex-wrap">
           <select className="form-select py-1.5 text-sm rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-primary focus:ring focus:ring-primary/50" aria-label="Select Payer">
              <option>All Payers</option>
              <option>United Healthcare</option>
              <option>Aetna</option>
           </select>

           <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
              <div className="relative inline-flex items-center">
                <input className="sr-only peer" type="checkbox" defaultChecked />
                <div className="w-9 h-5 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </div>
              <span>High-Impact Only</span>
           </label>
        </div>
      </div>

      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[450px_1fr] w-full">
        
        {/* AI Analyst Pane (Left Side) */}
        <div className="bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col h-full overflow-hidden order-1 lg:order-1 relative z-10 shadow-md">
             <div className="p-4 border-b border-slate-200 dark:border-slate-700 shrink-0 bg-slate-50/50 dark:bg-slate-800/80">
                <div className="flex items-center gap-2 mb-1">
                   <span className="material-symbols-outlined text-primary text-xl">psychology</span>
                   <h2 className="font-bold text-lg text-slate-800 dark:text-slate-200">AI Denial Analyst</h2>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Analyzing Claim <span className="font-mono font-medium text-slate-700 dark:text-slate-300">UH8372A1</span></p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/50 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg shrink-0">
                            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-xl">gpp_bad</span>
                        </div>
                        <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">Modifier Mismatch Detected</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">Payer guidelines indicate CPT <strong>99214</strong> with Place of Service <strong>02 (Telehealth)</strong> requires modifier <strong>95</strong> or <strong>GT</strong> depending on the plan, but <strong>59</strong> was used.</p>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md w-fit ml-auto">
                        <span className="material-symbols-outlined text-sm">auto_awesome</span>
                        AI Confidence: 93%
                    </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                     <button className="w-full flex items-center justify-between p-4 text-left font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <span className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">build</span> Suggested Fixes</span>
                        <span className="material-symbols-outlined text-slate-400">expand_less</span>
                    </button>
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 text-sm space-y-3">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div>
                                <p className="text-slate-800 dark:text-slate-200 font-medium">Update modifier on CPT 99214 to <span className="font-mono font-bold text-primary">95</span></p>
                                <span className="text-xs text-green-600 dark:text-green-400 mt-1 block">Recommended for United Healthcare</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button className="size-8 flex items-center justify-center rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 transition-colors" title="Accept Fix"><span className="material-symbols-outlined text-lg">check_circle</span></button>
                                <button className="size-8 flex items-center justify-center rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors" title="Reject Fix"><span className="material-symbols-outlined text-lg">cancel</span></button>
                            </div>
                        </div>
                    </div>
                </div>

                 <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                    <button className="w-full flex items-center justify-between p-4 text-left font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <span className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">description</span> AI Appeal Letter</span>
                    <span className="material-symbols-outlined text-slate-400">expand_less</span>
                    </button>
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 text-sm space-y-3">
                        <div className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300 h-32 overflow-y-auto font-mono">
                            Re: Claim UH8372A1<br/><br/>
                            To Whom It May Concern,<br/><br/>
                            This letter is to appeal the denial of claim UH8372A1 for patient Isabella Rossi, Date of Service 10/26/2023.<br/><br/>
                            The claim was denied due to an invalid modifier. We have reviewed the payer guidelines and corrected the modifier to reflect the appropriate telehealth service code...
                        </div>
                        <div className="flex gap-2">
                            <button className="flex-1 py-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-600">Copy Text</button>
                            <button className="flex-1 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-bold hover:bg-primary/20">Generate PDF</button>
                        </div>
                    </div>
                 </div>
            </div>

            <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
                <div className="flex items-center gap-3">
                    <button className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Mark Resolved</button>
                    <button className="flex-[2] flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-primary/90 transition-colors">
                        <span className="material-symbols-outlined text-lg">playlist_add_check</span>
                        <span>Correct & Resubmit</span>
                    </button>
                </div>
            </footer>
        </div>

        {/* Denial Queue List (Right Side) */}
        <div className="bg-background-light dark:bg-slate-900 flex flex-col overflow-y-auto order-2 lg:order-2 w-full">
          <div className="p-4 sm:p-6 sticky top-0 bg-background-light/95 dark:bg-slate-900/95 backdrop-blur-sm z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-transparent">
            <div>
              <h2 className="font-bold text-2xl text-slate-900 dark:text-white">Denial Queue</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">24 claims requiring attention</p>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Sort by:</span>
                <select className="form-select text-sm rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm focus:border-primary focus:ring-0 py-2 pl-3 pr-8">
                  <option>AI Priority (High-Low)</option>
                  <option>Date of Service (Newest)</option>
                  <option>Billed Amount (High-Low)</option>
                </select>
            </div>
          </div>
          
          <div className="p-4 sm:p-6 pt-0">
             <div className="overflow-hidden bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm text-left text-slate-600 dark:text-slate-400">
                    <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Claim ID</th>
                            <th className="px-6 py-4 font-semibold">Patient</th>
                            <th className="px-6 py-4 font-semibold">Payer</th>
                            <th className="px-6 py-4 font-semibold">Issue Summary</th>
                            <th className="px-6 py-4 font-semibold">Severity</th>
                            <th className="px-6 py-4 font-semibold text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        <tr className="bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors border-l-4 border-l-primary">
                            <td className="px-6 py-4 font-mono font-medium text-slate-900 dark:text-white">UH8372A1</td>
                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">Isabella Rossi</td>
                            <td className="px-6 py-4">United Health</td>
                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">Modifier mismatch on 99214</td>
                            <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">High</span></td>
                            <td className="px-6 py-4 text-right"><button className="text-primary hover:text-primary/80 font-bold text-sm">Reviewing...</button></td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors border-l-4 border-l-transparent">
                            <td className="px-6 py-4 font-mono font-medium text-slate-900 dark:text-white">AE9910B4</td>
                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">John Smith</td>
                            <td className="px-6 py-4">Aetna</td>
                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">DOB Mismatch (Year)</td>
                            <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">Medium</span></td>
                            <td className="px-6 py-4 text-right"><button className="text-slate-500 hover:text-primary font-bold text-sm">Review</button></td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors border-l-4 border-l-transparent">
                            <td className="px-6 py-4 font-mono font-medium text-slate-900 dark:text-white">CI7722C9</td>
                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">Sarah Connor</td>
                            <td className="px-6 py-4">Cigna</td>
                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">Duplicate Claim</td>
                            <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">Low</span></td>
                            <td className="px-6 py-4 text-right"><button className="text-slate-500 hover:text-primary font-bold text-sm">Review</button></td>
                        </tr>
                         <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors border-l-4 border-l-transparent">
                            <td className="px-6 py-4 font-mono font-medium text-slate-900 dark:text-white">BC4455D2</td>
                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">Michael Chang</td>
                            <td className="px-6 py-4">BCBS</td>
                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">Coordination of Benefits</td>
                            <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">Medium</span></td>
                            <td className="px-6 py-4 text-right"><button className="text-slate-500 hover:text-primary font-bold text-sm">Review</button></td>
                        </tr>
                    </tbody>
                </table>
             </div>
          </div>
        </div>

      </div>
    </main>
  );
};