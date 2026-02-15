"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";
import { useSidebarStore } from "@/stores/sidebar-store";

interface AppShellProps {
    children: React.ReactNode;
}

const pageTransition = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
} as const;

export function AppShell({ children }: AppShellProps) {
    const { isCollapsed } = useSidebarStore();

    return (
        <div className="min-h-screen h-screen bg-[var(--bg-primary)] overflow-hidden">
            <Sidebar />

            {/* Main content — generous padding for breathing room */}
            <motion.main
                className={cn(
                    "h-screen overflow-y-auto transition-[margin-left] duration-300 ease-out",
                    "max-lg:ml-0 max-lg:pt-16"
                )}
                animate={{
                    marginLeft: isCollapsed
                        ? "var(--sidebar-w-collapsed)"
                        : "var(--sidebar-w)",
                }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ marginLeft: undefined }}
            >
                <div className="px-8 py-8 lg:px-10 lg:py-9 min-h-full max-w-[1440px]">
                    <AnimatePresence mode="wait">
                        <motion.div key="page-content" {...pageTransition}>
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.main>
        </div>
    );
}
