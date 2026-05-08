import { createClient } from "@/lib/supabase/server";
import { anthropic, buildSystemPrompt } from "@/lib/anthropic";
import { computeFinancialSummary } from "@/lib/utils";
import { NextResponse } from "next/server";
import type { Income, Expense, Debt, Subscription, SavingsGoal, ChatAPIMessage } from "@/lib/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const body = await request.json().catch(() => ({}));
  const { messages, financialData }: {
    messages: ChatAPIMessage[];
    financialData?: { income: Income[]; expenses: Expense[]; debts: Debt[]; subscriptions: Subscription[]; goals: SavingsGoal[] };
  } = body;

  if (!messages?.length) return NextResponse.json({ error: "No messages" }, { status: 400 });

  let income: Income[], expenses: Expense[], debts: Debt[];
  let subscriptions: Subscription[], goals: SavingsGoal[];
  let userName: string | undefined;

  if (user) {
    const [iRes, eRes, dRes, sRes, gRes, pRes] = await Promise.all([
      supabase.from("income").select("*").eq("user_id", user.id).eq("is_active", true),
      supabase.from("expenses").select("*").eq("user_id", user.id).eq("is_active", true),
      supabase.from("debts").select("*").eq("user_id", user.id).eq("is_active", true),
      supabase.from("subscriptions").select("*").eq("user_id", user.id).eq("is_active", true),
      supabase.from("savings_goals").select("*").eq("user_id", user.id).eq("is_active", true),
      supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    ]);
    income = (iRes.data ?? []) as Income[];
    expenses = (eRes.data ?? []) as Expense[];
    debts = (dRes.data ?? []) as Debt[];
    subscriptions = (sRes.data ?? []) as Subscription[];
    goals = (gRes.data ?? []) as SavingsGoal[];
    userName = (pRes.data as { full_name: string | null } | null)?.full_name ?? undefined;
  } else {
    income = financialData?.income ?? [];
    expenses = financialData?.expenses ?? [];
    debts = financialData?.debts ?? [];
    subscriptions = financialData?.subscriptions ?? [];
    goals = financialData?.goals ?? [];
  }

  const summary = computeFinancialSummary(income, expenses, debts, subscriptions, goals);
  const systemPrompt = buildSystemPrompt({ summary, income, expenses, debts, subscriptions, goals, userName });

  const userMessage = messages[messages.length - 1];

  // Only persist messages for authenticated users
  if (user) {
    await supabase.from("chat_messages").insert({
      user_id: user.id,
      role: "user",
      content: userMessage.content,
    });
  }

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const encoder = new TextEncoder();
  let fullResponse = "";

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
          const text = chunk.delta.text;
          fullResponse += text;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        }
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();

      if (user) {
        await supabase.from("chat_messages").insert({
          user_id: user.id,
          role: "assistant",
          content: fullResponse,
        });
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
