"use client";

import { useFinances } from "@/lib/store/finance-store";
import { computeFinancialSummary, formatGBP, formatPercent, expenseCategoryLabel, toMonthly } from "@/lib/utils";
import { motion } from "framer-motion";
import { stagger, fadeUp } from "@/lib/motion";

function LoadingSkeleton() {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5 sm:space-y-6">
        <div className="shimmer h-8 w-48 rounded-xl" />
        {[1,2,3].map((n) => <div key={n} className="shimmer h-40 rounded-2xl" />)}
      </div>
    </main>
  );
}

export default function ReportsPage() {
  const { income, expenses, debts, subscriptions, goals, isLoading } = useFinances();

  const summary = computeFinancialSummary(income, expenses, debts, subscriptions, goals);
  const totalOut = summary.monthlyExpenses + summary.monthlyDebtPayments + summary.monthlySubscriptions;

  const categoryTotals = new Map<string, number>();
  for (const e of expenses) {
    const monthly = toMonthly(e.amount, e.frequency);
    categoryTotals.set(e.category, (categoryTotals.get(e.category) ?? 0) + monthly);
  }
  const sortedCategories = Array.from(categoryTotals.entries()).sort((a, b) => b[1] - a[1]);

  const scoreComponents = [
    {
      label: "Debt-to-income ratio",
      good: summary.debtToIncomeRatio < 15,
      display: formatPercent(summary.debtToIncomeRatio),
      description: "Keep below 15% for a healthy score",
    },
    {
      label: "Savings rate",
      good: summary.savingsRate >= 20,
      display: formatPercent(summary.savingsRate),
      description: "Aim for 20%+ of monthly income",
    },
    {
      label: "Budget adherence",
      good: totalOut / Math.max(summary.monthlyIncome, 1) < 0.7,
      display: formatPercent(summary.monthlyIncome > 0 ? (totalOut / summary.monthlyIncome) * 100 : 0) + " of income spent",
      description: "Keep total spending below 70% of income",
    },
  ];

  if (isLoading) return <LoadingSkeleton />;

  return (
    <main className="flex-1 overflow-y-auto">
      <motion.div
        className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5 sm:space-y-6"
        variants={stagger(0.07)}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl font-bold text-foreground">Reports & Insights</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Your financial snapshot at a glance</p>
        </motion.div>

        {/* Health score breakdown */}
        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6 gradient-border-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-primary/5 to-transparent pointer-events-none rounded-2xl" />
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5">
            Health score breakdown
          </h2>
          <div className="flex items-center gap-5 mb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={`text-6xl font-bold ${
                summary.healthScore >= 80 ? "text-emerald-400" :
                summary.healthScore >= 65 ? "text-primary" :
                summary.healthScore >= 50 ? "text-amber-400" : "text-red-400"
              }`}
            >
              {summary.healthScore}
            </motion.div>
            <div>
              <p className={`text-xl font-semibold ${
                summary.healthScore >= 80 ? "text-emerald-400" :
                summary.healthScore >= 65 ? "text-primary" :
                summary.healthScore >= 50 ? "text-amber-400" : "text-red-400"
              }`}>{summary.healthLabel}</p>
              <p className="text-xs text-muted-foreground">out of 100</p>
            </div>
          </div>
          <div className="space-y-4">
            {scoreComponents.map((comp, i) => (
              <motion.div
                key={comp.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <motion.span
                      className={`material-symbols-outlined text-[15px] ${comp.good ? "text-emerald-400" : "text-red-400"}`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                    >
                      {comp.good ? "check_circle" : "cancel"}
                    </motion.span>
                    <span className="text-sm font-medium text-foreground">{comp.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{comp.display}</span>
                </div>
                <p className="text-xs text-muted-foreground ml-6">{comp.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Cashflow report */}
        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Monthly cashflow</h2>
          <div className="space-y-0">
            {[
              { label: "Total income",        value: summary.monthlyIncome,          color: "text-emerald-400", positive: true  },
              { label: "Recurring expenses",  value: -summary.monthlyExpenses,       color: "text-red-400",     positive: false },
              { label: "Debt payments",       value: -summary.monthlyDebtPayments,   color: "text-amber-400",   positive: false },
              { label: "Subscriptions",       value: -summary.monthlySubscriptions,  color: "text-amber-400",   positive: false },
              { label: "Net disposable",      value: summary.disposableIncome,       color: summary.disposableIncome >= 0 ? "text-primary" : "text-red-400", positive: summary.disposableIncome >= 0 },
            ].map(({ label, value, color, positive }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className={`flex items-center justify-between py-3 border-b border-border/40 last:border-0 ${i === 4 ? "font-bold" : ""}`}
              >
                <span className="text-sm text-foreground">{label}</span>
                <span className={`text-sm font-semibold ${color}`}>
                  {positive || value >= 0 ? "+" : ""}{formatGBP(value)}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Spending by category */}
        {sortedCategories.length > 0 && (
          <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Spending by category
            </h2>
            <div className="space-y-4">
              {sortedCategories.map(([cat, amount], i) => {
                const pct = summary.monthlyIncome > 0 ? (amount / summary.monthlyIncome) * 100 : 0;
                return (
                  <motion.div
                    key={cat}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.32, delay: i * 0.055, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm text-foreground">{expenseCategoryLabel(cat)}</span>
                      <span className="text-sm font-semibold text-foreground">
                        {formatGBP(amount)}
                        <span className="text-xs text-muted-foreground font-normal ml-1.5">
                          ({formatPercent(pct)})
                        </span>
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(pct, 100)}%` }}
                        transition={{ duration: 0.9, delay: 0.1 + i * 0.055, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Savings goals */}
        {goals.length > 0 && (
          <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Savings goals
            </h2>
            <div className="space-y-5">
              {goals.map((goal, i) => {
                const pct = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                const isComplete = pct >= 100;
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="flex justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{goal.name}</span>
                        {isComplete && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400"
                          >
                            DONE ✓
                          </motion.span>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatGBP(goal.current_amount)} / {formatGBP(goal.target_amount)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${isComplete ? "bg-gradient-to-r from-emerald-400 to-primary" : "bg-gradient-to-r from-primary to-primary/70"}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.1 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{pct.toFixed(0)}% complete</span>
                      {goal.target_date && (
                        <span className="text-xs text-muted-foreground">
                          Target: {new Date(goal.target_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
