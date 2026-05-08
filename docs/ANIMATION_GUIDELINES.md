# INSYT. — Animation Guidelines

> Motion should feel like the product is breathing — not performing.

Inspired by: Linear, Raycast, Apple. Smooth. Intelligent. Restrained.

---

## Philosophy

Animation in INSYT. serves a single purpose: **making the interface feel more alive and trustworthy**, not more impressive. Every animation should have a reason. If removing it doesn't make the product worse, it shouldn't be there.

### Core Principles

1. **Purposeful** — Animation communicates state changes, hierarchy, and transitions. Never decorative-only.
2. **Subtle** — Amplitude is small. Users should feel the motion, not watch it.
3. **Fast** — Transitions complete before they become annoying. Most < 300ms.
4. **Consistent** — The same type of action uses the same type of motion everywhere.
5. **Accessible** — All motion respects `prefers-reduced-motion`.

---

## Easing Functions

### Primary Easing

```ts
// Used for most entrance/exit animations — mimics Apple's spring feel
ease: [0.22, 1, 0.36, 1]; // Custom cubic-bezier "expressive"
```

### Spring (for interactive feedback)

```ts
type: "spring", stiffness: 400, damping: 25   // Snappy, feels physical
type: "spring", stiffness: 300, damping: 30   // Slightly softer
```

### Linear (for continuous animations only)

```ts
ease: "linear"; // Progress bars, spinners — never for transitions
```

### Standard

```ts
ease: "easeOut"; // Simple fade-ins
ease: "easeInOut"; // Page-level transitions
```

---

## Timing Reference

| Animation type          | Duration          | Notes                              |
| ----------------------- | ----------------- | ---------------------------------- |
| Page transition (exit)  | 140ms             | Fast — user shouldn't wait         |
| Page transition (enter) | 220ms             | Slightly slower, feels intentional |
| Element fade-in         | 200–350ms         | Longer for important elements      |
| Stagger child delay     | 60–80ms           | Between list items                 |
| Hover state             | 150–200ms         | Instant feel                       |
| Alert appear            | 300ms             | Slide + fade                       |
| Alert dismiss           | 200ms             | Collapse height                    |
| Toast enter             | 300ms             | Slide from right                   |
| Toast exit              | 200ms             | Fade out                           |
| Sidebar slide (mobile)  | 300ms             | CSS transition, not Framer         |
| Spinner                 | Infinite, 1s loop | Linear ease                        |
| Number count-up         | 800–1200ms        | EaseOut                            |
| Health ring draw        | 1200ms            | Spring                             |

---

## Page Transitions

All page transitions are handled by `components/layout/PageTransition.tsx`, which wraps route content with `AnimatePresence mode="wait"` keyed on `usePathname()`.

```tsx
// Entrance
initial:  { opacity: 0, y: 8 }
animate:  { opacity: 1, y: 0 }
transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] }

// Exit
exit:     { opacity: 0, y: -4 }
transition: { duration: 0.14, ease: "easeIn" }
```

**Rules:**

- Y-axis displacement is always small (4–12px). Never large slide effects.
- Exit is always faster than entrance.
- Never animate X-axis on page transitions (too distracting).

---

## Stagger Patterns

Used for lists, grids, and dashboard sections that reveal progressively.

```tsx
// Parent container
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

// Each child
const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};
```

**Usage**: `<motion.div variants={container} initial="hidden" animate="show">` with `<motion.div variants={item}>` children.

---

## Hover Behaviours

### Cards / Clickable surfaces

```tsx
whileHover={{ y: -2, boxShadow: "..." }}
transition={{ duration: 0.2 }}
```

### Icon buttons / small interactive elements

```tsx
whileHover={{ scale: 1.08 }}
whileTap={{ scale: 0.94 }}
transition={{ type: "spring", stiffness: 400, damping: 20 }}
```

### Brand logo icon

```tsx
whileHover={{ scale: 1.08 }}
transition={{ type: "spring", stiffness: 400, damping: 20 }}
```

### Sidebar nav items

- CSS transitions only (`transition-all duration-150`)
- No Framer Motion — keep sidebar rendering performant

