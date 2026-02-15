"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BrainCircuit,
    Send,
    Sparkles,
    Bot,
    User,
    AlertCircle,
    Loader2,
    Trash2,
    Wheat,
    TrendingUp,
    CloudRain,
    Pill,
    Plus,
    MessageSquare,
    Pencil,
    Check,
    X,
    ChevronLeft,
    History,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { cn } from "@/lib/utils";
import { useChatStore, type ChatMessage } from "@/stores/chat-store";

/* ─── QUICK PROMPTS ─── */
const quickPrompts = [
    {
        icon: <Wheat size={15} />,
        label: "Best time to sell wheat?",
        color: "text-amber-400",
    },
    {
        icon: <CloudRain size={15} />,
        label: "Rain impact on my harvest",
        color: "text-sky-400",
    },
    {
        icon: <TrendingUp size={15} />,
        label: "Maximize soybean ROI",
        color: "text-emerald-400",
    },
    {
        icon: <Pill size={15} />,
        label: "Organic vs chemical pest control cost",
        color: "text-purple-400",
    },
];

/* ─── TYPING INDICATOR ─── */
function TypingIndicator() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex gap-3 justify-start"
        >
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
                <Bot size={16} className="text-white" />
            </div>
            <div className="rounded-2xl rounded-tl-sm px-5 py-3 bg-[var(--bg-subtle)] border border-[var(--border-default)]">
                <div className="flex items-center gap-2">
                    {[0, 1, 2].map((i) => (
                        <motion.span
                            key={i}
                            className="w-2 h-2 rounded-full bg-[var(--green)]"
                            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                        />
                    ))}
                    <span className="text-sm text-[var(--text-muted)] ml-2">
                        AgriMate is analyzing...
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

