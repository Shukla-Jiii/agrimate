"use client";

import { create } from "zustand";

/* ─── TYPES ─── */
export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string; // ISO string for serialization
    error?: boolean;
}

export interface Conversation {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: string;
    updatedAt: string;
}

interface ChatState {
    conversations: Conversation[];
    activeConversationId: string | null;

    // Getters
    getActiveConversation: () => Conversation | undefined;

    // Actions
    createConversation: () => string;
    deleteConversation: (id: string) => void;
    renameConversation: (id: string, title: string) => void;
    setActiveConversation: (id: string | null) => void;
    addMessage: (conversationId: string, message: ChatMessage) => void;
    clearConversation: (id: string) => void;
}

/* ─── HELPERS ─── */
function generateTitle(firstMessage: string): string {
    // Take first 40 chars of first user message as title
    const clean = firstMessage.replace(/[#*_~`]/g, "").trim();
    if (clean.length <= 40) return clean;
    return clean.substring(0, 37) + "...";
}

function loadFromStorage(): { conversations: Conversation[]; activeId: string | null } {
    if (typeof window === "undefined") return { conversations: [], activeId: null };
    try {
        const data = localStorage.getItem("agrimate-chat-history");
        if (data) {
            const parsed = JSON.parse(data);
            return {
                conversations: parsed.conversations || [],
                activeId: parsed.activeConversationId || null,
            };
        }
    } catch {
        // Corrupted data, reset
    }
    return { conversations: [], activeId: null };
}

function saveToStorage(conversations: Conversation[], activeId: string | null) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(
            "agrimate-chat-history",
            JSON.stringify({ conversations, activeConversationId: activeId })
        );
    } catch {
        // Storage full or unavailable
    }
}

/* ─── STORE ─── */
export const useChatStore = create<ChatState>((set, get) => {
    const initial = loadFromStorage();

    return {
        conversations: initial.conversations,
        activeConversationId: initial.activeId,

        getActiveConversation: () => {
            const { conversations, activeConversationId } = get();
            return conversations.find((c) => c.id === activeConversationId);
        },

        createConversation: () => {
            const id = crypto.randomUUID();
            const newConvo: Conversation = {
                id,
                title: "New Chat",
                messages: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            set((state) => {
                const updated = [newConvo, ...state.conversations];
                saveToStorage(updated, id);
                return { conversations: updated, activeConversationId: id };
            });
            return id;
        },

        deleteConversation: (id) => {
            set((state) => {
                const updated = state.conversations.filter((c) => c.id !== id);
                const newActive =
                    state.activeConversationId === id
                        ? updated[0]?.id || null
                        : state.activeConversationId;
                saveToStorage(updated, newActive);
                return { conversations: updated, activeConversationId: newActive };
            });
        },

        renameConversation: (id, title) => {
            set((state) => {
                const updated = state.conversations.map((c) =>
                    c.id === id ? { ...c, title, updatedAt: new Date().toISOString() } : c
                );
                saveToStorage(updated, state.activeConversationId);
                return { conversations: updated };
            });
        },

        setActiveConversation: (id) => {
            set((state) => {
                saveToStorage(state.conversations, id);
                return { activeConversationId: id };
            });
        },

        addMessage: (conversationId, message) => {
            set((state) => {
                const updated = state.conversations.map((c) => {
                    if (c.id !== conversationId) return c;

                    const updatedMessages = [...c.messages, message];

                    // Auto-name from first user message
                    let title = c.title;
                    if (
                        title === "New Chat" &&
                        message.role === "user" &&
                        c.messages.filter((m) => m.role === "user").length === 0
                    ) {
                        title = generateTitle(message.content);
                    }

                    return {
                        ...c,
                        messages: updatedMessages,
                        title,
                        updatedAt: new Date().toISOString(),
                    };
                });
                saveToStorage(updated, state.activeConversationId);
                return { conversations: updated };
            });
        },

        clearConversation: (id) => {
            set((state) => {
                const updated = state.conversations.map((c) =>
                    c.id === id
                        ? { ...c, messages: [], title: "New Chat", updatedAt: new Date().toISOString() }
                        : c
                );
                saveToStorage(updated, state.activeConversationId);
                return { conversations: updated };
            });
        },
    };
});
