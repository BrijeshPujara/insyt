"use client";

import { useFinances } from "@/lib/store/finance-store";
import { computeFinancialSummary, formatGBP, toMonthly, expenseCategoryLabel, categoryIcon } from "@/lib/utils";
import { motion } from "framer-motion";
import { stagger, fadeUp } from "@/lib/motion";

function LoadingSkeleton() {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
        <div className="shimmer h-8 w-48 rounded-xl" />
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {[1,2,3].map((n) => <div key={n} className="shimmer h-20 sm:h-24 rounded-2xl" />)}
        </div>
        <div className="shimmer h-64 rounded-2xl" />
      </div>
    </main>
  );
}

const statColors = [
  { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/15" },
  { color: "text-red-400",     bg: "bg-red-400/10",     border: "border-red-400/15"     },
  { color: "text-primary",     bg: "bg-primary/10",     border: "border-primary/15"     },
];

export default function BudgetsPage() {
  const { income, expenses, debts, subscriptions, goals, isLoading } = useFinances();
  const summary = computeFinancialSummary(income, expenses, debts, subscriptions, goals);

  const categoryMap = new Map<string, { total: number; count: number }>();
  for (const e of expenses) {
    const monthly = toMonthly(e.amount, e.frequency);
    const existing = categoryMap.get(e.category) ?? { total: 0, count: 0 };
    categoryMap.set(e.category, { total: existing.total + monthly, count: existing.count + 1 });
  }
  const categories = Array.from(categoryMap.entries()).sort((a, b) => b[1].total - a[1].total);

  const stats = [
    { label: "Monthly income",   value: summary.monthlyIncome },
    { label: "Total outgoings",  value: summary.monthlyExpenses + summary.monthlyDebtPayments + summary.monthlySubscriptions },
    { label: "Remaining",        value: summary.disposableIncome },
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
        <motion.div variants={fadeUp} className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Budget Planner</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Monthly breakdown of your spending</p>
          </div>
          <motion.a
            href="/add-finances"
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary inline-flex items-center gap-1.5 no-underline shrink-0 text-xs sm:text-sm !py-2 sm:!py-2.5 !px-3 sm:!px-4"
          >
            <span className="material-symbols-outlined text-[13px] sm:text-[16px]">add</span>
            Add expense
          </motion.a>
        </motion.div>

        {/* Summary strip */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-2 sm:gap-4">
          {stats.map(({ label, value }, i) => {
            const { color, bg, border } = statColors[i];
            const displayColor = i === 2
              ? (value >= 0 ? "text-primary" : "text-red-400")
              : color;
            const displayBg = i === 2
              ? (value >= 0 ? "bg-primary/10" : "bg-red-400/10")
              : bg;
            const displayBorder = i === 2
              ? (value >= 0 ? "border-primary/15" : "border-red-400/15")
              : border;

            return (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -3, transition: { duration: 0.18 } }}
                className={`glass-card rounded-2xl p-3 sm:p-4 border ${displayBorder} flex flex-col`}
              >
                <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl ${displayBg} flex items-center justify-center mb-2 sm:mb-3`}>
                  <span className={`material-symbols-outlined text-[13px] sm:text-[18px] ${displayColor}`}>
                    {i === 0 ? "trending_up" : i === 1 ? "trending_down" : "savings"}
                  </span>
                </div>
                <p className="text-[9px] sm:text-xs text-muted-foreground leading-tight mb-0.5">{label}</p>
                <p className={`text-xs sm:text-lg font-bold tabular-nums leading-tight truncate ${displayColor}`}>{formatGBP(value)}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Expenses by category */}
        {categories.length > 0 ? (
          <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5">
              Expenses by category
            </h2>
            <div className="space-y-4">
              {categories.map(([category, { total, count }], i) => {
                const pct = summary.monthlyIncome > 0 ? (total / summary.monthlyIncome) * 100 : 0;
                const barColor =
                  pct > 30 ? "from-red-400 to-red-400/70" :
                  pct > 15 ? "from-amber-400 to-amber-400/70" :
                  "from-primary to-primary/70";

                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.055, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ x: 2, transition: { duration: 0.15 } }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-[15px]">
                            {categoryIcon(category)}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-foreground">
                            {expenseCategoryLabel(category)}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1.5">
                            ({count})
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-foreground">{formatGBP(total)}/mo</span>
                        <span className="text-xs text-muted-foreground ml-1.5">{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(pct, 100)}%` }}
                        transition={{ duration: 0.9, delay: 0.12 + i * 0.055, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={fadeUp}
            className="glass-card rounded-2xl p-10 text-center gradient-border-card"
          >
            <motion.span
              className="material-symbols-outlined text-primary text-5xl mb-4 block"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              receipt_long
            </motion.span>
            <h2 className="text-lg font-semibold text-foreground mb-2">No expenses yet</h2>
            <p className="text-muted-foreground text-sm mb-5">
              Add your recurring expenses to see your budget breakdown.
            </p>
            <motion.a
              href="/add-finances"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary inline-flex items-center gap-2 no-underline"
            >
              Add expenses
            </motion.a>
          </motion.div>
        )}

        {/* Subscriptions */}
        {subscriptions.length > 0 && (
          <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Subscriptions
              </h2>
              <span className="text-sm font-semibold text-amber-400">
                {formatGBP(summary.monthlySubscriptions)}/mo
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {subscriptions.map((sub, i) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.28, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.03, y: -1, transition: { duration: 0.15 } }}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/50 hover:bg-muted/80 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-amber-400 text-[16px]">subscriptions</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground leading-tight">{sub.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatGBP(sub.amount)}/{sub.frequency === "monthly" ? "mo" : sub.frequency === "weekly" ? "wk" : "yr"}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
