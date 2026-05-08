"use client"; // Next.js App Router directive — ignored by Metro/React Native bundler

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type {
  Income,
  Expense,
  Debt,
  Subscription,
  SavingsGoal,
  AIInsight,
  Frequency,
  ExpenseCategory,
  DebtType,
} from "@insyt/core";
import type { StorageAdapter } from "./adapter";

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "insyt_finance_v1";
const GUEST_USER_ID = "guest";

// ─── Input types ──────────────────────────────────────────────────────────────

export interface AddIncomeData {
  source: string;
  amount: number;
  frequency: Frequency;
  pay_date?: string | null;
  notes?: string | null;
}

export interface AddExpenseData {
  name: string;
  category: ExpenseCategory;
  amount: number;
  frequency: Frequency | "one_off";
  is_essential?: boolean;
  notes?: string | null;
}

export interface AddDebtData {
  name: string;
  type: DebtType;
  balance: number;
  interest_rate: number;
  minimum_payment: number;
  notes?: string | null;
}

export interface AddSubscriptionData {
  name: string;
  amount: number;
  frequency: "weekly" | "monthly" | "annually";
  category?: string | null;
  notes?: string | null;
}

export interface AddGoalData {
  name: string;
  target_amount: number;
  current_amount?: number;
  target_date?: string | null;
  priority?: number;
  notes?: string | null;
}

export interface UpdateGoalData {
  current_amount?: number;
  name?: string;
  target_amount?: number;
  target_date?: string | null;
  notes?: string | null;
}

// ─── Context value ────────────────────────────────────────────────────────────

export interface FinanceContextValue {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  income: Income[];
  expenses: Expense[];
  debts: Debt[];
  subscriptions: Subscription[];
  goals: SavingsGoal[];
  insights: AIInsight[];
  addIncome: (data: AddIncomeData) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  addExpense: (data: AddExpenseData) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addDebt: (data: AddDebtData) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  addSubscription: (data: AddSubscriptionData) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  addGoal: (data: AddGoalData) => Promise<void>;
  updateGoal: (id: string, data: UpdateGoalData) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  setInsights: (insights: AIInsight[]) => void;
  migrateGuestData: (userId: string) => Promise<void>;
  clearGuestData: () => void;
}

// ─── Internal storage shape ───────────────────────────────────────────────────

interface LocalStore {
  income: Income[];
  expenses: Expense[];
  debts: Debt[];
  subscriptions: Subscription[];
  goals: SavingsGoal[];
  insights: AIInsight[];
}

