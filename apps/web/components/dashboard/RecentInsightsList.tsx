"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFinances } from "@/lib/store/finance-store";
import type { AIInsight } from "@/lib/types";

interface Props {
  insights: AIInsight[];
}

const impactConfig = {
  high: { classes: "text-red-400 bg-red-400/10", label: "HIGH" },
  medium: { classes: "text-amber-400 bg-amber-400/10", label: "MEDIUM" },
  low: { classes: "text-emerald-400 bg-emerald-400/10", label: "LOW" },
} as const;

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.065 } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -14, scale: 0.97 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
};

export function RecentInsightsList({ insights }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const {
    setInsights,
    income,
    expenses,
    debts,
    subscriptions,
    goals,
    isGuest,
  } = useFinances();

  async function handleRefresh() {
    setRefreshing(true);
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
      if (res.ok) {
        const data = await res.json();
        setInsights(data.insights ?? []);
      }
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            INSYT Insights
          </h2>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/12 text-primary">
            {insights.length}
          </span>
        </div>
        <motion.a
          href="/advisory"
          whileHover={{ x: 3 }}
          transition={{ duration: 0.15 }}
          className="text-xs text-primary hover:underline flex items-center gap-0.5"
        >
          Full report
          <span className="material-symbols-outlined text-[12px]">
            arrow_forward
          </span>
        </motion.a>
        <motion.button
          onClick={handleRefresh}
          disabled={refreshing}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors disabled:opacity-40"
          title="Refresh insights"
          aria-label="Refresh insights"
        >
          <motion.span
            className="material-symbols-outlined text-[16px] block"
            animate={{ rotate: refreshing ? 360 : 0 }}
            transition={
              refreshing
                ? { duration: 0.8, repeat: Infinity, ease: "linear" }
                : { duration: 0.3 }
            }
          >
            refresh
          </motion.span>
        </motion.button>
      </div>

      <motion.div
        className="space-y-2"
        variants={listVariants}
        initial="hidden"
        animate="show"
      >
        {insights.map((insight) => {
          const isOpen = expanded === insight.id;
          const cfg = insight.impact ? impactConfig[insight.impact] : null;

          return (
            <motion.div
              key={insight.id}
              variants={rowVariants}
              layout
              onClick={() => setExpanded(isOpen ? null : insight.id)}
              whileHover={{ x: 2, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.99 }}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer group"
            >
              <motion.div
                className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <span className="material-symbols-outlined text-primary text-[16px]">
                  {insight.icon ?? "lightbulb"}
                </span>
              </motion.div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <p className="text-sm font-semibold text-foreground">
                    {insight.title}
                  </p>
                  {cfg && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-wide ${cfg.classes}`}
                    >
                      {cfg.label}
                    </span>
                  )}
                </div>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.p
                      key="full"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="text-xs text-muted-foreground leading-relaxed overflow-hidden"
                    >
                      {insight.body}
                    </motion.p>
                  ) : (
                    <motion.p
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-muted-foreground leading-relaxed line-clamp-1"
                    >
                      {insight.body}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <motion.span
                className="material-symbols-outlined text-[16px] text-muted-foreground/50 shrink-0 mt-1 group-hover:text-muted-foreground transition-colors"
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                expand_more
              </motion.span>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
