"use client";

import { useState, useRef, useEffect } from "react";
import { useFinances } from "@/lib/store/finance-store";
import type { ChatAPIMessage } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

const STARTERS = [
  { text: "How can I reduce my monthly outgoings?", icon: "trending_down" },
  { text: "What's the best way to tackle my debt?",  icon: "credit_card" },
  { text: "Am I saving enough for retirement?",       icon: "savings"     },
  { text: "How do I improve my health score?",        icon: "favorite"    },
];

const CHIPS = [
  "Reduce outgoings",
  "Tackle debt",
  "Health score",
  "Savings tips",
];

function CoachOrbMini({ thinking = false }: { thinking?: boolean }) {
  return (
    <div className="relative w-9 h-9 shrink-0">
      {/* Spinning conic gradient ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "conic-gradient(from 0deg, #22d3ee 0%, #14b8a6 40%, #34d399 70%, #22d3ee 100%)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: thinking ? 1.2 : 2.4, repeat: Infinity, ease: "linear" }}
      />
      {/* Inner fill */}
      <div
        className="absolute inset-[2px] rounded-full flex items-center justify-center"
        style={{ background: "radial-gradient(circle at 38% 32%, rgb(34 211 238 / 0.22), rgb(var(--surface-container)))" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {thinking ? (
            <motion.div
              key="dots"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-0.5"
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1 h-1 rounded-full bg-primary"
                  animate={{ y: [0, -3, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                />
              ))}
            </motion.div>
          ) : (
            <motion.span
              key="I"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-black text-[13px] text-primary leading-none"
            >
              I
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CoachOrbFAB({ open }: { open: boolean }) {
  return (
    <div className="relative w-14 h-14">
      {/* Spinning ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "conic-gradient(from 0deg, #22d3ee 0%, #14b8a6 40%, #34d399 70%, transparent 100%)",
          filter: "blur(3px)",
          inset: "-4px",
        }}
        animate={{ rotate: open ? -360 : 360 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
      />
      {/* Core */}
      <div
        className="absolute inset-0 rounded-full flex items-center justify-center"
        style={{ background: "radial-gradient(circle at 38% 32%, rgb(34 211 238 / 0.4), rgb(var(--primary)))" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "chat"}
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0,   scale: 1   }}
            exit={{   opacity: 0, rotate:  90,  scale: 0.6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="material-symbols-outlined text-[22px] text-primary-foreground"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {open ? "close" : "chat"}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function ChatWidget() {
  const { income, expenses, debts, subscriptions, goals, isGuest } = useFinances();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  }, [input]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const assistantMsg: Message = { role: "assistant", content: "", streaming: true };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const apiMessages: ChatAPIMessage[] = newMessages.map((m) => ({
        role: m.role, content: m.content,
      }));

      const body: Record<string, unknown> = { messages: apiMessages };
      if (isGuest) {
        body.financialData = { income, expenses, debts, subscriptions, goals };
      }

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Chat failed");

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const { text } = JSON.parse(data);
              accumulated += text;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: accumulated, streaming: true };
                return updated;
              });
            } catch {}
          }
        }
      }

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: accumulated };
        return updated;
      });
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, I couldn't process that. Please try again.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const isThinking = loading && messages[messages.length - 1]?.streaming && !messages[messages.length - 1]?.content;

  return (
    <>
      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-40">
        <AnimatePresence>
          {!open && (
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/20"
              animate={{ scale: [1, 1.55, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setOpen((v) => !v)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          className="relative w-14 h-14 rounded-full overflow-visible flex items-center justify-center"
          style={{ filter: "drop-shadow(0 4px 20px rgb(34 211 238 / 0.3))" }}
          title="Open INSYT AI"
        >
          <CoachOrbFAB open={open} />
        </motion.button>
      </div>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.93, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0,   scale: 1,    filter: "blur(0px)" }}
            exit={{   opacity: 0, y: 16,   scale: 0.95, filter: "blur(2px)" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-6 w-96 max-h-[600px] flex flex-col glass-card-solid rounded-2xl shadow-2xl z-40 overflow-hidden"
            style={{ maxWidth: "calc(100vw - 32px)" }}
          >
            {/* Header */}
            <div className="relative flex items-center gap-3 p-4 border-b border-border overflow-hidden">
              <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--ai-grad-soft)" }} />

              <CoachOrbMini thinking={isThinking} />

              <div className="flex-1 relative z-10">
                <p className="text-sm font-semibold text-foreground">
                  INSYT<span className="text-primary">.</span> AI
                </p>
                <div className="flex items-center gap-1.5">
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    {isThinking ? "Thinking…" : "Powered by Claude"}
                  </p>
                </div>
              </div>

              <motion.button
                onClick={() => setOpen(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative z-10 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </motion.button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar min-h-0">
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-4"
                >
                  <div className="text-center pt-2 pb-1">
                    <p className="text-sm font-semibold text-foreground mb-1">
                      Hi! I&apos;m INSYT<span className="text-primary">.</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ask me anything about your finances.
                    </p>
                  </div>
                  <div className="space-y-2">
                    {STARTERS.map((s, i) => (
                      <motion.button
                        key={s.text}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.07, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => sendMessage(s.text)}
                        className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/60 hover:bg-muted text-sm text-foreground transition-colors"
                      >
                        <span className="material-symbols-outlined text-primary text-[16px] shrink-0">
                          {s.icon}
                        </span>
                        <span className="leading-snug">{s.text}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0,  scale: 1    }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="shrink-0 mt-1 mr-2">
                        <CoachOrbMini thinking={!!msg.streaming && !msg.content} />
                      </div>
                    )}
                    <div
                      className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "rounded-bl-sm border border-border/60"
                      }`}
                      style={msg.role === "assistant" ? {
                        background: "linear-gradient(135deg, rgb(var(--surface-container-high) / 0.9), rgb(var(--surface-container) / 0.7))",
                        backdropFilter: "blur(8px)",
                      } : undefined}
                    >
                      {msg.content || (msg.streaming && !msg.content ? (
                        <div className="flex items-center gap-1 py-0.5">
                          {[0, 1, 2].map((i) => (
                            <motion.span
                              key={i}
                              className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60"
                              animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                            />
                          ))}
                        </div>
                      ) : null)}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            {/* Suggestion chips */}
            {messages.length === 0 && (
              <div className="px-3 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                {CHIPS.map((chip, i) => (
                  <motion.button
                    key={chip}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.06, duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => sendMessage(chip)}
                    className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border border-primary/25 text-primary bg-primary/6 hover:bg-primary/14 transition-colors whitespace-nowrap"
                  >
                    {chip}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Input area */}
            <div className="p-3 border-t border-border">
              <div className="flex items-end gap-2 bg-muted/50 rounded-xl p-1.5 border border-border/50 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask INSYT."
                  rows={1}
                  disabled={loading}
                  className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none disabled:opacity-50 no-scrollbar"
                  style={{ maxHeight: "96px" }}
                />
                <motion.button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ boxShadow: "0 2px 8px var(--glow-primary)" }}
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
