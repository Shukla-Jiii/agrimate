"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
    Droplets,
    CloudRain,
    Package,
    TrendingUp,
    TrendingDown,
    ShieldAlert,
    ShieldCheck,
    ShieldBan,
    Clock,
    Activity,
    Zap,
    ClipboardEdit,
    Loader2,
    X,
    Sprout,
    MapPin,
    Layers,
    Maximize2,
    AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
    YieldOptimizerData,
    OptimizerMetric,
    RiskLevel,
    ActionType,
} from "@/types/yield-optimizer";
import { fetchYieldAnalysis, type FarmInput } from "@/lib/yield-optimizer-api";

/* ─── CONFIG ─── */
const CROPS = ["Wheat", "Rice", "Mustard", "Onion", "Potato", "Tomato", "Soybean", "Gram", "Maize", "Sugarcane", "Cotton", "Groundnut", "Chilli", "Turmeric"];
const STATES = ["Andhra Pradesh", "Bihar", "Chhattisgarh", "Gujarat", "Haryana", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal"];
const SOIL_TYPES = ["Alluvial", "Black (Regur)", "Red", "Laterite", "Sandy", "Clay", "Loamy", "Sandy Loam"];

/* ─── ANIMATED COUNTER ─── */
function useCountUp(target: number, duration = 1600) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-30px" });
    const started = useRef(false);

    useEffect(() => {
        if (!inView || started.current) return;
        started.current = true;
        const t0 = performance.now();
        const step = (now: number) => {
            const p = Math.min((now - t0) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setCount(Math.round(target * eased));
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration, inView]);

    return { count, ref };
}

/* ─── RISK CONFIG ─── */
const riskConfig: Record<RiskLevel, {
    bg: string; border: string; text: string; glow: string;
    icon: React.ReactNode; pulse: string; gradient: string;
}> = {
    critical: {
        bg: "rgba(239,68,68,0.06)", border: "rgba(239,68,68,0.15)", text: "text-red-400",
        glow: "risk-pulse", icon: <ShieldBan size={20} />, pulse: "bg-red-500",
        gradient: "from-red-500/[0.04] via-transparent to-transparent",
    },
    warning: {
        bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.15)", text: "text-amber-400",
        glow: "", icon: <ShieldAlert size={20} />, pulse: "bg-amber-500",
        gradient: "from-amber-500/[0.04] via-transparent to-transparent",
    },
    optimal: {
        bg: "rgba(34,197,94,0.06)", border: "rgba(34,197,94,0.15)", text: "text-emerald-400",
        glow: "safe-glow", icon: <ShieldCheck size={20} />, pulse: "bg-emerald-500",
        gradient: "from-emerald-500/[0.04] via-transparent to-transparent",
    },
    neutral: {
        bg: "rgba(148,163,184,0.04)", border: "rgba(148,163,184,0.1)", text: "text-slate-400",
        glow: "", icon: <Activity size={20} />, pulse: "bg-slate-500",
        gradient: "from-slate-500/[0.02] via-transparent to-transparent",
    },
};

const actionConfig: Record<ActionType, { emoji: string; label: string; color: string }> = {
    HOLD: { emoji: "🚨", label: "HOLD ACTION", color: "text-red-400" },
    APPLY: { emoji: "✅", label: "APPLY NOW", color: "text-emerald-400" },
    DELAY: { emoji: "⏳", label: "DELAY ACTION", color: "text-amber-400" },
    HARVEST: { emoji: "🌾", label: "HARVEST READY", color: "text-amber-400" },
    IRRIGATE: { emoji: "💧", label: "IRRIGATE NOW", color: "text-blue-400" },
};

const metricIcons: Record<string, React.ReactNode> = {
    soilMoisture: <Droplets size={14} className="text-blue-400" />,
    rainProbability: <CloudRain size={14} className="text-sky-400" />,
    fertilizerPrice: <Package size={14} className="text-amber-400" />,
    yieldProjection: <TrendingUp size={14} className="text-emerald-400" />,
};

/* ═══ LARGE CONFIDENCE GAUGE ═══ */
function ConfidenceGauge({ value, riskLevel }: { value: number; riskLevel: RiskLevel }) {
    const color = { critical: "#ef4444", warning: "#f59e0b", optimal: "#22c55e", neutral: "#94a3b8" }[riskLevel];
    const circumference = 2 * Math.PI * 52; // r=52
    const { count, ref } = useCountUp(value, 1200);

    return (
        <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="var(--bg-muted)" strokeWidth="6" opacity="0.3" />
                <motion.circle cx="60" cy="60" r="52" fill="none" stroke={color} strokeWidth="6"
                    strokeLinecap="round" strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference * (1 - value / 100) }}
                    transition={{ duration: 1.8, delay: 0.3, ease: "easeOut" }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span ref={ref} className="text-2xl text-display text-[var(--text-primary)]">{count}%</span>
                <span className="text-[9px] text-[var(--text-faint)] font-medium tracking-wider uppercase">Risk</span>
            </div>
        </div>
    );
}

