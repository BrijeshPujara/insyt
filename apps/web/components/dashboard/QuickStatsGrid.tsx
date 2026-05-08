"use client";

import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import type { FinancialSummary } from "@/lib/types";

interface Props {
  summary: FinancialSummary;
}

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  show: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
};

export function QuickStatsGrid({ summary }: Props) {
  const stats = [
    {
      label: "Monthly Income",
      value: summary.monthlyIncome,
      icon: "trending_up",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      borderColor: "border-emerald-400/15",
      glow: "hover:shadow-[0_0_20px_rgba(52,211,153,0.15)]",
    },
    {
      label: "Total Savings",
      value: summary.totalSavings,
      icon: "savings",
      color: "text-primary",
      bg: "bg-primary/10",
      borderColor: "border-primary/15",
      glow: "hover:shadow-[0_0_20px_var(--glow-primary)]",
    },
    {
      label: "Total Debt",
      value: summary.totalDebt,
      icon: "credit_card",
      color: "text-red-400",
      bg: "bg-red-400/10",
      borderColor: "border-red-400/15",
      glow: "hover:shadow-[0_0_20px_rgba(248,113,113,0.15)]",
    },
    {
      label: "Savings Rate",
      value: summary.savingsRate,
      icon: "percent",
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      borderColor: "border-amber-400/15",
      glow: "hover:shadow-[0_0_20px_rgba(251,191,36,0.15)]",
      isPercent: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 h-full">
      {stats.map(({ label, value, icon, color, bg, borderColor, glow, isPercent }, i) => (
        <motion.div
          key={label}
          custom={i}
          variants={cardVariants}
          initial="hidden"
          animate="show"
          whileHover={{ y: -3, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } }}
          whileTap={{ scale: 0.98 }}
          className={`glass-card rounded-2xl p-4 flex items-center gap-3 border ${borderColor} transition-shadow duration-300 ${glow} cursor-default`}
        >
          <motion.div
            className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <span className={`material-symbols-outlined text-[20px] ${color}`}>{icon}</span>
          </motion.div>
          <div>
            <p className="text-xs text-muted-foreground leading-tight">{label}</p>
            <p className={`text-lg font-bold ${color} tabular-nums no-transition`}>
              {isPercent ? (
                <AnimatedNumber
                  value={value}
                  format={(v) => `${v.toFixed(1)}%`}
                  duration={1.3}
                  delay={i * 0.08}
                />
              ) : (
                <AnimatedNumber
                  value={value}
                  format={(v) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v)}
                  duration={1.3}
                  delay={i * 0.08}
                />
              )}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
