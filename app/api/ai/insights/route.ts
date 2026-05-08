import { createClient } from "@/lib/supabase/server";
import { anthropic, buildInsightsPrompt } from "@/lib/anthropic";
import { computeFinancialSummary } from "@/lib/utils";
import { NextResponse } from "next/server";
import { createHash } from "crypto";
import type {
  Income,
  Expense,
  Debt,
  Subscription,
  SavingsGoal,
  AIInsight,
} from "@/lib/types";

// Cache TTL: re-generate insights only after this many hours (or when data changes)
const CACHE_TTL_HOURS = 24;

/**
 * Compute a short deterministic fingerprint from the user's current financial data.
 * If any amount, count, or balance changes, the hash changes → cache miss → new insights.
 */
function computeDataHash(
  income: Income[],
  expenses: Expense[],
  debts: Debt[],
  subscriptions: Subscription[],
  goals: SavingsGoal[],
): string {
  const fingerprint = JSON.stringify({
    income: income
      .map((i) => ({ a: i.amount, f: i.frequency, s: i.source }))
      .sort((a, b) => a.s.localeCompare(b.s)),
    expenses: expenses
      .map((e) => ({ a: e.amount, f: e.frequency, n: e.name }))
      .sort((a, b) => a.n.localeCompare(b.n)),
    debts: debts.map((d) => ({
      b: d.balance,
      r: d.interest_rate,
      m: d.minimum_payment,
    })),
    subs: subscriptions
      .map((s) => ({ a: s.amount, n: s.name }))
      .sort((a, b) => a.n.localeCompare(b.n)),
    goals: goals.map((g) => ({ c: g.current_amount, t: g.target_amount })),
  });
  return createHash("sha256").update(fingerprint).digest("hex").slice(0, 16);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const body = await request.json().catch(() => ({}));
  // Allow the client to force a fresh generation (e.g., after data changes)
  const forceRefresh = body.force === true;

  let income: Income[], expenses: Expense[], debts: Debt[];
  let subscriptions: Subscription[], goals: SavingsGoal[];
  let userName: string | undefined;

  if (user) {
    const [iRes, eRes, dRes, sRes, gRes, pRes] = await Promise.all([
      supabase
        .from("income")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true),
      supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true),
      supabase
        .from("debts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true),
      supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true),
      supabase
        .from("savings_goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true),
      supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    ]);
    income = (iRes.data ?? []) as Income[];
    expenses = (eRes.data ?? []) as Expense[];
    debts = (dRes.data ?? []) as Debt[];
    subscriptions = (sRes.data ?? []) as Subscription[];
    goals = (gRes.data ?? []) as SavingsGoal[];
    userName =
      (pRes.data as { full_name: string | null } | null)?.full_name ??
      undefined;
  } else {
    // Guest: financial data passed in request body
    income = body.income ?? [];
    expenses = body.expenses ?? [];
    debts = body.debts ?? [];
    subscriptions = body.subscriptions ?? [];
    goals = body.goals ?? [];
  }

  const summary = computeFinancialSummary(
    income,
    expenses,
    debts,
    subscriptions,
    goals,
  );
  const dataHash = computeDataHash(
    income,
    expenses,
    debts,
    subscriptions,
    goals,
  );

  // ── Cache lookup (authenticated users only) ──────────────────────────────────
  if (user && !forceRefresh) {
    const cutoff = new Date(
      Date.now() - CACHE_TTL_HOURS * 60 * 60 * 1000,
    ).toISOString();

    const { data: cached } = await supabase
      .from("ai_insights")
      .select("*")
      .eq("user_id", user.id)
      .eq("data_hash", dataHash)
      .gte("generated_at", cutoff)
      .order("generated_at", { ascending: false })
      .limit(4);

    if (cached && cached.length > 0) {
      return NextResponse.json({ insights: cached, cached: true });
    }
  }

  // ── Cache miss → call Claude ─────────────────────────────────────────────────
  const prompt = buildInsightsPrompt({
    summary,
    income,
    expenses,
    debts,
    subscriptions,
    goals,
    userName,
  });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "[]";

  let rawInsights: {
    type: string;
    title: string;
    body: string;
    impact: string;
    icon: string;
  }[];
  try {
    rawInsights = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response" },
      { status: 500 },
    );
  }

  const now = new Date().toISOString();

  // For authenticated users, replace old insights and persist new ones with the hash
  if (user) {
    await supabase.from("ai_insights").delete().eq("user_id", user.id);
    await supabase.from("ai_insights").insert(
      rawInsights.map((ins) => ({
        user_id: user.id,
        type: ins.type,
        title: ins.title,
        body: ins.body,
        impact: ins.impact,
        icon: ins.icon,
        is_read: false,
        data_hash: dataHash,
      })),
    );
  }

  const insights: AIInsight[] = rawInsights.map((ins, i) => ({
    id: `insight-${Date.now()}-${i}`,
    user_id: user?.id ?? "guest",
    type: ins.type as AIInsight["type"],
    title: ins.title,
    body: ins.body,
    impact: ins.impact as AIInsight["impact"],
    icon: ins.icon,
    is_read: false,
    generated_at: now,
  }));

  return NextResponse.json({ insights, cached: false });
}
