import React from 'react';
import { ViewState } from '../types';

interface Props {
  setView: (view: ViewState) => void;
}

export const NewClaimMethod: React.FC<Props> = ({ setView }) => {
  return (
    <main className="flex-1 px-4 py-12 md:px-8 md:py-16 lg:py-24 animate-in zoom-in-95 duration-500">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <h1 className="text-gray-900 dark:text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">Create or Import a Claim</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-normal leading-relaxed max-w-2xl mt-2">Choose the method that matches your workflow. You can upload files, import structured data, or build a claim manually.</p>
        </div>
        
        <div className="relative mt-16 bg-gray-100/60 dark:bg-gray-800/30 rounded-3xl p-2 sm:p-4">
          <div className="absolute inset-0 border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl"></div>
          <div className="relative grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-8">
            
            {/* Card 1 */}
            <div className="flex flex-col rounded-xl shadow-soft bg-white dark:bg-gray-800/80 p-8 sm:p-10 text-left transition-all hover:-translate-y-1 hover:shadow-soft-lg cursor-pointer group" onClick={() => setView(ViewState.UPLOAD_REVIEW)}>
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined !text-4xl text-indigo-600 dark:text-indigo-300">csv</span>
                </div>
                <h3 className="text-xl font-bold leading-tight tracking-[-0.015em] text-gray-900 dark:text-white">Upload CSV</h3>
              </div>
              <p className="mt-6 text-base font-normal leading-relaxed text-gray-600 dark:text-gray-400 flex-grow">Perfect for uploading multiple claims at once — ideal for billing teams bringing in historical claims or bulk data.</p>
              <div className="mt-8">
                <button className="flex w-full min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal shadow-sm hover:bg-primary/90 transition-colors">
                  Upload CSV
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col rounded-xl shadow-soft bg-white dark:bg-gray-800/80 p-8 sm:p-10 text-left transition-all hover:-translate-y-1 hover:shadow-soft-lg cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/40 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined !text-4xl text-teal-600 dark:text-teal-300">data_object</span>
                </div>
                <h3 className="text-xl font-bold leading-tight tracking-[-0.015em] text-gray-900 dark:text-white">Upload JSON</h3>
              </div>
              <p className="mt-6 text-base font-normal leading-relaxed text-gray-600 dark:text-gray-400 flex-grow">Best for technical teams or integrations. Import structured claim data exactly as your system exports it.</p>
               <div className="mt-8">
                <button className="flex w-full min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal shadow-sm hover:bg-primary/90 transition-colors">
                  Upload JSON
                </button>
              </div>
            </div>

            {/* Card 3 */}
            <div className="flex flex-col rounded-xl shadow-soft bg-white dark:bg-gray-800/80 p-8 sm:p-10 text-left transition-all hover:-translate-y-1 hover:shadow-soft-lg cursor-pointer group" onClick={() => setView(ViewState.CLAIM_WIZARD)}>
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined !text-4xl text-amber-600 dark:text-amber-300">edit_note</span>
                </div>
                <h3 className="text-xl font-bold leading-tight tracking-[-0.015em] text-gray-900 dark:text-white">Build From Scratch</h3>
              </div>
              <p className="mt-6 text-base font-normal leading-relaxed text-gray-600 dark:text-gray-400 flex-grow">Use our guided form to enter patient demographics, payer information, diagnoses, and service lines step-by-step.</p>
               <div className="mt-8">
                <button className="flex w-full min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal shadow-sm hover:bg-primary/90 transition-colors">
                  Start Claim
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
};