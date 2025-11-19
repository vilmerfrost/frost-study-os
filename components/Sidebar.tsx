"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/hooks/useTheme";

const links = [
  { href: "/today", label: "Today", icon: "📅" },
  { href: "/session", label: "Session", icon: "📚" },
  { href: "/coach", label: "Coach", icon: "🎯" },
  { href: "/history", label: "History", icon: "📈" },
  { href: "/year", label: "Year Brain", icon: "🧠" },
  { href: "/notes", label: "Notes", icon: "📝" },
  { href: "/exports", label: "Exports", icon: "📤" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme, mounted } = useTheme();
  const themeIcon = !mounted ? "…" : theme === "dark" ? "☀️" : "🌙";
  const themeLabel = !mounted ? "Laddar..." : theme === "dark" ? "Ljust läge" : "Mörkt läge";

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 border-r border-slate-200 dark:border-slate-800/50 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md z-30 flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800/50">
        <Link href="/" className="font-bold text-lg tracking-tight text-slate-900 dark:text-slate-50 hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
          Vilmer Study OS 🧊
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (pathname === "/" && link.href === "/today");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                active
                  ? "bg-sky-500 text-white font-medium shadow-lg shadow-sky-500/20"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800/50">
        <button
          onClick={toggleTheme}
          className="w-full group rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-white flex items-center justify-between transition hover:border-violet-400 hover:shadow-[0_8px_30px_rgba(109,40,217,0.25)]"
        >
          <span>{themeIcon}</span>
          <span>{themeLabel}</span>
        </button>
      </div>
    </aside>
  );
}

