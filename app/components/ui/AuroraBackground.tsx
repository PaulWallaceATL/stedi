"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  showRadialGradient?: boolean;
}

export function AuroraBackground({
  children,
  className,
  showRadialGradient = true,
}: AuroraBackgroundProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden bg-[#0a0908]",
        className
      )}
    >
      {/* Aurora Gradient Layers - Dune Desert Theme */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary Aurora - Spice Orange */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute -inset-[10px] opacity-50"
        >
          <div
            className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(201, 116, 53, 0.25) 0%, transparent 70%)",
              filter: "blur(60px)",
              animation: "aurora1 15s ease-in-out infinite",
            }}
          />
          <div
            className="absolute top-1/4 right-1/4 h-[600px] w-[600px] rounded-full"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(139, 90, 43, 0.2) 0%, transparent 70%)",
              filter: "blur(80px)",
              animation: "aurora2 20s ease-in-out infinite",
            }}
          />
          <div
            className="absolute bottom-0 left-1/3 h-[400px] w-[700px] rounded-full"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(166, 124, 82, 0.15) 0%, transparent 70%)",
              filter: "blur(70px)",
              animation: "aurora3 18s ease-in-out infinite",
            }}
          />
          <div
            className="absolute top-1/2 right-0 h-[500px] w-[500px] rounded-full"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(107, 68, 35, 0.2) 0%, transparent 70%)",
              filter: "blur(90px)",
              animation: "aurora4 22s ease-in-out infinite",
            }}
          />
        </motion.div>

        {/* Subtle Grid Overlay - Brutalist */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(201, 116, 53, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(201, 116, 53, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Noise Texture - Sandstorm */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Radial Gradient Overlay */}
      {showRadialGradient && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0908]/50 to-[#0a0908]" />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>

      <style jsx>{`
        @keyframes aurora1 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        @keyframes aurora2 {
          0%,
          100% {
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
          50% {
            transform: translate(-40px, 30px) scale(1.15) rotate(10deg);
          }
        }
        @keyframes aurora3 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(50px, -30px) scale(0.95);
          }
          66% {
            transform: translate(-30px, -20px) scale(1.1);
          }
        }
        @keyframes aurora4 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-50px, 50px) scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}
