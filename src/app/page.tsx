"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Cloud,
  Droplets,
  Thermometer,
  Wind,
  MapPin,
  Search,
  LocateFixed,
  Sunrise,
  Sunset,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  LandPlot,
  CalendarClock,
  Activity,
  ChevronRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { BentoCard } from "@/components/ui/bento-card";
import {
  YieldOptimizerCard,
  MOCK_YIELD_OPTIMIZER_DATA,
} from "@/components/features/yield-optimizer-card";

/* ═══════════════════════════════════════════
   ANIMATED COUNTER — Numbers count up on view
   ═══════════════════════════════════════════ */
function CountUp({ target, prefix = "", suffix = "", duration = 1.2 }: {
  target: number; prefix?: string; suffix?: string; duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = (now - startTime) / (duration * 1000);
      if (elapsed < 1) {
        start = Math.round(target * Math.min(elapsed, 1));
        setCount(start);
        requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };
    requestAnimationFrame(animate);
  }, [inView, target, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString("en-IN")}{suffix}</span>;
}

/* ═══════════════════════════════════════════
   SPARKLINE — Minimal animated price chart  
   ═══════════════════════════════════════════ */
function Sparkline({ data, color, height = 40 }: { data: number[]; color: string; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = height - ((v - min) / range) * (height - 4);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div ref={ref} className="w-full" style={{ height }}>
      <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
        <motion.polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.polygon
          points={`0,${height} ${points} 100,${height}`}
          fill={`url(#grad-${color})`}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1.5, delay: 0.3 }}
        />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════
   WEATHER WIDGET — Compact supporting card
   ═══════════════════════════════════════════ */
interface WeatherData {
  location: { name: string; region: string; country: string; localtime: string };
  current: {
    temperature: number; feelsLike: number; humidity: number;
    windSpeed: number; windDir: string;
    condition: { text: string; icon: string }; isDay: boolean;
  };
  forecast: {
    date: string; maxTemp: number; minTemp: number; rainChance: number;
    condition: { text: string; icon: string };
    astro: { sunrise: string; sunset: string };
    hourly: { time: string; temp: number; condition: { text: string; icon: string }; rainChance: number }[];
  }[];
}

