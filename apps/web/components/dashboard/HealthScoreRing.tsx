"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import type { FinancialSummary } from "@/lib/types";

interface Props {
  score: number;
  label: FinancialSummary["healthLabel"];
}

const RADIUS = 58;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const scoreConfig = {
  Excellent:      { color: "#34d399", glow: "rgba(52,211,153,0.35)",  bg: "bg-emerald-400/10", text: "text-emerald-400" },
  Good:           { color: "#46e4ee", glow: "rgba(70,228,238,0.3)",   bg: "bg-primary/10",     text: "text-primary"    },
  Fair:           { color: "#fbbf24", glow: "rgba(251,191,36,0.3)",   bg: "bg-amber-400/10",   text: "text-amber-400"  },
  "Needs Attention": { color: "#f87171", glow: "rgba(248,113,113,0.3)", bg: "bg-red-400/10", text: "text-red-400"     },
} as const;

export function HealthScoreRing({ score, label }: Props) {
  const [dashOffset, setDashOffset] = useState(CIRCUMFERENCE);
  const motionScore = useMotionValue(0);
  const displayScore = useTransform(motionScore, (v) => Math.round(v).toString());
  const prevScore = useRef(0);

  const cfg = scoreConfig[label] ?? scoreConfig["Good"];

  useEffect(() => {
    // Animate the SVG ring
    const timeout = setTimeout(() => {
      setDashOffset(CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE);
    }, 120);

    // Animate the number counter
    prevScore.current = score;
    const controls = animate(motionScore, score, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      delay: 0.1,
    });

    return () => {
      clearTimeout(timeout);
      controls.stop();
    };
  }, [score, motionScore]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-40 h-40">
        {/* Ambient glow behind ring */}
        <motion.div
          className="absolute inset-4 rounded-full"
          style={{ background: cfg.glow, filter: "blur(16px)" }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
        />

        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          {/* Track ring */}
          <circle
            cx="80" cy="80" r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-muted"
          />
          {/* Glow ring (blurred duplicate) */}
          <circle
            cx="80" cy="80" r={RADIUS}
            fill="none"
            stroke={cfg.color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{
              transition: "stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)",
              filter: "blur(6px)",
              opacity: 0.5,
            }}
          />
          {/* Main ring */}
          <circle
            cx="80" cy="80" r={RADIUS}
            fill="none"
            stroke={cfg.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)" }}
          />
        </svg>

        {/* Score display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-baseline gap-0.5">
            <motion.span className="text-3xl font-bold text-foreground tabular-nums no-transition">
              {displayScore}
            </motion.span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">Financial Health</p>
        <motion.p
          className={`text-xs font-medium mt-0.5 ${cfg.text}`}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {label}
        </motion.p>
      </div>
    </div>
  );
}
