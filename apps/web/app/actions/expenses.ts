"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const expenseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum([
    "housing", "council_tax", "utilities", "food_groceries", "transport",
    "broadband_mobile", "insurance", "childcare", "health", "eating_out",
    "entertainment", "clothing", "personal_care", "gym", "subscriptions", "other",
  ]),
  amount: z.coerce.number().positive("Amount must be positive"),
  frequency: z.enum(["weekly", "biweekly", "monthly", "annually", "one_off"]),
  due_day: z.coerce.number().min(1).max(31).optional().nullable(),
  is_essential: z.coerce.boolean().default(false),
  notes: z.string().optional().nullable(),
});

export type ActionResult = { error: string } | { success: true };

export async function addExpense(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorised" };

  const parsed = expenseSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    amount: formData.get("amount"),
    frequency: formData.get("frequency"),
    due_day: formData.get("due_day") || null,
    is_essential: formData.get("is_essential") === "true",
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { error } = await supabase.from("expenses").insert({
    user_id: user.id,
    ...parsed.data,
    is_active: true,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/budgets");
  revalidatePath("/add-finances");
  return { success: true };
}

export async function updateExpense(id: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorised" };

  const parsed = expenseSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    amount: formData.get("amount"),
    frequency: formData.get("frequency"),
    due_day: formData.get("due_day") || null,
    is_essential: formData.get("is_essential") === "true",
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { error } = await supabase
    .from("expenses")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/budgets");
  return { success: true };
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorised" };

  const { error } = await supabase
    .from("expenses")
    .update({ is_active: false })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/budgets");
  return { success: true };
}
