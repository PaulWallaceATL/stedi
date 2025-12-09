import React from 'react';
import { ViewState } from '../types';

interface Props {
  setView: (view: ViewState) => void;
}

export const UploadReview: React.FC<Props> = ({ setView }) => {
  return (
    <main className="flex-1 px-4 py-8 md:px-8 md:py-12 lg:py-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 mb-8">
          <h1 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight tracking-[-0.033em]">Review Uploaded Claims</h1>
          <p className="text-gray-600 dark:text-gray-400 text-base font-normal leading-normal">Validate your data before generating claims. File: <span className="font-medium text-gray-700 dark:text-gray-300">claims_q3_2023.csv</span></p>
        </div>
        
        {/* Stats */}
        <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center justify-center size-12 rounded-full bg-blue-100 dark:bg-blue-900/50">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-300 text-2xl">list_alt</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Rows Uploaded</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">1,520</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
              <div className="flex items-center justify-center size-12 rounded-full bg-red-100 dark:bg-red-900/50">
                <span className="material-symbols-outlined text-red-600 dark:text-red-300 text-2xl">error</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-red-400">Rows with Errors</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-300">12</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center justify-center size-12 rounded-full bg-green-100 dark:bg-green-900/50">
                <span className="material-symbols-outlined text-green-600 dark:text-green-300 text-2xl">check_circle</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-green-400">Rows Ready for Import</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-300">1,508</p>
              </div>
            </div>
          </div>

          {/* Error Table */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Error Details</h2>
            <div className="mt-4 flow-root">
              <div className="-mx-6 -my-2 overflow-x-auto">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Row</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Column</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Error Message</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800/50">
                        <tr>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">25</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">Date of Service</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-red-600 dark:text-red-400">Invalid date format. Expected 'YYYY-MM-DD'.</td>
                        </tr>
                        <tr>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">42</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">CPT Code</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-red-600 dark:text-red-400">Missing required value.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-4">
             <button onClick={() => setView(ViewState.CLAIM_METHOD)} className="flex w-full sm:w-auto min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                Cancel Upload
             </button>
             <button className="flex w-full sm:w-auto min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors">
                Proceed to Claim Generation
             </button>
          </div>
        </div>
      </div>
    </main>
  );
};