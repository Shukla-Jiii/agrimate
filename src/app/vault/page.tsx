"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Vault as VaultIcon,
    FileText,
    Image,
    Database,
    Upload,
    FolderOpen,
    Clock,
    HardDrive,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { BentoGrid, BentoCard } from "@/components/ui/bento-card";

const recentFiles = [
    { name: "Wheat_Yield_Report_2026.pdf", type: "pdf", size: "2.4 MB", date: "Feb 14" },
    { name: "Field_B_Soil_Analysis.csv", type: "data", size: "856 KB", date: "Feb 13" },
    { name: "Satellite_Overview_Jan.png", type: "image", size: "4.1 MB", date: "Feb 10" },
    { name: "Revenue_Q3_Summary.xlsx", type: "data", size: "1.2 MB", date: "Feb 08" },
    { name: "Crop_Insurance_Docs.pdf", type: "pdf", size: "3.8 MB", date: "Feb 05" },
];

const fileIcons = {
    pdf: <FileText size={16} className="text-red-400" />,
    data: <Database size={16} className="text-blue-400" />,
    image: <Image size={16} className="text-purple-400" />,
};

export default function VaultPage() {
    return (
        <AppShell>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8 pb-16"
            >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl text-display text-[var(--text-primary)]">
                            Data <span className="gradient-text">Vault</span>
                        </h1>
                        <p className="text-sm text-[var(--text-muted)] mt-1.5">
                            Secure storage for farm records, reports & documents
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-semibold shadow-[0_0_20px_rgba(34,197,94,0.15)] hover:shadow-[0_0_30px_rgba(34,197,94,0.25)] transition-shadow"
                    >
                        <Upload size={16} />
                        Upload File
                    </motion.button>
                </div>

                {/* Stats */}
                <BentoGrid className="grid-cols-1 sm:grid-cols-3">
                    <BentoCard
                        title="24 Files"
                        subtitle="Total Documents"
                        icon={<FolderOpen size={18} />}
                        accent="green"
                    >
                        <p className="text-xs text-[var(--text-faint)] mt-1">
                            PDFs, CSVs, Images
                        </p>
                    </BentoCard>
                    <BentoCard
                        title="48.2 MB"
                        subtitle="Storage Used"
                        icon={<HardDrive size={18} />}
                        accent="blue"
                    >
                        <div className="mt-2 h-1.5 bg-[var(--bg-muted)] rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "32%" }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-[var(--green)]"
                            />
                        </div>
                        <p className="text-[10px] text-[var(--text-faint)] mt-1">
                            32% of 150 MB
                        </p>
                    </BentoCard>
                    <BentoCard
                        title="Feb 14"
                        subtitle="Last Upload"
                        icon={<Clock size={18} />}
                        accent="neutral"
                    >
                        <p className="text-xs text-[var(--text-faint)] mt-1">
                            Wheat_Yield_Report_2026.pdf
                        </p>
                    </BentoCard>
                </BentoGrid>

                {/* File List */}
                <div className="card !p-0 overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
                        <h2 className="text-sm font-semibold text-[var(--text-secondary)]">
                            Recent Files
                        </h2>
                    </div>
                    <div className="divide-y divide-[var(--border-subtle)]">
                        {recentFiles.map((file, i) => (
                            <motion.div
                                key={file.name}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                whileHover={{ backgroundColor: "var(--bg-card-hover)" }}
                                className="flex items-center gap-4 px-6 py-3.5 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--bg-subtle)] group-hover:bg-[var(--bg-muted)] transition-colors">
                                    {fileIcons[file.type as keyof typeof fileIcons]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-[11px] text-[var(--text-faint)]">
                                        {file.size}
                                    </p>
                                </div>
                                <span className="text-xs text-[var(--text-faint)]">
                                    {file.date}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </AppShell>
    );
}
