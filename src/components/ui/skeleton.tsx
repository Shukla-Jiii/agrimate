"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
    className?: string;
    variant?: "text" | "circular" | "rectangular" | "chart";
}

export function Skeleton({ className, variant = "rectangular" }: SkeletonProps) {
    const baseClasses =
        "relative overflow-hidden bg-[var(--black-700)] animate-pulse";

    const variantClasses = {
        text: "h-4 rounded-md",
        circular: "rounded-full",
        rectangular: "rounded-[var(--radius-md)]",
        chart: "rounded-[var(--radius-md)]",
    };

    return (
        <div className={cn(baseClasses, variantClasses[variant], className)}>
            <div
                className="absolute inset-0"
                style={{
                    background: "var(--gradient-shimmer)",
                    animation: "shimmer 2s infinite",
                }}
            />
        </div>
    );
}

export function SkeletonCard({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "rounded-[var(--radius-lg)] p-5 space-y-4",
                "bg-[var(--surface-card)] border border-[var(--border-subtle)]",
                className
            )}
        >
            <div className="flex items-center justify-between">
                <Skeleton variant="text" className="h-3 w-20" />
                <Skeleton variant="circular" className="h-8 w-8" />
            </div>
            <Skeleton variant="text" className="h-8 w-32" />
            <Skeleton variant="text" className="h-3 w-24" />
            <Skeleton variant="chart" className="h-16 w-full mt-2" />
        </div>
    );
}
