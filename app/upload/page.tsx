"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ValidationRow = {
  row: number;
  patientName: string;
  payerId: string;
  serviceDate: string;
  cptCode: string;
  billedAmount: string;
  hasError: boolean;
  errorField?: string;
  errorMessage?: string;
};

type ErrorDetail = {
  row: number;
  column: string;
  message: string;
};

type FieldMapping = {
  source: string;
  target: string;
  mapped: boolean;
};

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [validRows, setValidRows] = useState(0);
  const [errorRows, setErrorRows] = useState(0);
  const [warningRows, setWarningRows] = useState(0);
  const [previewData, setPreviewData] = useState<ValidationRow[]>([]);
  const [errorDetails, setErrorDetails] = useState<ErrorDetail[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Simulate validation
      setTimeout(() => {
        simulateValidation();
      }, 1000);
    }
  };

  const simulateValidation = () => {
    setValidating(true);
    setTimeout(() => {
      // Simulate validation results
      setTotalRows(1520);
      setValidRows(1508);
      setErrorRows(12);
      setWarningRows(3);
      
      // Simulate error details
      setErrorDetails([
        { row: 25, column: "Date of Service", message: "Invalid date format. Expected 'YYYY-MM-DD'." },
        { row: 42, column: "CPT Code", message: "Missing required value." },
        { row: 117, column: "Payer ID", message: "Payer ID 'X1234' not found in our system." },
      ]);

      // Simulate field mappings
      setFieldMappings([
        { source: "PatientID", target: "Patient ID", mapped: true },
        { source: "ServiceDate", target: "Date of Service", mapped: true },
        { source: "Patient_Name", target: "Unmapped", mapped: false },
      ]);
      
      // Simulate preview data
      setPreviewData([
        { row: 25, patientName: "P0025", payerId: "PAY123", serviceDate: "2023.08.15", cptCode: "99213", billedAmount: "$125.00", hasError: true, errorField: "serviceDate", errorMessage: "Invalid date format" },
        { row: 42, patientName: "P0042", payerId: "PAY456", serviceDate: "2023-08-16", cptCode: "", billedAmount: "$250.50", hasError: true, errorField: "cptCode", errorMessage: "Missing CPT Code" },
        { row: 117, patientName: "P0117", payerId: "X1234", serviceDate: "2023-08-17", cptCode: "99214", billedAmount: "$150.00", hasError: true, errorField: "payerId", errorMessage: "Payer not found" },
      ]);
      
      setValidating(false);
      setValidated(true);
    }, 2000);
  };

  const handleImport = () => {
    router.push("/dashboard");
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#f6f7f8]">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-gray-200 px-10 py-3 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4 text-gray-800">
          <div className="size-6 text-[#137fec]">
            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z"></path>
            </svg>
          </div>
          <h2 className="text-gray-900 text-lg font-bold leading-tight tracking-[-0.015em]">Clinix AI Billing</h2>
        </div>
        <div className="flex flex-1 justify-end gap-6 items-center">
          <div className="hidden md:flex items-center gap-8">
            <Link className="text-gray-700 hover:text-[#137fec] text-sm font-medium leading-normal" href="/dashboard">Dashboard</Link>
            <Link className="text-[#137fec] font-semibold text-sm leading-normal" href="/upload">Upload</Link>
            <Link className="text-gray-700 hover:text-[#137fec] text-sm font-medium leading-normal" href="/denials">Denials</Link>
            <Link className="text-gray-700 hover:text-[#137fec] text-sm font-medium leading-normal" href="/performance">Reports</Link>
            <Link className="text-gray-700 hover:text-[#137fec] text-sm font-medium leading-normal" href="/settings">Settings</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/claims/new"
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#137fec] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#0f6acc] gap-2"
            >
              <span className="truncate">Create Claim</span>
            </Link>
            <button className="flex cursor-pointer items-center justify-center rounded-lg h-10 bg-gray-100 text-gray-900 text-sm font-bold min-w-0 px-2.5">
              <span className="material-symbols-outlined text-xl">notifications</span>
            </button>
            <button className="flex cursor-pointer items-center justify-center rounded-lg h-10 bg-gray-100 text-gray-900 text-sm font-bold min-w-0 px-2.5">
              <span className="material-symbols-outlined text-xl">help</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-10 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 mb-8">
            <h1 className="text-gray-900 text-3xl font-bold leading-tight tracking-[-0.033em]">Review Uploaded Claims</h1>
            <p className="text-gray-600 text-base font-normal leading-normal">
              Validate your data before generating claims. {file && <span className="font-medium text-gray-700">File: {file.name}</span>}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-8">
              {!validated ? (
                <div className="flex flex-col gap-6 p-8 bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="flex flex-col items-center justify-center gap-6 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
                    <div className="rounded-full bg-[#137fec]/10 p-4 text-[#137fec]">
                      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-gray-900 text-xl font-bold leading-tight tracking-[-0.015em]">Upload CSV File</p>
                      <p className="text-gray-500 text-sm font-normal leading-normal">
                        {validating ? "Validating your file..." : "Drag & drop your file here or click to browse."}
                      </p>
                    </div>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept=".csv"
                        onChange={handleFileSelect}
                        disabled={validating}
                      />
                      <span className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-6 bg-[#137fec] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#0f6acc] transition-colors shadow-sm">
                        {validating ? "Validating..." : "Select CSV File"}
                      </span>
                    </label>
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <p className="text-gray-500 text-xs font-normal">Accepted format: .csv · Max file size: 5MB · Use our template for fastest onboarding.</p>
                    <div className="flex justify-center items-center gap-6">
                      <a className="text-[#137fec] hover:text-[#0f6acc] text-sm font-medium leading-normal underline" href="#">Download CSV Template</a>
                      <a className="text-[#137fec] hover:text-[#0f6acc] text-sm font-medium leading-normal underline" href="#">See Required Fields</a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8 space-y-8">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-center size-12 rounded-full bg-blue-100">
                        <span className="material-symbols-outlined text-blue-600 text-2xl">list_alt</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Rows Uploaded</p>
                        <p className="text-2xl font-bold text-gray-900">{totalRows.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-red-50">
                      <div className="flex items-center justify-center size-12 rounded-full bg-red-100">
                        <span className="material-symbols-outlined text-red-600 text-2xl">error</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Rows with Errors</p>
                        <p className="text-2xl font-bold text-red-600">{errorRows}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-green-50">
                      <div className="flex items-center justify-center size-12 rounded-full bg-green-100">
                        <span className="material-symbols-outlined text-green-600 text-2xl">check_circle</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Rows Ready for Import</p>
                        <p className="text-2xl font-bold text-green-600">{validRows.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Error Details */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Error Details</h2>
                    <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Row</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Column</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Error Message</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {errorDetails.map((err, idx) => (
                            <tr key={idx}>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{err.row}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{err.column}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-red-600">{err.message}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Field Mapping */}
                  <div className="border-t border-gray-200 pt-8">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-900">Map Fields</h2>
                      <button className="flex items-center justify-center gap-2 rounded-lg h-9 px-4 bg-gray-100 text-gray-800 text-sm font-medium hover:bg-gray-200 transition-colors">
                        <span className="material-symbols-outlined text-base">swap_horiz</span>
                        <span>Map Fields</span>
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">We&apos;ve detected some mismatched columns. Please map them to the correct Clinix AI fields.</p>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
                      {fieldMappings.map((mapping, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className={`font-medium ${mapping.mapped ? 'text-gray-700' : 'text-red-600'} w-1/3`}>{mapping.source}</span>
                          <span className="material-symbols-outlined text-gray-400">arrow_right_alt</span>
                          <span className={`font-medium ${mapping.mapped ? 'text-green-600' : 'text-red-600'}`}>{mapping.target}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Data Preview */}
                  <div className="border-t border-gray-200 pt-8">
                    <h2 className="text-xl font-bold text-gray-900">Data Preview</h2>
                    <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Patient ID</th>
                              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date of Service</th>
                              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Payer ID</th>
                              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">CPT Code</th>
                              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Charge</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {previewData.map((row) => (
                              <tr key={row.row}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{row.patientName}</td>
                                <td className={`whitespace-nowrap px-3 py-4 text-sm ${row.errorField === 'serviceDate' ? 'bg-red-50 text-red-700' : 'text-gray-500'}`}>
                                  {row.serviceDate}
                                </td>
                                <td className={`whitespace-nowrap px-3 py-4 text-sm ${row.errorField === 'payerId' ? 'bg-red-50 text-red-700' : 'text-gray-500'}`}>
                                  {row.payerId}
                                </td>
                                <td className={`whitespace-nowrap px-3 py-4 text-sm ${row.errorField === 'cptCode' ? 'bg-red-50 text-red-700' : 'text-gray-500'}`}>
                                  {row.cptCode || ''}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{row.billedAmount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-gray-200 pt-8">
                    <button className="flex w-full sm:w-auto cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-gray-200 text-gray-800 text-sm font-bold hover:bg-gray-300 transition-colors">
                      Cancel Upload
                    </button>
                    <button className="flex w-full sm:w-auto cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-gray-200 text-gray-800 text-sm font-bold hover:bg-gray-300 transition-colors">
                      Fix Errors
                    </button>
                    <button
                      onClick={handleImport}
                      className="flex w-full sm:w-auto cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-[#137fec] text-white text-sm font-bold hover:bg-[#137fec]/90 transition-colors"
                    >
                      Proceed to Claim Generation
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-28 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-[#137fec]/10 text-[#137fec] p-2 rounded-lg mt-1">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Before You Upload</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Our system auto-validates ICD-10, CPT, and payer IDs to help you avoid denied claims.
                    </p>
                  </div>
                </div>
                <ul className="space-y-4 text-sm text-gray-600 pl-2">
                  <li className="flex items-start gap-3">
                    <span className="text-[#137fec] mt-0.5">✓</span>
                    <span>Use our CSV template for fastest setup.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#137fec] mt-0.5">✓</span>
                    <span>Field names must match exactly.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#137fec] mt-0.5">✓</span>
                    <span>Multi-line claims should share the same claim ID.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#137fec] mt-0.5">ⓘ</span>
                    <span>ICD-10 and CPT codes are auto-validated.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

