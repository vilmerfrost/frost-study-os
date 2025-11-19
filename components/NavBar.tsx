"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/session", label: "Session", icon: "📚" },
  { href: "/history", label: "History", icon: "📈" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold text-sm tracking-tight hover:text-sky-400 transition-colors">
          Vilmer Study OS 🧊
        </Link>
        <nav className="flex gap-2 text-xs">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              (pathname === "/" && link.href === "/session");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  "px-3 py-1.5 rounded-full border transition-all duration-200 flex items-center gap-1.5 " +
                  (active
                    ? "bg-sky-500 text-slate-950 border-sky-500 shadow-lg shadow-sky-500/20"
                    : "border-slate-700 text-slate-300 hover:border-sky-500 hover:bg-slate-800/50")
                }
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

