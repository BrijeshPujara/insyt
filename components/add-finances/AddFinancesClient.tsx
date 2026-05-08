"use client";

import { useState } from "react";
import {
  cn,
  formatGBP,
  frequencyLabel,
  expenseCategoryLabel,
  debtTypeLabel,
} from "@/lib/utils";
import { useFinances } from "@/lib/store/finance-store";
import type {
  Income,
  Expense,
  Debt,
  Subscription,
  SavingsGoal,
} from "@/lib/types";

interface Props {
  income: Income[];
  expenses: Expense[];
  debts: Debt[];
  subscriptions: Subscription[];
  goals: SavingsGoal[];
}

type Tab = "income" | "expenses" | "debts" | "subscriptions" | "goals";

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "income", label: "Income", icon: "payments" },
  { id: "expenses", label: "Expenses", icon: "shopping_cart" },
  { id: "debts", label: "Debts", icon: "credit_card" },
  { id: "subscriptions", label: "Subscriptions", icon: "subscriptions" },
  { id: "goals", label: "Goals", icon: "savings" },
];

export function AddFinancesClient({
  income,
  expenses,
  debts,
  subscriptions,
  goals,
}: Props) {
  const store = useFinances();
  const [activeTab, setActiveTab] = useState<Tab>("income");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function withSubmit(fn: () => Promise<void>) {
    setSubmitting(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setError(null);
            }}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="material-symbols-outlined text-[16px]">
              {tab.icon}
            </span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
        </div>
      )}

      {/* ─── INCOME ─── */}
      {activeTab === "income" && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Add income source
            </h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const form = e.currentTarget;
                await withSubmit(async () => {
                  const amount = parseFloat(fd.get("amount") as string);
                  if (!amount || amount <= 0)
                    throw new Error("Amount must be positive");
                  await store.addIncome({
                    source: fd.get("source") as string,
                    amount,
                    frequency: fd.get("frequency") as "monthly",
                  });
                  form.reset();
                });
              }}
              className="grid grid-cols-2 gap-3"
            >
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">
                  Source
                </label>
                <input
                  name="source"
                  required
                  placeholder="e.g. Salary, Freelance"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Amount (£)
                </label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="2500"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Frequency
                </label>
                <select name="frequency" className="input-field w-full">
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Fortnightly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
              <div className="col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full"
                >
                  {submitting ? "Adding…" : "Add income"}
                </button>
              </div>
            </form>
          </div>

          {income.length > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-foreground mb-3">
                Your income
              </h2>
              <div className="space-y-0">
                {income.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.source}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {frequencyLabel(item.frequency)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-emerald-400">
                        {formatGBP(item.amount)}
                      </span>
                      <button
                        onClick={() => store.deleteIncome(item.id)}
                        className="p-1 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── EXPENSES ─── */}
      {activeTab === "expenses" && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Add recurring expense
            </h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const form = e.currentTarget;
                await withSubmit(async () => {
                  const amount = parseFloat(fd.get("amount") as string);
                  if (!amount || amount <= 0)
                    throw new Error("Amount must be positive");
                  await store.addExpense({
                    name: fd.get("name") as string,
                    category: fd.get("category") as "housing",
                    amount,
                    frequency: fd.get("frequency") as "monthly",
                    is_essential: fd.get("is_essential") === "true",
                  });
                  form.reset();
                });
              }}
              className="grid grid-cols-2 gap-3"
            >
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">
                  Name
                </label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Rent, Council Tax"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Category
                </label>
                <select name="category" className="input-field w-full">
                  <option value="housing">Rent / Mortgage</option>
                  <option value="council_tax">Council Tax</option>
                  <option value="utilities">Utilities</option>
                  <option value="food_groceries">Food & Groceries</option>
                  <option value="transport">Transport</option>
                  <option value="broadband_mobile">Broadband & Mobile</option>
                  <option value="insurance">Insurance</option>
                  <option value="childcare">Childcare</option>
                  <option value="health">Health</option>
                  <option value="eating_out">Eating Out</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="gym">Gym & Fitness</option>
                  <option value="clothing">Clothing</option>
                  <option value="personal_care">Personal Care</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Frequency
                </label>
                <select name="frequency" className="input-field w-full">
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Fortnightly</option>
                  <option value="annually">Annually</option>
                  <option value="one_off">One-off</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Amount (£)
                </label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="800"
                  className="input-field w-full"
                />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <input
                  name="is_essential"
                  type="checkbox"
                  id="is_essential"
                  value="true"
                  className="rounded"
                />
                <label
                  htmlFor="is_essential"
                  className="text-sm text-foreground"
                >
                  Essential expense
                </label>
              </div>
              <div className="col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full"
                >
                  {submitting ? "Adding…" : "Add expense"}
                </button>
              </div>
            </form>
          </div>

          {expenses.length > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-foreground mb-3">
                Your expenses
              </h2>
              <div className="space-y-0">
                {expenses.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {expenseCategoryLabel(item.category)} ·{" "}
                        {frequencyLabel(item.frequency)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-red-400">
                        {formatGBP(item.amount)}
                      </span>
                      <button
                        onClick={() => store.deleteExpense(item.id)}
                        className="p-1 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── DEBTS ─── */}
      {activeTab === "debts" && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Add debt
            </h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const form = e.currentTarget;
                await withSubmit(async () => {
                  await store.addDebt({
                    name: fd.get("name") as string,
                    type: fd.get("type") as "credit_card",
                    balance: parseFloat(fd.get("balance") as string),
                    interest_rate: parseFloat(
                      fd.get("interest_rate") as string,
                    ),
                    minimum_payment: parseFloat(
                      fd.get("minimum_payment") as string,
                    ),
                  });
                  form.reset();
                });
              }}
              className="grid grid-cols-2 gap-3"
            >
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">
                  Name
                </label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Barclaycard, Student Loan"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Type
                </label>
                <select name="type" className="input-field w-full">
                  <option value="credit_card">Credit Card</option>
                  <option value="personal_loan">Personal Loan</option>
                  <option value="student_loan">Student Loan</option>
                  <option value="mortgage">Mortgage</option>
                  <option value="car_finance">Car Finance</option>
                  <option value="overdraft">Overdraft</option>
                  <option value="buy_now_pay_later">Buy Now Pay Later</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Balance (£)
                </label>
                <input
                  name="balance"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="5000"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Interest rate (%)
                </label>
                <input
                  name="interest_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  required
                  placeholder="19.9"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Min. payment (£/mo)
                </label>
                <input
                  name="minimum_payment"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="50"
                  className="input-field w-full"
                />
              </div>
              <div className="col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full"
                >
                  {submitting ? "Adding…" : "Add debt"}
                </button>
              </div>
            </form>
          </div>

          {debts.length > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-foreground mb-3">
                Your debts
              </h2>
              <div className="space-y-0">
                {debts.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {debtTypeLabel(item.type)} · {item.interest_rate}% APR
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-red-400">
                        {formatGBP(item.balance)}
                      </span>
                      <button
                        onClick={() => store.deleteDebt(item.id)}
                        className="p-1 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── SUBSCRIPTIONS ─── */}
      {activeTab === "subscriptions" && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Add subscription
            </h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const form = e.currentTarget;
                await withSubmit(async () => {
                  await store.addSubscription({
                    name: fd.get("name") as string,
                    amount: parseFloat(fd.get("amount") as string),
                    frequency: fd.get("frequency") as "monthly",
                  });
                  form.reset();
                });
              }}
              className="grid grid-cols-2 gap-3"
            >
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">
                  Name
                </label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Netflix, Spotify"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Amount (£)
                </label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="9.99"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Frequency
                </label>
                <select name="frequency" className="input-field w-full">
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
              <div className="col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full"
                >
                  {submitting ? "Adding…" : "Add subscription"}
                </button>
              </div>
            </form>
          </div>

          {subscriptions.length > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-foreground mb-3">
                Your subscriptions
              </h2>
              <div className="space-y-0">
                {subscriptions.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {frequencyLabel(
                          item.frequency as "weekly" | "monthly" | "annually",
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-amber-400">
                        {formatGBP(item.amount)}
                      </span>
                      <button
                        onClick={() => store.deleteSubscription(item.id)}
                        className="p-1 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── GOALS ─── */}
      {activeTab === "goals" && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Add savings goal
            </h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const form = e.currentTarget;
                await withSubmit(async () => {
                  const targetDate = fd.get("target_date") as string;
                  await store.addGoal({
                    name: fd.get("name") as string,
                    target_amount: parseFloat(
                      fd.get("target_amount") as string,
                    ),
                    current_amount: parseFloat(
                      (fd.get("current_amount") as string) || "0",
                    ),
                    target_date: targetDate || null,
                    priority: parseInt((fd.get("priority") as string) || "5"),
                  });
                  form.reset();
                });
              }}
              className="grid grid-cols-2 gap-3"
            >
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">
                  Goal name
                </label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Emergency Fund, Holiday"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Target amount (£)
                </label>
                <input
                  name="target_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="5000"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Already saved (£)
                </label>
                <input
                  name="current_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Target date
                </label>
                <input
                  name="target_date"
                  type="date"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Priority (1–10)
                </label>
                <input
                  name="priority"
                  type="number"
                  min="1"
                  max="10"
                  defaultValue="5"
                  className="input-field w-full"
                />
              </div>
              <div className="col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full"
                >
                  {submitting ? "Adding…" : "Add goal"}
                </button>
              </div>
            </form>
          </div>

          {goals.length > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-foreground mb-3">
                Your savings goals
              </h2>
              <div className="space-y-4">
                {goals.map((item) => {
                  const pct = Math.min(
                    (item.current_amount / item.target_amount) * 100,
                    100,
                  );
                  return (
                    <div key={item.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatGBP(item.current_amount)} /{" "}
                            {formatGBP(item.target_amount)}
                          </span>
                          <button
                            onClick={() => store.deleteGoal(item.id)}
                            className="p-1 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              delete
                            </span>
                          </button>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {pct.toFixed(0)}% complete
                        </p>
                        {/* Inline progress update */}
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget);
                            const add = parseFloat(
                              fd.get("add_amount") as string,
                            );
                            if (!add || isNaN(add)) return;
                            await withSubmit(async () => {
                              const newAmount = Math.min(
                                item.current_amount + add,
                                item.target_amount,
                              );
                              await store.updateGoal(item.id, {
                                current_amount: newAmount,
                              });
                            });
                            (e.target as HTMLFormElement).reset();
                          }}
                          className="flex items-center gap-1"
                        >
                          <input
                            name="add_amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="Add £"
                            className="input-field w-20 py-1 text-xs"
                          />
                          <button
                            type="submit"
                            disabled={submitting}
                            className="px-2 py-1 rounded-lg bg-primary/15 text-primary text-xs font-semibold hover:bg-primary/25 transition-colors"
                          >
                            +
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
