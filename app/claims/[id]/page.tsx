"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { claimStatus, listTransactions, getTransactionOutput, createAttachment } from "../../lib/stediClient";
import AIClaimIntelligence from "../../components/AIClaimIntelligence";
import { motion, AnimatePresence } from "framer-motion";

// Types
type ClaimEvent = {
  id: string;
  type: string;
  payload: any;
  created_at: string;
  transaction_id?: string;
};

// Helper functions
function formatCurrency(value: number | string | null | undefined) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (num === null || num === undefined || isNaN(num)) return "$0.00";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
}

function formatDate(value: string | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", options || { month: "short", day: "numeric", year: "numeric" });
}

function formatDateFromYYYYMMDD(value: string | null | undefined) {
  if (!value) return "—";
  const digits = String(value).replace(/\D/g, "");
  if (digits.length !== 8) return "—";
  const y = digits.slice(0, 4);
  const m = digits.slice(4, 6);
  const d = digits.slice(6, 8);
  return new Date(`${y}-${m}-${d}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Status badge component - FUNCTIONAL COLORS retained
function StatusBadge({ status }: { status: string | null | undefined }) {
  const key = (status || "").toLowerCase();
  const config = {
    accepted: { label: "Accepted", bg: "bg-emerald-500/10", text: "text-emerald-400", icon: "check_circle", border: "border-emerald-500/30" },
    paid: { label: "Paid", bg: "bg-emerald-500/10", text: "text-emerald-400", icon: "payments", border: "border-emerald-500/30" },
    posted: { label: "Posted", bg: "bg-emerald-500/10", text: "text-emerald-400", icon: "verified", border: "border-emerald-500/30" },
    success: { label: "Success", bg: "bg-emerald-500/10", text: "text-emerald-400", icon: "task_alt", border: "border-emerald-500/30" },
    denied: { label: "Denied", bg: "bg-rose-500/10", text: "text-rose-400", icon: "cancel", border: "border-rose-500/30" },
    rejected: { label: "Rejected", bg: "bg-rose-500/10", text: "text-rose-400", icon: "block", border: "border-rose-500/30" },
    submitted: { label: "Submitted", bg: "bg-sky-500/10", text: "text-sky-400", icon: "send", border: "border-sky-500/30" },
    sent: { label: "Sent", bg: "bg-sky-500/10", text: "text-sky-400", icon: "outgoing_mail", border: "border-sky-500/30" },
    pending: { label: "Pending", bg: "bg-amber-500/10", text: "text-amber-400", icon: "hourglass_empty", border: "border-amber-500/30" },
    review: { label: "Needs Review", bg: "bg-amber-500/10", text: "text-amber-400", icon: "rate_review", border: "border-amber-500/30" },
  }[key] || { label: "Draft", bg: "bg-[#6b5a45]/10", text: "text-[#8b7355]", icon: "draft", border: "border-[#6b5a45]/30" };

  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${config.bg} ${config.text} border ${config.border}`}>
      <span className="material-symbols-outlined text-base">{config.icon}</span>
      {config.label}
    </span>
  );
}