/* ═══ METRIC BAR ═══ */
function MetricRow({ metric, metricKey, delay }: { metric: OptimizerMetric; metricKey: string; delay: number }) {
    const { count, ref } = useCountUp(metric.value, 1400);
    const inRange = metric.idealMin !== undefined && metric.idealMax !== undefined && metric.value >= metric.idealMin && metric.value <= metric.idealMax;
    const isLow = metric.idealMin !== undefined && metric.value < metric.idealMin;
    const statusColor = inRange ? "text-emerald-400" : isLow ? "text-amber-400" : "text-red-400";
    const barColor = inRange ? "bg-emerald-500" : isLow ? "bg-amber-500" : "bg-red-500";
    const barW = metric.unit === "₹/bag" ? Math.min((metric.value / 2000) * 100, 100) : Math.min(metric.value, 100);

    return (
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay }}>
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded flex items-center justify-center bg-[var(--bg-subtle)]">
                        {metricIcons[metricKey] || <Activity size={14} />}
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">{metric.label}</span>
                </div>
                <span ref={ref} className={cn("text-sm font-bold text-metric", statusColor)}>
                    {metric.unit === "₹/bag" ? `₹${count.toLocaleString()}` : count}{metric.unit !== "₹/bag" ? metric.unit : "/bag"}
                </span>
            </div>
            <div className="h-[3px] bg-[var(--bg-muted)] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${barW}%` }}
                    transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
                    className={cn("h-full rounded-full", barColor)} style={{ opacity: 0.8 }}
                />
            </div>
        </motion.div>
    );
}

/* ═══ SKELETON ═══ */
function HeroSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
            <div className="lg:col-span-2 space-y-6">
                <div className="h-6 w-48 skeleton" />
                <div className="h-16 w-72 skeleton" />
                <div className="h-4 w-full skeleton" />
                <div className="h-4 w-3/4 skeleton" />
            </div>
            <div className="flex items-center justify-center">
                <div className="w-32 h-32 rounded-full skeleton" />
            </div>
        </div>
    );
}

