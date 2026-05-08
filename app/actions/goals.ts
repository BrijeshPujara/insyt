"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const goalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  target_amount: z.coerce.number().positive("Target must be positive"),
  current_amount: z.coerce.number().min(0).default(0),
  target_date: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  priority: z.coerce.number().min(1).max(10).default(5),
  notes: z.string().optional().nullable(),
});

const depositSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
});

export type ActionResult = { error: string } | { success: true };

export async function addGoal(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorised" };

  const parsed = goalSchema.safeParse({
    name: formData.get("name"),
    target_amount: formData.get("target_amount"),
    current_amount: formData.get("current_amount") || 0,
    target_date: formData.get("target_date") || null,
    category: formData.get("category") || null,
    priority: formData.get("priority") || 5,
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { error } = await supabase.from("savings_goals").insert({
    user_id: user.id,
    ...parsed.data,
    is_active: true,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/add-finances");
  return { success: true };
}

export async function depositToGoal(id: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorised" };

  const parsed = depositSchema.safeParse({ amount: formData.get("amount") });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { data: goal, error: fetchError } = await supabase
    .from("savings_goals")
    .select("current_amount, target_amount")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !goal) return { error: "Goal not found" };

  const newAmount = Math.min(goal.current_amount + parsed.data.amount, goal.target_amount);

  const { error } = await supabase
    .from("savings_goals")
    .update({ current_amount: newAmount })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteGoal(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorised" };

  const { error } = await supabase
    .from("savings_goals")
    .update({ is_active: false })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { success: true };
}