// Timeline event component - Dune themed
function TimelineEvent({ event, isLast }: { event: ClaimEvent; isLast: boolean }) {
  const typeConfig: Record<string, { icon: string; label: string; color: string }> = {
    submission: { icon: "send", label: "Claim Submitted", color: "text-sky-400" },
    status: { icon: "sync", label: "Status Check (277)", color: "text-[#c97435]" },
    transaction_prefill: { icon: "link", label: "Transaction Linked", color: "text-[#a67c52]" },
    transaction_output: { icon: "receipt_long", label: "Remittance (835)", color: "text-emerald-400" },
    attachment: { icon: "attach_file", label: "Attachment Sent (275)", color: "text-amber-400" },
    ai_analysis: { icon: "visibility", label: "AI Analysis", color: "text-[#c97435]" },
  };
  
  const config = typeConfig[event.type] || { icon: "event", label: event.type, color: "text-[#6b5a45]" };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full bg-[#1a1512] border border-[#c97435]/20 flex items-center justify-center ${config.color}`}>
          <span className="material-symbols-outlined text-lg">{config.icon}</span>
        </div>
        {!isLast && <div className="w-px h-full bg-[#c97435]/20 my-2" />}
      </div>
      <div className="pb-6 flex-1">
        <div className="flex items-center justify-between">
          <p className={`font-medium ${config.color}`}>{config.label}</p>
          <p className="text-xs text-[#6b5a45]">{formatDate(event.created_at, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
        </div>
        {event.transaction_id && (
          <p className="text-xs text-[#6b5a45] mt-1 font-mono">TXN: {event.transaction_id.slice(0, 8)}...</p>
        )}
      </div>
    </div>
  );
}

// Service line component - Dune themed
function ServiceLine({ line, index }: { line: any; index: number }) {
  const ps = line?.professionalService || {};
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center justify-between p-4 bg-[#1a1512]/30 rounded-xl border border-[#c97435]/10 hover:border-[#c97435]/30 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-[#c97435]/10 flex items-center justify-center">
          <span className="text-[#c97435] font-bold text-sm">{index + 1}</span>
        </div>
        <div>
          <p className="font-semibold text-[#e8dcc8]">
            {ps.procedureCode || "—"}
            {ps.procedureModifiers?.length > 0 && (
              <span className="ml-2 text-[#6b5a45] font-normal">
                ({ps.procedureModifiers.join(", ")})
              </span>
            )}
          </p>
          <p className="text-sm text-[#8b7355]">
            {formatDateFromYYYYMMDD(line.serviceDate)} • {ps.serviceUnitCount || 1} unit(s)
          </p>
        </div>
      </div>
      <p className="text-lg font-bold text-[#e8dcc8]">
        {formatCurrency(ps.lineItemChargeAmount)}
      </p>
    </motion.div>
  );
}

// Main component
export default function ClaimDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [data, setData] = useState<any>(null);
  const [events, setEvents] = useState<ClaimEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingTxn, setLoadingTxn] = useState(false);
  const [txnId, setTxnId] = useState<string>("");
  const [showDevTools, setShowDevTools] = useState(false);
  const [statusResult, setStatusResult] = useState<any>(null);
  const [txnResult, setTxnResult] = useState<any>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  
  const supabaseMissing = !supabase;

  // Load claim data
  useEffect(() => {
    const load = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      try {
        const { data: row, error: claimErr } = await supabase.from("claims").select("*").eq("id", id).single();
        if (claimErr) throw claimErr;
        if (row) setData(row);
        
        try {
          const { data: evts } = await supabase
            .from("claim_status_events")
            .select("*")
            .eq("claim_id", id)
            .order("created_at", { ascending: false })
            .limit(20);
          if (evts) setEvents(evts as ClaimEvent[]);
        } catch (evtErr) {
          console.warn("Could not load claim events:", evtErr);
        }
      } catch (err) {
        console.error("Failed to load claim:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  // Auto-check status for non-final claims
  useEffect(() => {
    if (!data || !supabase) return;
    const key = String(data.status || "").toLowerCase();
    const isFinal = ["accepted", "paid", "posted", "success", "denied", "rejected"].includes(key);
    if (!isFinal && !loadingStatus) {
      handleCheckStatus();
    }
  }, [data?.id]);

  // Derived values
  const claimPayload = data?.payload || {};
  const claimInfo = claimPayload?.claimInformation || {};
  const subscriber = claimPayload?.subscriber || {};
  const billing = claimPayload?.billing || {};
  const receiver = claimPayload?.receiver || {};
  const serviceLines = useMemo(() => Array.isArray(claimInfo?.serviceLines) ? claimInfo.serviceLines : [], [claimInfo]);
  const diagnoses = useMemo(() => claimInfo?.healthCareCodeInformation || [], [claimInfo]);

  const showNotification = (type: "success" | "error" | "info", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCheckStatus = async () => {
    if (!data) return;
    
    const normalizeYYYYMMDD = (value: any) => {
      const digits = String(value ?? "").replace(/\D/g, "");
      return digits.length === 8 ? digits : null;
    };

    const controlNumber = claimPayload?.controlNumber || claimInfo?.patientControlNumber || null;
    const tradingPartnerServiceId = claimPayload?.tradingPartnerServiceId || data?.trading_partner_service_id || null;
    const serviceDates = serviceLines
      .map((l: any) => normalizeYYYYMMDD(l?.serviceDate ?? l?.serviceDates?.dateTimePeriod))
      .filter(Boolean) as string[];
    serviceDates.sort();

    const payload = {
      controlNumber,
      tradingPartnerServiceId,
      encounter: {
        beginningDateOfService: serviceDates[0] || null,
        endDateOfService: serviceDates[serviceDates.length - 1] || null,
      },
      providers: [{
        providerType: "BillingProvider",
        organizationName: billing?.organizationName || claimPayload?.submitter?.organizationName || null,
        npi: billing?.npi || null,
      }],
      subscriber: {
        memberId: subscriber?.memberId || null,
        firstName: subscriber?.firstName || null,
        lastName: subscriber?.lastName || null,
        dateOfBirth: normalizeYYYYMMDD(subscriber?.dateOfBirth),
      },
    };

    const missingFields = [];
    if (!payload.controlNumber) missingFields.push("Control Number");
    if (!payload.tradingPartnerServiceId) missingFields.push("Payer ID");
    if (!payload.subscriber.memberId) missingFields.push("Member ID");
    
    if (missingFields.length > 0) {
      setStatusResult({ error: `Missing required fields: ${missingFields.join(", ")}` });
      return;
    }

    try {
      setLoadingStatus(true);
      const res = await claimStatus(payload);
      setStatusResult(res.data);
      
      const upstream = res.data?.data || res.data;
      let newStatus = String(data.status || "").toLowerCase();
      if (!newStatus || newStatus === "draft") newStatus = "submitted";
      
      const statusInfo = upstream?.statusInformation?.[0];
      if (statusInfo) {
        const code = statusInfo.claimStatusCategoryCode || statusInfo.statusCode;
        if (["1", "2", "20", "22"].includes(code)) newStatus = "accepted";
        else if (["4", "27"].includes(code)) newStatus = "denied";
        else if (["3", "15", "16"].includes(code)) newStatus = "pending";
      }

      if (supabase) {
        await supabase.from("claims").update({ status: newStatus }).eq("id", id);
        try {
          await supabase.from("claim_status_events").insert({ claim_id: id, type: "status", payload: res.data });
        } catch (e) { console.warn("Event insert failed:", e); }
        setData({ ...data, status: newStatus });
        setEvents(prev => [{ id: Date.now().toString(), type: "status", payload: res.data, created_at: new Date().toISOString() }, ...prev]);
        showNotification("success", "Status updated from payer");
      }
    } catch (err: any) {
      setStatusResult({ error: err?.message });
      showNotification("error", "Failed to check status");
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleFindTransaction = async () => {
    try {
      setLoadingTxn(true);
      const res = await listTransactions();
      const items = (res.data?.data?.items || res.data?.items || []) as any[];
      const controlNumber = String(claimPayload?.controlNumber || "");
      
      const matched = controlNumber
        ? items.find((t) => String(t?.x12?.metadata?.transaction?.controlNumber || "") === controlNumber)
        : items.find((t) => (t?.operation || "").includes("X12->GuideJSON"));

      if (matched?.transactionId) {
        setTxnId(matched.transactionId);
        if (supabase) {
          try {
            await supabase.from("claim_status_events").insert({ 
              claim_id: id, 
              type: "transaction_prefill", 
              transaction_id: matched.transactionId,
              payload: { matched: true }
            });
          } catch (e) { console.warn("Event insert failed:", e); }
          setEvents(prev => [{ id: Date.now().toString(), type: "transaction_prefill", payload: {}, created_at: new Date().toISOString(), transaction_id: matched.transactionId }, ...prev]);
        }
        showNotification("success", "Transaction linked");
      } else {
        showNotification("info", "No matching transaction found");
      }
    } catch (err: any) {
      showNotification("error", "Failed to find transaction");
    } finally {
      setLoadingTxn(false);
    }
  };

  const handleGetRemittance = async () => {
    if (!txnId) {
      showNotification("error", "Link a transaction first");
      return;
    }
    try {
      setLoadingTxn(true);
      const res = await getTransactionOutput(txnId);
      setTxnResult(res.data);
      
      const output = res.data?.data || res.data;
      let newStatus = String(data?.status || "submitted").toLowerCase();
      
      if (output?.documentDownloadUrl || output?.claimPaymentInformation || output?.output) {
        const claimPaymentInfo = output?.claimPaymentInformation?.[0];
        if (claimPaymentInfo) {
          const paidAmount = parseFloat(claimPaymentInfo.claimPaymentAmount || "0");
          if (paidAmount > 0) newStatus = "paid";
          else newStatus = "denied";
        } else {
          newStatus = "accepted";
        }
      }

      if (supabase) {
        await supabase.from("claims").update({ status: newStatus }).eq("id", id);
        try {
          await supabase.from("claim_status_events").insert({ claim_id: id, type: "transaction_output", transaction_id: txnId, payload: res.data });
        } catch (e) { console.warn("Event insert failed:", e); }
        setData({ ...data, status: newStatus });
        setEvents(prev => [{ id: Date.now().toString(), type: "transaction_output", payload: res.data, created_at: new Date().toISOString(), transaction_id: txnId }, ...prev]);
        showNotification("success", "Remittance data retrieved");
      }
    } catch (err: any) {
      showNotification("error", "Failed to get remittance");
    } finally {
      setLoadingTxn(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0908] flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-12 h-12 border-3 border-[#c97435] border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-[#8b7355]">Loading claim...</p>
        </motion.div>
      </main>
    );
  }

  if (supabaseMissing || !data) {
    return (
      <main className="min-h-screen bg-[#0a0908] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[#8b7355]">{supabaseMissing ? "Database not configured" : "Claim not found"}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#c97435] to-[#8b5a2b] text-[#0a0908] font-semibold hover:shadow-lg hover:shadow-[#c97435]/30 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0908]">
      {/* Notification Toast - functional colors */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 ${
              notification.type === "success" ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400" :
              notification.type === "error" ? "bg-rose-500/20 border border-rose-500/30 text-rose-400" :
              "bg-sky-500/20 border border-sky-500/30 text-sky-400"
            }`}
          >
            <span className="material-symbols-outlined">
              {notification.type === "success" ? "check_circle" : notification.type === "error" ? "error" : "info"}
            </span>
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header - Dune themed */}
      <header className="sticky top-0 z-40 border-b border-[#c97435]/10 bg-[#0a0908]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/dashboard")}
              className="p-2 rounded-lg hover:bg-[#c97435]/10 text-[#8b7355] hover:text-[#e8dcc8] transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#e8dcc8]">Claim Details</h1>
              <p className="text-sm text-[#6b5a45] font-mono">{id.slice(0, 8)}...</p>
            </div>
          </div>
          <StatusBadge status={data.status} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Patient Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1512]/50 to-[#0a0908]/50 border border-[#c97435]/10"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-[#c97435]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-[#c97435]">person</span>
              </div>
              <div>
                <p className="text-xs text-[#6b5a45] uppercase tracking-wider">Patient</p>
                <p className="text-xl font-bold text-[#e8dcc8]">{data.patient_name || "—"}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6b5a45]">DOB</span>
                <span className="text-[#a67c52]">{formatDateFromYYYYMMDD(subscriber?.dateOfBirth)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b5a45]">Member ID</span>
                <span className="text-[#a67c52] font-mono">{subscriber?.memberId || "—"}</span>
              </div>
            </div>
          </motion.div>

          {/* Payer Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1512]/50 to-[#0a0908]/50 border border-[#c97435]/10"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-[#8b5a2b]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-[#8b5a2b]">business</span>
              </div>
              <div>
                <p className="text-xs text-[#6b5a45] uppercase tracking-wider">Payer</p>
                <p className="text-xl font-bold text-[#e8dcc8]">{data.payer_name || receiver?.organizationName || "—"}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6b5a45]">Payer ID</span>
                <span className="text-[#a67c52] font-mono">{data.trading_partner_service_id || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b5a45]">Control #</span>
                <span className="text-[#a67c52] font-mono">{claimPayload?.controlNumber || "—"}</span>
              </div>
            </div>
          </motion.div>

          {/* Financial Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1512]/50 to-[#0a0908]/50 border border-[#c97435]/10"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-emerald-400">payments</span>
              </div>
              <div>
                <p className="text-xs text-[#6b5a45] uppercase tracking-wider">Billed Amount</p>
                <p className="text-3xl font-bold text-[#e8dcc8]">{formatCurrency(data.total_charge || data.claim_charge_amount)}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6b5a45]">Service Lines</span>
                <span className="text-[#a67c52]">{serviceLines.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b5a45]">Date of Service</span>
                <span className="text-[#a67c52]">{formatDateFromYYYYMMDD(serviceLines[0]?.serviceDate)}</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* AI Claim Intelligence - Anirul */}
        <section className="mb-8">
          <AIClaimIntelligence
            claim={claimPayload}
            claimId={id}
            onApplySuggestions={(optimizedClaim) => {
              showNotification("success", "AI optimizations applied");
              console.log("Optimized claim:", optimizedClaim);
            }}
          />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Claim Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Lines */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-[#1a1512]/50 border border-[#c97435]/10"
            >
              <h2 className="text-lg font-semibold text-[#e8dcc8] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c97435]">receipt_long</span>
                Service Lines
              </h2>
              <div className="space-y-3">
                {serviceLines.length > 0 ? (
                  serviceLines.map((line: any, i: number) => (
                    <ServiceLine key={i} line={line} index={i} />
                  ))
                ) : (
                  <p className="text-[#6b5a45] text-center py-8">No service lines found</p>
                )}
              </div>
            </motion.section>

            {/* Diagnoses */}
            {diagnoses.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-[#1a1512]/50 border border-[#c97435]/10"
              >
                <h2 className="text-lg font-semibold text-[#e8dcc8] mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400">medical_information</span>
                  Diagnosis Codes
                </h2>
                <div className="flex flex-wrap gap-2">
                  {diagnoses.map((dx: any, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-mono"
                    >
                      {dx.diagnosisCode}
                    </span>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Provider Info */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-[#1a1512]/50 border border-[#c97435]/10"
            >
              <h2 className="text-lg font-semibold text-[#e8dcc8] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#a67c52]">local_hospital</span>
                Provider Information
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#6b5a45] mb-1">Billing Provider</p>
                  <p className="text-[#e8dcc8] font-medium">{billing?.organizationName || "—"}</p>
                </div>
                <div>
                  <p className="text-[#6b5a45] mb-1">NPI</p>
                  <p className="text-[#e8dcc8] font-mono">{billing?.npi || "—"}</p>
                </div>
                <div>
                  <p className="text-[#6b5a45] mb-1">Tax ID</p>
                  <p className="text-[#e8dcc8] font-mono">{billing?.employerId || "—"}</p>
                </div>
                <div>
                  <p className="text-[#6b5a45] mb-1">Place of Service</p>
                  <p className="text-[#e8dcc8]">{claimInfo?.placeOfServiceCode || "—"}</p>
                </div>
              </div>
            </motion.section>
          </div>

          {/* Right Column - Actions & Timeline */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-[#1a1512]/50 border border-[#c97435]/10"
            >
              <h2 className="text-lg font-semibold text-[#e8dcc8] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-400">bolt</span>
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={handleCheckStatus}
                  disabled={loadingStatus}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#c97435] to-[#8b5a2b] text-[#0a0908] font-semibold hover:shadow-lg hover:shadow-[#c97435]/30 disabled:opacity-50 transition-all"
                >
                  {loadingStatus ? (
                    <motion.div className="w-5 h-5 border-2 border-[#0a0908]/30 border-t-[#0a0908] rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} />
                  ) : (
                    <span className="material-symbols-outlined">sync</span>
                  )}
                  Check Claim Status
                </button>
                
                <button
                  onClick={handleFindTransaction}
                  disabled={loadingTxn}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#c97435]/20 text-[#a67c52] font-medium hover:bg-[#c97435]/10 disabled:opacity-50 transition-colors"
                >
                  {loadingTxn ? (
                    <motion.div className="w-5 h-5 border-2 border-[#6b5a45] border-t-[#a67c52] rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} />
                  ) : (
                    <span className="material-symbols-outlined">link</span>
                  )}
                  Link Transaction
                </button>

                <button
                  onClick={handleGetRemittance}
                  disabled={loadingTxn || !txnId}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#c97435]/20 text-[#a67c52] font-medium hover:bg-[#c97435]/10 disabled:opacity-50 transition-colors"
                >
                  <span className="material-symbols-outlined">download</span>
                  Get Payment Info
                </button>
              </div>
              
              {txnId && (
                <div className="mt-4 p-3 rounded-lg bg-[#1a1512]/50 border border-[#c97435]/10">
                  <p className="text-xs text-[#6b5a45] mb-1">Linked Transaction</p>
                  <p className="text-sm text-[#a67c52] font-mono truncate">{txnId}</p>
                </div>
              )}
            </motion.section>

            {/* Timeline */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-[#1a1512]/50 border border-[#c97435]/10"
            >
              <h2 className="text-lg font-semibold text-[#e8dcc8] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c97435]">timeline</span>
                Activity Timeline
              </h2>
              <div className="max-h-80 overflow-y-auto">
                {events.length > 0 ? (
                  events.map((event, i) => (
                    <TimelineEvent key={event.id} event={event} isLast={i === events.length - 1} />
                  ))
                ) : (
                  <p className="text-[#6b5a45] text-center py-8">No activity yet</p>
                )}
              </div>
            </motion.section>
          </div>
        </div>

        {/* Developer Tools */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8"
        >
          <button
            onClick={() => setShowDevTools(!showDevTools)}
            className="flex items-center gap-2 text-[#6b5a45] hover:text-[#a67c52] text-sm font-medium transition-colors"
          >
            <motion.span
              animate={{ rotate: showDevTools ? 90 : 0 }}
              className="material-symbols-outlined text-base"
            >
              chevron_right
            </motion.span>
            Developer Tools
          </button>
          
          <AnimatePresence>
            {showDevTools && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-4"
              >
                <div className="p-6 rounded-2xl bg-[#1a1512]/50 border border-[#c97435]/10">
                  <h3 className="text-sm font-semibold text-[#6b5a45] mb-3">Raw Claim Payload</h3>
                  <pre className="max-h-60 overflow-auto rounded-lg bg-[#0a0908] p-4 text-xs text-[#6b5a45] font-mono">
                    {JSON.stringify(claimPayload, null, 2)}
                  </pre>
                </div>
                
                {statusResult && (
                  <div className="p-6 rounded-2xl bg-[#1a1512]/50 border border-[#c97435]/10">
                    <h3 className="text-sm font-semibold text-[#6b5a45] mb-3">Status API Response</h3>
                    <pre className="max-h-60 overflow-auto rounded-lg bg-[#0a0908] p-4 text-xs text-[#6b5a45] font-mono">
                      {JSON.stringify(statusResult, null, 2)}
                    </pre>
                  </div>
                )}

                {txnResult && (
                  <div className="p-6 rounded-2xl bg-[#1a1512]/50 border border-[#c97435]/10">
                    <h3 className="text-sm font-semibold text-[#6b5a45] mb-3">Transaction Output</h3>
                    <pre className="max-h-60 overflow-auto rounded-lg bg-[#0a0908] p-4 text-xs text-[#6b5a45] font-mono">
                      {JSON.stringify(txnResult, null, 2)}
                    </pre>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </main>
    </div>
  );
}
