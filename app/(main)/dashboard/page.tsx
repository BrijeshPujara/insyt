"use client";

import { useFinances } from "@/lib/store/finance-store";
import { computeFinancialSummary, formatGBP, formatPercent } from "@/lib/utils";
import { AIInsightsSection } from "@/components/dashboard/AIInsightsSection";
import { HealthScoreRing } from "@/components/dashboard/HealthScoreRing";
import { QuickStatsGrid } from "@/components/dashboard/QuickStatsGrid";
import { RecentInsightsList } from "@/components/dashboard/RecentInsightsList";
// ChatWidget is implemented but gated — enable for Pro tier
import { SmartAlerts } from "@/components/dashboard/SmartAlerts";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { motion, AnimatePresence } from "framer-motion";
import { stagger, fadeUp } from "@/lib/motion";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function LoadingSkeleton() {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="shimmer h-8 w-56 rounded-xl" />
          <div className="shimmer h-4 w-40 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="shimmer h-52 rounded-2xl" />
          <div className="lg:col-span-2 grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="shimmer h-24 rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="shimmer h-36 rounded-2xl" />
        <div className="shimmer h-48 rounded-2xl" />
      </div>
    </main>
  );
}

const cashflowItems = [
  {
    label: "Income",
    key: "monthlyIncome",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    icon: "payments",
  },
  {
    label: "Expenses",
    key: "monthlyExpenses",
    color: "text-red-400",
    bg: "bg-red-400/10",
    icon: "shopping_cart",
  },
  {
    label: "Debt",
    key: "monthlyDebtPayments",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    icon: "credit_card",
  },
  {
    label: "Disposable",
    key: "disposableIncome",
    color: null,
    bg: "bg-primary/10",
    icon: "savings",
  },
] as const;