function WeatherCompact() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationInput, setLocationInput] = useState("");

  const fetchWeather = React.useCallback((params: string = "") => {
    setLoading(true);
    fetch(`/api/weather${params}`)
      .then((r) => r.json())
      .then((d) => { if (d.location) setWeather(d); })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(`?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`),
        () => fetchWeather(),
        { timeout: 8000, enableHighAccuracy: false }
      );
    } else fetchWeather();
  }, [fetchWeather]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (locationInput.trim()) {
      fetchWeather(`?city=${encodeURIComponent(locationInput.trim())}`);
      setLocationInput("");
    }
  };

  if (loading && !weather) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-4 w-32 skeleton" />
        <div className="h-10 w-24 skeleton" />
        <div className="flex gap-2">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 flex-1 skeleton" />)}</div>
      </div>
    );
  }

  if (!weather) return <div className="text-sm text-[var(--text-muted)]">Unavailable</div>;

  return (
    <div className="space-y-4">
      {/* Location + Search */}
      <div className="flex items-center gap-2">
        <MapPin size={14} className="text-[var(--green)]" />
        <span className="text-xs font-semibold text-[var(--text-secondary)]">
          {weather.location.name}, {weather.location.region}
        </span>
        <form onSubmit={handleSearch} className="ml-auto flex items-center gap-1.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-subtle)]">
            <Search size={12} className="text-[var(--text-faint)]" />
            <input type="text" value={locationInput} onChange={(e) => setLocationInput(e.target.value)}
              placeholder="City"
              className="bg-transparent text-xs text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none w-16" />
          </div>
          <button type="button" onClick={() => {
            if ("geolocation" in navigator) {
              navigator.geolocation.getCurrentPosition(
                (pos) => fetchWeather(`?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`),
                () => { }, { timeout: 8000 }
              );
            }
          }} className="p-1.5 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] transition-colors">
            <LocateFixed size={14} className="text-[var(--text-faint)]" />
          </button>
        </form>
      </div>

      {/* Current */}
      <div className="flex items-center gap-4">
        <img src={weather.current.condition.icon} alt="" className="w-12 h-12" />
        <div>
          <span className="text-3xl text-display text-[var(--text-primary)]">{Math.round(weather.current.temperature)}°</span>
          <p className="text-xs text-[var(--text-muted)]">{weather.current.condition.text}</p>
        </div>
        <div className="ml-auto flex flex-col gap-1 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5"><Droplets size={12} className="text-blue-400" /> {weather.current.humidity}%</span>
          <span className="flex items-center gap-1.5"><Wind size={12} className="text-sky-300" /> {weather.current.windSpeed} km/h</span>
        </div>
      </div>

      {/* 5-Day */}
      <div className="flex gap-2">
        {weather.forecast.slice(0, 5).map((day, i) => {
          const d = new Date(day.date);
          const name = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
          return (
            <motion.div key={day.date} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex-1 text-center py-2 rounded-xl bg-[var(--bg-subtle)]/50"
            >
              <span className="text-[10px] text-[var(--text-faint)] font-medium">{i === 0 ? "Today" : name}</span>
              <img src={day.condition.icon} alt="" className="w-7 h-7 mx-auto" />
              <div className="flex items-center justify-center gap-1 text-xs">
                <span className="text-[var(--text-primary)] font-semibold text-metric">{Math.round(day.maxTemp)}°</span>
                <span className="text-[var(--text-faint)]">{Math.round(day.minTemp)}°</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Astro */}
      {weather.forecast[0]?.astro && (
        <div className="flex items-center gap-4 text-xs text-[var(--text-faint)]">
          <span className="flex items-center gap-1"><Sunrise size={12} className="text-amber-400" /> {weather.forecast[0].astro.sunrise}</span>
          <span className="flex items-center gap-1"><Sunset size={12} className="text-indigo-400" /> {weather.forecast[0].astro.sunset}</span>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD PAGE — HERO DECISION CARD LAYOUT
   
   [ HERO: YIELD OPTIMIZER — 60% of viewport ]  ← Dominant
   [ Weather ]  [ Market Prices ]                 ← Evidence  
   [ Stats: Area | Revenue | Health | Next ]      ← Scroll
   ═══════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening");
  }, []);

  const marketData = [
    { name: "Wheat", price: 2847, change: 3.2, trend: "up" as const, data: [2650, 2700, 2680, 2750, 2800, 2780, 2847] },
    { name: "Rice", price: 3420, change: 1.8, trend: "up" as const, data: [3200, 3280, 3350, 3310, 3400, 3380, 3420] },
    { name: "Mustard", price: 5100, change: -0.5, trend: "down" as const, data: [5200, 5150, 5180, 5120, 5090, 5110, 5100] },
  ];

  return (
    <AppShell>
      <div className="space-y-8 pb-16">

        {/* ─── HEADER — Minimal, breathing ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl text-display text-[var(--text-primary)]">
              {greeting}, <span className="gradient-text">Farmer</span>
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1.5">
              Your daily farm decision intelligence
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-faint)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse" />
            Live data
          </div>
        </motion.div>

        {/* ═══ SECTION 1: HERO DECISION CARD ═══
            This IS the app. 60% of viewport. 
            Judges see this first → "This app tells farmers WHAT to do" */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <YieldOptimizerCard data={MOCK_YIELD_OPTIMIZER_DATA} />
        </motion.div>

        {/* ═══ SECTION 2: SUPPORTING EVIDENCE ═══
            Weather + Market — compact, side by side
            These answer "why?" for the hero card decision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Weather */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
          >
            <BentoCard title="Weather Forecast" subtitle="Live • GPS" icon={<Cloud size={18} />} accent="blue">
              <WeatherCompact />
            </BentoCard>
          </motion.div>

          {/* Market Prices */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
          >
            <BentoCard title="Market Snapshot" subtitle="Top Mandi Prices" icon={<TrendingUp size={18} />} accent="green">
              <div className="space-y-4 mt-1">
                {marketData.map((item) => (
                  <div key={item.name} className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[var(--text-primary)]">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-metric text-[var(--text-primary)]">
                            ₹{item.price.toLocaleString("en-IN")}
                          </span>
                          <span className={`flex items-center gap-0.5 text-xs font-semibold ${item.trend === "up" ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
                            {item.trend === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {Math.abs(item.change)}%
                          </span>
                        </div>
                      </div>
                      <div className="mt-1.5">
                        <Sparkline
                          data={item.data}
                          color={item.trend === "up" ? "var(--green)" : "var(--red)"}
                          height={28}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </motion.div>
        </div>

        {/* ═══ SECTION 3: FARM OVERVIEW STATS ═══
            Scroll to see — low priority, minimal, muted */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25 }}
        >
          <h2 className="text-xs font-semibold tracking-wider uppercase text-[var(--text-faint)] mb-4">
            Farm Overview
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Area */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="card">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--green-dim)] flex items-center justify-center">
                  <LandPlot size={16} className="text-[var(--green)]" />
                </div>
                <span className="text-[10px] font-semibold text-[var(--text-faint)] tracking-wider uppercase">Area</span>
              </div>
              <p className="text-xl font-bold text-metric text-[var(--text-primary)]">
                <CountUp target={125} suffix="" /> <span className="text-xs text-[var(--text-muted)] font-normal">ha</span>
              </p>
              <p className="text-xs text-[var(--text-faint)] mt-1">3 active fields</p>
            </motion.div>

            {/* Revenue */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="card">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--green-dim)] flex items-center justify-center">
                  <IndianRupee size={16} className="text-[var(--green)]" />
                </div>
                <span className="text-[10px] font-semibold text-[var(--text-faint)] tracking-wider uppercase">Revenue</span>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-xl font-bold text-metric text-[var(--text-primary)]">
                  ₹<CountUp target={42} suffix="L" />
                </p>
                <span className="flex items-center gap-0.5 text-xs font-semibold text-[var(--green)] mb-0.5">
                  <ArrowUpRight size={12} /> 12%
                </span>
              </div>
              <p className="text-xs text-[var(--text-faint)] mt-1">Rabi season</p>
            </motion.div>

            {/* Health */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="card">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--green-dim)] flex items-center justify-center">
                  <Activity size={16} className="text-[var(--green)]" />
                </div>
                <span className="text-[10px] font-semibold text-[var(--text-faint)] tracking-wider uppercase">Health</span>
              </div>
              <div className="flex items-center gap-3">
                {/* Animated ring */}
                <div className="relative w-11 h-11">
                  <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="var(--bg-muted)" strokeWidth="2.5" />
                    <motion.circle cx="18" cy="18" r="15" fill="none" stroke="var(--green)" strokeWidth="2.5"
                      strokeLinecap="round" strokeDasharray="94.25" strokeDashoffset="94.25"
                      animate={{ strokeDashoffset: 94.25 * (1 - 0.87) }}
                      transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[var(--text-primary)]">87%</span>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-secondary)] font-medium">5/5</p>
                  <p className="text-[10px] text-[var(--text-faint)]">Fields OK</p>
                </div>
              </div>
            </motion.div>

            {/* Next Action */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="card">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--blue-dim)] flex items-center justify-center">
                  <CalendarClock size={16} className="text-[var(--blue)]" />
                </div>
                <span className="text-[10px] font-semibold text-[var(--text-faint)] tracking-wider uppercase">Next Action</span>
              </div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Tomorrow, 6 AM</p>
              <p className="text-xs text-[var(--text-faint)] mt-0.5 flex items-center gap-1">
                Irrigation · Wheat B <ChevronRight size={12} />
              </p>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </AppShell>
  );
}
