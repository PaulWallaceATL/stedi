"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const claimId = searchParams.get("id") || "CL-2024-12-001";
  const patientName = searchParams.get("patient") || "Jane Doe";
  const payer = searchParams.get("payer") || "United Healthcare";
  const amount = searchParams.get("amount") || "550.00";

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#f7f8fa] overflow-x-hidden">
      <header className="flex w-full items-center justify-center border-b border-solid border-gray-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between whitespace-nowrap px-10 py-3 w-full max-w-7xl">
          <div className="flex items-center gap-4 text-gray-900">
            <div className="size-6 text-[#137fec]">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 className="text-lg font-bold tracking-tight">Clinix AI Billing</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="hidden md:flex items-center gap-9">
              <Link className="text-gray-800 text-sm font-medium leading-normal" href="/dashboard">Dashboard</Link>
              <Link className="text-gray-800 text-sm font-medium leading-normal" href="/claims/new">Claims</Link>
              <Link className="text-gray-800 text-sm font-medium leading-normal" href="#">Patients</Link>
              <Link className="text-gray-800 text-sm font-medium leading-normal" href="/performance">Reports</Link>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex cursor-pointer items-center justify-center rounded-full h-10 w-10 bg-gray-100 text-gray-800 gap-2 text-sm font-bold">
                <span className="material-symbols-outlined text-xl">settings</span>
              </button>
              <button className="flex cursor-pointer items-center justify-center rounded-full h-10 w-10 bg-gray-100 text-gray-800 gap-2 text-sm font-bold">
                <span className="material-symbols-outlined text-xl">notifications</span>
              </button>
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBs2yODZYHNsbsGS70ZzOd_Ktwc1uWgK7u7jrG4F--NOwBFXSxRRK1Y1b2SoRHFKn1D71VBqSJLlrpiLES-UKbkdgXz5caOHnMPz2paxMZoMi6oCQRfJ4PRmfKbnc-pc4GsCieZY8FArqjlCpJYh1McvsadU5_ycytxJjNhgNZ-7W1WVUVHv3o4jh_h8d4BzPkB7L7ib3ojZ0FNQp5cumvTFmSBliFvytjvQ81WHFVRqJT5hVq9kcVDljpDIU_uGul5dO7qHbdBrpM")'}}></div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-1 justify-center py-12 px-4 sm:px-6 lg:px-8 md:py-16">
        <div className="flex flex-col w-full max-w-2xl flex-1 items-center space-y-8">
          {/* Success Icon */}
          <div className="flex flex-col items-center gap-5 text-center w-full">
            <div className="flex items-center justify-center p-8 rounded-full" style={{background: "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.0) 70%)"}}>
              <div className="flex flex-col items-center justify-center size-20 rounded-full bg-green-500 text-white">
                <span className="material-symbols-outlined !text-5xl" style={{fontVariationSettings: "'wght' 500"}}>check</span>
              </div>
            </div>
            <div className="flex max-w-lg flex-col items-center gap-2">
              <h1 className="text-gray-900 text-3xl font-bold leading-tight tracking-tight text-center">Claim Created Successfully!</h1>
              <p className="text-gray-600 text-base font-normal leading-normal text-center">Your claim has been added to Clinix and is now marked Ready for Submission. You&apos;re all set!</p>
            </div>
          </div>

          {/* Claim Details Card */}
          <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <div className="flex flex-col gap-1.5">
                <p className="text-gray-500 text-sm font-medium leading-normal">Claim ID</p>
                <p className="text-gray-800 text-base font-semibold leading-normal">{claimId}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-gray-500 text-sm font-medium leading-normal">Payer</p>
                <p className="text-gray-800 text-base font-semibold leading-normal">{payer}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-gray-500 text-sm font-medium leading-normal">Patient Name</p>
                <p className="text-gray-800 text-base font-semibold leading-normal">{patientName}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-gray-500 text-sm font-medium leading-normal">Total Billed Amount</p>
                <p className="text-gray-800 text-base font-semibold leading-normal">${amount}</p>
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <p className="text-gray-500 text-sm font-medium leading-normal">Current Status</p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700">
                    <span className="size-2 rounded-full bg-blue-500"></span>
                    Ready for Submission
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2 border-t border-gray-200 pt-6">
                <p className="text-gray-500 text-sm font-medium leading-normal">Created on</p>
                <p className="text-gray-800 text-base font-normal leading-normal">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} at {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4 mt-2">
              <p className="text-gray-600 text-sm font-medium leading-normal">
                Next: Review the claim or proceed with <Link href="/dashboard" className="text-[#137fec] hover:underline font-semibold">submission</Link>.
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="w-full max-w-lg pt-4 pb-2">
            <div className="flex w-full items-center justify-center text-xs font-medium">
              <div className="flex items-center text-green-600 font-semibold">
                Created
                <div className="h-px w-12 bg-gray-200 mx-3"></div>
              </div>
              <div className="flex items-center text-blue-600 font-semibold">
                Ready for Submission
                <div className="h-px w-12 bg-gray-200 mx-3"></div>
              </div>
              <div className="flex items-center text-gray-400">
                Submitted
                <div className="h-px w-12 bg-gray-200 mx-3"></div>
              </div>
              <div className="text-gray-400">Paid</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col w-full max-w-lg mt-4 space-y-3">
            <Link
              href={`/claims/${claimId}`}
              className="flex items-center justify-center rounded-lg h-12 px-6 bg-[#137fec] text-white text-base font-semibold shadow-md hover:bg-[#137fec]/90 gap-2"
            >
              <span className="material-symbols-outlined text-xl">visibility</span>
              <span>View Claim Details</span>
            </Link>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/claims/new"
                className="flex items-center justify-center rounded-lg h-11 px-4 bg-transparent text-gray-600 text-sm font-medium flex-1 hover:bg-gray-100 gap-2 border border-gray-200"
              >
                <span className="material-symbols-outlined text-lg">add_box</span>
                <span>Create Another Claim</span>
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center justify-center rounded-lg h-11 px-4 bg-transparent text-gray-600 text-sm font-medium flex-1 hover:bg-gray-100 gap-2 border border-gray-200"
              >
                <span className="material-symbols-outlined text-lg">dashboard</span>
                <span>Go to Claims Dashboard</span>
              </Link>
            </div>
          </div>

          {/* Upload Link */}
          <div className="flex items-center justify-center w-full max-w-lg mt-6 text-sm">
            <Link href="#" className="text-[#137fec] hover:underline font-medium flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">upload_file</span>
              Upload supporting documents (optional)
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ClaimSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
