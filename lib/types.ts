export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// ─── Database type definitions ────────────────────────────────────────────────

type TableDef<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: never[];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<Profile, Omit<Profile, "created_at" | "updated_at">, Partial<Omit<Profile, "id">>>;
      income: TableDef<Income, Omit<Income, "id" | "created_at" | "updated_at">, Partial<Omit<Income, "id" | "user_id">>>;
      expenses: TableDef<Expense, Omit<Expense, "id" | "created_at" | "updated_at">, Partial<Omit<Expense, "id" | "user_id">>>;
      debts: TableDef<Debt, Omit<Debt, "id" | "created_at" | "updated_at">, Partial<Omit<Debt, "id" | "user_id">>>;
      subscriptions: TableDef<Subscription, Omit<Subscription, "id" | "created_at">, Partial<Omit<Subscription, "id" | "user_id">>>;
      savings_goals: TableDef<SavingsGoal, Omit<SavingsGoal, "id" | "created_at" | "updated_at">, Partial<Omit<SavingsGoal, "id" | "user_id">>>;
      ai_insights: TableDef<AIInsight, Omit<AIInsight, "id" | "generated_at">, Partial<Omit<AIInsight, "id" | "user_id" | "generated_at">>>;
      chat_messages: TableDef<ChatMessage, Omit<ChatMessage, "id" | "created_at">, Record<string, never>>;
    };
    Views: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Functions: Record<string, never>;
  };
};

// ─── Domain models ────────────────────────────────────────────────────────────

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  currency: string;
  theme: string;
  created_at: string;
  updated_at: string;
};

export type Frequency = "weekly" | "biweekly" | "monthly" | "annually";

export type Income = {
  id: string;
  user_id: string;
  source: string;
  amount: number;
  frequency: Frequency;
  pay_date: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ExpenseCategory =
  | "housing"
  | "council_tax"
  | "utilities"
  | "food_groceries"
  | "transport"
  | "broadband_mobile"
  | "insurance"
  | "childcare"
  | "health"
  | "eating_out"
  | "entertainment"
  | "clothing"
  | "personal_care"
  | "gym"
  | "subscriptions"
  | "other";

export type Expense = {
  id: string;
  user_id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  frequency: Frequency | "one_off";
  due_day: number | null;
  is_essential: boolean;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DebtType =
  | "credit_card"
  | "personal_loan"
  | "student_loan"
  | "mortgage"
  | "car_finance"
  | "overdraft"
  | "buy_now_pay_later"
  | "other";

export type Debt = {
  id: string;
  user_id: string;
  name: string;
  type: DebtType;
  balance: number;
  interest_rate: number;
  minimum_payment: number;
  due_day: number | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  frequency: "weekly" | "monthly" | "annually";
  category: string | null;
  next_billing_date: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
};

export type SavingsGoal = {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  category: string | null;
  priority: number;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AIInsight = {
  id: string;
  user_id: string;
  type: "spending" | "debt" | "savings" | "cashflow" | "general";
  title: string;
  body: string;
  impact: "high" | "medium" | "low" | null;
  icon: string | null;
  is_read: boolean;
  generated_at: string;
};

export type ChatMessage = {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

// ─── Computed / view models ───────────────────────────────────────────────────

export type FinancialSummary = {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyDebtPayments: number;
  monthlySubscriptions: number;
  totalDebt: number;
  totalSavings: number;
  disposableIncome: number;
  debtToIncomeRatio: number;
  savingsRate: number;
  healthScore: number;
  healthLabel: "Excellent" | "Good" | "Fair" | "Needs Attention";
};

export type ChatAPIMessage = {
  role: "user" | "assistant";
  content: string;
};
