// INSYT. — shared motion system
// Inspired by Linear, Raycast, Apple: fluid, intentional, premium

import type { Transition, Variants } from "framer-motion";

// ── Spring configurations ─────────────────────────────────────────────────────

export const spring = {
  gentle: { type: "spring", stiffness: 200, damping: 30, mass: 0.8 }  as Transition,
  snappy: { type: "spring", stiffness: 380, damping: 32, mass: 0.7 }  as Transition,
  premium:{ type: "spring", stiffness: 280, damping: 28, mass: 0.9 }  as Transition,
  slow:   { type: "spring", stiffness: 120, damping: 22, mass: 1.1 }  as Transition,
  micro:  { type: "spring", stiffness: 520, damping: 38, mass: 0.5 }  as Transition,
  nav:    { type: "spring", stiffness: 400, damping: 38, mass: 0.7 }  as Transition,
} as const;

// ── Easing curves ─────────────────────────────────────────────────────────────

export const ease = {
  premium:    [0.22, 1, 0.36, 1]         as [number,number,number,number],
  smooth:     [0.4, 0, 0.2, 1]           as [number,number,number,number],
  snappy:     [0.25, 0.46, 0.45, 0.94]   as [number,number,number,number],
  decelerate: [0.0, 0.0, 0.2, 1]         as [number,number,number,number],
} as const;

// ── Duration tokens ───────────────────────────────────────────────────────────

export const dur = {
  instant: 0.08,
  fast:    0.16,
  normal:  0.24,
  slow:    0.38,
  gentle:  0.55,
} as const;

// ── Shared variants ───────────────────────────────────────────────────────────

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0,  transition: { duration: dur.slow,  ease: ease.premium } },
  exit:   { opacity: 0, y: -8, transition: { duration: dur.fast,  ease: ease.smooth  } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1,   transition: { duration: dur.normal, ease: ease.smooth  } },
  exit:   { opacity: 0,   transition: { duration: dur.fast                        } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.93 },
  show:   { opacity: 1, scale: 1,    transition: { duration: dur.normal, ease: ease.premium } },
  exit:   { opacity: 0, scale: 0.97, transition: { duration: dur.fast                       } },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  show:   { opacity: 1, x: 0,   transition: { duration: dur.slow, ease: ease.premium } },
  exit:   { opacity: 0, x: -10, transition: { duration: dur.fast                     } },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  show:   { opacity: 1, x: 0,  transition: { duration: dur.slow, ease: ease.premium } },
  exit:   { opacity: 0, x: 10, transition: { duration: dur.fast                     } },
};

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -12, scaleY: 0.96 },
  show:   { opacity: 1, y: 0,   scaleY: 1,    transition: { duration: dur.normal, ease: ease.premium } },
  exit:   { opacity: 0, y: -8,  scaleY: 0.98, transition: { duration: dur.fast,   ease: ease.smooth  } },
};

// ── Stagger containers ────────────────────────────────────────────────────────

export const stagger = (delay = 0.07, children = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: delay, delayChildren: children } },
});

// ── Page transitions ──────────────────────────────────────────────────────────

export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(2px)" },
  show:   { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: dur.slow,   ease: ease.premium } },
  exit:   { opacity: 0, y: -6, filter: "blur(1px)", transition: { duration: dur.fast,   ease: ease.smooth  } },
};

// ── Card interactions ─────────────────────────────────────────────────────────

export const cardHover = {
  rest:  { y: 0,  scale: 1    },
  hover: { y: -3, scale: 1.005, transition: { duration: dur.fast, ease: ease.smooth } },
  tap:   { y: 0,  scale: 0.98,  transition: { duration: dur.instant                 } },
};

// ── List item ─────────────────────────────────────────────────────────────────

export const listItem: Variants = {
  hidden: { opacity: 0, x: -14 },
  show:   { opacity: 1, x: 0,   transition: { duration: dur.slow,  ease: ease.premium } },
};