const emptyLocal = (): LocalStore => ({
  income: [],
  expenses: [],
  debts: [],
  subscriptions: [],
  goals: [],
  insights: [],
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function timestamp(): string {
  return new Date().toISOString();
}

// ─── Context ──────────────────────────────────────────────────────────────────

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function useFinances(): FinanceContextValue {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinances must be used inside FinanceProvider");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export interface FinanceProviderProps {
  children: React.ReactNode;
  storage: StorageAdapter;
  supabase: SupabaseClient;
}

export function FinanceProvider({ children, storage, supabase }: FinanceProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [income, setIncome] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [insights, setInsightsState] = useState<AIInsight[]>([]);

  // Ref always reflects latest local state — used inside async callbacks to
  // write a consistent snapshot without depending on React state closure values.
  const storeRef = useRef<LocalStore>(emptyLocal());
  useEffect(() => {
    storeRef.current = { income, expenses, debts, subscriptions, goals, insights };
  }, [income, expenses, debts, subscriptions, goals, insights]);

  // ── Storage helpers ──────────────────────────────────────────────────────

  const saveGuest = useCallback(
    (patch: Partial<LocalStore>) => {
      const next = { ...storeRef.current, ...patch };
      // Fire-and-forget — failures are non-critical; data is already in state.
      storage.set(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
    },
    [storage],
  );

  const loadFromStorage = useCallback(async () => {
    try {
      const raw = await storage.get(STORAGE_KEY);
      const stored: LocalStore = raw ? (JSON.parse(raw) as LocalStore) : emptyLocal();
      setIncome(stored.income ?? []);
      setExpenses(stored.expenses ?? []);
      setDebts(stored.debts ?? []);
      setSubscriptions(stored.subscriptions ?? []);
      setGoals(stored.goals ?? []);
      setInsightsState(stored.insights ?? []);
    } catch {
      // corrupt data — start fresh
    } finally {
      setIsLoading(false);
    }
  }, [storage]);

  const clearStorage = useCallback(async () => {
    await storage.remove(STORAGE_KEY).catch(() => {});
  }, [storage]);

  // ── Supabase load ─────────────────────────────────────────────────────────

  const loadFromSupabase = useCallback(
    async (uid: string) => {
      setIsLoading(true);
      try {
        const [iRes, eRes, dRes, sRes, gRes, insRes] = await Promise.all([
          supabase.from("income").select("*").eq("user_id", uid).eq("is_active", true).order("created_at"),
          supabase.from("expenses").select("*").eq("user_id", uid).eq("is_active", true).order("created_at"),
          supabase.from("debts").select("*").eq("user_id", uid).eq("is_active", true).order("interest_rate", { ascending: false }),
          supabase.from("subscriptions").select("*").eq("user_id", uid).eq("is_active", true).order("created_at"),
          supabase.from("savings_goals").select("*").eq("user_id", uid).eq("is_active", true).order("priority"),
          supabase.from("ai_insights").select("*").eq("user_id", uid).order("generated_at", { ascending: false }).limit(20),
        ]);
        setIncome((iRes.data ?? []) as Income[]);
        setExpenses((eRes.data ?? []) as Expense[]);
        setDebts((dRes.data ?? []) as Debt[]);
        setSubscriptions((sRes.data ?? []) as Subscription[]);
        setGoals((gRes.data ?? []) as SavingsGoal[]);
        setInsightsState((insRes.data ?? []) as AIInsight[]);
      } finally {
        setIsLoading(false);
      }
    },
    [supabase],
  );

  // ── Auth state ────────────────────────────────────────────────────────────

  useEffect(() => {
    async function migrateLocalToSupabase(uid: string) {
      const raw = await storage.get(STORAGE_KEY).catch(() => null);
      const local: LocalStore = raw ? (JSON.parse(raw) as LocalStore) : emptyLocal();
      const hasLocal =
        local.income.length > 0 ||
        local.expenses.length > 0 ||
        local.debts.length > 0 ||
        local.subscriptions.length > 0 ||
        local.goals.length > 0;

      if (hasLocal) {
        await Promise.all([
          ...local.income.map((i) => supabase.from("income").insert({ ...i, id: undefined, user_id: uid })),
          ...local.expenses.map((e) => supabase.from("expenses").insert({ ...e, id: undefined, user_id: uid })),
          ...local.debts.map((d) => supabase.from("debts").insert({ ...d, id: undefined, user_id: uid })),
          ...local.subscriptions.map((s) => supabase.from("subscriptions").insert({ ...s, id: undefined, user_id: uid })),
          ...local.goals.map((g) => supabase.from("savings_goals").insert({ ...g, id: undefined, user_id: uid })),
        ]);
      }

      await clearStorage();
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        await migrateLocalToSupabase(u.id);
        loadFromSupabase(u.id);
      } else {
        loadFromStorage();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        if (event === "SIGNED_IN") {
          await migrateLocalToSupabase(u.id);
          loadFromSupabase(u.id);
        }
      } else {
        if (event === "SIGNED_OUT") {
          await clearStorage();
          setIncome([]);
          setExpenses([]);
          setDebts([]);
          setSubscriptions([]);
          setGoals([]);
          setInsightsState([]);
          setIsLoading(false);
        } else {
          loadFromStorage();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, storage, loadFromSupabase, loadFromStorage, clearStorage]);

  // ─────────────────────────────────────────────────────────────────────────
  // INCOME
  // ─────────────────────────────────────────────────────────────────────────

  const addIncome = useCallback(
    async (data: AddIncomeData) => {
      if (user) {
        const { data: row } = await supabase
          .from("income")
          .insert({ user_id: user.id, ...data, is_active: true })
          .select()
          .single();
        if (row) setIncome((prev) => [...prev, row as Income]);
      } else {
        const item: Income = {
          id: makeId(),
          user_id: GUEST_USER_ID,
          source: data.source,
          amount: data.amount,
          frequency: data.frequency,
          pay_date: data.pay_date ?? null,
          notes: data.notes ?? null,
          is_active: true,
          created_at: timestamp(),
          updated_at: timestamp(),
        };
        setIncome((prev) => {
          const next = [...prev, item];
          saveGuest({ income: next });
          return next;
        });
      }
    },
    [user, supabase, saveGuest],
  );

  const deleteIncome = useCallback(
    async (id: string) => {
      if (user) {
        await supabase.from("income").update({ is_active: false }).eq("id", id).eq("user_id", user.id);
      }
      setIncome((prev) => {
        const next = prev.filter((i) => i.id !== id);
        if (!user) saveGuest({ income: next });
        return next;
      });
    },
    [user, supabase, saveGuest],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // EXPENSES
  // ─────────────────────────────────────────────────────────────────────────

  const addExpense = useCallback(
    async (data: AddExpenseData) => {
      if (user) {
        const { data: row } = await supabase
          .from("expenses")
          .insert({ user_id: user.id, ...data, is_essential: data.is_essential ?? false, is_active: true })
          .select()
          .single();
        if (row) setExpenses((prev) => [...prev, row as Expense]);
      } else {
        const item: Expense = {
          id: makeId(),
          user_id: GUEST_USER_ID,
          name: data.name,
          category: data.category,
          amount: data.amount,
          frequency: data.frequency,
          due_day: null,
          is_essential: data.is_essential ?? false,
          is_active: true,
          notes: data.notes ?? null,
          created_at: timestamp(),
          updated_at: timestamp(),
        };
        setExpenses((prev) => {
          const next = [...prev, item];
          saveGuest({ expenses: next });
          return next;
        });
      }
    },
    [user, supabase, saveGuest],
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      if (user) {
        await supabase.from("expenses").update({ is_active: false }).eq("id", id).eq("user_id", user.id);
      }
      setExpenses((prev) => {
        const next = prev.filter((e) => e.id !== id);
        if (!user) saveGuest({ expenses: next });
        return next;
      });
    },
    [user, supabase, saveGuest],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // DEBTS
  // ─────────────────────────────────────────────────────────────────────────

  const addDebt = useCallback(
    async (data: AddDebtData) => {
      if (user) {
        const { data: row } = await supabase
          .from("debts")
          .insert({ user_id: user.id, ...data, is_active: true, due_day: null })
          .select()
          .single();
        if (row)
          setDebts((prev) =>
            [...prev, row as Debt].sort((a, b) => b.interest_rate - a.interest_rate),
          );
      } else {
        const item: Debt = {
          id: makeId(),
          user_id: GUEST_USER_ID,
          name: data.name,
          type: data.type,
          balance: data.balance,
          interest_rate: data.interest_rate,
          minimum_payment: data.minimum_payment,
          due_day: null,
          is_active: true,
          notes: data.notes ?? null,
          created_at: timestamp(),
          updated_at: timestamp(),
        };
        setDebts((prev) => {
          const next = [...prev, item].sort((a, b) => b.interest_rate - a.interest_rate);
          saveGuest({ debts: next });
          return next;
        });
      }
    },
    [user, supabase, saveGuest],
  );

  const deleteDebt = useCallback(
    async (id: string) => {
      if (user) {
        await supabase.from("debts").update({ is_active: false }).eq("id", id).eq("user_id", user.id);
      }
      setDebts((prev) => {
        const next = prev.filter((d) => d.id !== id);
        if (!user) saveGuest({ debts: next });
        return next;
      });
    },
    [user, supabase, saveGuest],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSCRIPTIONS
  // ─────────────────────────────────────────────────────────────────────────

  const addSubscription = useCallback(
    async (data: AddSubscriptionData) => {
      if (user) {
        const { data: row } = await supabase
          .from("subscriptions")
          .insert({ user_id: user.id, ...data, is_active: true })
          .select()
          .single();
        if (row) setSubscriptions((prev) => [...prev, row as Subscription]);
      } else {
        const item: Subscription = {
          id: makeId(),
          user_id: GUEST_USER_ID,
          name: data.name,
          amount: data.amount,
          frequency: data.frequency,
          category: data.category ?? null,
          next_billing_date: null,
          is_active: true,
          notes: data.notes ?? null,
          created_at: timestamp(),
        };
        setSubscriptions((prev) => {
          const next = [...prev, item];
          saveGuest({ subscriptions: next });
          return next;
        });
      }
    },
    [user, supabase, saveGuest],
  );

  const deleteSubscription = useCallback(
    async (id: string) => {
      if (user) {
        await supabase.from("subscriptions").update({ is_active: false }).eq("id", id).eq("user_id", user.id);
      }
      setSubscriptions((prev) => {
        const next = prev.filter((s) => s.id !== id);
        if (!user) saveGuest({ subscriptions: next });
        return next;
      });
    },
    [user, supabase, saveGuest],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // GOALS
  // ─────────────────────────────────────────────────────────────────────────

  const addGoal = useCallback(
    async (data: AddGoalData) => {
      if (user) {
        const { data: row } = await supabase
          .from("savings_goals")
          .insert({
            user_id: user.id,
            ...data,
            current_amount: data.current_amount ?? 0,
            priority: data.priority ?? 5,
            is_active: true,
          })
          .select()
          .single();
        if (row) setGoals((prev) => [...prev, row as SavingsGoal]);
      } else {
        const item: SavingsGoal = {
          id: makeId(),
          user_id: GUEST_USER_ID,
          name: data.name,
          target_amount: data.target_amount,
          current_amount: data.current_amount ?? 0,
          target_date: data.target_date ?? null,
          category: null,
          priority: data.priority ?? 5,
          is_active: true,
          notes: data.notes ?? null,
          created_at: timestamp(),
          updated_at: timestamp(),
        };
        setGoals((prev) => {
          const next = [...prev, item];
          saveGuest({ goals: next });
          return next;
        });
      }
    },
    [user, supabase, saveGuest],
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      if (user) {
        await supabase.from("savings_goals").update({ is_active: false }).eq("id", id).eq("user_id", user.id);
      }
      setGoals((prev) => {
        const next = prev.filter((g) => g.id !== id);
        if (!user) saveGuest({ goals: next });
        return next;
      });
    },
    [user, supabase, saveGuest],
  );

  const updateGoal = useCallback(
    async (id: string, data: UpdateGoalData) => {
      if (user) {
        await supabase
          .from("savings_goals")
          .update({ ...data, updated_at: timestamp() })
          .eq("id", id)
          .eq("user_id", user.id);
      }
      setGoals((prev) => {
        const next = prev.map((g) =>
          g.id === id ? { ...g, ...data, updated_at: timestamp() } : g,
        );
        if (!user) saveGuest({ goals: next });
        return next;
      });
    },
    [user, supabase, saveGuest],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // INSIGHTS
  // ─────────────────────────────────────────────────────────────────────────

  const setInsights = useCallback(
    (newInsights: AIInsight[]) => {
      setInsightsState(newInsights);
      if (!user) saveGuest({ insights: newInsights });
    },
    [user, saveGuest],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // MIGRATION: guest → authenticated
  // ─────────────────────────────────────────────────────────────────────────

  const migrateGuestData = useCallback(
    async (userId: string) => {
      const raw = await storage.get(STORAGE_KEY).catch(() => null);
      const local: LocalStore = raw ? (JSON.parse(raw) as LocalStore) : emptyLocal();
      const hasData =
        local.income.length > 0 ||
        local.expenses.length > 0 ||
        local.debts.length > 0 ||
        local.subscriptions.length > 0 ||
        local.goals.length > 0;
      if (!hasData) return;

      await Promise.all([
        ...local.income.map((i) => supabase.from("income").insert({ ...i, id: undefined, user_id: userId })),
        ...local.expenses.map((e) => supabase.from("expenses").insert({ ...e, id: undefined, user_id: userId })),
        ...local.debts.map((d) => supabase.from("debts").insert({ ...d, id: undefined, user_id: userId })),
        ...local.subscriptions.map((s) => supabase.from("subscriptions").insert({ ...s, id: undefined, user_id: userId })),
        ...local.goals.map((g) => supabase.from("savings_goals").insert({ ...g, id: undefined, user_id: userId })),
      ]);

      await clearStorage();
      await loadFromSupabase(userId);
    },
    [supabase, storage, clearStorage, loadFromSupabase],
  );

  const clearGuestData = useCallback(() => {
    clearStorage();
    setIncome([]);
    setExpenses([]);
    setDebts([]);
    setSubscriptions([]);
    setGoals([]);
    setInsightsState([]);
  }, [clearStorage]);

  // ─────────────────────────────────────────────────────────────────────────

  const value: FinanceContextValue = {
    user,
    isGuest: !user,
    isLoading,
    income,
    expenses,
    debts,
    subscriptions,
    goals,
    insights,
    addIncome,
    deleteIncome,
    addExpense,
    deleteExpense,
    addDebt,
    deleteDebt,
    addSubscription,
    deleteSubscription,
    addGoal,
    deleteGoal,
    updateGoal,
    setInsights,
    migrateGuestData,
    clearGuestData,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}
