import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Frequency, FinancialSummary, Income, Expense, Debt, Subscription, SavingsGoal } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── GBP Formatting ──────────────────────────────────────────────────────────

export function formatGBP(amount: number, compact = false): string {
  if (compact && Math.abs(amount) >= 1000) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  }
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// ─── Frequency normalisation ─────────────────────────────────────────────────

export function toMonthly(amount: number, frequency: Frequency | "one_off"): number {
  switch (frequency) {
    case "weekly":    return amount * 52 / 12;
    case "biweekly":  return amount * 26 / 12;
    case "monthly":   return amount;
    case "annually":  return amount / 12;
    case "one_off":   return 0;
    default:          return amount;
  }
}

// ─── Financial health score ───────────────────────────────────────────────────

export function computeFinancialSummary(
  incomes: Income[],
  expenses: Expense[],
  debts: Debt[],
  subscriptions: Subscription[],
  goals: SavingsGoal[]
): FinancialSummary {
  const monthlyIncome = incomes
    .filter((i) => i.is_active)
    .reduce((sum, i) => sum + toMonthly(i.amount, i.frequency), 0);

  const monthlyExpenses = expenses
    .filter((e) => e.is_active)
    .reduce((sum, e) => sum + toMonthly(e.amount, e.frequency), 0);

  const monthlyDebtPayments = debts
    .filter((d) => d.is_active)
    .reduce((sum, d) => sum + d.minimum_payment, 0);

  const monthlySubscriptions = subscriptions
    .filter((s) => s.is_active)
    .reduce((sum, s) => sum + toMonthly(s.amount, s.frequency as Frequency), 0);

  const totalDebt = debts
    .filter((d) => d.is_active)
    .reduce((sum, d) => sum + d.balance, 0);

  const totalSavings = goals
    .filter((g) => g.is_active)
    .reduce((sum, g) => sum + g.current_amount, 0);

  const totalMonthlyOut = monthlyExpenses + monthlyDebtPayments + monthlySubscriptions;
  const disposableIncome = monthlyIncome - totalMonthlyOut;

  const debtToIncomeRatio = monthlyIncome > 0
    ? (monthlyDebtPayments / monthlyIncome) * 100
    : 0;

  const savingsRate = monthlyIncome > 0
    ? Math.max(0, (disposableIncome / monthlyIncome) * 100)
    : 0;

  // Score components (each 0–25)
  const dtiScore =
    debtToIncomeRatio < 15 ? 25 :
    debtToIncomeRatio < 35 ? 18 :
    debtToIncomeRatio < 50 ? 10 : 3;

  const savingsScore =
    savingsRate > 20 ? 25 :
    savingsRate > 10 ? 18 :
    savingsRate > 5  ? 12 : 5;

  const budgetScore =
    monthlyIncome === 0 ? 10 :
    totalMonthlyOut / monthlyIncome < 0.5 ? 25 :
    totalMonthlyOut / monthlyIncome < 0.7 ? 18 :
    totalMonthlyOut / monthlyIncome < 0.9 ? 12 : 4;

  const emergencyMonths = monthlyExpenses > 0 ? totalSavings / monthlyExpenses : 0;
  const emergencyScore =
    emergencyMonths > 6 ? 25 :
    emergencyMonths > 3 ? 18 :
    emergencyMonths > 1 ? 10 : 3;

  const healthScore = Math.round(dtiScore + savingsScore + budgetScore + emergencyScore);

  const healthLabel: FinancialSummary["healthLabel"] =
    healthScore >= 80 ? "Excellent" :
    healthScore >= 65 ? "Good" :
    healthScore >= 50 ? "Fair" : "Needs Attention";

  return {
    monthlyIncome,
    monthlyExpenses,
    monthlyDebtPayments,
    monthlySubscriptions,
    totalDebt,
    totalSavings,
    disposableIncome,
    debtToIncomeRatio,
    savingsRate,
    healthScore,
    healthLabel,
  };
}

// ─── Misc helpers ─────────────────────────────────────────────────────────────

export function frequencyLabel(f: Frequency | "one_off"): string {
  const map: Record<string, string> = {
    weekly: "Weekly", biweekly: "Fortnightly",
    monthly: "Monthly", annually: "Annually", one_off: "One-off",
  };
  return map[f] ?? f;
}

export function expenseCategoryLabel(c: string): string {
  const map: Record<string, string> = {
    housing: "Rent / Mortgage", council_tax: "Council Tax",
    utilities: "Utilities", food_groceries: "Food & Groceries",
    transport: "Transport", broadband_mobile: "Broadband & Mobile",
    insurance: "Insurance", childcare: "Childcare", health: "Health",
    eating_out: "Eating Out", entertainment: "Entertainment",
    clothing: "Clothing", personal_care: "Personal Care",
    gym: "Gym & Fitness", subscriptions: "Subscriptions", other: "Other",
  };
  return map[c] ?? c;
}

export function debtTypeLabel(t: string): string {
  const map: Record<string, string> = {
    credit_card: "Credit Card", personal_loan: "Personal Loan",
    student_loan: "Student Loan", mortgage: "Mortgage",
    car_finance: "Car Finance", overdraft: "Overdraft",
    buy_now_pay_later: "Buy Now Pay Later", other: "Other",
  };
  return map[t] ?? t;
}

export function debtTypeIcon(t: string): string {
  const map: Record<string, string> = {
    credit_card: "credit_card", personal_loan: "person",
    student_loan: "school", mortgage: "home",
    car_finance: "directions_car", overdraft: "account_balance",
    buy_now_pay_later: "shopping_bag", other: "receipt_long",
  };
  return map[t] ?? "receipt_long";
}

export function categoryIcon(c: string): string {
  const map: Record<string, string> = {
    housing: "home", council_tax: "location_city",
    utilities: "bolt", food_groceries: "shopping_cart",
    transport: "directions_car", broadband_mobile: "wifi",
    insurance: "security", childcare: "child_care",
    health: "health_and_safety", eating_out: "restaurant",
    entertainment: "movie", clothing: "checkroom",
    personal_care: "spa", gym: "fitness_center",
    subscriptions: "subscriptions", other: "category",
  };
  return map[c] ?? "category";
}
