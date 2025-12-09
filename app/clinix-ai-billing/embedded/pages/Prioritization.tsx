import React from 'react';
import { ViewState } from '../types';

interface Props {
  setView: (view: ViewState) => void;
}

export const Prioritization: React.FC<Props> = ({ setView }) => {
  return (
    <main className="flex-1 overflow-auto p-6 lg:p-8 animate-in slide-in-from-right-4 duration-500">
      <div className="mx-auto max-w-screen-2xl">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex items-center rounded-lg bg-slate-200/50 dark:bg-slate-800 p-1">
              <button onClick={() => setView(ViewState.DASHBOARD)} className="px-4 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-md transition-all">Billing Ops Manager</button>
              <button className="px-4 py-1.5 text-sm font-semibold text-white bg-primary rounded-md shadow-sm transition-all">Intelligent Prioritization</button>
              <button onClick={() => setView(ViewState.PERFORMANCE_REVIEW)} className="px-4 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-md transition-all">Performance Review</button>
            </div>
          </div>

          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Intelligent Prioritization Hub</h1>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-center">
               <button className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                <span className="material-symbols-outlined text-base">filter_list</span>
                <span>More Filters</span>
              </button>
               <button onClick={() => setView(ViewState.CLAIM_METHOD)} className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-primary/90">
                <span className="material-symbols-outlined text-base">add</span>
                <span>New Claim</span>
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <div className="flex flex-col rounded-xl border border-danger bg-danger/10 dark:bg-danger/20 p-4 text-danger-700 dark:text-danger-300 relative overflow-hidden transition-all hover:-translate-y-1">
              <span className="material-symbols-outlined text-4xl absolute -right-2 -bottom-2 opacity-20 rotate-12">error</span>
              <p className="text-sm font-medium text-danger-800 dark:text-danger-200">Needs Attention / Escalation</p>
              <p className="text-3xl font-bold mt-1">12</p>
              <p className="text-xs text-danger-600 dark:text-danger-400 mt-0.5">Critical claims requiring immediate action</p>
            </div>
            <div className="flex flex-col rounded-xl border border-primary bg-primary/10 dark:bg-primary/20 p-4 text-primary-700 dark:text-primary-300 relative overflow-hidden transition-all hover:-translate-y-1">
              <span className="material-symbols-outlined text-4xl absolute -right-2 -bottom-2 opacity-20 rotate-12">calendar_today</span>
              <p className="text-sm font-medium text-primary-800 dark:text-primary-200">AR Aging (0-30 Days)</p>
              <p className="text-3xl font-bold mt-1">$45,230</p>
              <p className="text-xs text-primary-600 dark:text-primary-400 mt-0.5">Healthy aging claims</p>
            </div>
            <div className="flex flex-col rounded-xl border border-warning bg-warning/10 dark:bg-warning/20 p-4 text-amber-700 dark:text-amber-300 relative overflow-hidden transition-all hover:-translate-y-1">
              <span className="material-symbols-outlined text-4xl absolute -right-2 -bottom-2 opacity-20 rotate-12">watch_later</span>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">AR Aging (30-60 Days)</p>
              <p className="text-3xl font-bold mt-1">$18,500</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Monitor closely for potential issues</p>
            </div>
            <div className="flex flex-col rounded-xl border border-danger bg-danger/10 dark:bg-danger/20 p-4 text-danger-700 dark:text-danger-300 relative overflow-hidden transition-all hover:-translate-y-1">
              <span className="material-symbols-outlined text-4xl absolute -right-2 -bottom-2 opacity-20 rotate-12">gpp_bad</span>
              <p className="text-sm font-medium text-danger-800 dark:text-danger-200">AR Aging (60+ Days)</p>
              <p className="text-3xl font-bold mt-1">$7,890</p>
              <p className="text-xs text-danger-600 dark:text-danger-400 mt-0.5">High priority for follow-up</p>
            </div>
            <div className="flex flex-col rounded-xl border border-success bg-success/10 dark:bg-success/20 p-4 text-success-700 dark:text-success-300 relative overflow-hidden transition-all hover:-translate-y-1">
              <span className="material-symbols-outlined text-4xl absolute -right-2 -bottom-2 opacity-20 rotate-12">verified</span>
              <p className="text-sm font-medium text-success-800 dark:text-success-200">First-Pass Resolution</p>
              <p className="text-3xl font-bold mt-1">88%</p>
              <p className="text-xs text-success-600 dark:text-success-400 mt-0.5">Improving efficiency</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Patient Name</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Claim ID</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Date of Service</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Payer</th>
                    <th className="px-6 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">Billed Amount</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Status</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Codes</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  <tr>
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-800 dark:text-slate-200">Isabella Rossi</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300">UH87654321</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300">Oct 26, 2023</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300">United Health</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-slate-800 dark:text-slate-200">$2,450.00</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/20 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                        <span className="material-symbols-outlined text-xs">error</span> Needs Review
                      </span>
                    </td>
                     <td className="px-6 py-4">
                        <button className="flex items-center gap-1 text-primary hover:underline focus:outline-none text-sm">
                        <span className="material-symbols-outlined text-base">info</span> View Codes
                            </button>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <a className="rounded-md bg-slate-100 dark:bg-slate-700 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600" href="#">View Details</a>
                    </td>
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