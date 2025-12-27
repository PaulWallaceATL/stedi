"use client";

import { useState } from "react";

type ERAViewerProps = {
  transactionId?: string;
  claimId?: string;
};

export default function ERAViewer({ transactionId, claimId }: ERAViewerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const fetchERAPDF = async () => {
    try {
      setLoading(true);
      setError(null);
      setPdfUrl(null);

      // Call Stedi ERA PDF API through proxy
      const proxyUrl = process.env.NEXT_PUBLIC_PROXY_URL?.replace(/\/+$/, "");
      if (!proxyUrl) {
        throw new Error("Proxy URL not configured");
      }

      const response = await fetch(`${proxyUrl}/proxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: `/2024-09-01/x12/transactions/${transactionId}/835/pdf`,
          method: "GET",
        }),
      });

      const result = await response.json();
      
      if (!result.ok) {
        throw new Error(result.data?.error || "Failed to fetch ERA PDF");
      }

      // The API returns a PDF URL or binary data
      if (result.data?.url) {
        setPdfUrl(result.data.url);
      } else if (result.data) {
        // If binary data, create blob URL
        const blob = new Blob([result.data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ERA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#137fec] text-xl">description</span>
          <h3 className="text-lg font-semibold text-slate-900">Payment Details (ERA/835)</h3>
        </div>
        <button
          onClick={fetchERAPDF}
          disabled={loading || !transactionId}
          className="flex items-center gap-2 px-4 py-2 bg-[#137fec] text-white rounded-lg text-sm font-semibold hover:bg-[#0f6acc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="material-symbols-outlined text-base">picture_as_pdf</span>
          {loading ? "Loading..." : "View ERA PDF"}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {pdfUrl && (
        <div className="mt-4">
          <iframe
            src={pdfUrl}
            className="w-full h-[600px] rounded-lg border border-slate-200"
            title="ERA PDF"
          />
          <div className="mt-2 flex gap-2">
            <a
              href={pdfUrl}
              download={`ERA-${transactionId || claimId}.pdf`}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-base">download</span>
              Download PDF
            </a>
          </div>
        </div>
      )}

      {!transactionId && !loading && (
        <div className="text-center py-8 text-slate-500 text-sm">
          <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inbox</span>
          <p>No transaction ID available. Poll transactions first.</p>
        </div>
      )}
    </div>
  );
}