/* ═══ FARM DATA FORM ═══ */
function FarmDataForm({ onSubmit, onCancel, isLoading }: { onSubmit: (d: FarmInput) => void; onCancel: () => void; isLoading: boolean }) {
    const [crop, setCrop] = useState("Wheat");
    const [area, setArea] = useState("2");
    const [state, setState] = useState("Punjab");
    const [soilType, setSoilType] = useState("Alluvial");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ crop, area: parseFloat(area) || 1, state, soilType });
    };

    const inputClass = "w-full px-3 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--green)]/30 transition-colors";

    return (
        <motion.form initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            onSubmit={handleSubmit} className="space-y-5"
        >
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <ClipboardEdit size={16} className="text-[var(--green)]" /> Enter Farm Data
                </h4>
                <button type="button" onClick={onCancel} className="p-1.5 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] transition-colors">
                    <X size={16} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-semibold text-[var(--text-faint)] tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
                        <Sprout size={11} /> Crop
                    </label>
                    <select value={crop} onChange={(e) => setCrop(e.target.value)} className={cn(inputClass, "appearance-none cursor-pointer")}>
                        {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-semibold text-[var(--text-faint)] tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
                        <Layers size={11} /> Area (ha)
                    </label>
                    <input type="number" min="0.1" max="1000" step="0.1" value={area} onChange={(e) => setArea(e.target.value)}
                        className={cn(inputClass, "tabular-nums")} />
                </div>
                <div>
                    <label className="text-[10px] font-semibold text-[var(--text-faint)] tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
                        <MapPin size={11} /> State
                    </label>
                    <select value={state} onChange={(e) => setState(e.target.value)} className={cn(inputClass, "appearance-none cursor-pointer")}>
                        {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-semibold text-[var(--text-faint)] tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
                        <Droplets size={11} /> Soil Type
                    </label>
                    <select value={soilType} onChange={(e) => setSoilType(e.target.value)} className={cn(inputClass, "appearance-none cursor-pointer")}>
                        {SOIL_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <motion.button type="submit" disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
                {isLoading ? <><Loader2 size={16} className="animate-spin" /> Analyzing…</> : <><Zap size={16} /> Run AI Analysis</>}
            </motion.button>
        </motion.form>
    );
}

/* ═══ FULL ANALYSIS MODAL ═══ */
function AnalysisModal({ text, onClose }: { text: string; onClose: () => void }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm" onClick={onClose}
        >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-8"
            >
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Zap size={20} className="text-[var(--green)]" /> Full Analysis
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <div className="prose prose-invert prose-sm max-w-none text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                    {text}
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   HERO CARD — THE STAR OF THE SHOW
   
   This card answers THE question: "What should I do today?"
   
   Layout (desktop):
   ┌─────────────────────────────────┬──────────────┐
   │  🚨 HOLD ACTION                │              │
   │  Do not apply fertilizer       │  [91% GAUGE] │
   │  today.                        │              │
   │                                │              │
   │  -₹1,200 projected loss/acre   │              │
   ├─────────────────────────────────┴──────────────┤
   │  Soil: 42%  │  Rain: 78%  │  Fert: ₹1,450    │
   └────────────────────────────────────────────────┘
   ═══════════════════════════════════════════════════════════════ */
export interface YieldOptimizerCardProps {
    data?: YieldOptimizerData;
    className?: string;
    loading?: boolean;
}

export function YieldOptimizerCard({ data: initialData, className, loading = false }: YieldOptimizerCardProps) {
    const [showForm, setShowForm] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [liveData, setLiveData] = useState<YieldOptimizerData | null>(null);
    const [fullAnalysis, setFullAnalysis] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    const data = liveData || initialData || MOCK_YIELD_OPTIMIZER_DATA;
    const { recommendation, metrics, lastUpdated } = data;
    const risk = riskConfig[recommendation.riskLevel];
    const action = actionConfig[recommendation.action];
    const impactPositive = recommendation.projectedImpact >= 0;
    const impactStr = `₹${Math.abs(recommendation.projectedImpact).toLocaleString("en-IN")}`;

    const handleSubmit = async (input: FarmInput) => {
        setIsAnalyzing(true);
        setShowForm(false);
        try {
            const r = await fetchYieldAnalysis(input);
            setLiveData({
                metrics: {
                    soilMoisture: { label: "Soil Moisture", value: r.soilMoisture, unit: "%", idealMin: 50, idealMax: 75, icon: "droplets" },
                    rainProbability: { label: "Rain Probability", value: r.weather?.rainChance ?? 30, unit: "%", idealMin: 0, idealMax: 30, icon: "cloud-rain" },
                    fertilizerPrice: { label: "Fertilizer Price", value: 1450, unit: "₹/bag", idealMin: 800, idealMax: 1200, icon: "package" },
                    yieldProjection: { label: "Yield Projection", value: r.yieldProjection, unit: " q/ha", idealMin: 30, idealMax: 45, icon: "trending-up" },
                },
                recommendation: r.recommendation,
                yieldTrend: [
                    { timestamp: "Day 1", value: r.yieldProjection - 4 }, { timestamp: "Day 2", value: r.yieldProjection - 2 },
                    { timestamp: "Day 3", value: r.yieldProjection - 3 }, { timestamp: "Day 4", value: r.yieldProjection - 1 },
                    { timestamp: "Day 5", value: r.yieldProjection }, { timestamp: "Day 6", value: r.yieldProjection + 1 },
                    { timestamp: "Day 7", value: r.yieldProjection },
                ],
                lastUpdated: "Just now",
            });
            setFullAnalysis(r.fullAnalysis);
        } catch (err) {
            console.error("Analysis failed:", err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                    "card-hero relative",
                    risk.glow && `animate-[${risk.glow}_4s_infinite]`,
                    className
                )}
                style={risk.glow ? { animation: `${risk.glow} 4s infinite` } : undefined}
            >
                {/* Ambient gradient — subtle, only on hero */}
                <div className={cn("absolute inset-0 bg-gradient-to-br rounded-[var(--radius-2xl)] pointer-events-none", risk.gradient)} />

                <div className="relative z-10">
                    {loading || isAnalyzing ? (
                        <div className="space-y-4">
                            <HeroSkeleton />
                            {isAnalyzing && (
                                <div className="flex items-center justify-center gap-2 py-4 text-sm text-[var(--green)]">
                                    <Loader2 size={16} className="animate-spin" /> Fetching live data & running AI analysis…
                                </div>
                            )}
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {showForm ? (
                                <FarmDataForm key="form" onSubmit={handleSubmit} onCancel={() => setShowForm(false)} isLoading={isAnalyzing} />
                            ) : (
                                <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                                    {/* ─── TOP: Label + Time ─── */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                style={{ background: risk.bg, border: `1px solid ${risk.border}` }}>
                                                <Zap size={16} className={risk.text} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-semibold tracking-widest uppercase text-[var(--text-faint)]">
                                                    Today&apos;s Decision
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", risk.pulse)} />
                                                    <span className="text-[10px] text-[var(--text-faint)]">
                                                        {liveData ? "Live" : "AI Analysis"} · {lastUpdated}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-[var(--text-faint)]">
                                            <Clock size={12} />
                                            <span>{lastUpdated}</span>
                                        </div>
                                    </div>

                                    {/* ─── HERO LAYOUT: Decision + Gauge ─── */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                                        {/* Left: Decision (dominant) */}
                                        <div className="lg:col-span-2">
                                            {/* Action badge */}
                                            <div className="flex items-center gap-2.5 mb-4">
                                                <span className="text-xl">{action.emoji}</span>
                                                <span className={cn("text-sm font-black tracking-[0.15em] uppercase", action.color)}>
                                                    {action.label}
                                                </span>
                                            </div>

                                            {/* Headline — BIG */}
                                            <h2 className="text-2xl sm:text-3xl text-display text-[var(--text-primary)] mb-3 leading-tight">
                                                {recommendation.headline}
                                            </h2>

                                            {/* Rationale */}
                                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5 max-w-xl">
                                                {recommendation.rationale}
                                            </p>

                                            {/* Impact badge — prominent */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4 }}
                                                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
                                                style={{
                                                    background: impactPositive ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                                                    border: `1px solid ${impactPositive ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}`,
                                                }}
                                            >
                                                {impactPositive ? <TrendingUp size={16} className="text-emerald-400" /> : <AlertTriangle size={16} className="text-red-400" />}
                                                <span className={cn("text-lg font-bold text-metric", impactPositive ? "text-emerald-400" : "text-red-400")}>
                                                    {impactPositive ? "+" : "-"}{impactStr}
                                                </span>
                                                <span className="text-xs text-[var(--text-muted)]">projected {impactPositive ? "gain" : "loss"} / acre</span>
                                            </motion.div>
                                        </div>

                                        {/* Right: Confidence Gauge */}
                                        <div className="flex items-center justify-center">
                                            <ConfidenceGauge value={recommendation.confidence} riskLevel={recommendation.riskLevel} />
                                        </div>
                                    </div>

                                    {/* ─── SEPARATOR ─── */}
                                    <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-default)] to-transparent mb-6" />

                                    {/* ─── METRICS ROW ─── */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                        {Object.entries(metrics).map(([key, metric], i) => (
                                            <MetricRow key={key} metric={metric} metricKey={key} delay={i * 0.1} />
                                        ))}
                                    </div>

                                    {/* ─── ACTIONS ─── */}
                                    <div className="flex items-center gap-3">
                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                            onClick={() => setShowForm(true)}
                                            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 transition-all"
                                        >
                                            <ClipboardEdit size={14} /> Enter Farm Data
                                        </motion.button>
                                        {fullAnalysis && (
                                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                                onClick={() => setShowModal(true)}
                                                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-secondary)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] border border-[var(--border-subtle)] transition-all"
                                            >
                                                <Maximize2 size={14} /> View Full Analysis
                                            </motion.button>
                                        )}
                                    </div>

                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </motion.div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && fullAnalysis && (
                    <AnalysisModal text={fullAnalysis} onClose={() => setShowModal(false)} />
                )}
            </AnimatePresence>
        </>
    );
}

/* ═══ MOCK DATA ═══ */
export const MOCK_YIELD_OPTIMIZER_DATA: YieldOptimizerData = {
    metrics: {
        soilMoisture: { label: "Soil Moisture", value: 42, unit: "%", idealMin: 50, idealMax: 75, icon: "droplets" },
        rainProbability: { label: "Rain Probability", value: 78, unit: "%", idealMin: 0, idealMax: 30, icon: "cloud-rain" },
        fertilizerPrice: { label: "Fertilizer Price", value: 1450, unit: "₹/bag", idealMin: 800, idealMax: 1200, icon: "package" },
        yieldProjection: { label: "Yield Projection", value: 34, unit: " q/ha", idealMin: 30, idealMax: 45, icon: "trending-up" },
    },
    recommendation: {
        action: "HOLD",
        riskLevel: "critical",
        headline: "Do not apply fertilizer today.",
        rationale: "78% rain probability in next 12 hours creates high nutrient runoff risk. Soil moisture at 42% is below ideal threshold. Applying ₹1,450/bag fertilizer now projects ₹1,200/acre loss due to wash-away.",
        projectedImpact: -1200,
        confidence: 91,
    },
    yieldTrend: [
        { timestamp: "Feb 9", value: 31 }, { timestamp: "Feb 10", value: 32 }, { timestamp: "Feb 11", value: 30 },
        { timestamp: "Feb 12", value: 33 }, { timestamp: "Feb 13", value: 34 }, { timestamp: "Feb 14", value: 33 }, { timestamp: "Feb 15", value: 34 },
    ],
    lastUpdated: "2 min ago",
};
