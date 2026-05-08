"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const subscriptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  frequency: z.enum(["weekly", "monthly", "annually"]),
  category: z.string().optional().nullable(),
  next_billing_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type ActionResult = { error: string } | { success: true };

export async function addSubscription(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorised" };

  const parsed = subscriptionSchema.safeParse({
    name: formData.get("name"),
    amount: formData.get("amount"),
    frequency: formData.get("frequency"),
    category: formData.get("category") || null,
    next_billing_date: formData.get("next_billing_date") || null,
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { error } = await supabase.from("subscriptions").insert({
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

export async function deleteSubscription(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorised" };

  const { error } = await supabase
    .from("subscriptions")
    .update({ is_active: false })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/budgets");
  return { success: true };
}