/* ─── WELCOME CARD ─── */
function WelcomeCard({ onPromptClick }: { onPromptClick: (p: string) => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center justify-center h-full py-12"
        >
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-blue-600 mb-6 shadow-[0_0_40px_rgba(34,197,94,0.15)]">
                <BrainCircuit size={34} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">
                AgriMate AI
            </h2>
            <p className="text-base text-[var(--text-muted)] max-w-md text-center leading-relaxed mb-10">
                Your blunt-truth agricultural economist. Ask about crop decisions,
                market timing, cost-benefit analysis, or weather impact on your farm.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {quickPrompts.map((p) => (
                    <motion.button
                        key={p.label}
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onPromptClick(p.label)}
                        className="flex items-center gap-3 px-5 py-4 rounded-xl bg-[var(--bg-card)] border border-transparent hover:border-[var(--border-default)] text-left transition-all duration-200 group"
                    >
                        <span className={cn("opacity-70 group-hover:opacity-100 transition-opacity", p.color)}>
                            {p.icon}
                        </span>
                        <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                            {p.label}
                        </span>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
}

/* ─── FORMAT MARKDOWN (lightweight) ─── */
function formatMarkdown(text: string): string {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[var(--text-primary)] font-semibold">$1</strong>')
        .replace(/^### (.+)$/gm, '<h4 class="text-base font-bold text-[var(--text-primary)] mt-3 mb-1">$1</h4>')
        .replace(/^## (.+)$/gm, '<h3 class="text-base font-bold text-[var(--text-primary)] mt-3 mb-1">$1</h3>')
        .replace(/^[-•] (.+)$/gm, '<div class="flex gap-2 ml-1"><span class="text-[var(--green)] mt-0.5">•</span><span>$1</span></div>')
        .replace(/^(\d+)\. (.+)$/gm, '<div class="flex gap-2 ml-1"><span class="text-[var(--green)] font-mono text-sm mt-0.5">$1.</span><span>$2</span></div>')
        .replace(/\n\n/g, '<div class="h-3"></div>')
        .replace(/\n/g, "<br/>");
}

/* ─── CONVERSATION SIDEBAR ─── */
function ConversationSidebar({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const {
        conversations,
        activeConversationId,
        createConversation,
        deleteConversation,
        renameConversation,
        setActiveConversation,
    } = useChatStore();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");

    const startRename = (id: string, currentTitle: string) => {
        setEditingId(id);
        setEditTitle(currentTitle);
    };

    const confirmRename = () => {
        if (editingId && editTitle.trim()) {
            renameConversation(editingId, editTitle.trim());
        }
        setEditingId(null);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: -280, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -280, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="absolute left-0 top-0 bottom-0 w-[280px] bg-[var(--bg-elevated)] border-r border-[var(--border-subtle)] z-20 flex flex-col"
                >
                    {/* Sidebar Header */}
                    <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <History size={16} className="text-[var(--green)]" />
                            <span className="text-sm font-semibold text-[var(--text-primary)]">Conversations</span>
                        </div>
                        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-white/[0.04]">
                            <ChevronLeft size={16} className="text-[var(--text-muted)]" />
                        </button>
                    </div>

                    {/* New Chat Button */}
                    <div className="p-3">
                        <button
                            onClick={() => createConversation()}
                            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--text-primary)] bg-gradient-to-r from-emerald-600/20 to-blue-600/10 border border-[var(--green)]/20 hover:border-[var(--green)]/40 transition-all"
                        >
                            <Plus size={16} />
                            New Chat
                        </button>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                        {conversations.length === 0 ? (
                            <p className="text-sm text-[var(--text-muted)] text-center py-8">
                                No conversations yet
                            </p>
                        ) : (
                            conversations.map((c) => (
                                <div
                                    key={c.id}
                                    className={cn(
                                        "group flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm",
                                        c.id === activeConversationId
                                            ? "bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)]"
                                            : "text-[var(--text-secondary)] hover:bg-white/[0.03] border border-transparent"
                                    )}
                                    onClick={() => setActiveConversation(c.id)}
                                >
                                    <MessageSquare size={14} className="flex-shrink-0 text-[var(--text-muted)]" />
                                    <div className="flex-1 min-w-0">
                                        {editingId === c.id ? (
                                            <div className="flex items-center gap-1">
                                                <input
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    onKeyDown={(e) => e.key === "Enter" && confirmRename()}
                                                    className="bg-[var(--bg-subtle)] rounded px-2 py-1 text-sm text-[var(--text-primary)] outline-none border border-[var(--green)]/30 w-full"
                                                    autoFocus
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <button onClick={(e) => { e.stopPropagation(); confirmRename(); }}>
                                                    <Check size={12} className="text-[var(--green)]" />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }}>
                                                    <X size={12} className="text-red-400" />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="truncate block">{c.title}</span>
                                        )}
                                        <span className="text-xs text-[var(--text-muted)]">
                                            {c.messages.length} messages
                                        </span>
                                    </div>
                                    {editingId !== c.id && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); startRename(c.id, c.title); }}
                                                className="p-1 rounded hover:bg-white/[0.06]"
                                            >
                                                <Pencil size={12} className="text-[var(--text-muted)]" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                                                className="p-1 rounded hover:bg-red-500/10"
                                            >
                                                <Trash2 size={12} className="text-red-400/60" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/* ═══════════════════════════════════════════
   AI LAB PAGE — MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function AILabPage() {
    const {
        activeConversationId,
        getActiveConversation,
        createConversation,
        addMessage,
        clearConversation,
    } = useChatStore();

    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Fix hydration: wait until client-side mount to read localStorage state
    useEffect(() => {
        setMounted(true);
    }, []);

    // Get active conversation (only after mount to avoid hydration mismatch)
    const activeConvo = mounted ? getActiveConversation() : undefined;
    const messages = activeConvo?.messages || [];
    const hasMessages = mounted && messages.length > 0;

    // Create initial conversation if none exists (client-only)
    useEffect(() => {
        if (mounted && !activeConversationId) {
            createConversation();
        }
    }, [mounted, activeConversationId, createConversation]);

    // Auto-scroll on new messages
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, scrollToBottom]);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "0px";
            const scrollHeight = textarea.scrollHeight;
            textarea.style.height = Math.min(scrollHeight, 120) + "px";
        }
    }, [input]);

    const sendMessage = async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || isLoading || !activeConversationId) return;

        const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content: trimmed,
            timestamp: new Date().toISOString(),
        };

        addMessage(activeConversationId, userMsg);
        setInput("");
        setIsLoading(true);

        if (textareaRef.current) {
            textareaRef.current.style.height = "44px";
        }

        try {
            const history = messages.map((m) => ({
                role: m.role,
                content: m.content,
            }));

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: trimmed, history }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Request failed");
            }

            const assistantMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: data.reply,
                timestamp: new Date().toISOString(),
            };

            addMessage(activeConversationId, assistantMsg);
        } catch (error) {
            const errorMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: "assistant",
                content:
                    error instanceof Error
                        ? error.message
                        : "Something went wrong. Please try again.",
                timestamp: new Date().toISOString(),
                error: true,
            };
            addMessage(activeConversationId, errorMsg);
        } finally {
            setIsLoading(false);
            textareaRef.current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    const handleClear = () => {
        if (activeConversationId) {
            clearConversation(activeConversationId);
        }
    };

    const handleNewChat = () => {
        createConversation();
    };

    return (
        <AppShell>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="h-[calc(100vh-6rem)] flex flex-col relative"
            >
                {/* Conversation Sidebar */}
                <ConversationSidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                {/* ── HEADER ── */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* History toggle */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="flex items-center justify-center w-11 h-11 rounded-xl bg-[var(--bg-card)] border border-transparent hover:border-[var(--border-default)] transition-all"
                        >
                            <History size={20} className="text-[var(--text-secondary)]" />
                        </motion.button>
                        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 shadow-[0_0_24px_rgba(34,197,94,0.15)]">
                            <BrainCircuit size={22} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                                AI <span className="gradient-text">Lab</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-sm text-[var(--text-muted)]">
                                    Nemotron Super 49B via NVIDIA NIM • Agricultural economist
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* New Chat */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleNewChat}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:text-[var(--green)] bg-[var(--bg-card)] border border-transparent hover:border-[var(--green)]/30 transition-all duration-200"
                        >
                            <Plus size={14} />
                            New
                        </motion.button>

                        {hasMessages && (
                            <motion.button
                                initial={false}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleClear}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:text-red-400 bg-white/[0.02] border border-white/[0.06] hover:border-red-500/30 transition-all duration-200"
                            >
                                <Trash2 size={14} />
                                Clear
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* ── CHAT CONTAINER ── */}
                <div className="flex-1 flex flex-col rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] overflow-hidden">
                    {/* Messages area */}
                    <div
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 scrollbar-thin"
                    >
                        {!hasMessages ? (
                            <WelcomeCard onPromptClick={sendMessage} />
                        ) : (
                            <>
                                <AnimatePresence mode="popLayout">
                                    {messages.map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 12, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -12 }}
                                            transition={{ duration: 0.3 }}
                                            className={cn(
                                                "flex gap-3",
                                                msg.role === "user" ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            {msg.role === "assistant" && (
                                                <div
                                                    className={cn(
                                                        "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
                                                        msg.error
                                                            ? "bg-red-500/20 border border-red-500/30"
                                                            : "bg-gradient-to-br from-emerald-500 to-blue-500"
                                                    )}
                                                >
                                                    {msg.error ? (
                                                        <AlertCircle size={16} className="text-red-400" />
                                                    ) : (
                                                        <Bot size={16} className="text-white" />
                                                    )}
                                                </div>
                                            )}

                                            <div
                                                className={cn(
                                                    "max-w-[85%] sm:max-w-[75%] text-[15px] leading-relaxed",
                                                    msg.role === "user"
                                                        ? "rounded-2xl rounded-tr-sm px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_2px_12px_rgba(34,197,94,0.15)]"
                                                        : msg.error
                                                            ? "rounded-2xl rounded-tl-sm px-5 py-3.5 bg-red-500/[0.06] border border-red-500/20 text-red-300"
                                                            : "rounded-2xl rounded-tl-sm px-5 py-3.5 bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)]"
                                                )}
                                            >
                                                {msg.role === "assistant" && !msg.error ? (
                                                    <div
                                                        className="prose-agri [&_strong]:text-[var(--text-primary)] [&_h3]:text-[var(--text-primary)] [&_h4]:text-[var(--text-primary)]"
                                                        dangerouslySetInnerHTML={{
                                                            __html: formatMarkdown(msg.content),
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="whitespace-pre-wrap">{msg.content}</span>
                                                )}
                                            </div>

                                            {msg.role === "user" && (
                                                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[var(--bg-muted)] border border-[var(--border-subtle)] flex items-center justify-center">
                                                    <User size={16} className="text-[var(--text-secondary)]" />
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                <AnimatePresence>
                                    {isLoading && <TypingIndicator />}
                                </AnimatePresence>
                            </>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* ── QUICK PROMPTS (shown when there are messages) ── */}
                    {hasMessages && !isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="px-5 sm:px-7 py-3 border-t border-[var(--border-subtle)]"
                        >
                            <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none">
                                <Sparkles
                                    size={14}
                                    className="text-[var(--text-muted)] flex-shrink-0"
                                />
                                {quickPrompts.map((p) => (
                                    <motion.button
                                        key={p.label}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => sendMessage(p.label)}
                                        className="flex-shrink-0 flex items-center gap-2 text-sm px-3.5 py-2 rounded-full bg-[var(--bg-card)] text-[var(--text-muted)] border border-transparent hover:border-[var(--border-default)] hover:text-[var(--text-primary)] transition-all duration-200"
                                    >
                                        <span className={p.color}>{p.icon}</span>
                                        {p.label}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ── INPUT BOX ── */}
                    <div className="p-4 sm:p-5 border-t border-[var(--border-default)]">
                        <div
                            className={cn(
                                "flex items-end gap-3 rounded-xl px-5 py-3 transition-all duration-300",
                                "bg-[var(--bg-subtle)] border",
                                input.length > 0 || isFocused
                                    ? "border-[var(--green)]/30 shadow-[0_0_20px_rgba(34,197,94,0.06)]"
                                    : "border-[var(--border-subtle)]"
                            )}
                        >
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                placeholder="Ask AgriMate about crop decisions, market timing, costs..."
                                rows={1}
                                disabled={isLoading}
                                className={cn(
                                    "flex-1 bg-transparent resize-none text-base text-[var(--text-primary)]",
                                    "placeholder:text-[var(--text-muted)] outline-none",
                                    "min-h-[48px] max-h-[120px] py-2.5",
                                    "disabled:opacity-50"
                                )}
                            />
                            <div className="flex items-center gap-2 pb-2">
                                {input.length > 0 && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-xs tabular-nums text-[var(--text-muted)]"
                                    >
                                        {input.length}
                                    </motion.span>
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.08 }}
                                    whileTap={{ scale: 0.92 }}
                                    onClick={() => sendMessage(input)}
                                    disabled={!input.trim() || isLoading}
                                    className={cn(
                                        "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200",
                                        input.trim() && !isLoading
                                            ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_2px_12px_rgba(34,197,94,0.25)] hover:shadow-[0_4px_20px_rgba(34,197,94,0.35)]"
                                            : "bg-[var(--bg-muted)] text-[var(--text-muted)] cursor-not-allowed"
                                    )}
                                >
                                    {isLoading ? (
                                        <Loader2 size={17} className="animate-spin" />
                                    ) : (
                                        <Send size={17} />
                                    )}
                                </motion.button>
                            </div>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-2 text-center opacity-60">
                            Powered by NVIDIA Nemotron Super 49B • Conversations auto-saved • Shift+Enter for new line
                        </p>
                    </div>
                </div>
            </motion.div>
        </AppShell>
    );
}
