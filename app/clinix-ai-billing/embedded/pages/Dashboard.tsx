import React from 'react';
import { ViewState } from '../types';

interface Props {
  setView: (view: ViewState) => void;
}

export const Dashboard: React.FC<Props> = ({ setView }) => {
  return (
    <main className="flex-1 overflow-auto p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="mx-auto max-w-screen-2xl">
        <div className="flex flex-col gap-6">
          
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center rounded-lg bg-slate-200/50 dark:bg-slate-800 p-1">
              <button className="px-4 py-1.5 text-sm font-semibold text-white bg-primary rounded-md shadow-sm transition-all">Billing Ops Manager</button>
              <button onClick={() => setView(ViewState.PRIORITIZATION)} className="px-4 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-md transition-all">Intelligent Prioritization</button>
              <button onClick={() => setView(ViewState.PERFORMANCE_REVIEW)} className="px-4 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-md transition-all">Performance Review</button>
            </div>
          </div>

          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Claim Management Dashboard</h1>
            <div className="flex items-center gap-2">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total AR</p>
                <span className="material-symbols-outlined text-primary text-lg">payments</span>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">$1.2M</p>
              <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                <span className="text-green-600 dark:text-green-400 font-semibold">+5.2%</span> last 30 days
              </div>
              <div className="h-10 bg-slate-100 dark:bg-slate-700 rounded-md mt-3 flex items-end overflow-hidden">
                 <div className="w-1/5 h-2/3 bg-primary/70 rounded-t-sm"></div>
                 <div className="w-1/5 h-3/4 bg-primary/70 rounded-t-sm ml-px"></div>
                 <div className="w-1/5 h-1/2 bg-primary/70 rounded-t-sm ml-px"></div>
                 <div className="w-1/5 h-4/5 bg-primary/70 rounded-t-sm ml-px"></div>
                 <div className="w-1/5 h-2/4 bg-primary/70 rounded-t-sm ml-px"></div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">First Pass Approval</p>
                <span className="material-symbols-outlined text-success text-lg">verified</span>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">88.5%</p>
              <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                <span className="text-green-600 dark:text-green-400 font-semibold">+1.2%</span> vs. target
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 mt-3">
                <div className="bg-success h-2.5 rounded-full" style={{ width: '88.5%' }}></div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Appeal Volume</p>
                    <span className="material-symbols-outlined text-warning text-lg">gavel</span>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">147</p>
                <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    <span className="text-red-600 dark:text-red-400 font-semibold">+18</span> this month
                </div>
                <div className="h-10 bg-slate-100 dark:bg-slate-700 rounded-md mt-3 flex items-end overflow-hidden">
                    <div className="w-1/5 h-1/3 bg-warning/70 rounded-t-sm"></div>
                    <div className="w-1/5 h-1/2 bg-warning/70 rounded-t-sm ml-px"></div>
                    <div className="w-1/5 h-2/3 bg-warning/70 rounded-t-sm ml-px"></div>
                    <div className="w-1/5 h-3/4 bg-warning/70 rounded-t-sm ml-px"></div>
                    <div className="w-1/5 h-4/5 bg-warning/70 rounded-t-sm ml-px"></div>
                </div>
            </div>

            <div 
                className="rounded-xl border border-danger bg-danger/10 dark:bg-danger/20 p-4 shadow-sm text-danger cursor-pointer hover:bg-danger/15 transition-colors"
                onClick={() => setView(ViewState.DENIAL_MANAGER)}
            >
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-danger">Needs Attention</p>
                    <span className="material-symbols-outlined text-danger text-lg">crisis_alert</span>
                </div>
                <p className="text-3xl font-bold">12</p>
                <div className="text-sm text-danger-700 dark:text-danger-300 mt-1">
                    <span className="font-semibold">3</span> critical escalations
                </div>
                <div className="flex items-center gap-2 mt-3">
                    <button className="flex-1 text-center py-1.5 px-3 bg-danger text-white rounded-md text-sm font-medium hover:bg-danger/90 transition-colors">Review All</button>
                </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
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
                    <th className="px-6 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {/* Row 1 */}
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer" onClick={() => setView(ViewState.CLAIM_DETAIL)}>
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
                    <td className="whitespace-nowrap px-6 py-4">
                      <button className="text-primary hover:underline font-medium" onClick={(e) => { e.stopPropagation(); setView(ViewState.CLAIM_DETAIL); }}>View Details</button>
                    </td>
                  </tr>
                   {/* Row 2 */}
                   <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-800 dark:text-slate-200">Robert Williams</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300">CIG12345678</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300">Oct 23, 2023</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300">Cigna</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-slate-800 dark:text-slate-200">$875.25</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/20 px-2 py-1 text-xs font-medium text-danger-700 dark:text-danger-300">
                        <span className="material-symbols-outlined text-xs">cancel</span> Denied
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <button className="text-primary hover:underline font-medium">View Details</button>
                    </td>
                  </tr>
                   {/* Row 3 */}
                   <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-800 dark:text-slate-200">Emily Brown</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300">HUM45678901</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300">Oct 22, 2023</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300">Humana</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-slate-800 dark:text-slate-200">$3,120.00</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-success/20 px-2 py-1 text-xs font-medium text-success dark:text-success/90">
                        <span className="material-symbols-outlined text-xs">check_circle</span> Accepted
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <button className="text-primary hover:underline font-medium">View Details</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 p-4">
                <span className="text-sm text-slate-600 dark:text-slate-400">Showing 1 to 5 of 357 claims</span>
                <div className="flex items-center gap-2">
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                <span className="material-symbols-outlined text-base">chevron_left</span>
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                <span className="material-symbols-outlined text-base">chevron_right</span>
                </button>
                </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};