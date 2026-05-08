"use client";

import { useFinances } from "@/lib/store/finance-store";
import { AIInsightsSection } from "@/components/dashboard/AIInsightsSection";
import { motion, AnimatePresence } from "framer-motion";
import { stagger, fadeUp, listItem } from "@/lib/motion";

const impactConfig = {
  high:   { classes: "text-red-400 bg-red-400/8 border-red-400/18",     label: "HIGH IMPACT"   },
  medium: { classes: "text-amber-400 bg-amber-400/8 border-amber-400/18", label: "MEDIUM IMPACT" },
  low:    { classes: "text-emerald-400 bg-emerald-400/8 border-emerald-400/18", label: "LOW IMPACT" },
} as const;

const typeLabels: Record<string, string> = {
  spending: "Spending", debt: "Debt", savings: "Savings",
  cashflow: "Cashflow", general: "General",
};

function LoadingSkeleton() {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="p-6 max-w-4xl mx-auto space-y-5">
        <div className="space-y-2">
          <div className="shimmer h-8 w-56 rounded-xl" />
          <div className="shimmer h-4 w-72 rounded-lg" />
        </div>
        <div className="shimmer h-20 rounded-2xl" />
        {[1,2,3].map((n) => <div key={n} className="shimmer h-28 rounded-2xl" />)}
      </div>
    </main>
  );
}

export default function AdvisoryPage() {
  const { insights, isLoading } = useFinances();

  if (isLoading) return <LoadingSkeleton />;

  return (
    <main className="flex-1 overflow-y-auto">
      <motion.div
        className="p-6 max-w-4xl mx-auto space-y-6"
        variants={stagger(0.07)}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl font-bold text-foreground">INSYT Advisory</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Personalised INSYT recommendations, powered by Claude
          </p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <AIInsightsSection />
        </motion.div>

        <AnimatePresence>
          {insights.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <motion.div
                variants={fadeUp}
                className="flex items-center gap-2"
              >
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Your insights
                </h2>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/12 text-primary">
                  {insights.length}
                </span>
              </motion.div>

              <motion.div
                variants={stagger(0.06)}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                {insights.map((insight, i) => {
                  const cfg = insight.impact ? impactConfig[insight.impact] : null;
                  return (
                    <motion.div
                      key={insight.id}
                      variants={listItem}
                      whileHover={{ y: -2, transition: { duration: 0.18 } }}
                      className="glass-card rounded-2xl p-5 flex items-start gap-4 gradient-border-card relative overflow-hidden group"
                    >
                      {i === 0 && (
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/3 to-transparent pointer-events-none" />
                      )}
                      <motion.div
                        className="relative w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      >
                        <span className="material-symbols-outlined text-primary text-[20px]">
                          {insight.icon ?? "lightbulb"}
                        </span>
                      </motion.div>
                      <div className="relative flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <p className="text-base font-semibold text-foreground">{insight.title}</p>
                          <span className="text-[10px] text-muted-foreground bg-muted/70 px-2 py-0.5 rounded-full">
                            {typeLabels[insight.type] ?? insight.type}
                          </span>
                          {cfg && (
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border tracking-wide ${cfg.classes}`}>
                              {cfg.label}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{insight.body}</p>
                        <p className="text-[10px] text-muted-foreground/50 mt-2">
                          {new Date(insight.generated_at).toLocaleDateString("en-GB", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {insights.length === 0 && (
          <motion.div
            variants={fadeUp}
            className="glass-card rounded-2xl p-10 text-center"
          >
            <motion.span
              className="material-symbols-outlined text-muted-foreground text-5xl mb-4 block"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              history
            </motion.span>
            <p className="text-muted-foreground text-sm">
              No insights generated yet. Click the button above to get started.
            </p>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
