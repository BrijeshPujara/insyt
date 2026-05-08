"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ToastContext, useToast } from "@/lib/hooks/use-toast";
import type { ToastItem } from "@/lib/hooks/use-toast";

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (t: Omit<ToastItem, "id">) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev.slice(-4), { ...t, id }]);
      const duration = t.duration ?? 4500;
      setTimeout(() => removeToast(id), duration);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

// ─── Icons / styles ────────────────────────────────────────────────────────────

const iconMap: Record<string, string> = {
  success: "check_circle",
  error: "error",
  warning: "warning",
  info: "info",
};

const containerStyle: Record<string, string> = {
  success: "border-emerald-500/25 bg-emerald-500/8",
  error: "border-red-500/25 bg-red-500/8",
  warning: "border-amber-500/25 bg-amber-500/8",
  info: "border-primary/20 bg-primary/8",
};

const iconStyle: Record<string, string> = {
  success: "text-emerald-400",
  error: "text-red-400",
  warning: "text-amber-400",
  info: "text-primary",
};

// ─── Toaster ──────────────────────────────────────────────────────────────────

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            role="alert"
            initial={{ opacity: 0, y: -12, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{
              opacity: 0,
              x: 20,
              scale: 0.92,
              transition: { duration: 0.18 },
            }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-lg max-w-[360px] min-w-[260px] ${containerStyle[t.type]}`}
          >
            <span
              className={`material-symbols-outlined text-[18px] mt-0.5 shrink-0 ${iconStyle[t.type]}`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {iconMap[t.type]}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-snug">
                {t.title}
              </p>
              {t.description && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {t.description}
                </p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 -mt-0.5 -mr-1 p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss notification"
            >
              <span className="material-symbols-outlined text-[15px]">
                close
              </span>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
