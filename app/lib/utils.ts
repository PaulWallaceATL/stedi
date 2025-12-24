import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Animation variants for consistent micro-interactions
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const slideInFromRight = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

// Format date
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

// Get status color
export function getStatusColor(status: string): {
  bg: string;
  text: string;
  glow: string;
} {
  const colors: Record<string, { bg: string; text: string; glow: string }> = {
    accepted: {
      bg: "bg-emerald-500/20",
      text: "text-emerald-400",
      glow: "shadow-emerald-500/20",
    },
    paid: {
      bg: "bg-emerald-500/20",
      text: "text-emerald-400",
      glow: "shadow-emerald-500/20",
    },
    submitted: {
      bg: "bg-blue-500/20",
      text: "text-blue-400",
      glow: "shadow-blue-500/20",
    },
    pending: {
      bg: "bg-amber-500/20",
      text: "text-amber-400",
      glow: "shadow-amber-500/20",
    },
    denied: {
      bg: "bg-rose-500/20",
      text: "text-rose-400",
      glow: "shadow-rose-500/20",
    },
    rejected: {
      bg: "bg-rose-500/20",
      text: "text-rose-400",
      glow: "shadow-rose-500/20",
    },
    draft: {
      bg: "bg-slate-500/20",
      text: "text-slate-400",
      glow: "shadow-slate-500/20",
    },
  };
  return colors[status.toLowerCase()] || colors.draft;
}

