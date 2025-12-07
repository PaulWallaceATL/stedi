import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/api", label: "API Workbench" },
  { href: "/rag", label: "RAG" },
  { href: "/mocks", label: "Mocks" },
];

export default function NavBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-white">
          Clinix AI
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-200">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1 hover:bg-white/10"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/api"
          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
        >
          Launch Workbench
        </Link>
      </div>
    </header>
  );
}

