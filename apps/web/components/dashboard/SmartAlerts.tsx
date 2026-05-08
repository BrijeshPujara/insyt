"use client";

import { useState } from "react";
import { useFinances } from "@/lib/store/finance-store";
import { computeFinancialSummary, formatGBP, formatPercent } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type AlertLevel = "danger" | "warning" | "info";

interface Alert {
  id: string;
  level: AlertLevel;
  title: string;
  message: string;
  action?: { label: string; href: string };
}

function computeAlerts(
  income: { is_active: boolean }[],
  expenses: { is_active: boolean }[],
  debts: { is_active: boolean; interest_rate: number; name: string }[],
  subscriptions: { is_active: boolean }[],
  goals: { is_active: boolean }[],
  summary: ReturnType<typeof computeFinancialSummary>
): Alert[] {
  const alerts: Alert[] = [];

  if (summary.monthlyIncome === 0 && (expenses.length > 0 || debts.length > 0)) {
    alerts.push({
      id: "no-income",
      level: "info",
      title: "Add your income",
      message: "Your financial health score needs your income to generate accurate recommendations.",
      action: { label: "Add income", href: "/add-finances" },
    });
    return alerts;
  }

  if (summary.disposableIncome < 0 && summary.monthlyIncome > 0) {
    alerts.push({
      id: "negative-cashflow",
      level: "danger",
      title: "Negative cashflow this month",
      message: `Your outgoings exceed your income by ${formatGBP(Math.abs(summary.disposableIncome))}/month. Review your budget to avoid accumulating debt.`,
      action: { label: "Review budget", href: "/budgets" },
    });
  }

  if (summary.debtToIncomeRatio > 40 && summary.monthlyIncome > 0) {
    alerts.push({
      id: "high-dti",
      level: "warning",
      title: "High debt-to-income ratio",
      message: `Your debt payments are ${formatPercent(summary.debtToIncomeRatio)} of income. Most lenders prefer this below 40%.`,
      action: { label: "View debt plan", href: "/debt" },
    });
  }

  const highInterestDebt = debts.find(
    (d) => (d as { is_active: boolean; interest_rate: number }).is_active &&
             (d as { interest_rate: number }).interest_rate > 18
  ) as { name: string; interest_rate: number } | undefined;
  if (highInterestDebt) {
    alerts.push({
      id: "high-interest",
      level: "warning",
      title: "High-interest debt detected",
      message: `${highInterestDebt.name} has ${highInterestDebt.interest_rate}% APR. Prioritising this debt could save significant interest.`,
      action: { label: "View debt strategy", href: "/debt" },
    });
  }

  if (summary.monthlySubscriptions > 0 && summary.monthlyIncome > 0) {
    const subPct = (summary.monthlySubscriptions / summary.monthlyIncome) * 100;
    if (subPct > 15) {
      alerts.push({
        id: "heavy-subs",
        level: "info",
        title: "Subscriptions are eating your budget",
        message: `Subscriptions cost ${formatGBP(summary.monthlySubscriptions)}/month — ${formatPercent(subPct)} of your income. Consider a subscription audit.`,
        action: { label: "Review subscriptions", href: "/budgets" },
      });
    }
  }

  if (summary.monthlyIncome > 0 && summary.savingsRate < 5 && summary.disposableIncome >= 0) {
    alerts.push({
      id: "low-savings",
      level: "info",
      title: "Low savings rate",
      message: `You're saving ${formatPercent(summary.savingsRate)} of income. Aim for 10–20% to build financial resilience and hit goals faster.`,
      action: { label: "Set a savings goal", href: "/add-finances" },
    });
  }

  if (goals.length === 0 && summary.monthlyIncome > 0 && summary.disposableIncome > 50) {
    alerts.push({
      id: "no-goals",
      level: "info",
      title: "You have no savings goals",
      message: `You have ${formatGBP(summary.disposableIncome)}/month available. A savings goal — even a small emergency fund — builds real financial security.`,
      action: { label: "Add a goal", href: "/add-finances" },
    });
  }

  return alerts.slice(0, 3);
}

const levelConfig = {
  danger: {
    container: "border-red-500/18 bg-red-500/4",
    icon: "text-red-400",
    iconName: "warning",
    action: "bg-red-400/12 text-red-400 hover:bg-red-400/22",
    glow: "hover:shadow-[0_0_16px_rgba(248,113,113,0.12)]",
  },
  warning: {
    container: "border-amber-500/18 bg-amber-500/4",
    icon: "text-amber-400",
    iconName: "notification_important",
    action: "bg-amber-400/12 text-amber-400 hover:bg-amber-400/22",
    glow: "hover:shadow-[0_0_16px_rgba(251,191,36,0.12)]",
  },
  info: {
    container: "border-primary/14 bg-primary/4",
    icon: "text-primary",
    iconName: "lightbulb",
    action: "bg-primary/12 text-primary hover:bg-primary/22",
    glow: "hover:shadow-[0_0_16px_var(--glow-primary)]",
  },
} as const;

export function SmartAlerts() {
  const { income, expenses, debts, subscriptions, goals } = useFinances();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const summary = computeFinancialSummary(income, expenses, debts, subscriptions, goals);
  const allAlerts = computeAlerts(income, expenses, debts, subscriptions, goals, summary);
  const alerts = allAlerts.filter((a) => !dismissed.has(a.id));

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {alerts.map((alert) => {
          const cfg = levelConfig[alert.level];
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <motion.div
                whileHover={{ x: 2, transition: { duration: 0.15 } }}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-shadow duration-200 ${cfg.container} ${cfg.glow}`}
              >
                <motion.span
                  className={`material-symbols-outlined text-[18px] mt-0.5 shrink-0 ${cfg.icon}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                  animate={alert.level === "danger" ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  {cfg.iconName}
                </motion.span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground mb-0.5">{alert.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{alert.message}</p>
                  {alert.action && (
                    <motion.a
                      href={alert.action.href}
                      whileHover={{ x: 2 }}
                      className={`inline-flex items-center gap-1 mt-2 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${cfg.action}`}
                    >
                      {alert.action.label}
                      <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                    </motion.a>
                  )}
                </div>
                <motion.button
                  onClick={() => setDismissed((prev) => new Set([...prev, alert.id]))}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="shrink-0 p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Dismiss alert"
                >
                  <span className="material-symbols-outlined text-[15px]">close</span>
                </motion.button>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
