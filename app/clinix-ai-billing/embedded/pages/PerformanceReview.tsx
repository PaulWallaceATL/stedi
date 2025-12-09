import React from 'react';
import { ViewState } from '../types';

interface Props {
  setView: (view: ViewState) => void;
}

export const PerformanceReview: React.FC<Props> = ({ setView }) => {
  return (
    <main className="flex-1 overflow-auto p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="mx-auto max-w-screen-2xl">
        <div className="flex flex-col gap-6">
          
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center rounded-lg bg-slate-200/50 dark:bg-slate-800 p-1">
              <button onClick={() => setView(ViewState.DASHBOARD)} className="px-4 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-md transition-all">Billing Ops Manager</button>
              <button onClick={() => setView(ViewState.PRIORITIZATION)} className="px-4 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-md transition-all">Intelligent Prioritization</button>
              <button className="px-4 py-1.5 text-sm font-semibold text-white bg-primary rounded-md shadow-sm transition-all">Performance Review</button>
            </div>
          </div>

          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Practice Performance Analytics</h1>
            <div className="flex items-center gap-2">
               <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600 p-1">
                   <button className="px-3 py-1 text-xs font-bold text-white bg-slate-800 dark:bg-slate-600 rounded">M</button>
                   <button className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">Q</button>
                   <button className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">Y</button>
               </div>
               <button className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                <span className="material-symbols-outlined text-base">download</span>
                <span>Export Report</span>
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Net Collection Rate</p>
                <div className="flex items-end gap-2 mt-1">
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">96%</p>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">↑ 2%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mt-4">
                   <div className="bg-primary h-1.5 rounded-full" style={{width: "96%"}}></div>
                </div>
             </div>
             <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Days in A/R</p>
                <div className="flex items-end gap-2 mt-1">
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">32</p>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">↓ 4 days</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mt-4">
                   <div className="bg-orange-400 h-1.5 rounded-full" style={{width: "45%"}}></div>
                </div>
             </div>
             <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">First Pass Resolution</p>
                <div className="flex items-end gap-2 mt-1">
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">92%</p>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">No change</span>
                </div>
                 <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mt-4">
                   <div className="bg-blue-500 h-1.5 rounded-full" style={{width: "92%"}}></div>
                </div>
             </div>
             <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Denial Rate</p>
                <div className="flex items-end gap-2 mt-1">
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">4.5%</p>
                    <span className="text-xs font-semibold text-red-500 dark:text-red-400 mb-1">↑ 0.5%</span>
                </div>
                 <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mt-4">
                   <div className="bg-red-500 h-1.5 rounded-full" style={{width: "15%"}}></div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2 rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Revenue Trend (6 Months)</h3>
                 <div className="h-64 flex items-end justify-between gap-2">
                    {[65, 72, 68, 85, 82, 94].map((h, i) => (
                        <div key={i} className="flex flex-col items-center flex-1 gap-2 group cursor-pointer">
                            <div className="w-full max-w-[60px] bg-primary/20 dark:bg-primary/30 rounded-t-sm relative h-full flex items-end overflow-hidden group-hover:bg-primary/30 dark:group-hover:bg-primary/40 transition-colors">
                                <div style={{height: `${h}%`}} className="w-full bg-primary relative">
                                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        ${h * 1200}
                                     </div>
                                </div>
                            </div>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'][i]}</span>
                        </div>
                    ))}
                 </div>
             </div>
             <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Top Denial Reasons</h3>
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-700 dark:text-slate-300">Registration / Eligibility</span>
                            <span className="font-semibold text-slate-900 dark:text-white">35%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                           <div className="bg-indigo-500 h-2 rounded-full" style={{width: '35%'}}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-700 dark:text-slate-300">Service Not Covered</span>
                            <span className="font-semibold text-slate-900 dark:text-white">25%</span>
                        </div>
                         <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                           <div className="bg-amber-500 h-2 rounded-full" style={{width: '25%'}}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-700 dark:text-slate-300">Duplicate Claim</span>
                            <span className="font-semibold text-slate-900 dark:text-white">15%</span>
                        </div>
                         <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                           <div className="bg-red-500 h-2 rounded-full" style={{width: '15%'}}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-700 dark:text-slate-300">Missing Information</span>
                            <span className="font-semibold text-slate-900 dark:text-white">12%</span>
                        </div>
                         <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                           <div className="bg-teal-500 h-2 rounded-full" style={{width: '12%'}}></div>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
};