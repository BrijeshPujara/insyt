"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Frequency } from "@/lib/types";

const incomeSchema = z.object({
  source: z.string().min(1, "Source is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  frequency: z.enum(["weekly", "biweekly", "monthly", "annually"] as [Frequency, ...Frequency[]]),
  pay_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type ActionResult = { error: string } | { success: true };

export async function addIncome(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorised" };

  const parsed = incomeSchema.safeParse({
    source: formData.get("source"),
    amount: formData.get("amount"),
    frequency: formData.get("frequency"),
    pay_date: formData.get("pay_date") || null,
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { error } = await supabase.from("income").insert({
    user_id: user.id,
    ...parsed.data,
    is_active: true,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/add-finances");
  return { success: true };
}

export async function updateIncome(id: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorised" };

  const parsed = incomeSchema.safeParse({
    source: formData.get("source"),
    amount: formData.get("amount"),
    frequency: formData.get("frequency"),
    pay_date: formData.get("pay_date") || null,
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { error } = await supabase
    .from("income")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/add-finances");
  return { success: true };
}

export async function deleteIncome(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorised" };

  const { error } = await supabase
    .from("income")
    .update({ is_active: false })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/add-finances");
  return { success: true };
}
