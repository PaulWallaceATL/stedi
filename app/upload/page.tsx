"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { ModernNav } from "@/components/ui/ModernNav";

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


// Stat card component - Dune themed with functional colors
function StatCard({ title, value, icon, color, delay = 0 }: { title: string; value: string | number; icon: string; color: string; delay?: number }) {
  const colorClasses: Record<string, { bg: string; icon: string; text: string }> = {
    blue: { bg: "from-sky-500/10 to-sky-600/5", icon: "text-sky-400", text: "text-sky-400" },
    red: { bg: "from-rose-500/10 to-rose-600/5", icon: "text-rose-400", text: "text-rose-400" },
    green: { bg: "from-emerald-500/10 to-emerald-600/5", icon: "text-emerald-400", text: "text-emerald-400" },
    amber: { bg: "from-amber-500/10 to-amber-600/5", icon: "text-amber-400", text: "text-amber-400" },
  };
  const classes = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`rounded-2xl bg-gradient-to-br ${classes.bg} border border-[#c97435]/10 p-5`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-[#1a1512]/50 flex items-center justify-center ${classes.icon}`}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <div>
          <p className="text-sm text-[#a67c52]">{title}</p>
          <p className={`text-2xl font-bold ${classes.text}`}>{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

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
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setTimeout(() => simulateValidation(), 1000);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "text/csv" || droppedFile?.name.endsWith(".csv")) {
      setFile(droppedFile);
      setTimeout(() => simulateValidation(), 1000);
    }
  };

  const simulateValidation = () => {
    setValidating(true);
    setTimeout(() => {
      setTotalRows(1520);
      setValidRows(1508);
      setErrorRows(12);
      setWarningRows(3);
      
      setErrorDetails([
        { row: 25, column: "Date of Service", message: "Invalid date format. Expected 'YYYY-MM-DD'." },
        { row: 42, column: "CPT Code", message: "Missing required value." },
        { row: 117, column: "Payer ID", message: "Payer ID 'X1234' not found in our system." },
      ]);

      setFieldMappings([
        { source: "PatientID", target: "Patient ID", mapped: true },
        { source: "ServiceDate", target: "Date of Service", mapped: true },
        { source: "Patient_Name", target: "Unmapped", mapped: false },
      ]);
      
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
    <AuroraBackground>
      <ModernNav />

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#e8dcc8]">Upload Claims</h2>
          <p className="text-[#8b7355] mt-1">
            Validate and import claims from CSV files
            {file && <span className="text-[#c97435] ml-2">• {file.name}</span>}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {!validated ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="rounded-2xl bg-[#1a1512]/50 border border-[#c97435]/10 overflow-hidden"
                >
                  <div
                    className={`p-8 border-2 border-dashed m-6 rounded-xl transition-all ${
                      isDragging 
                        ? "border-[#c97435] bg-[#c97435]/5" 
                        : "border-[#c97435]/20 hover:border-[#c97435]/40"
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center text-center">
                      <motion.div
                        animate={validating ? { rotate: 360 } : {}}
                        transition={validating ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
                        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#c97435]/20 to-[#8b5a2b]/20 flex items-center justify-center mb-6"
                      >
                        <span className="material-symbols-outlined text-4xl text-[#c97435]">
                          {validating ? "sync" : "cloud_upload"}
                        </span>
                      </motion.div>
                      
                      <h3 className="text-xl font-bold text-[#e8dcc8] mb-2">
                        {validating ? "Validating your file..." : "Upload CSV File"}
                      </h3>
                      <p className="text-[#8b7355] text-sm mb-6 max-w-md">
                        {validating 
                          ? "We're checking your data for errors and mapping fields automatically." 
                          : "Drag & drop your file here or click to browse. We'll validate ICD-10, CPT, and payer IDs automatically."}
                      </p>

                      {!validating && (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            accept=".csv"
                            onChange={handleFileSelect}
                            disabled={validating}
                          />
                          <motion.span
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#c97435] to-[#8b5a2b] text-[#0a0908] font-semibold shadow-lg shadow-[#c97435]/20"
                          >
                            <span className="material-symbols-outlined">folder_open</span>
                            Select CSV File
                          </motion.span>
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="px-6 pb-6 flex flex-col items-center gap-4">
                    <p className="text-xs text-[#6b5a45]">Accepted format: .csv · Max file size: 5MB</p>
                    <div className="flex items-center gap-4">
                      <a className="text-sm text-[#c97435] hover:underline" href="#">Download CSV Template</a>
                      <span className="text-[#6b5a45]">•</span>
                      <a className="text-sm text-[#c97435] hover:underline" href="#">View Required Fields</a>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard title="Total Rows" value={totalRows.toLocaleString()} icon="list_alt" color="blue" delay={0} />
                    <StatCard title="Rows with Errors" value={errorRows} icon="error" color="red" delay={0.1} />
                    <StatCard title="Ready to Import" value={validRows.toLocaleString()} icon="check_circle" color="green" delay={0.2} />
                  </div>

                  {/* Error Details - RED for errors */}
                  <div className="rounded-2xl bg-[#1a1512]/50 border border-[#c97435]/10 overflow-hidden">
                    <div className="p-6 border-b border-[#c97435]/10">
                      <h3 className="text-lg font-semibold text-[#e8dcc8]">Error Details</h3>
                      <p className="text-sm text-[#8b7355]">{errorRows} rows need attention</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#c97435]/10">
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b5a45] uppercase">Row</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b5a45] uppercase">Column</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b5a45] uppercase">Error</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#c97435]/10">
                          {errorDetails.map((err, idx) => (
                            <tr key={idx} className="hover:bg-[#c97435]/5">
                              <td className="px-6 py-4 text-sm font-mono text-[#a67c52]">{err.row}</td>
                              <td className="px-6 py-4 text-sm text-[#a67c52]">{err.column}</td>
                              <td className="px-6 py-4 text-sm text-rose-400">{err.message}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Field Mappings */}
                  <div className="rounded-2xl bg-[#1a1512]/50 border border-[#c97435]/10 overflow-hidden">
                    <div className="p-6 border-b border-[#c97435]/10 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-[#e8dcc8]">Field Mappings</h3>
                        <p className="text-sm text-[#8b7355]">We detected some columns that need mapping</p>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1512] border border-[#c97435]/20 text-[#a67c52] text-sm font-medium hover:bg-[#c97435]/10 transition-colors">
                        <span className="material-symbols-outlined text-lg">swap_horiz</span>
                        Map Fields
                      </button>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {fieldMappings.map((mapping, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-[#0a0908]/30">
                            <span className={`font-medium ${mapping.mapped ? "text-[#a67c52]" : "text-rose-400"}`}>{mapping.source}</span>
                            <span className="material-symbols-outlined text-[#6b5a45]">arrow_forward</span>
                            <span className={`font-medium ${mapping.mapped ? "text-emerald-400" : "text-rose-400"}`}>{mapping.target}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Data Preview */}
                  <div className="rounded-2xl bg-[#1a1512]/50 border border-[#c97435]/10 overflow-hidden">
                    <div className="p-6 border-b border-[#c97435]/10">
                      <h3 className="text-lg font-semibold text-[#e8dcc8]">Data Preview</h3>
                      <p className="text-sm text-[#8b7355]">Showing rows with errors</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#c97435]/10">
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b5a45] uppercase">Patient ID</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b5a45] uppercase">Service Date</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b5a45] uppercase">Payer ID</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b5a45] uppercase">CPT Code</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b5a45] uppercase">Charge</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#c97435]/10">
                          {previewData.map((row) => (
                            <tr key={row.row} className="hover:bg-[#c97435]/5">
                              <td className="px-6 py-4 text-sm text-[#a67c52]">{row.patientName}</td>
                              <td className={`px-6 py-4 text-sm ${row.errorField === "serviceDate" ? "bg-rose-500/10 text-rose-400" : "text-[#a67c52]"}`}>
                                {row.serviceDate}
                              </td>
                              <td className={`px-6 py-4 text-sm ${row.errorField === "payerId" ? "bg-rose-500/10 text-rose-400" : "text-[#a67c52]"}`}>
                                {row.payerId}
                              </td>
                              <td className={`px-6 py-4 text-sm font-mono ${row.errorField === "cptCode" ? "bg-rose-500/10 text-rose-400" : "text-[#a67c52]"}`}>
                                {row.cptCode || "—"}
                              </td>
                              <td className="px-6 py-4 text-sm text-[#a67c52]">{row.billedAmount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl bg-gradient-to-br from-[#c97435]/10 to-[#8b5a2b]/10 border border-[#c97435]/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#c97435]/20 flex items-center justify-center text-[#c97435]">
                    <span className="material-symbols-outlined">verified</span>
                  </div>
                  <h3 className="text-[#e8dcc8] font-semibold">Before You Upload</h3>
                </div>
                <p className="text-sm text-[#8b7355] mb-4">
                  Our system auto-validates ICD-10, CPT, and payer IDs to help you avoid denied claims.
                </p>
                <ul className="space-y-3 text-sm text-[#a67c52]">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-emerald-400 text-lg mt-0.5">check_circle</span>
                    Use our CSV template for fastest setup
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-emerald-400 text-lg mt-0.5">check_circle</span>
                    Field names must match exactly
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-emerald-400 text-lg mt-0.5">check_circle</span>
                    Multi-line claims share the same claim ID
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#c97435] text-lg mt-0.5">info</span>
                    ICD-10 and CPT codes are auto-validated
                  </li>
                </ul>
              </div>

              {validated && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-[#1a1512]/50 border border-[#c97435]/10 p-6 space-y-4"
                >
                  <h3 className="text-[#e8dcc8] font-semibold">Actions</h3>
                  <div className="space-y-2">
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a1512] border border-[#c97435]/20 text-[#a67c52] font-medium hover:bg-[#c97435]/10 transition-colors">
                      <span className="material-symbols-outlined text-lg">cancel</span>
                      Cancel Upload
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a1512] border border-[#c97435]/20 text-[#a67c52] font-medium hover:bg-[#c97435]/10 transition-colors">
                      <span className="material-symbols-outlined text-lg">build</span>
                      Fix Errors
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleImport}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#c97435] to-[#8b5a2b] text-[#0a0908] font-semibold shadow-lg shadow-[#c97435]/20"
                    >
                      <span className="material-symbols-outlined text-lg">check_circle</span>
                      Proceed to Import
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </AuroraBackground>
  );
}
