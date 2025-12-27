"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

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

// Mock notifications
const NOTIFICATIONS = [
  { id: 1, type: "success", title: "Claim Accepted", message: "Claim #C8d2a... was accepted by Stedi Test Payer", time: "2 min ago", read: false },
  { id: 2, type: "warning", title: "Review Required", message: "Claim #C3f1b... needs additional documentation", time: "1 hour ago", read: false },
  { id: 3, type: "info", title: "Payment Received", message: "$2,160.00 deposited from Medicare", time: "3 hours ago", read: true },
];

export function ModernNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === "Escape") {
        setShowSearch(false);
        setShowNotifications(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = searchQuery.trim()
    ? navItems.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : navItems;

  const handleSearchSelect = (href: string) => {
    router.push(href);
    setShowSearch(false);
    setSearchQuery("");
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#0a0908]/80 backdrop-blur-sm z-[100]"
              onClick={() => setShowSearch(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-lg z-[101]"
            >
              <div className="mx-4 rounded-2xl bg-[#1a1512] border border-[#c97435]/20 shadow-2xl shadow-[#c97435]/10 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#c97435]/10">
                  <span className="material-symbols-outlined text-[#c97435]">search</span>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search pages, claims, patients..."
                    className="flex-1 bg-transparent text-[#e8dcc8] placeholder-[#6b5a45] focus:outline-none"
                  />
                  <kbd className="px-2 py-1 rounded bg-[#c97435]/10 text-[10px] text-[#8b7355] font-medium">ESC</kbd>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {searchResults.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => handleSearchSelect(item.href)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#c97435]/10 transition-colors text-left"
                    >
                      <span className="material-symbols-outlined text-[#8b7355]">{item.icon}</span>
                      <span className="text-[#e8dcc8]">{item.label}</span>
                      <span className="ml-auto text-xs text-[#6b5a45]">{item.href}</span>
                    </button>
                  ))}
                  {searchQuery && searchResults.length === 0 && (
                    <div className="px-4 py-8 text-center text-[#6b5a45]">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
            {/* Search Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => setShowSearch(true)}
              className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1512]/50 border border-[#c97435]/10 hover:border-[#c97435]/20 transition-colors group cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#6b5a45] group-hover:text-[#8b7355] transition-colors">
                search
              </span>
              <span className="w-24 xl:w-32 text-xs text-[#6b5a45]">Search...</span>
              <kbd className="hidden xl:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#c97435]/10 text-[9px] text-[#8b7355] font-medium">
                ⌘K
              </kbd>
            </motion.button>

            {/* Notifications */}
            <div ref={notificationRef} className="relative">
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg bg-[#1a1512]/50 border border-[#c97435]/10 hover:border-[#c97435]/20 transition-all group"
              >
                <span className="material-symbols-outlined text-lg text-[#8b7355] group-hover:text-[#e8dcc8] transition-colors">
                  notifications
                </span>
                {/* Notification badge */}
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-[#c97435] opacity-75 animate-ping" />
                    <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-gradient-to-r from-[#c97435] to-[#8b5a2b] text-[8px] font-bold text-[#0a0908] items-center justify-center">
                      {unreadCount}
                    </span>
                  </span>
                )}
              </motion.button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-12 w-80 rounded-xl bg-[#1a1512] border border-[#c97435]/20 shadow-2xl shadow-[#c97435]/10 overflow-hidden z-50"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#c97435]/10">
                      <h3 className="font-semibold text-[#e8dcc8]">Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllRead}
                          className="text-xs text-[#c97435] hover:text-[#e8dcc8] transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={cn(
                            "px-4 py-3 border-b border-[#c97435]/10 hover:bg-[#c97435]/5 transition-colors cursor-pointer",
                            !notif.read && "bg-[#c97435]/10"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <span className={cn(
                              "material-symbols-outlined text-lg mt-0.5",
                              notif.type === "success" && "text-emerald-400",
                              notif.type === "warning" && "text-amber-400",
                              notif.type === "info" && "text-sky-400"
                            )}>
                              {notif.type === "success" ? "check_circle" : notif.type === "warning" ? "warning" : "info"}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#e8dcc8]">{notif.title}</p>
                              <p className="text-xs text-[#8b7355] truncate">{notif.message}</p>
                              <p className="text-xs text-[#6b5a45] mt-1">{notif.time}</p>
                            </div>
                            {!notif.read && (
                              <div className="w-2 h-2 rounded-full bg-[#c97435] mt-2" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Link 
                      href="/settings"
                      className="block px-4 py-3 text-center text-sm text-[#c97435] hover:bg-[#c97435]/10 transition-colors"
                    >
                      View all notifications
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Avatar */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/settings")}
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
    </>
  );
}
