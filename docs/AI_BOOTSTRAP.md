# INSYT. — AI Bootstrap System

> How future Claude sessions should initialise, orient, and work effectively on this codebase.

---

## Purpose

This file eliminates the most common source of wasted context in AI-assisted development: **codebase rediscovery**. Every new Claude session that reads this file first can immediately operate at senior-engineer level on the INSYT. codebase.

---

## Session Initialisation Protocol

### Step 1: Load This File First
Any Claude session working on INSYT. should begin by reading `docs/AI_BOOTSTRAP.md` (this file). It tells you which other docs to load based on the task type.

### Step 2: Identify Task Type
Use the task matrix below to determine which docs and agents to load.

### Step 3: Load Relevant Docs + Agent
Load only the docs relevant to your task — not all docs. Fewer, more targeted docs = better-quality responses.

### Step 4: Check Live Code State
Before making changes, read the relevant source files. The docs describe the *intended* state; the source files reveal the *actual* state.

---

## Task → Doc + Agent Matrix

| Task type | Docs to load | Agent to use |
|---|---|---|
| UI/visual changes, new components | `DESIGN_SYSTEM.md`, `ANIMATION_GUIDELINES.md` | `ui-ux-agent.md` |
| New features, user flows, empty states | `UX_PRINCIPLES.md`, `PRODUCT.md` | `product-agent.md` + `ui-ux-agent.md` |
| React components, shadcn, responsiveness | `DESIGN_SYSTEM.md`, `ARCHITECTURE.md` | `frontend-agent.md` |
| Supabase, auth, database, APIs | `ARCHITECTURE.md` | `backend-agent.md` |
| Financial calculations, AI coach, insights | `FINANCE_LOGIC.md` | `finance-agent.md` |
| Folder structure, patterns, refactoring | `ARCHITECTURE.md` | `architecture-agent.md` |
| Branding, copy, tone, naming | `BRAND_GUIDELINES.md` | `product-agent.md` |
| Animations, motion, interactions | `ANIMATION_GUIDELINES.md` | `ui-ux-agent.md` |
| Full feature (end-to-end) | All relevant docs | Multiple agents (see collaboration rules) |

---

## Quick Context Snapshot

Use this to orient a new session instantly without reading all docs:

```
INSYT. — AI-powered personal finance coaching app
Stack: Next.js 15 App Router · TypeScript · Tailwind · Framer Motion · Supabase · Anthropic Claude
Brand: Teal primary (#006874 light / #46E4EE dark) · Manrope font · Material Symbols icons
Design: Glass cards · dark/light mode via .dark class · premium/calm/intelligent aesthetic
Auth: Email/password + Google OAuth · Supabase · /api/auth/callback handles both
State: FinanceStore Context (lib/store/finance-store.tsx) · Guest mode (localStorage) → Supabase migration
AI: claude-sonnet-4-6 · /api/ai/chat (streaming) · /api/ai/insights (structured JSON)
Repo root: lumina-finance/ (the folder is named lumina but brand is INSYT.)
Key paths:
  - app/(main)/ → authenticated pages
  - app/(auth)/ → login/signup
  - app/actions/ → Server Actions
  - components/layout/ → Sidebar, BottomNav, PageTransition, MainLayoutClient, ThemeToggle
  - lib/store/finance-store.tsx → global state
  - lib/types.ts → all TypeScript types
  - docs/ → project intelligence (this system)
  - agents/ → AI agent definitions
```

---

## Example Session Flows

### Flow A: "Add a new dashboard widget"

```
1. Read: docs/DESIGN_SYSTEM.md (colour tokens, glass-card, spacing)
2. Read: docs/ANIMATION_GUIDELINES.md (stagger patterns, entrance animations)
3. Read: agents/ui-ux-agent.md (design standards and reasoning)
4. Read: app/(main)/dashboard/page.tsx (current dashboard structure)
5. Read: components/dashboard/ directory (existing widget patterns)
6. Build the component following existing patterns
7. Wire it into the dashboard page
```

### Flow B: "Fix a Supabase auth bug"

```
1. Read: docs/ARCHITECTURE.md (auth flow, server vs client clients)
2. Read: agents/backend-agent.md (security standards, Supabase patterns)
3. Read: app/actions/auth.ts (current auth server actions)
4. Read: lib/supabase/server.ts, lib/supabase/client.ts
5. Identify the issue and fix
```

### Flow C: "Improve the AI coaching quality"

```
1. Read: docs/FINANCE_LOGIC.md (financial logic, insight standards)
2. Read: docs/BRAND_GUIDELINES.md (tone of voice, AI assistant branding)
3. Read: agents/finance-agent.md (finance reasoning standards)
4. Read: lib/anthropic.ts (current prompts)
5. Improve prompts and financial context building
```

