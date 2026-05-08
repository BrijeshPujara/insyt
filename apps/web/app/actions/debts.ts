"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const debtSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum([
    "credit_card", "personal_loan", "student_loan", "mortgage",
    "car_finance", "overdraft", "buy_now_pay_later", "other",
  ]),
  balance: z.coerce.number().min(0, "Balance must be 0 or more"),
  interest_rate: z.coerce.number().min(0).max(100),
  minimum_payment: z.coerce.number().min(0),
  due_day: z.coerce.number().min(1).max(31).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type ActionResult = { error: string } | { success: true };

export async function addDebt(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorised" };

  const parsed = debtSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    balance: formData.get("balance"),
    interest_rate: formData.get("interest_rate"),
    minimum_payment: formData.get("minimum_payment"),
    due_day: formData.get("due_day") || null,
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { error } = await supabase.from("debts").insert({
    user_id: user.id,
    ...parsed.data,
    is_active: true,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/debt");
  revalidatePath("/add-finances");
  return { success: true };
}

export async function updateDebt(id: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorised" };

  const parsed = debtSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    balance: formData.get("balance"),
    interest_rate: formData.get("interest_rate"),
    minimum_payment: formData.get("minimum_payment"),
    due_day: formData.get("due_day") || null,
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { error } = await supabase
    .from("debts")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/debt");
  return { success: true };
}

export async function deleteDebt(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorised" };

  const { error } = await supabase
    .from("debts")
    .update({ is_active: false })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/debt");
  return { success: true };
}
