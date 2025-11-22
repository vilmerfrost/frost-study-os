"use client";

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export interface HistoryGraphProps {
    data: {
        date: string;
        sessions: number;
        hours: number;
    }[];
    type?: "line" | "bar";
}

export default function HistoryGraph({ data, type = "line" }: HistoryGraphProps) {
    if (!data || data.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
                <p className="text-sm text-muted-foreground">No data available for selected period</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Activity Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
                {type === "line" ? (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="date"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                        />
                        <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="sessions"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            name="Sessions"
                        />
                        <Line
                            type="monotone"
                            dataKey="hours"
                            stroke="hsl(var(--accent))"
                            strokeWidth={2}
                            name="Hours"
                        />
                    </LineChart>
                ) : (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="date"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                        />
                        <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                            }}
                        />
                        <Legend />
                        <Bar dataKey="sessions" fill="hsl(var(--primary))" name="Sessions" />
                        <Bar dataKey="hours" fill="hsl(var(--accent))" name="Hours" />
                    </BarChart>
                )}
            </ResponsiveContainer>
        </div>
    );
}
