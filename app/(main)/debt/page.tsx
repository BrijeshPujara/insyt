"use client";

import { useFinances } from "@/lib/store/finance-store";
import { computeFinancialSummary, formatGBP, formatPercent, debtTypeLabel, debtTypeIcon } from "@/lib/utils";
import { motion } from "framer-motion";
import { stagger, fadeUp } from "@/lib/motion";

function LoadingSkeleton() {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="shimmer h-8 w-48 rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map((n) => <div key={n} className="shimmer h-24 rounded-2xl" />)}
        </div>
        {[1,2].map((n) => <div key={n} className="shimmer h-36 rounded-2xl" />)}
      </div>
    </main>
  );
}

function monthsToPayoff(balance: number, monthlyPayment: number, apr: number): number | null {
  if (monthlyPayment <= 0 || balance <= 0) return null;
  const monthlyRate = apr / 100 / 12;
  if (monthlyRate === 0) return Math.ceil(balance / monthlyPayment);
  if (monthlyPayment <= balance * monthlyRate) return null;
  return Math.ceil(
    Math.log(monthlyPayment / (monthlyPayment - balance * monthlyRate)) /
    Math.log(1 + monthlyRate)
  );
}

export default function DebtPage() {
  const { income, expenses, debts, subscriptions, goals, isLoading } = useFinances();
  const summary = computeFinancialSummary(income, expenses, debts, subscriptions, goals);

  if (isLoading) return <LoadingSkeleton />;

  return (
    <main className="flex-1 overflow-y-auto">
      <motion.div
        className="p-6 max-w-5xl mx-auto space-y-6"
        variants={stagger(0.07)}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp} className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Debt Breakdown</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Track and manage all your debts</p>
          </div>
          <motion.a
            href="/add-finances"
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary inline-flex items-center gap-2 no-underline"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Add debt
          </motion.a>
        </motion.div>

        {/* Summary stats */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4">
          {[
            { label: "Total debt",        value: formatGBP(summary.totalDebt),           color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/15",    icon: "credit_card"    },
            { label: "Monthly payments",  value: formatGBP(summary.monthlyDebtPayments), color: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/15",  icon: "calendar_month" },
            { label: "DTI ratio",         value: formatPercent(summary.debtToIncomeRatio), color: summary.debtToIncomeRatio < 35 ? "text-emerald-400" : "text-red-400", bg: summary.debtToIncomeRatio < 35 ? "bg-emerald-400/10" : "bg-red-400/10", border: summary.debtToIncomeRatio < 35 ? "border-emerald-400/15" : "border-red-400/15", icon: "percent" },
          ].map(({ label, value, color, bg, border, icon }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -3, transition: { duration: 0.18 } }}
              className={`glass-card rounded-2xl p-4 border ${border} flex items-center gap-3`}
            >
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <span className={`material-symbols-outlined text-[20px] ${color}`}>{icon}</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-lg font-bold ${color}`}>{value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {debts.length === 0 ? (
          <motion.div
            variants={fadeUp}
            className="glass-card rounded-2xl p-10 text-center gradient-border-card"
          >
            <motion.span
              className="material-symbols-outlined text-emerald-400 text-5xl mb-4 block"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              sentiment_very_satisfied
            </motion.span>
            <h2 className="text-lg font-semibold text-foreground mb-2">No debts recorded</h2>
            <p className="text-muted-foreground text-sm">
              You&apos;re either debt-free or haven&apos;t added your debts yet.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Avalanche strategy tip */}
            <motion.div
              variants={fadeUp}
              className="glass-card rounded-2xl p-4 border border-primary/18 gradient-border-card relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/4 to-transparent pointer-events-none" />
              <div className="relative flex items-start gap-3">
                <motion.span
                  className="material-symbols-outlined text-primary text-[20px] mt-0.5 shrink-0"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  lightbulb
                </motion.span>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-0.5">
                    Avalanche strategy recommended
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Debts are sorted by interest rate (highest first). Paying off the most expensive
                    debt first saves the most money over time.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Debt cards */}
            <motion.div variants={stagger(0.08)} className="space-y-3">
              {debts.map((debt, i) => {
                const months = monthsToPayoff(debt.balance, debt.minimum_payment, debt.interest_rate);
                const totalInterest = months
                  ? Math.max(0, debt.minimum_payment * months - debt.balance)
                  : null;
                const payoffPct = Math.max(0, Math.min(100, 100 - (debt.balance / (debt.balance + (totalInterest ?? 0))) * 100));

                return (
                  <motion.div
                    key={debt.id}
                    variants={fadeUp}
                    whileHover={{ y: -2, transition: { duration: 0.18 } }}
                    className="glass-card rounded-2xl p-5 relative overflow-hidden"
                  >
                    {i === 0 && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/6 to-transparent pointer-events-none rounded-2xl" />
                    )}
                    <div className="relative flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-red-400/10 flex items-center justify-center border border-red-400/15">
                          <span className="material-symbols-outlined text-red-400 text-[20px]">
                            {debtTypeIcon(debt.type)}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-base font-semibold text-foreground">{debt.name}</p>
                            {i === 0 && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.2 }}
                                className="text-[10px] bg-primary/18 text-primary px-2 py-0.5 rounded-full font-semibold"
                              >
                                Pay first
                              </motion.span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{debtTypeLabel(debt.type)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-400">{formatGBP(debt.balance)}</p>
                        <p className="text-xs text-muted-foreground">balance</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center mb-3">
                      {[
                        { label: "APR",          value: `${debt.interest_rate}%`, color: "text-amber-400" },
                        { label: "Min. payment", value: `${formatGBP(debt.minimum_payment)}/mo`, color: "text-foreground" },
                        { label: "Est. payoff",  value: months ? `${months} mo` : "N/A",          color: "text-foreground" },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="bg-muted/40 rounded-xl p-2.5">
                          <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
                          <p className={`text-sm font-bold ${color}`}>{value}</p>
                        </div>
                      ))}
                    </div>

                    {totalInterest !== null && (
                      <p className="text-xs text-muted-foreground text-center mt-1">
                        At minimum payments you&apos;ll pay ~{formatGBP(totalInterest)} in interest
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        )}
      </motion.div>
    </main>
  );
}
