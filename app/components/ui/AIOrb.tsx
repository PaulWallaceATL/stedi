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

// Anirul-inspired AI Orb - Professional AI aesthetic
export function AIOrb({
  isActive = false,
  isProcessing = false,
  size = "md",
  onClick,
  className,
}: AIOrbProps) {
  const [particles, setParticles] = useState<{ id: number; angle: number; delay: number }[]>([]);
  const [sacredRings, setSacredRings] = useState<{ id: number; scale: number; opacity: number }[]>([]);

  useEffect(() => {
    if (isActive || isProcessing) {
      // Orbiting particles like spice essence
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        angle: (360 / 12) * i,
        delay: i * 0.1,
      }));
      setParticles(newParticles);
      
      // Sacred geometry rings
      const rings = Array.from({ length: 3 }, (_, i) => ({
        id: i,
        scale: 1 + i * 0.3,
        opacity: 0.3 - i * 0.08,
      }));
      setSacredRings(rings);
    } else {
      setParticles([]);
      setSacredRings([]);
    }
  }, [isActive, isProcessing]);

  const sizes = {
    sm: { orb: "w-12 h-12", glow: "w-24 h-24", ring: "w-18 h-18", icon: "text-lg" },
    md: { orb: "w-16 h-16", glow: "w-32 h-32", ring: "w-24 h-24", icon: "text-2xl" },
    lg: { orb: "w-24 h-24", glow: "w-48 h-48", ring: "w-36 h-36", icon: "text-3xl" },
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn("relative flex items-center justify-center", className)}
    >
      {/* Outer mystical glow - like prescient vision */}
      <motion.div
        animate={{
          scale: isProcessing ? [1, 1.3, 1] : isActive ? [1, 1.1, 1] : 1,
          opacity: isActive || isProcessing ? [0.3, 0.6, 0.3] : 0.2,
        }}
        transition={{
          duration: isProcessing ? 2 : 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={cn(
          "absolute rounded-full blur-3xl",
          sizes[size].glow,
          "bg-gradient-radial from-[#c97435]/40 via-[#8b5a2b]/20 to-transparent"
        )}
      />

      {/* Sacred geometry rings - Bene Gesserit symbols */}
      <AnimatePresence>
        {sacredRings.map((ring) => (
          <motion.div
            key={ring.id}
            initial={{ scale: 0.8, opacity: 0, rotate: 0 }}
            animate={{
              scale: ring.scale,
              opacity: ring.opacity,
              rotate: ring.id % 2 === 0 ? 360 : -360,
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              rotate: { duration: 20 + ring.id * 5, repeat: Infinity, ease: "linear" },
              scale: { duration: 0.5 },
              opacity: { duration: 0.5 },
            }}
            className={cn(
              "absolute rounded-full border",
              sizes[size].ring,
              "border-[#c97435]/30"
            )}
            style={{
              borderStyle: ring.id === 1 ? "dashed" : "solid",
            }}
          />
        ))}
      </AnimatePresence>

      {/* Hexagonal sacred pattern overlay */}
      <AnimatePresence>
        {(isActive || isProcessing) && (
          <motion.svg
            initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
            animate={{ opacity: 0.4, scale: 1, rotate: 60 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              rotate: { duration: 30, repeat: Infinity, ease: "linear" },
            }}
            className={cn("absolute", sizes[size].ring)}
            viewBox="0 0 100 100"
          >
            <polygon
              points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
              fill="none"
              stroke="#c97435"
              strokeWidth="0.5"
              opacity="0.5"
            />
            <polygon
              points="50,20 80,35 80,65 50,80 20,65 20,35"
              fill="none"
              stroke="#a67c52"
              strokeWidth="0.5"
              opacity="0.3"
            />
          </motion.svg>
        )}
      </AnimatePresence>

      {/* Orbiting essence particles - like spice motes */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0.5, 1, 0.5],
              opacity: [0.3, 0.8, 0.3],
              rotate: [particle.angle, particle.angle + 360],
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              rotate: { duration: 6, repeat: Infinity, ease: "linear", delay: particle.delay },
              scale: { duration: 3, repeat: Infinity, delay: particle.delay },
              opacity: { duration: 3, repeat: Infinity, delay: particle.delay },
            }}
            className="absolute"
            style={{
              transformOrigin: `${size === "lg" ? "70px" : size === "md" ? "50px" : "38px"} center`,
            }}
          >
            <div
              className={cn(
                "rounded-full",
                size === "lg" ? "w-2 h-2" : "w-1.5 h-1.5",
                "bg-gradient-to-r from-[#e8dcc8] to-[#c97435]",
                "shadow-lg shadow-[#c97435]/50"
              )}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Inner mystical eye glow */}
      <motion.div
        animate={{
          opacity: isProcessing ? [0.5, 1, 0.5] : isActive ? 0.7 : 0.4,
          scale: isProcessing ? [0.9, 1.1, 0.9] : 1,
        }}
        transition={{ duration: 2, repeat: isProcessing ? Infinity : 0 }}
        className={cn(
          "absolute rounded-full blur-md",
          size === "lg" ? "w-16 h-16" : size === "md" ? "w-10 h-10" : "w-8 h-8",
          "bg-gradient-radial from-[#e8dcc8]/60 via-[#c97435]/40 to-transparent"
        )}
      />

      {/* Main orb - the Eye of Anirul */}
      <motion.div
        animate={{
          scale: isProcessing ? [1, 1.05, 1] : 1,
          boxShadow: isActive || isProcessing
            ? [
                "0 0 20px rgba(201, 116, 53, 0.5), inset 0 0 20px rgba(232, 220, 200, 0.2)",
                "0 0 40px rgba(201, 116, 53, 0.7), inset 0 0 30px rgba(232, 220, 200, 0.3)",
                "0 0 20px rgba(201, 116, 53, 0.5), inset 0 0 20px rgba(232, 220, 200, 0.2)",
              ]
            : "0 0 15px rgba(201, 116, 53, 0.3)",
        }}
        transition={{
          duration: 2,
          repeat: isActive || isProcessing ? Infinity : 0,
        }}
        className={cn(
          "relative rounded-full",
          sizes[size].orb,
          "bg-gradient-to-br from-[#1a1512] via-[#2a2018] to-[#0a0908]",
          "border border-[#c97435]/40",
          "flex items-center justify-center overflow-hidden"
        )}
      >
        {/* Inner orb gradient layers */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-[#c97435]/20 to-transparent" />
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-[#e8dcc8]/10 via-transparent to-[#c97435]/10" />
        
        {/* Mystical eye center */}
        <motion.div
          animate={{
            opacity: isProcessing ? [0.6, 1, 0.6] : 0.8,
            scale: isProcessing ? [0.95, 1.05, 0.95] : 1,
          }}
          transition={{ duration: 1.5, repeat: isProcessing ? Infinity : 0 }}
          className={cn(
            "absolute rounded-full",
            size === "lg" ? "w-8 h-8" : size === "md" ? "w-5 h-5" : "w-4 h-4",
            "bg-gradient-radial from-[#e8dcc8] via-[#c97435] to-[#8b5a2b]",
            "shadow-inner"
          )}
        />

        {/* Icon */}
        <motion.span
          animate={{
            rotate: isProcessing ? [0, 360] : 0,
            opacity: isProcessing ? [0.8, 1, 0.8] : 1,
          }}
          transition={{
            rotate: { duration: 3, repeat: isProcessing ? Infinity : 0, ease: "linear" },
            opacity: { duration: 1, repeat: isProcessing ? Infinity : 0 },
          }}
          className={cn(
            "relative material-symbols-outlined text-[#e8dcc8] z-10",
            sizes[size].icon
          )}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {isProcessing ? "sync" : "visibility"}
        </motion.span>
      </motion.div>
    </motion.button>
  );
}

// AI Assistant Panel - Anirul Style
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
          {/* Backdrop with mystical overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0a0908]/80 backdrop-blur-md z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg z-50"
          >
            <div className="h-full bg-gradient-to-b from-[#0a0908] via-[#0d0b09] to-[#0a0908] backdrop-blur-2xl border-l border-[#c97435]/20 overflow-hidden">
              {/* Mystical border accent */}
              <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#c97435]/50 to-transparent" />
              
              {/* Header - AI Title */}
              <div className="relative flex items-center justify-between p-6 border-b border-[#c97435]/10">
                {/* Sacred geometry background */}
                <div className="absolute inset-0 opacity-5">
                  <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice">
                    <pattern id="sacredPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                      <polygon points="20,5 35,12.5 35,27.5 20,35 5,27.5 5,12.5" fill="none" stroke="#c97435" strokeWidth="0.5"/>
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#sacredPattern)" />
                  </svg>
                </div>
                
                <div className="relative flex items-center gap-4">
                  <AIOrb size="sm" isActive />
                  <div>
                    <h2 className="text-lg font-semibold text-[#e8dcc8] tracking-wide">ANIRUL</h2>
                    <p className="text-xs text-[#8b7355] uppercase tracking-widest">AI Assistant</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="relative p-2 rounded-lg hover:bg-[#c97435]/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[#8b7355]">close</span>
                </motion.button>
              </div>

              {/* AI greeting */}
              <div className="px-6 py-4 border-b border-[#c97435]/10 bg-[#c97435]/5">
                <p className="text-sm text-[#a67c52] italic">
                  "I have seen the paths of your claims. Ask, and I shall illuminate the way forward."
                </p>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {children}
              </div>

              {/* Input field */}
              <div className="p-6 border-t border-[#c97435]/10 bg-[#0a0908]/50">
                <div className="relative">
                  {/* Mystical input border */}
                  <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-[#c97435]/30 via-[#e8dcc8]/10 to-[#c97435]/30 opacity-50" />
                  <div className="relative flex items-center gap-3 p-3 rounded-xl bg-[#1a1512]/70 border border-[#c97435]/20">
                    <span className="material-symbols-outlined text-[#c97435] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                      auto_awesome
                    </span>
                    <input
                      type="text"
                      placeholder="Ask about claims, billing, or denials..."
                      className="flex-1 bg-transparent text-sm text-[#e8dcc8] placeholder-[#6b5a45] focus:outline-none"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-lg bg-gradient-to-r from-[#c97435] to-[#8b5a2b] text-[#0a0908] shadow-lg shadow-[#c97435]/30"
                    >
                      <span className="material-symbols-outlined text-lg">send</span>
                    </motion.button>
                  </div>
                </div>
                <p className="text-xs text-[#6b5a45] mt-3 text-center">
                  Anirul specializes in claims, billing, and denial prevention
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
