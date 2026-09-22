"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/books", label: "Books", icon: "📖" },
  { href: "/authors", label: "Authors", icon: "✒️" },
  { href: "/reviews", label: "Reviews", icon: "⭐" },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gradient-to-b from-amber-950 via-amber-900 to-stone-900 text-amber-50 flex-shrink-0 hidden md:flex md:flex-col relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_20%_10%,white,transparent_40%)]" />
        <div className="absolute -bottom-24 -left-16 w-56 h-56 rounded-full bg-amber-600/10 blur-3xl" />

        <div className="relative px-6 py-8 border-b border-amber-800/40">
          <p className="text-amber-400 text-[10px] font-semibold tracking-[0.25em] uppercase mb-1.5">Est. Since Forever</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="font-extrabold text-2xl leading-tight">
            The Ink &amp; Page
          </h1>
          <p className="text-amber-300/60 text-xs mt-1.5">Management Portal</p>
        </div>

        <nav className="relative flex-1 px-3 py-6 space-y-1.5">
          {navItems.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all relative overflow-hidden ${
                  active
                    ? "bg-white/10 text-white shadow-inner"
                    : "text-amber-200/60 hover:bg-white/5 hover:text-amber-100"
                }`}
              >
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-amber-300 rounded-r-full" />}
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="relative px-6 py-5 text-[11px] text-amber-400/40 border-t border-amber-800/40">
          Curated titles · Honest reviews
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden bg-gradient-to-r from-amber-950 to-amber-900 text-amber-50 px-4 py-3.5 flex gap-5 overflow-x-auto sticky top-0 z-30 shadow-lg">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-semibold whitespace-nowrap flex items-center gap-1.5">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </header>
        <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-x-hidden bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100">
          {children}
        </main>
      </div>
    </div>
  );
}