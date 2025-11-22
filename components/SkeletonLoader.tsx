"use client";

export default function SkeletonLoader() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
            <div className="grid gap-4 md:grid-cols-3 mt-6">
                <div className="h-32 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
            </div>
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="rounded-xl border border-border bg-card p-6 animate-pulse">
            <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-4/5"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
        </div>
    );
}

export function GraphSkeleton() {
    return (
        <div className="rounded-xl border border-border bg-card p-6">
            <div className="h-6 bg-muted rounded w-1/3 mb-6 animate-pulse"></div>
            <div className="h-[300px] bg-muted/50 rounded animate-pulse"></div>
        </div>
    );
}
