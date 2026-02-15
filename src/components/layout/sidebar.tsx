"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    TrendingUp,
    BrainCircuit,
    Vault,
    ChevronLeft,
    Menu,
    X,
    Sprout,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar-store";

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    badge?: string;
}

const navItems: NavItem[] = [
    { label: "Dashboard", href: "/", icon: <LayoutDashboard size={20} /> },
    { label: "Market", href: "/market", icon: <TrendingUp size={20} />, badge: "Live" },
    { label: "AI Lab", href: "/ai-lab", icon: <BrainCircuit size={20} /> },
    { label: "Vault", href: "/vault", icon: <Vault size={20} /> },
];

function NavLink({
    item,
    isCollapsed,
    isActive,
    onClick,
}: {
    item: NavItem;
    isCollapsed: boolean;
    isActive: boolean;
    onClick?: () => void;
}) {
    return (
        <Link
            href={item.href}
            onClick={onClick}
            className={cn(
                "group relative flex items-center gap-3.5 rounded-xl",
                "transition-all duration-200 ease-out",
                isCollapsed ? "justify-center p-3" : "px-4 py-3",
                isActive
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            )}
        >
            {/* Sliding pill background for active state */}
            {isActive && (
                <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl bg-[var(--bg-subtle)]"
                    style={{ borderLeft: "2px solid var(--green)" }}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
            )}

            {/* Icon */}
            <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                className="relative z-10 flex-shrink-0"
            >
                {item.icon}
            </motion.div>

            {/* Label */}
            <AnimatePresence mode="wait">
                {!isCollapsed && (
                    <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative z-10 text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                        {item.label}
                    </motion.span>
                )}
            </AnimatePresence>

            {/* Badge */}
            {item.badge && !isCollapsed && (
                <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 ml-auto badge badge-green text-[10px]"
                >
                    {item.badge}
                </motion.span>
            )}

            {/* Tooltip for collapsed */}
            {isCollapsed && (
                <div
                    className={cn(
                        "absolute left-full ml-3 px-3 py-1.5 rounded-lg",
                        "bg-[var(--bg-subtle)] text-[var(--text-primary)] text-xs font-medium",
                        "shadow-[var(--shadow-md)] border border-[var(--border-subtle)]",
                        "opacity-0 group-hover:opacity-100 pointer-events-none",
                        "transition-opacity duration-200 whitespace-nowrap z-50"
                    )}
                >
                    {item.label}
                </div>
            )}
        </Link>
    );
}

export function Sidebar() {
    const pathname = usePathname();
    const { isCollapsed, isMobileOpen, toggle, toggleMobile, closeMobile } =
        useSidebarStore();

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={toggleMobile}
                className={cn(
                    "fixed top-4 left-4 z-50 p-2.5 rounded-xl",
                    "bg-[var(--bg-elevated)] border border-[var(--border-subtle)]",
                    "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                    "transition-colors duration-200 lg:hidden"
                )}
            >
                {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        onClick={closeMobile}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                className={cn(
                    "fixed top-0 left-0 h-full z-40 flex flex-col",
                    "bg-[var(--bg-secondary)]/80 backdrop-blur-xl",
                    "border-r border-[var(--border-subtle)]",
                    "max-lg:-translate-x-full max-lg:data-[open=true]:translate-x-0",
                    "max-lg:transition-transform max-lg:duration-300",
                    "max-lg:w-[var(--sidebar-w)]",
                    "lg:translate-x-0"
                )}
                data-open={isMobileOpen}
                animate={{
                    width: isCollapsed ? 76 : 260,
                }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
                {/* Logo */}
                <div
                    className={cn(
                        "flex items-center h-[68px] px-5 border-b border-[var(--border-subtle)]",
                        isCollapsed ? "justify-center px-0" : "justify-between"
                    )}
                >
                    <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
                        <motion.div
                            whileHover={{ rotate: 15, scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--green)] to-[var(--green-soft)]"
                        >
                            <Sprout size={18} className="text-white" />
                        </motion.div>

                        <AnimatePresence mode="wait">
                            {!isCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -6 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <h1 className="text-base font-bold text-[var(--text-primary)] leading-none tracking-tight">
                                        Agri<span className="text-[var(--green)]">Mate</span>
                                    </h1>
                                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5 tracking-widest uppercase font-medium">
                                        Farm Intelligence
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggle}
                        className={cn(
                            "hidden lg:flex items-center justify-center p-1.5 rounded-lg",
                            "text-[var(--text-faint)] hover:text-[var(--text-muted)]",
                            "transition-colors duration-200"
                        )}
                    >
                        <motion.div
                            animate={{ rotate: isCollapsed ? 180 : 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            <ChevronLeft size={16} />
                        </motion.div>
                    </motion.button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.href}
                            item={item}
                            isCollapsed={isCollapsed}
                            isActive={pathname === item.href}
                            onClick={closeMobile}
                        />
                    ))}
                </nav>

                {/* Footer — version */}
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="px-5 py-4 border-t border-[var(--border-subtle)]"
                    >
                        <p className="text-[10px] text-[var(--text-faint)] tracking-wider uppercase">
                            v2.0 · Powered by AI
                        </p>
                    </motion.div>
                )}
            </motion.aside>
        </>
    );
}
