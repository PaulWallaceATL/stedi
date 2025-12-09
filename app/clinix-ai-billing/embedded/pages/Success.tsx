import React from 'react';
import { ViewState } from '../types';

interface Props {
  setView: (view: ViewState) => void;
}

export const Success: React.FC<Props> = ({ setView }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark font-display relative h-full">
      <div className="relative flex min-h-full w-full flex-col">
        {/* Success Page Header */}
        <header className="flex w-full items-center justify-center border-b border-solid border-gray-200/80 dark:border-gray-700/80 bg-white/80 dark:bg-background-dark/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between whitespace-nowrap px-10 py-3 w-full max-w-7xl">
            <div className="flex items-center gap-4 text-gray-900 dark:text-white">
              <span className="material-symbols-outlined text-primary text-3xl">spark</span>
              <h2 className="text-lg font-bold tracking-[-0.015em]">Clinix AI Billing</h2>
            </div>
            <div className="flex flex-1 justify-end gap-8">
              <div className="hidden md:flex items-center gap-9">
                <a className="text-gray-800 dark:text-gray-300 text-sm font-medium leading-normal cursor-pointer hover:text-primary" onClick={() => setView(ViewState.DASHBOARD)}>Dashboard</a>
                <a className="text-gray-800 dark:text-gray-300 text-sm font-medium leading-normal cursor-pointer hover:text-primary">Claims</a>
                <a className="text-gray-800 dark:text-gray-300 text-sm font-medium leading-normal cursor-pointer hover:text-primary">Patients</a>
                <a className="text-gray-800 dark:text-gray-300 text-sm font-medium leading-normal cursor-pointer hover:text-primary">Reports</a>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0">
                  <span className="material-symbols-outlined text-xl">settings</span>
                </button>
                <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0">
                  <span className="material-symbols-outlined text-xl">notifications</span>
                </button>
                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 cursor-pointer" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBs2yODZYHNsbsGS70ZzOd_Ktwc1uWgK7u7jrG4F--NOwBFXSxRRK1Y1b2SoRHFKn1D71VBqSJLlrpiLES-UKbkdgXz5caOHnMPz2paxMZoMi6oCQRfJ4PRmfKbnc-pc4GsCieZY8FArqjlCpJYh1McvsadU5_ycytxJjNhgNZ-7W1WVUVHv3o4jh_h8d4BzPkB7L7ib3ojZ0FNQp5cumvTFmSBliFvytjvQ81WHFVRqJT5hVq9kcVDljpDIU_uGul5dO7qHbdBrpM")'}}></div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex flex-1 justify-center py-12 px-4 sm:px-6 lg:px-8 md:py-16">
          <div className="layout-content-container flex flex-col w-full max-w-2xl flex-1 items-center space-y-8">
            <div className="flex flex-col items-center gap-5 text-center w-full">
              <div className="flex items-center justify-center p-8 rounded-full" style={{background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.0) 70%)'}}>
                <div className="flex flex-col items-center justify-center size-20 rounded-full bg-green-500 text-white">
                  <span className="material-symbols-outlined !text-5xl" style={{fontVariationSettings: "'wght' 500"}}>check</span>
                </div>
              </div>
              <div className="flex max-w-lg flex-col items-center gap-2">
                <h1 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight tracking-[-0.015em] text-center">Claim Created Successfully!</h1>
                <p className="text-gray-600 dark:text-gray-300 text-base font-normal leading-normal text-center">Your claim has been added to Clinix and is now marked Ready for Submission. You’re all set!</p>
              </div>
            </div>
            
            <div className="w-full bg-white dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                <div className="flex flex-col gap-1.5">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-normal">Claim ID</p>
                  <p className="text-gray-800 dark:text-gray-200 text-base font-semibold leading-normal">CL-2024-08-123</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-normal">Payer</p>
                  <p className="text-gray-800 dark:text-gray-200 text-base font-semibold leading-normal">United Healthcare</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-normal">Patient Name</p>
                  <p className="text-gray-800 dark:text-gray-200 text-base font-semibold leading-normal">Jane Doe</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-normal">Total Billed Amount</p>
                  <p className="text-gray-800 dark:text-gray-200 text-base font-semibold leading-normal">$550.00</p>
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-normal">Current Status</p>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-900/50 px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300">
                      <span className="size-2 rounded-full bg-blue-500"></span>
                      Ready for Submission
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2 border-t border-gray-200 dark:border-gray-800 pt-6">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-normal">Created on</p>
                  <p className="text-gray-800 dark:text-gray-200 text-base font-normal leading-normal">August 12, 2024 at 10:30 AM</p>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-2">
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium leading-normal">Next: Review the claim or proceed with <a className="text-primary hover:underline font-semibold" href="#">submission</a>.</p>
              </div>
            </div>

            <div className="w-full max-w-lg pt-4 pb-2">
              <div className="flex w-full items-center justify-center text-xs font-medium">
                <div className="flex items-center text-green-600 dark:text-green-400 font-semibold after:content-[''] after:h-px after:flex-grow after:bg-gray-200 dark:after:bg-gray-700 after:mx-3 after:w-16">Created</div>
                <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold after:content-[''] after:h-px after:flex-grow after:bg-gray-200 dark:after:bg-gray-700 after:mx-3 after:w-16">Ready for Submission</div>
                <div className="flex items-center text-gray-400 dark:text-gray-500 after:content-[''] after:h-px after:flex-grow after:bg-gray-200 dark:after:bg-gray-700 after:mx-3 after:w-16">Submitted</div>
                <div className="text-gray-400 dark:text-gray-500">Paid</div>
              </div>
            </div>

            <div className="flex flex-col w-full max-w-lg mt-4 space-y-3">
              <button onClick={() => setView(ViewState.CLAIM_DETAIL)} className="flex min-w-[84px] max-w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-base font-semibold leading-normal tracking-[0.015em] shadow-md hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary gap-2">
                <span className="material-symbols-outlined text-xl">visibility</span>
                <span className="truncate">View Claim Details</span>
              </button>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => setView(ViewState.CLAIM_METHOD)} className="flex min-w-[84px] max-w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-4 bg-transparent text-gray-600 dark:text-gray-300 text-sm font-medium leading-normal tracking-[0.015em] flex-1 hover:bg-gray-100 dark:hover:bg-gray-800 gap-2 border border-gray-200 dark:border-gray-700/80">
                  <span className="material-symbols-outlined text-lg">add_box</span>
                  <span className="truncate">Create Another Claim</span>
                </button>
                <button onClick={() => setView(ViewState.DASHBOARD)} className="flex min-w-[84px] max-w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-4 bg-transparent text-gray-600 dark:text-gray-300 text-sm font-medium leading-normal tracking-[0.015em] flex-1 hover:bg-gray-100 dark:hover:bg-gray-800 gap-2 border border-gray-200 dark:border-gray-700/80">
                  <span className="material-symbols-outlined text-lg">dashboard</span>
                  <span className="truncate">Go to Claims Dashboard</span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-center w-full max-w-lg mt-6 text-sm">
                <a className="text-primary hover:underline font-medium flex items-center gap-1.5" href="#">
                    <span className="material-symbols-outlined text-base">upload_file</span>
                    Upload supporting documents (optional)
                </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};