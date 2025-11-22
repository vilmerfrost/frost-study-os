"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, BookOpen, History, Bot, Settings } from "lucide-react";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navItems = [
        { href: "/today", label: "Today", icon: LayoutDashboard },
        { href: "/session", label: "Session", icon: Calendar },
        { href: "/year", label: "YearBrain", icon: BookOpen },
        { href: "/history", label: "History", icon: History },
        { href: "/coach", label: "Coach", icon: Bot },
        { href: "/settings", label: "Settings", icon: Settings },
    ];

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border/40 bg-background/50 hidden md:flex flex-col p-4">
                <div className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4 md:p-8">
                {children}
            </main>
        </div>
    );
}
