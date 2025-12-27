"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "subtle" | "glow";
  hoverEffect?: boolean;
  glowColor?: string;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      className,
      variant = "default",
      hoverEffect = true,
      glowColor = "spice",
      ...props
    },
    ref
  ) => {
    const variants = {
      default:
        "bg-[#1a1512]/30 border-[#c97435]/10 backdrop-blur-xl",
      elevated:
        "bg-[#1a1512]/50 border-[#c97435]/15 backdrop-blur-2xl shadow-2xl shadow-black/30",
      subtle:
        "bg-[#1a1512]/20 border-[#c97435]/5 backdrop-blur-lg",
      glow: `bg-[#1a1512]/30 border-[#c97435]/10 backdrop-blur-xl shadow-lg ${
        glowColor === "spice"
          ? "shadow-[#c97435]/10"
          : glowColor === "sand"
          ? "shadow-[#a67c52]/10"
          : glowColor === "copper"
          ? "shadow-[#8b5a2b]/10"
          : glowColor === "rust"
          ? "shadow-[#6b4423]/10"
          : "shadow-[#c97435]/10"
      }`,
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        whileHover={
          hoverEffect
            ? {
                y: -4,
                transition: { duration: 0.2 },
              }
            : undefined
        }
        className={cn(
          "relative rounded-2xl border transition-all duration-300",
          variants[variant],
          hoverEffect && "hover:border-[#c97435]/20 hover:bg-[#1a1512]/40",
          className
        )}
        {...props}
      >
        {/* Inner glow effect */}
        <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute inset-px rounded-2xl bg-gradient-to-b from-[#c97435]/[0.08] to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";

// Metric Card with animated counter - Dune Theme
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: { value: number; isPositive: boolean };
  color?: "spice" | "sand" | "copper" | "rust" | "ember";
  delay?: number;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "spice",
  delay = 0,
}: MetricCardProps) {
  const colorStyles = {
    spice: {
      iconBg: "bg-[#c97435]/20",
      iconText: "text-[#c97435]",
      glow: "shadow-[#c97435]/20",
      gradient: "from-[#c97435]/10 to-transparent",
    },
    sand: {
      iconBg: "bg-[#a67c52]/20",
      iconText: "text-[#a67c52]",
      glow: "shadow-[#a67c52]/20",
      gradient: "from-[#a67c52]/10 to-transparent",
    },
    copper: {
      iconBg: "bg-[#8b5a2b]/20",
      iconText: "text-[#d4844c]",
      glow: "shadow-[#8b5a2b]/20",
      gradient: "from-[#8b5a2b]/10 to-transparent",
    },
    rust: {
      iconBg: "bg-[#6b4423]/20",
      iconText: "text-[#8b5a2b]",
      glow: "shadow-[#6b4423]/20",
      gradient: "from-[#6b4423]/10 to-transparent",
    },
    ember: {
      iconBg: "bg-[#b85c38]/20",
      iconText: "text-[#e07b4c]",
      glow: "shadow-[#b85c38]/20",
      gradient: "from-[#b85c38]/10 to-transparent",
    },
  };

  const styles = colorStyles[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl",
        "bg-[#1a1512]/30 border border-[#c97435]/10 backdrop-blur-xl",
        "hover:border-[#c97435]/20 transition-all duration-300",
        `shadow-lg ${styles.glow}`
      )}
    >
      {/* Gradient Background */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-50",
          styles.gradient
        )}
      />

      {/* Content */}
      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-[#8b7355]">{title}</p>
            <motion.p
              className="text-4xl font-bold text-[#e8dcc8] tracking-tight"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.2, duration: 0.5 }}
            >
              {value}
            </motion.p>
            {subtitle && (
              <p className="text-xs text-[#6b5a45]">{subtitle}</p>
            )}
            {trend && (
              <div
                className={cn(
                  "inline-flex items-center gap-1 text-xs font-medium",
                  trend.isPositive ? "text-emerald-400" : "text-rose-400"
                )}
              >
                <span className="material-symbols-outlined text-sm">
                  {trend.isPositive ? "trending_up" : "trending_down"}
                </span>
                {Math.abs(trend.value)}%
              </div>
            )}
          </div>

          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: delay + 0.1,
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl",
              styles.iconBg,
              "ring-1 ring-[#c97435]/10"
            )}
          >
            <span
              className={cn("material-symbols-outlined text-2xl", styles.iconText)}
            >
              {icon}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Hover Glow */}
      <div
        className={cn(
          "absolute -bottom-20 -right-20 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30",
          color === "spice"
            ? "bg-[#c97435]"
            : color === "sand"
            ? "bg-[#a67c52]"
            : color === "copper"
            ? "bg-[#8b5a2b]"
            : color === "rust"
            ? "bg-[#6b4423]"
            : "bg-[#b85c38]"
        )}
      />
    </motion.div>
  );
}
