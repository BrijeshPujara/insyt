"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFinances } from "@/lib/store/finance-store";
import type { AIInsight } from "@/lib/types";

export function AIInsightsSection() {
  const {
    income,
    expenses,
    debts,
    subscriptions,
    goals,
    setInsights,
    isGuest,
  } = useFinances();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);

  const hasData = income.length > 0 || expenses.length > 0;

  async function generateInsights() {
    setLoading(true);
    setError(null);
    try {
      const body = isGuest
        ? JSON.stringify({
            income,
            expenses,
            debts,
            subscriptions,
            goals,
            force: true,
          })
        : JSON.stringify({ force: true });

      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error ?? "Failed to generate insights",
        );
      }

      const data = await res.json();
      const newInsights: AIInsight[] = data.insights ?? [];
      setInsights(newInsights);
      setGenerated(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card rounded-2xl p-5 border border-primary/12 gradient-border-card ai-strip relative overflow-hidden"
    >
      {/* Subtle shimmer background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-transparent pointer-events-none" />

      <div className="relative flex items-start gap-4">
        <motion.div
          className="w-11 h-11 rounded-xl bg-primary/12 flex items-center justify-center shrink-0 border border-primary/20"
          animate={{ scale: loading ? [1, 1.05, 1] : 1 }}
          transition={{
            duration: 1.5,
            repeat: loading ? Infinity : 0,
            ease: "easeInOut",
          }}
        >
          <span
            className="material-symbols-outlined text-primary text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            psychology
          </span>
        </motion.div>
        <div className="flex-1">
          <p className="text-base font-semibold text-foreground mb-0.5">
            INSYT Analysis
          </p>
          <p className="text-sm text-muted-foreground">
            {hasData
              ? "INSYT will analyse your finances and generate personalised recommendations."
              : "Add your income and expenses first, then let INSYT generate your analysis."}
          </p>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 text-sm text-red-400"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          onClick={generateInsights}
          disabled={loading || !hasData}
          whileHover={!loading && hasData ? { scale: 1.04, y: -1 } : {}}
          whileTap={!loading && hasData ? { scale: 0.97 } : {}}
          className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            boxShadow:
              "0 2px 8px var(--glow-primary), inset 0 1px 0 rgba(255,255,255,0.18)",
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {loading ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <motion.span
                  className="w-3.5 h-3.5 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                Analysing…
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">
                  auto_awesome
                </span>
                {generated ? "Regenerate" : "Generate"}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
}