export default function DashboardPage() {
  const {
    income,
    expenses,
    debts,
    subscriptions,
    goals,
    insights,
    isLoading,
    user,
  } = useFinances();
  const summary = computeFinancialSummary(
    income,
    expenses,
    debts,
    subscriptions,
    goals,
  );

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] ?? null;
  const hasData = income.length > 0 || expenses.length > 0;

  const budgetPct = Math.min(
    ((summary.monthlyExpenses +
      summary.monthlyDebtPayments +
      summary.monthlySubscriptions) /
      Math.max(summary.monthlyIncome, 1)) *
      100,
    100,
  );

  const progressColor =
    budgetPct < 50
      ? "from-emerald-400 to-primary"
      : budgetPct < 80
        ? "from-primary to-amber-400"
        : "from-amber-400 to-red-400";

  if (isLoading) return <LoadingSkeleton />;

  return (
    <main className="flex-1 overflow-y-auto">
      <motion.div
        className="p-6 max-w-7xl mx-auto space-y-5"
        variants={stagger(0.07)}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
        <motion.div
          variants={fadeUp}
          className="flex items-start justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {firstName
                ? `${getGreeting()}, ${firstName} 👋`
                : "Your financial dashboard"}
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {hasData
                ? "Here's your financial overview for today"
                : "Start by adding your income and expenses below"}
            </p>
          </div>

          <AnimatePresence>
            {hasData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 8 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="text-right"
              >
                <p className="text-xs text-muted-foreground">Health Score</p>
                <p
                  className={`text-lg font-bold ${
                    summary.healthScore >= 80
                      ? "text-emerald-400"
                      : summary.healthScore >= 65
                        ? "text-primary"
                        : summary.healthScore >= 50
                          ? "text-amber-400"
                          : "text-red-400"
                  }`}
                >
                  {summary.healthLabel}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Smart alerts */}
        {hasData && (
          <motion.div variants={fadeUp}>
            <SmartAlerts />
          </motion.div>
        )}

        {/* Empty state */}
        {!hasData && (
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -2, transition: { duration: 0.18 } }}
            className="glass-card rounded-2xl p-10 text-center border border-primary/18 gradient-border-card relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/4 via-transparent to-transparent pointer-events-none" />
            <motion.span
              className="material-symbols-outlined text-primary text-5xl mb-4 block"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              account_balance_wallet
            </motion.span>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Set up your financial profile
            </h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
              Add your income, expenses, and debts to unlock personalised
              insights and coaching. No account needed to get started.
            </p>
            <motion.a
              href="/add-finances"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-semibold transition-all no-underline"
              style={{ boxShadow: "0 4px 16px var(--glow-primary)" }}
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Get started — it&apos;s free
            </motion.a>
          </motion.div>
        )}

        {hasData && (
          <>
            {/* Health score + quick stats */}
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-1 lg:grid-cols-3 gap-4"
            >
              <motion.div
                whileHover={{ y: -2, transition: { duration: 0.18 } }}
                className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center hairline-card relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent pointer-events-none" />
                <HealthScoreRing
                  score={summary.healthScore}
                  label={summary.healthLabel}
                />
              </motion.div>
              <div className="lg:col-span-2">
                <QuickStatsGrid summary={summary} />
              </div>
            </motion.div>

            {/* Cashflow strip */}
            <motion.div
              variants={fadeUp}
              className="glass-card rounded-2xl p-5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/4 to-transparent pointer-events-none rounded-2xl" />
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Monthly cashflow
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cashflowItems.map(({ label, key, bg, icon }, idx) => {
                  const rawValue = summary[key];
                  const isDisposable = key === "disposableIncome";
                  const valueColor = isDisposable
                    ? rawValue >= 0
                      ? "text-primary"
                      : "text-red-400"
                    : key === "monthlyIncome"
                      ? "text-emerald-400"
                      : key === "monthlyExpenses"
                        ? "text-red-400"
                        : "text-amber-400";

                  return (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: 0.1 + idx * 0.07,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="flex items-start gap-3"
                    >
                      <div
                        className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}
                      >
                        <span
                          className={`material-symbols-outlined text-[18px] ${valueColor}`}
                        >
                          {icon}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p
                          className={`text-base font-bold tabular-nums no-transition ${valueColor}`}
                        >
                          <AnimatedNumber
                            value={rawValue}
                            format={(v) =>
                              new Intl.NumberFormat("en-GB", {
                                style: "currency",
                                currency: "GBP",
                                maximumFractionDigits: 0,
                              }).format(v)
                            }
                            duration={1.2}
                            delay={0.15 + idx * 0.07}
                          />
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Budget progress bar */}
              <div className="mt-5 pt-4 border-t border-border/60">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Budget used</span>
                  <span
                    className={
                      budgetPct > 80 ? "text-red-400 font-semibold" : ""
                    }
                  >
                    {formatPercent(budgetPct)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${progressColor}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${budgetPct}%` }}
                    transition={{
                      duration: 1.2,
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.3,
                    }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Debt overview */}
            {debts.length > 0 && (
              <motion.div
                variants={fadeUp}
                className="glass-card rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Debt overview
                  </h2>
                  <motion.a
                    href="/debt"
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.15 }}
                    className="text-xs text-primary hover:underline flex items-center gap-0.5"
                  >
                    View all
                    <span className="material-symbols-outlined text-[12px]">
                      arrow_forward
                    </span>
                  </motion.a>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[
                    {
                      label: "Total debt",
                      value: summary.totalDebt,
                      color: "text-red-400",
                    },
                    {
                      label: "Monthly payments",
                      value: summary.monthlyDebtPayments,
                      color: "text-amber-400",
                    },
                    {
                      label: "DTI ratio",
                      value: summary.debtToIncomeRatio,
                      color:
                        summary.debtToIncomeRatio < 35
                          ? "text-emerald-400"
                          : "text-red-400",
                      isPercent: true,
                    },
                  ].map(({ label, value, color, isPercent }) => (
                    <div key={label}>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p
                        className={`text-lg font-bold tabular-nums no-transition ${color}`}
                      >
                        {isPercent ? formatPercent(value) : formatGBP(value)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="space-y-0">
                  {debts.slice(0, 3).map((debt, i) => (
                    <motion.div
                      key={debt.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: i * 0.06,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      whileHover={{ x: 3, transition: { duration: 0.15 } }}
                      className="flex items-center justify-between py-3 border-t border-border/40 first:border-0 cursor-default"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {debt.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {debt.interest_rate}% APR
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">
                          {formatGBP(debt.balance)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          min {formatGBP(debt.minimum_payment)}/mo
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* AI Insights */}
            <motion.div variants={fadeUp}>
              {insights.length > 0 ? (
                <RecentInsightsList insights={insights} />
              ) : (
                <AIInsightsSection />
              )}
            </motion.div>

            {/* AI Chat — Pro teaser */}
            <motion.div variants={fadeUp}>
              <div className="glass-card rounded-2xl p-5 border border-primary/15 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/4 via-transparent to-transparent pointer-events-none" />
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <span
                      className="material-symbols-outlined text-primary text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      chat
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-foreground">
                        INSYT<span className="text-primary">.</span> AI Chat
                      </h3>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary uppercase tracking-wide">
                        Pro
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Chat with your personal AI coach about your finances —
                      available in the paid plan.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </main>
  );
}
