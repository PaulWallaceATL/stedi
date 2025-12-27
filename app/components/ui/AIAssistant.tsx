"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AIOrb } from "./AIOrb";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ClaimData {
  id: string;
  patient_name?: string;
  payer_name?: string;
  status?: string;
  claim_charge_amount?: number;
  date_of_service?: string;
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  claims?: ClaimData[];
}

const ALLOWED_TOPICS = [
  "claim", "billing", "insurance", "payer", "payment", "denial", "denied",
  "status", "submitted", "cpt", "icd", "diagnosis", "procedure", "patient",
  "amount", "charge", "balance", "ar", "aging", "era", "remittance",
  "authorization", "appeal", "how many", "total", "average"
];

function isClaimsRelated(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  return ALLOWED_TOPICS.some(topic => lowerQuery.includes(topic));
}

function generateLocalResponse(query: string, claims: ClaimData[]): string {
  const lowerQuery = query.toLowerCase();
  const totalClaims = claims.length;
  const totalAmount = claims.reduce((sum, c) => sum + (c.claim_charge_amount || 0), 0);
  const acceptedClaims = claims.filter(c => c.status === "accepted" || c.status === "paid");
  const pendingClaims = claims.filter(c => c.status === "submitted" || c.status === "pending");
  const deniedClaims = claims.filter(c => c.status === "denied" || c.status === "rejected");

  if (lowerQuery.includes("how many") && lowerQuery.includes("claim")) {
    return `You have **${totalClaims} claims** in your account.\n\n• ${acceptedClaims.length} accepted/paid\n• ${pendingClaims.length} processing\n• ${deniedClaims.length} denied/rejected`;
  }

  if (lowerQuery.includes("total") && (lowerQuery.includes("amount") || lowerQuery.includes("billed"))) {
    return `Your **total billed amount** is **$${totalAmount.toLocaleString()}**.`;
  }

  if (lowerQuery.includes("denied") || lowerQuery.includes("rejection")) {
    if (deniedClaims.length === 0) {
      return "Great news! You don't have any denied claims currently. 🎉";
    }
    return `You have **${deniedClaims.length} denied claims**. Would you like help with an appeal strategy?`;
  }

  if (lowerQuery.includes("pending") || lowerQuery.includes("processing") || lowerQuery.includes("status")) {
    return `**Claims Status:**\n\n• ✅ Accepted: ${acceptedClaims.length}\n• ⏳ Processing: ${pendingClaims.length}\n• ❌ Denied: ${deniedClaims.length}\n\nFirst-pass rate: **${totalClaims > 0 ? Math.round((acceptedClaims.length / totalClaims) * 100) : 0}%**`;
  }

  if (lowerQuery.includes("payer") || lowerQuery.includes("insurance")) {
    const payers = [...new Set(claims.map(c => c.payer_name).filter(Boolean))];
    return `You have claims with **${payers.length} payers**:\n\n${payers.map(p => `• ${p}`).join("\n")}`;
  }

  return `**Your Account Summary:**\n\n• ${totalClaims} total claims\n• $${totalAmount.toLocaleString()} total billed\n• ${Math.round((acceptedClaims.length / Math.max(totalClaims, 1)) * 100)}% first-pass rate\n\nAsk me about claims, denials, or billing!`;
}

export function AIAssistant({ isOpen, onClose, claims = [] }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: `Hello! I'm your Clinix AI billing assistant. I can help you with:\n\n• **Claims Analysis** - Review statuses and trends\n• **Denial Management** - Understand and appeal denials\n• **Billing Questions** - CPT codes, modifiers, rules\n\nWhat would you like to know?`,
        timestamp: new Date(),
      }]);
    }
  }, [isOpen, messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    if (!isClaimsRelated(input)) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I'm designed to help with medical billing and claims only. Ask me about:\n\n• Claim statuses\n• Denials and appeals\n• Billing codes\n• Payer requirements",
          timestamp: new Date(),
        }]);
        setIsLoading(false);
      }, 500);
      return;
    }

    setTimeout(() => {
      const response = generateLocalResponse(input, claims);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50"
          >
            <div className="h-full flex flex-col bg-[#0a0908]/95 backdrop-blur-2xl border-l border-[#c97435]/20">
              <div className="flex items-center justify-between p-4 border-b border-[#c97435]/20">
                <div className="flex items-center gap-3">
                  <AIOrb size="sm" isActive={!isLoading} isProcessing={isLoading} />
                  <div>
                    <h2 className="text-lg font-semibold text-[#e8dcc8]">AI Assistant</h2>
                    <p className="text-xs text-[#c97435]">Claims & Billing Intelligence</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#c97435]/10">
                  <span className="material-symbols-outlined text-[#8b7355]">close</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-[#c97435] to-[#8b5a2b] text-[#0a0908]"
                        : "bg-[#1a1512]/60 border border-[#c97435]/20 text-[#e8dcc8]"
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">
                        {msg.content.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
                          part.startsWith("**") && part.endsWith("**")
                            ? <strong key={i} className="text-[#c97435]">{part.slice(2, -2)}</strong>
                            : part
                        )}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-[#1a1512]/60 border border-[#c97435]/20 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-[#c97435] rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-[#a67c52] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-[#8b5a2b] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSubmit} className="p-4 border-t border-[#c97435]/20">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1512]/40 border border-[#c97435]/20">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about your claims..."
                    disabled={isLoading}
                    className="flex-1 bg-transparent text-sm text-[#e8dcc8] placeholder-[#6b5a45] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="p-2 rounded-lg bg-gradient-to-r from-[#c97435] to-[#8b5a2b] text-[#0a0908] disabled:opacity-50 hover:shadow-lg hover:shadow-[#c97435]/30 transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">send</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
