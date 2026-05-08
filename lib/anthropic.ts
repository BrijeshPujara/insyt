import Anthropic from "@anthropic-ai/sdk";
import type { FinancialSummary, Income, Expense, Debt, Subscription, SavingsGoal } from "./types";
import { formatGBP, debtTypeLabel, expenseCategoryLabel } from "./utils";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export type FinancialContext = {
  summary: FinancialSummary;
  income: Income[];
  expenses: Expense[];
  debts: Debt[];
  subscriptions: Subscription[];
  goals: SavingsGoal[];
  userName?: string;
};

export function buildSystemPrompt(ctx: FinancialContext): string {
  const { summary, income, expenses, debts, subscriptions, goals, userName } = ctx;
  const name = userName ? userName.split(" ")[0] : "there";

  const incomeLines = income
    .filter((i) => i.is_active)
    .map((i) => `  - ${i.source}: ${formatGBP(i.amount)} ${i.frequency}`)
    .join("\n") || "  None entered yet";

  const expenseLines = expenses
    .filter((e) => e.is_active)
    .map((e) => `  - ${e.name} (${expenseCategoryLabel(e.category)}): ${formatGBP(e.amount)} ${e.frequency}`)
    .join("\n") || "  None entered yet";

  const debtLines = debts
    .filter((d) => d.is_active)
    .map((d) => `  - ${d.name} (${debtTypeLabel(d.type)}): ${formatGBP(d.balance)} balance, ${d.interest_rate}% APR, min. ${formatGBP(d.minimum_payment)}/mo`)
    .join("\n") || "  None entered yet";

  const subLines = subscriptions
    .filter((s) => s.is_active)
    .map((s) => `  - ${s.name}: ${formatGBP(s.amount)} ${s.frequency}`)
    .join("\n") || "  None entered yet";

  const goalLines = goals
    .filter((g) => g.is_active)
    .map((g) => `  - ${g.name}: ${formatGBP(g.current_amount)} of ${formatGBP(g.target_amount)} saved`)
    .join("\n") || "  None entered yet";

  return `You are INSYT AI — a warm, intelligent, and highly personalised UK personal finance coach built into INSYT.

You are speaking with ${name}. Here is their real financial profile:

MONTHLY INCOME: ${formatGBP(summary.monthlyIncome)}
MONTHLY EXPENSES: ${formatGBP(summary.monthlyExpenses)}
MONTHLY DEBT PAYMENTS: ${formatGBP(summary.monthlyDebtPayments)}
MONTHLY SUBSCRIPTIONS: ${formatGBP(summary.monthlySubscriptions)}
TOTAL DEBT: ${formatGBP(summary.totalDebt)}
TOTAL SAVINGS: ${formatGBP(summary.totalSavings)}
DISPOSABLE INCOME: ${formatGBP(summary.disposableIncome)}
DEBT-TO-INCOME RATIO: ${summary.debtToIncomeRatio.toFixed(1)}%
SAVINGS RATE: ${summary.savingsRate.toFixed(1)}%
FINANCIAL HEALTH SCORE: ${summary.healthScore}/100 (${summary.healthLabel})

INCOME SOURCES:
${incomeLines}

RECURRING EXPENSES:
${expenseLines}

DEBTS:
${debtLines}

SUBSCRIPTIONS:
${subLines}

SAVINGS GOALS:
${goalLines}

COACHING STYLE:
- Use British English and UK financial terminology (salary, council tax, PAYE, ISA, NS&I, etc.)
- Be warm, supportive, and never judgemental about finances
- Give specific, actionable advice using their real numbers
- Reference their actual figures when making recommendations
- Be concise but substantive — no waffle
- Format responses with clear structure when helpful
- Prioritise emotional safety — finances are stressful and personal
- Think like a knowledgeable friend, not a bank's chatbot
- Use £ for all amounts, not $ or USD`;
}

export function buildInsightsPrompt(ctx: FinancialContext): string {
  return `${buildSystemPrompt(ctx)}

Based on the financial profile above, generate exactly 4 highly personalised financial insights. Each insight must:
- Reference their specific numbers
- Be directly actionable
- Be supportive in tone
- Focus on the most impactful improvements

Return ONLY valid JSON in this exact format (no markdown, no commentary):
[
  {
    "type": "spending|debt|savings|cashflow|general",
    "title": "Short, specific title (max 8 words)",
    "body": "2-3 sentences referencing their real numbers with a concrete recommendation",
    "impact": "high|medium|low",
    "icon": "material_symbol_name"
  }
]

Use these icon names from Material Symbols: lightbulb, savings, trending_down, credit_card, restaurant, subscriptions, home, bolt, directions_car, account_balance, query_stats, tips_and_updates`;
}
