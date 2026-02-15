"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoCardProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    className?: string;
    accent?: "green" | "blue" | "neutral";
    children?: React.ReactNode;
    noPadding?: boolean;
}

export function BentoCard({
    title,
    subtitle,
    icon,
    className,
    accent = "neutral",
    children,
    noPadding = false,
}: BentoCardProps) {
    const iconColor = {
        green: "text-[var(--green)]",
        blue: "text-[var(--blue)]",
        neutral: "text-[var(--text-muted)]",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.995 }}
            className={cn(
                "card cursor-default",
                noPadding && "!p-0",
                className
            )}
        >
            {/* Header */}
            <div className={cn("flex items-center justify-between", noPadding && "px-7 pt-6")}>
                <div>
                    {subtitle && (
                        <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--text-faint)] block mb-1">
                            {subtitle}
                        </span>
                    )}
                    <h3 className="text-sm font-semibold text-[var(--text-secondary)] leading-tight">
                        {title}
                    </h3>
                </div>
                {icon && (
                    <div className={cn("flex items-center justify-center", iconColor[accent])}>
                        {icon}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className={cn("mt-4", noPadding && "px-7 pb-6")}>
                {children}
            </div>
        </motion.div>
    );
}

/* ─── GRID HELPER ─── */
interface BentoGridProps {
    children: React.ReactNode;
    className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
    return (
        <div className={cn("grid gap-5", className)}>
            {children}
        </div>
    );
}
