"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    Loader2,
    RefreshCw,
    MapPin,
    Calendar,
    X,
    ChevronDown,
    BarChart3,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

/* ─── TYPES ─── */
interface MandiRecord {
    state: string;
    district: string;
    market: string;
    commodity: string;
    variety: string;
    grade: string;
    arrivalDate: string;
    minPrice: number;
    maxPrice: number;
    modalPrice: number;
}

/* ─── POPULAR COMMODITIES ─── */
const popularCommodities = [
    "Wheat", "Rice", "Mustard", "Onion", "Potato", "Tomato", "Soybean", "Gram",
    "Maize", "Sugarcane", "Cotton", "Groundnut", "Chilli", "Turmeric",
];

export default function MarketPage() {
    const [records, setRecords] = React.useState<MandiRecord[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [total, setTotal] = React.useState(0);
    const [lastUpdated, setLastUpdated] = React.useState("");
    const [source, setSource] = React.useState("");

    // Filters
    const [selectedCommodity, setSelectedCommodity] = React.useState("Wheat");
    const [stateFilter, setStateFilter] = React.useState("");
    const [searchQuery, setSearchQuery] = React.useState("");
    const [showFilters, setShowFilters] = React.useState(false);

    const fetchMandiData = React.useCallback(
        (commodity: string, state?: string) => {
            setLoading(true);
            setError(null);
            const params = new URLSearchParams({ commodity, limit: "100" });
            if (state) params.append("state", state);

            fetch(`/api/mandi?${params.toString()}`)
                .then((r) => r.json())
                .then((data) => {
                    if (data.error) {
                        setError(data.error);
                    } else {
                        setRecords(data.records || []);
                        setTotal(data.total || 0);
                        setSource(data.source || "");
                        setLastUpdated(data.lastUpdated || "");
                    }
                })
                .catch(() => setError("Failed to fetch mandi prices"))
                .finally(() => setLoading(false));
        },
        []
    );

    React.useEffect(() => {
        fetchMandiData(selectedCommodity, stateFilter || undefined);
    }, [selectedCommodity, stateFilter, fetchMandiData]);

    // Filter records by search query
    const filteredRecords = records.filter((r) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            r.market.toLowerCase().includes(q) ||
            r.district.toLowerCase().includes(q) ||
            r.variety.toLowerCase().includes(q) ||
            r.state.toLowerCase().includes(q)
        );
    });

    // Get unique states
    const uniqueStates = [...new Set(records.map((r) => r.state))].sort();

    // Stats
    const avgModal = filteredRecords.length > 0
        ? Math.round(filteredRecords.reduce((s, r) => s + r.modalPrice, 0) / filteredRecords.length)
        : 0;
    const maxPrice = filteredRecords.length > 0 ? Math.max(...filteredRecords.map((r) => r.maxPrice)) : 0;
    const minPrice = filteredRecords.length > 0 ? Math.min(...filteredRecords.map((r) => r.minPrice)) : 0;

    return (
        <AppShell>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="h-full flex flex-col"
            >
                {/* ── HEADER ── */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
                            Market <span className="gradient-text-blue">Intelligence</span>
                        </h1>
                        <p className="text-base text-[var(--text-muted)] mt-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Live mandi prices from Govt. of India
                            {source && <span className="text-sm">• {source}</span>}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-subtle)]">
                            <Search size={16} className="text-[var(--text-muted)]" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search market, district..."
                                className="bg-transparent text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none w-48"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery("")}>
                                    <X size={16} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]" />
                                </button>
                            )}
                        </div>
                        {/* Filter toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2.5 rounded-xl border transition-colors ${showFilters
                                ? "bg-[var(--green-600)]/20 border-[var(--green-400)]/30 text-[var(--green-400)]"
                                : "bg-[var(--surface-secondary)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                }`}
                        >
                            <Filter size={18} />
                        </button>
                        {/* Refresh */}
                        <button
                            onClick={() => fetchMandiData(selectedCommodity, stateFilter || undefined)}
                            disabled={loading}
                            className="p-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
                        >
                            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        </button>
                    </div>
                </div>

                {/* ── COMMODITY CHIPS ── */}
                <div className="flex flex-wrap gap-2.5 mb-5">
                    {popularCommodities.map((c) => (
                        <motion.button
                            key={c}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setSelectedCommodity(c)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selectedCommodity === c
                                ? "bg-gradient-to-r from-[var(--green-600)] to-[var(--green-500)] text-white shadow-[0_2px_12px_rgba(34,197,94,0.2)]"
                                : "bg-white/[0.03] text-[var(--text-muted)] border border-white/[0.06] hover:border-white/[0.12] hover:text-[var(--text-primary)]"
                                }`}
                        >
                            {c}
                        </motion.button>
                    ))}
                </div>

                {/* ── EXPANDED FILTERS ── */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mb-5"
                        >
                            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {/* State filter */}
                                    <div>
                                        <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium mb-2 block">
                                            State
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={stateFilter}
                                                onChange={(e) => setStateFilter(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-subtle)] text-base text-[var(--text-primary)] outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="">All States</option>
                                                {uniqueStates.map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── STATS ROW ── */}
                {filteredRecords.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        {[
                            { label: "Total Records", value: total.toLocaleString(), icon: <BarChart3 size={16} className="text-[var(--blue-400)]" /> },
                            { label: "Avg Modal Price", value: `₹${avgModal.toLocaleString()}`, icon: <TrendingUp size={16} className="text-[var(--green-400)]" /> },
                            { label: "Highest Price", value: `₹${maxPrice.toLocaleString()}`, icon: <ArrowUpRight size={16} className="text-emerald-400" /> },
                            { label: "Lowest Price", value: `₹${minPrice.toLocaleString()}`, icon: <ArrowDownRight size={16} className="text-red-400" /> },
                        ].map((stat) => (
                            <div key={stat.label} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-2">
                                    {stat.icon}
                                    {stat.label}
                                </div>
                                <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── TABLE ── */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={28} className="text-[var(--green-400)] animate-spin" />
                        <span className="text-base text-[var(--text-muted)] ml-3">Fetching live mandi prices...</span>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-red-400 text-base mb-3">{error}</p>
                        <button
                            onClick={() => fetchMandiData(selectedCommodity)}
                            className="text-sm text-[var(--green-400)] hover:underline"
                        >
                            Try again
                        </button>
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-[var(--text-muted)] text-base">No records found for &quot;{selectedCommodity}&quot;</p>
                        <p className="text-sm text-[var(--text-muted)] mt-2">Try a different commodity or clear filters</p>
                    </div>
                ) : (
                    <div className="flex-1 rounded-xl border border-white/[0.06] overflow-hidden flex flex-col">
                        <div className="flex-1 overflow-auto">
                            <table className="w-full">
                                <thead className="sticky top-0 z-10">
                                    <tr className="border-b border-white/[0.08] bg-[var(--surface-secondary)]">
                                        {["Market", "District", "State", "Variety", "Min ₹", "Max ₹", "Modal ₹", "Date"].map((h) => (
                                            <th key={h} className="text-left text-xs text-[var(--text-muted)] uppercase tracking-wider px-5 py-3.5 font-semibold whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.map((r, i) => (
                                        <motion.tr
                                            key={`${r.market}-${r.variety}-${i}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: Math.min(i * 0.02, 0.5) }}
                                            className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors"
                                        >
                                            <td className="px-5 py-3.5 text-sm text-[var(--text-primary)] font-medium whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={14} className="text-[var(--green-400)]" />
                                                    {r.market}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-sm text-[var(--text-secondary)] whitespace-nowrap">{r.district}</td>
                                            <td className="px-5 py-3.5 text-sm text-[var(--text-secondary)] whitespace-nowrap">{r.state}</td>
                                            <td className="px-5 py-3.5 text-sm text-[var(--text-secondary)] whitespace-nowrap">{r.variety}</td>
                                            <td className="px-5 py-3.5 text-sm text-[var(--text-muted)] tabular-nums whitespace-nowrap">₹{r.minPrice.toLocaleString()}</td>
                                            <td className="px-5 py-3.5 text-sm text-[var(--text-muted)] tabular-nums whitespace-nowrap">₹{r.maxPrice.toLocaleString()}</td>
                                            <td className="px-5 py-3.5 text-base font-semibold text-[var(--green-400)] tabular-nums whitespace-nowrap">₹{r.modalPrice.toLocaleString()}</td>
                                            <td className="px-5 py-3.5 text-sm text-[var(--text-muted)] whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar size={14} />
                                                    {r.arrivalDate}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Footer */}
                        <div className="px-5 py-3 bg-white/[0.01] border-t border-white/[0.06] flex items-center justify-between">
                            <span className="text-sm text-[var(--text-muted)]">
                                Showing {filteredRecords.length} of {total.toLocaleString()} records
                            </span>
                            {lastUpdated && (
                                <span className="text-sm text-[var(--text-muted)]">
                                    Updated: {new Date(lastUpdated).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </motion.div>
        </AppShell>
    );
}
