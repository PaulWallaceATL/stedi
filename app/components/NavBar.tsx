import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/api", label: "API Workbench" },
  { href: "/rag", label: "RAG" },
  { href: "/mocks", label: "Mocks" },
];

export default function NavBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-700 shadow-[0_8px_24px_rgba(15,123,220,0.25)]">
            CAI
          </span>
          <span>Clinix AI</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm text-slate-700">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/api"
          className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-600/30 transition hover:-translate-y-0.5 hover:bg-sky-500"
        >
          Launch Workbench
        </Link>
      </div>
    </header>
  );
}

