"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/claims/new", label: "New Claim", icon: "add_circle" },
  { href: "/upload", label: "Upload", icon: "upload_file" },
  { href: "/denials", label: "Denials", icon: "error_outline" },
  { href: "/performance", label: "Analytics", icon: "insights" },
  { href: "/settings", label: "Settings", icon: "tune" },
];

export function ModernNav() {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="sticky top-0 z-50"
    >
      {/* Backdrop blur container - Brutalist dark */}
      <div className="absolute inset-0 bg-[#0a0908]/90 backdrop-blur-2xl border-b border-[#c97435]/10" />

      <div className="relative max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Dune inspired */}
          <Link href="/dashboard" className="flex items-center gap-3 group shrink-0">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              {/* Logo glow - spice orange */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#c97435] to-[#8b5a2b] rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />

              {/* Logo container */}
              <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-[#c97435] via-[#a67c52] to-[#6b4423] flex items-center justify-center shadow-lg shadow-[#c97435]/25">
                <svg className="w-5 h-5 text-[#0a0908]" fill="none" viewBox="0 0 48 48">
                  <path
                    d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </motion.div>

            <div className="hidden sm:block">
              <h1 className="text-lg font-bold bg-gradient-to-r from-[#e8dcc8] to-[#a67c52] bg-clip-text text-transparent">
                Clinix AI
              </h1>
            </div>
          </Link>

          {/* Navigation - Centered with brutalist styling */}
          <nav className="hidden lg:flex items-center gap-0.5 p-1 rounded-xl bg-[#1a1512]/50 border border-[#c97435]/10 mx-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="relative"
                >
                  {/* Active/Hover background */}
                  <AnimatePresence>
                    {(isActive || hoveredItem === item.href) && (
                      <motion.div
                        layoutId="nav-pill"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        className={cn(
                          "absolute inset-0 rounded-xl",
                          isActive
                            ? "bg-gradient-to-r from-[#c97435]/20 to-[#8b5a2b]/20 border border-[#c97435]/30"
                            : "bg-[#c97435]/5"
                        )}
                      />
                    )}
                  </AnimatePresence>

                  {/* Nav item content */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                      isActive ? "text-[#e8dcc8]" : "text-[#8b7355] hover:text-[#e8dcc8]"
                    )}
                  >
                    <span
                      className={cn(
                        "material-symbols-outlined text-base transition-colors",
                        isActive ? "text-[#c97435]" : ""
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="hidden xl:inline">{item.label}</span>

                    {/* Active indicator dot */}
                    {isActive && (
                      <motion.div
                        layoutId="active-dot"
                        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#c97435]"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1512]/50 border border-[#c97435]/10 hover:border-[#c97435]/20 transition-colors group"
            >
              <span className="material-symbols-outlined text-base text-[#6b5a45] group-hover:text-[#8b7355] transition-colors">
                search
              </span>
              <input
                type="text"
                placeholder="Search..."
                className="w-24 xl:w-32 bg-transparent text-xs text-[#e8dcc8] placeholder-[#6b5a45] focus:outline-none"
              />
              <kbd className="hidden xl:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#c97435]/10 text-[9px] text-[#8b7355] font-medium">
                ⌘K
              </kbd>
            </motion.div>

            {/* Notifications */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 rounded-lg bg-[#1a1512]/50 border border-[#c97435]/10 hover:border-[#c97435]/20 transition-all group"
            >
              <span className="material-symbols-outlined text-lg text-[#8b7355] group-hover:text-[#e8dcc8] transition-colors">
                notifications
              </span>
              {/* Notification badge */}
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#c97435] opacity-75 animate-ping" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-gradient-to-r from-[#c97435] to-[#8b5a2b] text-[8px] font-bold text-[#0a0908] items-center justify-center">
                  3
                </span>
              </span>
            </motion.button>

            {/* AI Assistant Toggle */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 rounded-lg bg-gradient-to-r from-[#c97435]/20 to-[#8b5a2b]/20 border border-[#c97435]/30 hover:border-[#c97435]/50 transition-all group overflow-hidden"
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#c97435]/10 to-[#8b5a2b]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative material-symbols-outlined text-lg text-[#c97435] group-hover:text-[#d4844c] transition-colors">
                auto_awesome
              </span>
            </motion.button>

            {/* User Avatar */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#c97435] to-[#6b4423] rounded-lg blur opacity-50" />
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[#c97435] to-[#6b4423] flex items-center justify-center text-[#0a0908] font-bold text-xs ring-1 ring-[#c97435]/20">
                C
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
