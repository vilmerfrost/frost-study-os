"use client";

import { Brain, CheckCircle, Clock, Loader2 } from "lucide-react";

export interface AgentUplinkProps {
    status: "idle" | "generating" | "complete";
    logs?: any[];
}

export default function AgentUplink({ status, logs = [] }: AgentUplinkProps) {
    const agents = [
        { name: "Analyzer", icon: "🔍" },
        { name: "Tutor", icon: "🎓" },
        { name: "Planner", icon: "📋" },
        { name: "Task Generator", icon: "✅" },
    ];

    const getAgentStatus = (agentName: string) => {
        if (status === "idle") return { status: "idle", color: "bg-muted" };
        if (status === "complete") return { status: "complete", color: "bg-green-500" };

        // Check logs for this agent
        const agentLog = logs.find((log) =>
            log.agent?.toLowerCase().includes(agentName.toLowerCase())
        );

        if (agentLog) {
            if (agentLog.status === "complete") return { status: "complete", color: "bg-green-500" };
            if (agentLog.status === "generating" || agentLog.status === "parsing") {
                return { status: "working", color: "bg-yellow-500 animate-pulse" };
            }
        }

        return { status: "waiting", color: "bg-muted/50" };
    };

    return (
        <div className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Brain className="h-3 w-3" />
                    Agent Uplink
                </h3>
                {status === "generating" && (
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                )}
            </div>

            <div className="space-y-2">
                {agents.map((agent) => {
                    const agentStatus = getAgentStatus(agent.name);
                    return (
                        <div key={agent.name} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${agentStatus.color}`}
                                />
                                <span>{agent.icon}</span>
                                <span>{agent.name}</span>
                            </span>
                            <span className="text-muted-foreground text-xs capitalize">
                                {agentStatus.status}
                            </span>
                        </div>
                    );
                })}
            </div>

            {status === "complete" && (
                <div className="pt-2 border-t border-border/30">
                    <div className="flex items-center gap-2 text-xs text-green-500">
                        <CheckCircle className="h-3 w-3" />
                        <span>Plan generated successfully</span>
                    </div>
                </div>
            )}
        </div>
    );
}
