"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface AIOrbProps {
  isActive?: boolean;
  isProcessing?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
}

export function AIOrb({
  isActive = false,
  isProcessing = false,
  size = "md",
  onClick,
  className,
}: AIOrbProps) {
  const [particles, setParticles] = useState<{ id: number; angle: number }[]>([]);

  useEffect(() => {
    if (isActive || isProcessing) {
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        angle: (360 / 8) * i,
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [isActive, isProcessing]);

  const sizes = {
    sm: { orb: "w-12 h-12", glow: "w-20 h-20", ring: "w-16 h-16" },
    md: { orb: "w-16 h-16", glow: "w-28 h-28", ring: "w-24 h-24" },
    lg: { orb: "w-24 h-24", glow: "w-40 h-40", ring: "w-36 h-36" },
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn("relative flex items-center justify-center", className)}
    >
      {/* Outer glow */}
      <motion.div
        animate={{
          scale: isProcessing ? [1, 1.2, 1] : 1,
          opacity: isActive || isProcessing ? 0.6 : 0.3,
        }}
        transition={{
          scale: { duration: 2, repeat: isProcessing ? Infinity : 0 },
          opacity: { duration: 0.3 },
        }}
        className={cn(
          "absolute rounded-full blur-2xl",
          sizes[size].glow,
          "bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500"
        )}
      />

      {/* Animated ring */}
      <AnimatePresence>
        {(isActive || isProcessing) && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              rotate: 360,
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              rotate: { duration: 8, repeat: Infinity, ease: "linear" },
              scale: { duration: 0.3 },
              opacity: { duration: 0.3 },
            }}
            className={cn(
              "absolute rounded-full",
              sizes[size].ring,
              "border-2 border-transparent",
              "bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500",
              "[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]",
              "[mask-composite:exclude]",
              "p-[2px]"
            )}
          />
        )}
      </AnimatePresence>

      {/* Orbiting particles */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: [0.5, 1, 0.5],
              rotate: [particle.angle, particle.angle + 360],
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              rotate: { duration: 4, repeat: Infinity, ease: "linear" },
              opacity: { duration: 2, repeat: Infinity },
            }}
            className="absolute"
            style={{
              transformOrigin: `${size === "lg" ? "60px" : size === "md" ? "40px" : "32px"} center`,
            }}
          >
            <div
              className={cn(
                "rounded-full",
                size === "lg" ? "w-2 h-2" : "w-1.5 h-1.5",
                "bg-gradient-to-r from-blue-400 to-violet-400"
              )}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main orb */}
      <motion.div
        animate={{
          scale: isProcessing ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 1.5,
          repeat: isProcessing ? Infinity : 0,
        }}
        className={cn(
          "relative rounded-full",
          sizes[size].orb,
          "bg-gradient-to-br from-blue-500 via-violet-500 to-fuchsia-500",
          "shadow-lg shadow-violet-500/50",
          "flex items-center justify-center",
          "ring-2 ring-white/20"
        )}
      >
        {/* Inner highlight */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/30 to-transparent" />

        {/* Icon */}
        <motion.span
          animate={{
            rotate: isProcessing ? [0, 360] : 0,
          }}
          transition={{
            duration: 2,
            repeat: isProcessing ? Infinity : 0,
            ease: "linear",
          }}
          className="relative material-symbols-outlined text-white text-2xl"
        >
          {isProcessing ? "sync" : "auto_awesome"}
        </motion.span>
      </motion.div>
    </motion.button>
  );
}

// AI Assistant Panel
interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export function AIAssistantPanel({ isOpen, onClose, children }: AIAssistantPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg z-50"
          >
            <div className="h-full bg-[#0a0a12]/95 backdrop-blur-2xl border-l border-white/[0.08] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
                <div className="flex items-center gap-4">
                  <AIOrb size="sm" isActive />
                  <div>
                    <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
                    <p className="text-sm text-slate-500">Powered by Clinix Intelligence</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-400">close</span>
                </motion.button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {children}
              </div>

              {/* Input */}
              <div className="p-6 border-t border-white/[0.08]">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <input
                    type="text"
                    placeholder="Ask anything about your claims..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white"
                  >
                    <span className="material-symbols-outlined text-lg">send</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

