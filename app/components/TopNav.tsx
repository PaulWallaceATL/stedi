"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Profile = {
  id: string;
  email?: string;
  full_name?: string;
};

export default function TopNav() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [open, setOpen] = useState(false);
  const supabaseMissing = !supabase;

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    let mounted = true;
    const loadSession = async () => {
      const { data } = await client.auth.getSession();
      const user = data.session?.user;
      if (mounted && user) {
        setProfile({
          id: user.id,
          email: user.email || undefined,
          full_name: user.user_metadata?.full_name,
        });
      }
    };
    loadSession();
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setProfile(
        user
          ? {
              id: user.id,
              email: user.email || undefined,
              full_name: user.user_metadata?.full_name,
            }
          : null,
      );
    });
    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const initials = useMemo(() => {
    if (!profile) return "";
    const name = profile.full_name || profile.email || "";
    const parts = name.split(" ");
    if (parts.length >= 2) return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }, [profile]);

  return (
    <header className="sticky top-0 z-40 flex justify-center bg-gradient-to-b from-slate-950/90 via-slate-950/70 to-transparent backdrop-blur">
      <nav className="mt-4 flex w-full max-w-6xl items-center justify-between rounded-xl border border-slate-800/60 bg-slate-900/60 px-4 py-3 shadow-lg shadow-black/30">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-100">Clinix AI</span>
          <span className="hidden text-xs uppercase tracking-[0.18em] text-slate-400 sm:inline">
            Eligibility • Claims • Status • Appeals
          </span>
        </div>
        <div className="flex items-center gap-3">
          {supabaseMissing && (
            <Link
              href="/login"
              className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-sky-500/40 transition hover:-translate-y-0.5 hover:bg-sky-400"
            >
              Get Started
            </Link>
          )}
          {!supabaseMissing && !profile && (
            <Link
              href="/login"
              className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-sky-500/40 transition hover:-translate-y-0.5 hover:bg-sky-400"
            >
              Get Started
            </Link>
          )}
          {profile && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-sm font-semibold text-slate-950 shadow-md shadow-sky-600/40"
              >
                {initials || "ME"}
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl border border-slate-800 bg-slate-900/90 p-2 text-sm text-slate-100 shadow-lg shadow-black/40">
                  <Link
                    href="/dashboard"
                    className="block rounded-lg px-3 py-2 hover:bg-slate-800"
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/account"
                    className="block rounded-lg px-3 py-2 hover:bg-slate-800"
                    onClick={() => setOpen(false)}
                  >
                    Account settings
                  </Link>
                  <button
                    type="button"
                    className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-rose-200 hover:bg-slate-800"
                    onClick={async () => {
                      if (supabase) {
                        await supabase.auth.signOut();
                      }
                      setOpen(false);
                      setProfile(null);
                    }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

