"use client";

import { create } from "zustand";

interface SidebarState {
    isCollapsed: boolean;
    isMobileOpen: boolean;
    toggle: () => void;
    setCollapsed: (collapsed: boolean) => void;
    toggleMobile: () => void;
    closeMobile: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
    isCollapsed: false,
    isMobileOpen: false,
    toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
    setCollapsed: (collapsed: boolean) => set({ isCollapsed: collapsed }),
    toggleMobile: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
    closeMobile: () => set({ isMobileOpen: false }),
}));
