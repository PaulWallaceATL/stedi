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
      glowColor = "blue",
      ...props
    },
    ref
  ) => {
    const variants = {
      default:
        "bg-white/[0.03] border-white/[0.08] backdrop-blur-xl",
      elevated:
        "bg-white/[0.05] border-white/[0.1] backdrop-blur-2xl shadow-2xl shadow-black/20",
      subtle:
        "bg-white/[0.02] border-white/[0.05] backdrop-blur-lg",
      glow: `bg-white/[0.03] border-white/[0.08] backdrop-blur-xl shadow-lg ${
        glowColor === "blue"
          ? "shadow-blue-500/10"
          : glowColor === "emerald"
          ? "shadow-emerald-500/10"
          : glowColor === "violet"
          ? "shadow-violet-500/10"
          : glowColor === "amber"
          ? "shadow-amber-500/10"
          : "shadow-rose-500/10"
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
          hoverEffect && "hover:border-white/[0.15] hover:bg-white/[0.04]",
          className
        )}
        {...props}
      >
        {/* Inner glow effect */}
        <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute inset-px rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";

// Metric Card with animated counter
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: { value: number; isPositive: boolean };
  color?: "blue" | "emerald" | "violet" | "amber" | "rose";
  delay?: number;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "blue",
  delay = 0,
}: MetricCardProps) {
  const colorStyles = {
    blue: {
      iconBg: "bg-blue-500/20",
      iconText: "text-blue-400",
      glow: "shadow-blue-500/20",
      gradient: "from-blue-500/10 to-transparent",
    },
    emerald: {
      iconBg: "bg-emerald-500/20",
      iconText: "text-emerald-400",
      glow: "shadow-emerald-500/20",
      gradient: "from-emerald-500/10 to-transparent",
    },
    violet: {
      iconBg: "bg-violet-500/20",
      iconText: "text-violet-400",
      glow: "shadow-violet-500/20",
      gradient: "from-violet-500/10 to-transparent",
    },
    amber: {
      iconBg: "bg-amber-500/20",
      iconText: "text-amber-400",
      glow: "shadow-amber-500/20",
      gradient: "from-amber-500/10 to-transparent",
    },
    rose: {
      iconBg: "bg-rose-500/20",
      iconText: "text-rose-400",
      glow: "shadow-rose-500/20",
      gradient: "from-rose-500/10 to-transparent",
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
        "bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl",
        "hover:border-white/[0.12] transition-all duration-300",
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
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <motion.p
              className="text-4xl font-bold text-white tracking-tight"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.2, duration: 0.5 }}
            >
              {value}
            </motion.p>
            {subtitle && (
              <p className="text-xs text-slate-500">{subtitle}</p>
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
              "ring-1 ring-white/[0.1]"
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
          color === "blue"
            ? "bg-blue-500"
            : color === "emerald"
            ? "bg-emerald-500"
            : color === "violet"
            ? "bg-violet-500"
            : color === "amber"
            ? "bg-amber-500"
            : "bg-rose-500"
        )}
      />
    </motion.div>
  );
}

