"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./Sidebar";
import { PageTransition } from "./PageTransition";
import { BrandWordmark } from "@/components/brand/BrandWordmark";

export function MainLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Ambient background orbs — always present, very subtle */}
      <div className="ambient-orb-1" aria-hidden="true" />
      <div className="ambient-orb-2" aria-hidden="true" />

      {/* Mobile backdrop overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden lg:ml-64 relative z-10">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 h-14 px-4 border-b border-border bg-background/85 backdrop-blur-md sticky top-0 z-30 shrink-0">
          <motion.button
            onClick={() => setSidebarOpen(true)}
            whileTap={{ scale: 0.93 }}
            className="p-2 -ml-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Open navigation menu"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </motion.button>
          <BrandWordmark size="sm" />
        </div>

        {/* Page content with transitions */}
        <PageTransition>{children}</PageTransition>
      </div>
    </div>
  );
}
