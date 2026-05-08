"use client";

import { useFinances } from "@/lib/store/finance-store";
import { AddFinancesClient } from "@/components/add-finances/AddFinancesClient";

export default function AddFinancesPage() {
  const { income, expenses, debts, subscriptions, goals, isLoading } = useFinances();

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-3xl mx-auto space-y-6 animate-pulse">
          <div className="h-10 w-48 bg-muted rounded-xl" />
          <div className="h-12 bg-muted rounded-xl" />
          <div className="h-64 bg-muted rounded-2xl" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add Your Finances</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Build your complete financial profile for personalised coaching
          </p>
        </div>
        <AddFinancesClient
          income={income}
          expenses={expenses}
          debts={debts}
          subscriptions={subscriptions}
          goals={goals}
        />
      </div>
    </main>
  );
}