### Flow D: "Implement a new financial feature (e.g., net worth tracker)"

```
1. Read: docs/PRODUCT.md (feature philosophy, what INSYT. is/isn't)
2. Read: agents/product-agent.md (feature evaluation)
3. [If approved] Read: docs/ARCHITECTURE.md, docs/FINANCE_LOGIC.md
4. Read: agents/architecture-agent.md (where to put things)
5. Read: agents/frontend-agent.md (component patterns)
6. Read: agents/backend-agent.md (database + API patterns)
7. Implement database migration → store method → Server Action → component
```

### Flow E: "Mobile responsiveness improvements"

```
1. Read: docs/DESIGN_SYSTEM.md (breakpoints, layout philosophy)
2. Read: agents/frontend-agent.md (responsive patterns)
3. Read: components/layout/MainLayoutClient.tsx (mobile sidebar)
4. Identify affected pages and fix systematically
```

---

## Consistency Rules for Claude Sessions

### Design Consistency
- Always check `globals.css` before creating new colour usage — use existing tokens
- Always check `DESIGN_SYSTEM.md` before picking a new border radius or spacing value
- Always use the `glass-card` class for surface cards — never invent new card styles

### Code Consistency
- Always check `lib/types.ts` before defining a new type
- Always check `lib/store/finance-store.tsx` before adding state elsewhere
- Always use `cn()` from `lib/utils.ts` for conditional Tailwind classes
- Always check existing component patterns before creating new ones

### Animation Consistency
- Check `ANIMATION_GUIDELINES.md` timing table before using any duration
- Use the defined easing values — never arbitrary cubic-beziers
- Page transitions are handled by `PageTransition` — don't re-implement

### Financial Logic Consistency
- All financial calculations must be documented in `FINANCE_LOGIC.md`
- Any new Smart Alert trigger must be added to the alerts table in that doc
- AI prompts must follow the tone guidelines in `BRAND_GUIDELINES.md`

---

## How to Update This System

When significant new patterns, decisions, or components are established:

1. **New design pattern** → update `DESIGN_SYSTEM.md`
2. **New animation style** → update `ANIMATION_GUIDELINES.md`
3. **New financial metric** → update `FINANCE_LOGIC.md`
4. **New architectural pattern** → update `ARCHITECTURE.md`
5. **New feature** → update `PRODUCT.md` core features table
6. **Brand/copy decision** → update `BRAND_GUIDELINES.md`

**Update the doc before shipping the code** — the doc is the source of truth for future sessions.

---

## Recommended Session Prompt Templates

### UI Task Prompt
```
I'm working on INSYT. — an AI personal finance coaching app.
Read docs/DESIGN_SYSTEM.md and docs/ANIMATION_GUIDELINES.md before proceeding.
Use agents/ui-ux-agent.md as your design reasoning framework.
Task: [describe the UI change]
```

### Feature Task Prompt
```
I'm working on INSYT. — an AI personal finance coaching app.
Read docs/PRODUCT.md, docs/ARCHITECTURE.md, and agents/[relevant-agent].md before proceeding.
Task: [describe the feature]
```

### Bug Fix Prompt
```
I'm working on INSYT. — an AI personal finance coaching app.
Read docs/ARCHITECTURE.md before proceeding.
Bug: [describe the bug, expected behaviour, actual behaviour]
Relevant files: [list files]
```

---

## Architecture Decisions Log

Quick reference for decisions already made (so they don't get re-debated):

| Decision | Rationale |
|---|---|
| Guest mode via localStorage | Value before commitment — reduce signup friction |
| No named AI persona | Avoids anthropomorphism; INSYT. speaks as the product |
| Framer Motion for animations | Best-in-class DX, excellent TypeScript support |
| Material Symbols for icons | Variable weight, huge library, Google CDN |
| Manrope typeface | Premium feel, geometric, excellent legibility |
| Teal as brand colour | Calm, intelligent, financial trust — not generic blue |
| CSS transitions for sidebar | Better perf than Framer Motion for persistent nav |
| Server Actions for mutations | Simpler than API routes; automatic CSRF protection |
| RLS on all Supabase tables | Security-first; never bypass, never pass user_id from client |
| claude-sonnet-4-6 model | Best quality/cost balance for financial coaching |
| Single FinanceStore context | Simpler than Redux/Zustand for this data size |
| No shadcn component library (full) | Custom components for better design control |
| PWA via @ducanh2912/next-pwa | Maintained Next.js 15 fork; Workbox-based SW generation |
| SW disabled in dev | Prevents stale-cache confusion during active development |
| BottomNav on mobile | Native app pattern for <5 primary routes; sidebar for secondary |
| SW NetworkOnly for AI chat | Streaming responses cannot be cached — skip entirely |
| SW NetworkFirst for insights | Aligns with 24h data_hash cache TTL; offline shows stale OK |
