"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/today", label: "Today", icon: "📅" },
  { href: "/session", label: "Session", icon: "📚" },
  { href: "/coach", label: "Coach", icon: "🎯" },
  { href: "/history", label: "History", icon: "📈" },
  { href: "/year", label: "Year", icon: "🧠" },
  { href: "/notes", label: "Notes", icon: "📝" },
  { href: "/exports", label: "Exports", icon: "📤" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-slate-800/40 bg-slate-950/80 backdrop-blur-md">
      <div className="flex items-center gap-3 overflow-x-auto px-4 py-3 text-xs">
        {links.map((link) => {
          const active = pathname === link.href || (pathname === "/" && link.href === "/today");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex min-w-[68px] flex-col items-center gap-0.5 rounded-xl px-3 py-1 ${
                active ? "text-sky-400 bg-slate-900/80" : "text-slate-400"
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