### Buttons (primary/secondary)

- CSS `active:scale-[0.98]` — defined in `.btn-primary` / `.btn-secondary` classes
- No Framer `whileTap` needed for standard buttons

---

## Microinteractions

### Form Input Focus

- CSS `focus:ring-2 focus:ring-primary/30 focus:border-primary`
- No Framer Motion needed

### Error Messages (form validation)

```tsx
// Slide down + fade in
initial: { opacity: 0, height: 0, y: -4 }
animate: { opacity: 1, height: "auto", y: 0 }
exit:    { opacity: 0, height: 0 }
transition: { duration: 0.2 }
```

### Alert Dismiss (SmartAlerts)

```tsx
exit: { opacity: 0, height: 0, marginBottom: 0 }
transition: { duration: 0.25, ease: "easeInOut" }
```

### Toast notifications

```tsx
// Enter from right
initial: { opacity: 0, x: 60, scale: 0.95 }
animate: { opacity: 1, x: 0, scale: 1 }
exit:    { opacity: 0, x: 60, scale: 0.95 }
transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
```

### Health Score Ring

- SVG `strokeDashoffset` animated on mount
- Duration 1.2s, spring easing

### Number counters (financial values)

- Animate from 0 to actual value on first mount
- Duration 800–1000ms, easeOut

---

## Loading States

### Spinner (inline)

```tsx
<span className="w-4 h-4 rounded-full border-2 border-border border-t-foreground animate-spin" />
```

### Skeleton screens

- Use `animate-pulse` for skeleton loading states
- Match the exact shape/size of the content they replace
- Background: `bg-muted`

### Page-level loading

- `PageTransition` handles this via route-level animation
- Avoid full-page spinners — they feel slow

---

## `AnimatePresence` Rules

- Always wrap conditional renders with `<AnimatePresence>`
- Use `mode="wait"` for page transitions (one exits before next enters)
- Use `mode="popLayout"` for list additions/removals
- Provide a stable `key` prop on direct children of `AnimatePresence`
- Never put `AnimatePresence` inside a component that re-renders frequently without memoization

---

## Motion Accessibility

Every animation must respect `prefers-reduced-motion`. Use the Framer Motion `useReducedMotion` hook for complex cases, or the CSS media query for simpler ones.

```tsx
import { useReducedMotion } from "framer-motion";

function MyComponent() {
  const prefersReduced = useReducedMotion();
  const anim = prefersReduced ? {} : { y: 8, opacity: 0 };
  // ...
}
```

For CSS animations (sidebar, spinners):

```css
@media (prefers-reduced-motion: reduce) {
  .animate-spin {
    animation: none;
  }
  * {
    transition-duration: 0.01ms !important;
  }
}
```

---

## Performance Considerations

1. **GPU-only properties**: Only animate `opacity`, `transform` (scale, translate, rotate). Never animate `width`, `height`, `top`, `left`, `margin`, or `padding` directly (causes layout recalculation).
2. **Height animation exception**: Animating `height: "auto"` via Framer Motion is acceptable for collapse/expand interactions but must use `layout` prop carefully.
3. **Sidebar performance**: The main sidebar uses CSS transitions, not Framer Motion, to avoid re-renders on every navigation.
4. **Large lists**: Do not wrap every list item in a `motion.div` for lists > 50 items. Animate the container instead.
5. **Lazy animation**: For off-screen components, use `whileInView` with `viewport={{ once: true }}` instead of `animate`.

---

## Anti-Patterns — Never Do These

- ❌ Bouncy/elastic animations on data visualisations
- ❌ Duration > 600ms for any interactive feedback
- ❌ Animating things the user didn't trigger
- ❌ Multiple simultaneous full-page animations
- ❌ Scale animations > 1.15 or < 0.85
- ❌ Y-axis displacement > 24px on entrance animations
- ❌ `animate-bounce` on anything financial or serious
- ❌ Rotation effects on non-icon elements
- ❌ `framer-motion` layout animations on the sidebar (perf)
- ❌ Forgetting `AnimatePresence` wrapper for conditional renders
