"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
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
} from "@/lib/types";

// ─── Storage key ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "lumina_finance_v1";
const GUEST_USER_ID = "guest";

// ─── Input types for CRUD operations ─────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function timestamp(): string {
  return new Date().toISOString();
}

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

function loadLocal(): LocalStore {
  if (typeof window === "undefined") return emptyLocal();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyLocal();
    return JSON.parse(raw) as LocalStore;
  } catch {
    return emptyLocal();
  }
}

function saveLocal(store: LocalStore) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {}
}

function clearLocal() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

// ─── Context ──────────────────────────────────────────────────────────────────

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function useFinances(): FinanceContextValue {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinances must be used inside FinanceProvider");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [income, setIncome] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [insights, setInsightsState] = useState<AIInsight[]>([]);

  // ── Local state helpers ──────────────────────────────────────────────────

  const saveAllLocal = useCallback((store: LocalStore) => {
    saveLocal(store);
  }, []);

  const currentLocal = useCallback(
    (): LocalStore => ({
      income,
      expenses,
      debts,
      subscriptions,
      goals,
      insights,
    }),
    [income, expenses, debts, subscriptions, goals, insights],
  );

  // ── Load from Supabase ────────────────────────────────────────────────────

  const loadFromSupabase = useCallback(
    async (uid: string) => {
      setIsLoading(true);
      try {
        const [iRes, eRes, dRes, sRes, gRes, insRes] = await Promise.all([
          supabase
            .from("income")
            .select("*")
            .eq("user_id", uid)
            .eq("is_active", true)
            .order("created_at"),
          supabase
            .from("expenses")
            .select("*")
            .eq("user_id", uid)
            .eq("is_active", true)
            .order("created_at"),
          supabase
            .from("debts")
            .select("*")
            .eq("user_id", uid)
            .eq("is_active", true)
            .order("interest_rate", { ascending: false }),
          supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", uid)
            .eq("is_active", true)
            .order("created_at"),
          supabase
            .from("savings_goals")
            .select("*")
            .eq("user_id", uid)
            .eq("is_active", true)
            .order("priority"),
          supabase
            .from("ai_insights")
            .select("*")
            .eq("user_id", uid)
            .order("generated_at", { ascending: false })
            .limit(20),
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

  // ── Load from localStorage ────────────────────────────────────────────────

  const loadFromLocal = useCallback(() => {
    const stored = loadLocal();
    setIncome(stored.income);
    setExpenses(stored.expenses);
    setDebts(stored.debts);
    setSubscriptions(stored.subscriptions);
    setGoals(stored.goals);
    setInsightsState(stored.insights);
    setIsLoading(false);
  }, []);

  // ── Auth state ────────────────────────────────────────────────────────────

  useEffect(() => {
    // Migrate any guest localStorage data into Supabase then clear it.
    // Safe to call multiple times — clearLocal() ensures idempotency.
    async function migrateLocalToSupabase(uid: string) {
      const local = loadLocal();
      const hasLocal =
        local.income.length > 0 ||
        local.expenses.length > 0 ||
        local.debts.length > 0 ||
        local.subscriptions.length > 0 ||
        local.goals.length > 0;

      if (hasLocal) {
        await Promise.all([
          ...local.income.map((i) =>
            supabase.from("income").insert({ ...i, id: undefined, user_id: uid }),
          ),
          ...local.expenses.map((e) =>
            supabase.from("expenses").insert({ ...e, id: undefined, user_id: uid }),
          ),
          ...local.debts.map((d) =>
            supabase.from("debts").insert({ ...d, id: undefined, user_id: uid }),
          ),
          ...local.subscriptions.map((s) =>
            supabase.from("subscriptions").insert({ ...s, id: undefined, user_id: uid }),
          ),
          ...local.goals.map((g) =>
            supabase.from("savings_goals").insert({ ...g, id: undefined, user_id: uid }),
          ),
        ]);
      }

      // Always wipe localStorage once authenticated — authenticated users
      // never read from it, so stale guest data must not survive a sign-out.
      clearLocal();
    }

    // Initial load — covers OAuth/email-confirmation flows where the session
    // is already set via cookie on page load (INITIAL_SESSION, not SIGNED_IN).
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        await migrateLocalToSupabase(u.id);
        loadFromSupabase(u.id);
      } else {
        loadFromLocal();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        // SIGNED_IN fires for same-page sign-ins (email/password).
        // migrateLocalToSupabase is idempotent — if getSession already
        // cleared localStorage, this is a no-op.
        if (event === "SIGNED_IN") {
          await migrateLocalToSupabase(u.id);
        }
        loadFromSupabase(u.id);
      } else {
        // On sign-out: wipe all in-memory state and localStorage so the next
        // guest session starts completely clean.
        if (event === "SIGNED_OUT") {
          clearLocal();
          setIncome([]);
          setExpenses([]);
          setDebts([]);
          setSubscriptions([]);
          setGoals([]);
          setInsightsState([]);
          setIsLoading(false);
        } else {
          // No session and not a sign-out (e.g. initial load with no account)
          loadFromLocal();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, loadFromSupabase, loadFromLocal]);

  // ─────────────────────────────────────────────────────────────────────────
  // INCOME
  // ─────────────────────────────────────────────────────────────────────────

  const addIncome = useCallback(
    async (data: AddIncomeData) => {
      if (user) {
        const { data: row } = await supabase
          .from("income")
          .insert({
            user_id: user.id,
            ...data,
            is_active: true,
          })
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
          saveAllLocal({ ...currentLocal(), income: next });
          return next;
        });
      }
    },
    [user, supabase, currentLocal, saveAllLocal],
  );

  const deleteIncome = useCallback(
    async (id: string) => {
      if (user) {
        await supabase
          .from("income")
          .update({ is_active: false })
          .eq("id", id)
          .eq("user_id", user.id);
      }
      setIncome((prev) => {
        const next = prev.filter((i) => i.id !== id);
        if (!user) saveAllLocal({ ...currentLocal(), income: next });
        return next;
      });
    },
    [user, supabase, currentLocal, saveAllLocal],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // EXPENSES
  // ─────────────────────────────────────────────────────────────────────────

  const addExpense = useCallback(
    async (data: AddExpenseData) => {
      if (user) {
        const { data: row } = await supabase
          .from("expenses")
          .insert({
            user_id: user.id,
            ...data,
            is_essential: data.is_essential ?? false,
            is_active: true,
          })
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
          saveAllLocal({ ...currentLocal(), expenses: next });
          return next;
        });
      }
    },
    [user, supabase, currentLocal, saveAllLocal],
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      if (user) {
        await supabase
          .from("expenses")
          .update({ is_active: false })
          .eq("id", id)
          .eq("user_id", user.id);
      }
      setExpenses((prev) => {
        const next = prev.filter((e) => e.id !== id);
        if (!user) saveAllLocal({ ...currentLocal(), expenses: next });
        return next;
      });
    },
    [user, supabase, currentLocal, saveAllLocal],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // DEBTS
  // ─────────────────────────────────────────────────────────────────────────

  const addDebt = useCallback(
    async (data: AddDebtData) => {
      if (user) {
        const { data: row } = await supabase
          .from("debts")
          .insert({
            user_id: user.id,
            ...data,
            is_active: true,
            due_day: null,
          })
          .select()
          .single();
        if (row)
          setDebts((prev) =>
            [...prev, row as Debt].sort(
              (a, b) => b.interest_rate - a.interest_rate,
            ),
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
          const next = [...prev, item].sort(
            (a, b) => b.interest_rate - a.interest_rate,
          );
          saveAllLocal({ ...currentLocal(), debts: next });
          return next;
        });
      }
    },
    [user, supabase, currentLocal, saveAllLocal],
  );

  const deleteDebt = useCallback(
    async (id: string) => {
      if (user) {
        await supabase
          .from("debts")
          .update({ is_active: false })
          .eq("id", id)
          .eq("user_id", user.id);
      }
      setDebts((prev) => {
        const next = prev.filter((d) => d.id !== id);
        if (!user) saveAllLocal({ ...currentLocal(), debts: next });
        return next;
      });
    },
    [user, supabase, currentLocal, saveAllLocal],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSCRIPTIONS
  // ─────────────────────────────────────────────────────────────────────────

  const addSubscription = useCallback(
    async (data: AddSubscriptionData) => {
      if (user) {
        const { data: row } = await supabase
          .from("subscriptions")
          .insert({
            user_id: user.id,
            ...data,
            is_active: true,
          })
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
          saveAllLocal({ ...currentLocal(), subscriptions: next });
          return next;
        });
      }
    },
    [user, supabase, currentLocal, saveAllLocal],
  );

  const deleteSubscription = useCallback(
    async (id: string) => {
      if (user) {
        await supabase
          .from("subscriptions")
          .update({ is_active: false })
          .eq("id", id)
          .eq("user_id", user.id);
      }
      setSubscriptions((prev) => {
        const next = prev.filter((s) => s.id !== id);
        if (!user) saveAllLocal({ ...currentLocal(), subscriptions: next });
        return next;
      });
    },
    [user, supabase, currentLocal, saveAllLocal],
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
          saveAllLocal({ ...currentLocal(), goals: next });
          return next;
        });
      }
    },
    [user, supabase, currentLocal, saveAllLocal],
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      if (user) {
        await supabase
          .from("savings_goals")
          .update({ is_active: false })
          .eq("id", id)
          .eq("user_id", user.id);
      }
      setGoals((prev) => {
        const next = prev.filter((g) => g.id !== id);
        if (!user) saveAllLocal({ ...currentLocal(), goals: next });
        return next;
      });
    },
    [user, supabase, currentLocal, saveAllLocal],
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
        if (!user) saveAllLocal({ ...currentLocal(), goals: next });
        return next;
      });
    },
    [user, supabase, currentLocal, saveAllLocal],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // INSIGHTS
  // ─────────────────────────────────────────────────────────────────────────

  const setInsights = useCallback(
    (newInsights: AIInsight[]) => {
      setInsightsState(newInsights);
      if (!user) {
        saveAllLocal({ ...currentLocal(), insights: newInsights });
      }
    },
    [user, currentLocal, saveAllLocal],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // MIGRATION: guest → authenticated
  // ─────────────────────────────────────────────────────────────────────────

  const migrateGuestData = useCallback(
    async (userId: string) => {
      const local = loadLocal();
      const hasData =
        local.income.length > 0 ||
        local.expenses.length > 0 ||
        local.debts.length > 0 ||
        local.subscriptions.length > 0 ||
        local.goals.length > 0;
      if (!hasData) return;

      await Promise.all([
        ...local.income.map((i) =>
          supabase
            .from("income")
            .insert({ ...i, id: undefined, user_id: userId }),
        ),
        ...local.expenses.map((e) =>
          supabase
            .from("expenses")
            .insert({ ...e, id: undefined, user_id: userId }),
        ),
        ...local.debts.map((d) =>
          supabase
            .from("debts")
            .insert({ ...d, id: undefined, user_id: userId }),
        ),
        ...local.subscriptions.map((s) =>
          supabase
            .from("subscriptions")
            .insert({ ...s, id: undefined, user_id: userId }),
        ),
        ...local.goals.map((g) =>
          supabase
            .from("savings_goals")
            .insert({ ...g, id: undefined, user_id: userId }),
        ),
      ]);

      clearLocal();
      await loadFromSupabase(userId);
    },
    [supabase, loadFromSupabase],
  );

  const clearGuestData = useCallback(() => {
    clearLocal();
    setIncome([]);
    setExpenses([]);
    setDebts([]);
    setSubscriptions([]);
    setGoals([]);
    setInsightsState([]);
  }, []);

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

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  );
}
