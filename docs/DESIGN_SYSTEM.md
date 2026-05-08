# INSYT. — Design System

> Material You × Apple × Linear. Teal primary. Manrope typeface. Glass surfaces.

---

## Typography

### Typeface
- **Primary**: `Manrope` (Google Fonts) — loaded via `next/font/google`
- **Fallback**: `system-ui, -apple-system, sans-serif`
- **Icon system**: Material Symbols Outlined (variable font, `wght` 200–700)

### Scale

| Token | Size | Weight | Usage |
|---|---|---|---|
| Display | 36–48px | 800 | Hero headings, onboarding |
| H1 | 28–32px | 800 | Page titles |
| H2 | 20–24px | 700 | Section headings |
| H3 | 16–18px | 600 | Card titles, subsections |
| Body | 14–15px | 400–500 | Main content |
| Small | 12–13px | 400 | Labels, captions, meta |
| Micro | 10–11px | 500 | Badges, tags |

### Brand Wordmark
- `INSYT` in `font-black` (900), `tracking-[0.08em]`
- Trailing `.` in `text-primary` colour
- Subtitle "Financial Intelligence" in `text-[11px] tracking-wide text-muted-foreground`

---

## Colour Palette

### Design Token System
INSYT. uses a Material You-inspired token system with full dark/light mode support. All colours are defined as RGB channel values so Tailwind opacity modifiers work correctly.

### Primary — Teal/Cyan

| Token | Light | Dark |
|---|---|---|
| `--primary` | `#006874` (teal) | `#46E4EE` (cyan) |
| `--on-primary` | White | Deep teal `#00373A` |
| `--primary-container` | `#00C8D2` | `#00C8D2` |
| `--on-primary-container` | `#001F23` | `#004F53` |

### Surfaces

| Token | Light | Dark |
|---|---|---|
| `--background` | `#F8FAFB` | `#0E1011` |
| `--surface` | `#FFFFFF` | `#121414` |
| `--surface-container-low` | `#EAF0F0` | `#161819` |
| `--surface-container` | `#E4E8E9` | `#1C1E1F` |
| `--surface-container-high` | `#D9DCDD` | `#282A2B` |

### Semantic Colours

| Intent | Token | Light value |
|---|---|---|
| Error/Danger | `--error` | `#BA1A1A` |
| Error bg | `--error-container` | `#FFDAD6` |
| Outline | `--border` | `--outline-variant` |
| Muted text | `--muted-foreground` | `#3F4849` (light) / `#B4C4C5` (dark) |

### Glow Accents (for dark mode emphasis)
```css
--glow-primary:  rgb(0 104 116 / 0.18)
--glow-emerald:  rgb(52 211 153 / 0.14)
--glow-amber:    rgb(251 191 36 / 0.14)
--glow-red:      rgb(248 113 113 / 0.14)
```

### Status Colours (contextual, not in token system)
- **Success / Positive**: `emerald-400` / `emerald-500`
- **Warning**: `amber-400` / `amber-500`
- **Danger / Negative**: `red-400` / `red-500`
- **Info / Neutral**: `sky-400` / `sky-500`

---

## Spacing System

INSYT. uses the standard Tailwind 4px base unit. Key spatial conventions:

| Context | Value |
|---|---|
| Page padding (mobile) | `px-4` (16px) |
| Page padding (desktop) | `px-6` to `px-8` (24–32px) |
| Section gap | `gap-4` to `gap-6` |
| Card internal padding | `p-5` to `p-6` |
| Sidebar width | `w-64` (256px) |
| Top bar height (mobile) | `h-14` (56px) |
| Form field gap | `space-y-4` |
| Button padding | `px-4 py-2.5` |

---

## Border Radius System

| Component | Radius |
|---|---|
| Cards, large containers | `rounded-2xl` (16px) |
| Buttons, inputs, badges | `rounded-xl` (12px) |
| Avatars, small icon containers | `rounded-xl` or `rounded-full` |
| Tooltips, small chips | `rounded-lg` (8px) |
| Sidebar brand icon | `rounded-xl` |
| Alert/toast | `rounded-2xl` |

**Rule**: Never use `rounded-md` or `rounded-sm` — always `rounded-lg` minimum. The product should feel soft and modern.

---

## Shadows

| Context | Shadow |
|---|---|
| Light mode cards | `shadow-sm` + custom soft shadow |
| Elevated modals | `shadow-xl` |
| Sidebar (mobile overlay) | `shadow-2xl` |
| Dark mode | Shadows rarely needed; use border + glassmorphism |

