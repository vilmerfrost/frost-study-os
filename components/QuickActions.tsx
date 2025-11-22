"use client";

import { Play, FileText, CheckSquare, FastForward } from "lucide-react";
import Link from "next/link";

export default function QuickActions() {
    const actions = [
        {
            label: "Start Session",
            icon: Play,
            href: "/session",
            color: "bg-green-500/10 text-green-500 border-green-500/20",
            hoverColor: "hover:bg-green-500/20",
        },
        {
            label: "Reflect Now",
            icon: FileText,
            href: "/coach",
            color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
            hoverColor: "hover:bg-purple-500/20",
        },
        {
            label: "Review Items",
            icon: CheckSquare,
            href: "/reviews",
            color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
            hoverColor: "hover:bg-blue-500/20",
        },
        {
            label: "Advance Day",
            icon: FastForward,
            href: "/year",
            color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
            hoverColor: "hover:bg-orange-500/20",
        },
    ];

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
                {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <Link
                            key={action.label}
                            href={action.href}
                            className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${action.color} ${action.hoverColor}`}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="text-xs font-medium">{action.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