Light mode glass-card shadow:
```css
box-shadow: 0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04);
```

---

## Glassmorphism

Glassmorphism is used selectively for depth — not as a default surface treatment.

### Usage Rules
- **Dark mode**: Glass cards use `backdrop-blur-sm`, semi-transparent `bg-surface/60` gradient, `border border-outline-variant/30`
- **Light mode**: Glass cards use solid `rgba(255,255,255,0.88)` — never pure backdrop-blur on white (causes invisible content)
- **When to use**: Dashboard widgets, stat cards, sidebar
- **When NOT to use**: Forms, auth pages (use solid backgrounds), modals (too noisy)

### `.glass-card` class (from `globals.css`):
```css
/* Light */
background: rgba(255,255,255,0.88);
box-shadow: 0 2px 12px var(--glass-shadow), 0 0 0 1px var(--glass-border);
border-radius: 1rem;

/* Dark */
background: linear-gradient(135deg, rgb(var(--surface-container-low)/0.7), rgb(var(--surface)/0.5));
backdrop-filter: blur(12px);
border: 1px solid rgb(var(--outline-variant)/0.3);
```

---

## Layout Philosophy

### Grid Structure
- **Desktop**: Fixed 256px sidebar + fluid main content area
- **Mobile**: Full-width content, sidebar is an off-canvas drawer (CSS transform, 300ms)
- **Max content width**: `max-w-7xl mx-auto` for dashboard grids
- **Content columns**: Typically 12-col grid, cards span 4–6 cols

### Page Structure
```
[Sidebar 256px fixed] | [Main content area fluid]
                          ↳ [Top bar on mobile only: h-14]
                          ↳ [Page content: p-6, max-w-7xl]
```

### Responsive Breakpoints
- `sm`: 640px — single column becomes 2-col
- `lg`: 1024px — sidebar visible, mobile top bar hidden
- `xl`: 1280px — 3-col grid layouts unlock

---

## shadcn/ui Usage Conventions

INSYT. does **not** install the full shadcn component library. We use:
- The **design token conventions** (CSS variable names)
- Selective component adoption only when a native implementation would be significantly more complex

### When to use shadcn components
- Complex data tables
- Date pickers
- Dropdown menus with complex keyboard nav
- Dialog/modal with accessibility requirements

### When NOT to use shadcn
- Buttons (custom `.btn-primary` / `.btn-secondary` classes)
- Inputs (custom `.input-field` class)
- Cards (custom `.glass-card` class)
- Badges, alerts (custom implementations)

### shadcn token compatibility
`globals.css` maps INSYT. tokens to shadcn-compatible names (`--foreground`, `--card`, `--muted`, `--border`, `--ring`) so any shadcn component installed in the future will pick up the correct theme automatically.

---

## Dark / Light Mode Rules

- Mode is controlled via `.dark` class on `<html>` (set by `ThemeToggle` component)
- A flash-prevention inline script in `app/layout.tsx` reads `localStorage.theme` before hydration
- **Default**: System preference via `prefers-color-scheme`
- **Never** hardcode `text-white` or `text-black` — always use semantic tokens (`text-foreground`, `text-muted-foreground`)
- **Never** hardcode hex colours in Tailwind classes — use the mapped colour tokens
- Test every new component in both modes before shipping

---

## Visual Hierarchy

1. **Foreground text** (`text-foreground`) — primary content, high contrast
2. **Muted text** (`text-muted-foreground`) — labels, captions, secondary info
3. **Primary accent** (`text-primary`) — interactive elements, highlights
4. **Borders** (`border-border`) — structural dividers, card edges
5. **Background** (`bg-background`) — page canvas
6. **Surface** (`bg-surface`, `glass-card`) — elevated content containers

---

## Component Styling Principles

1. **Consistency over creativity** — use existing patterns before inventing new ones
2. **Interactive states are mandatory** — every clickable element needs hover, active, focus states
3. **Motion is semantic** — animations convey state changes, not just decoration
4. **Accessibility is non-negotiable** — ARIA labels, keyboard nav, focus rings on all interactive elements
5. **Icon + label** — never use icons alone without an accessible label
6. **Loading states** — every async action needs a loading indicator
7. **Empty states** — every list/data view needs a thoughtful empty state

---

## Key Utility Classes (Reference)

```css
.glass-card          /* Glassmorphic surface card */
.glass-card-solid    /* Solid surface card variant */
.input-field         /* Styled form input */
.btn-primary         /* Primary CTA button */
.btn-secondary       /* Secondary/outline button */
.inner-glow-btn      /* Button with inner glow effect */
```
