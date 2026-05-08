# INSYT. — Architecture Reference

> Next.js App Router · TypeScript strict · Supabase · Claude AI

---

## Project Root Structure

```
lumina-finance/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth layout group (no sidebar)
│   │   ├── layout.tsx      # Split-panel auth shell
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (main)/             # Authenticated app layout group
│   │   ├── layout.tsx      # Thin shell → MainLayoutClient
│   │   ├── dashboard/
│   │   ├── budgets/
│   │   ├── debt/
│   │   ├── advisory/
│   │   ├── reports/
│   │   ├── add-finances/
│   │   └── settings/
│   ├── actions/            # Server Actions (auth, CRUD)
│   ├── api/                # Route Handlers (AI, OAuth callback)
│   │   ├── ai/chat/        # Streaming Claude chat
│   │   ├── ai/insights/    # AI insights generation
│   │   └── auth/callback/  # Supabase OAuth code exchange
│   ├── globals.css         # Design tokens + utility classes
│   ├── layout.tsx          # Root layout (providers, fonts)
│   └── page.tsx            # Root redirect → /dashboard
├── components/
│   ├── add-finances/       # Data entry forms
│   ├── auth/               # Login, Signup, GoogleAuthButton
│   ├── dashboard/          # Dashboard-specific widgets
│   ├── layout/             # Sidebar, ThemeToggle, PageTransition, MainLayoutClient
│   ├── settings/           # Settings UI
│   └── ui/                 # Shared UI primitives (Toaster, etc.)
├── docs/                   # Project intelligence (this system)
├── agents/                 # AI agent definitions
├── lib/
│   ├── anthropic.ts        # Anthropic client + prompt builders
│   ├── types.ts            # All TypeScript types (DB + domain)
│   ├── utils.ts            # cn() + shared utilities
│   ├── hooks/              # Custom React hooks (use-toast, etc.)
│   ├── store/              # Global finance state (FinanceProvider)
│   └── supabase/
│       ├── client.ts       # Browser Supabase client (singleton)
│       └── server.ts       # Server Supabase client (cookie-based)
├── supabase/
│   └── migrations/         # SQL migrations (001_schema.sql)
├── middleware.ts            # Route protection (Supabase session check)
├── tailwind.config.ts
├── next.config.ts
└── tsconfig.json
```

---

## App Router Architecture

### Route Groups
- `(auth)` — pages without the sidebar (login, signup). Has its own layout with split-panel design.
- `(main)` — authenticated pages with sidebar. `layout.tsx` renders `MainLayoutClient` which manages mobile sidebar state.

### Server vs Client Components

**Default to Server Components.** Only opt into `"use client"` when you need:
- Browser APIs (`localStorage`, `window`, `document`)
- React hooks (`useState`, `useEffect`, `useContext`)
- Event handlers
- Framer Motion animations

| File | Boundary |
|---|---|
| `app/(main)/dashboard/page.tsx` | Server (fetches initial data) |
| `components/dashboard/*.tsx` | Client (animations, state) |
| `app/actions/auth.ts` | Server Action |
| `components/auth/LoginForm.tsx` | Client |
| `lib/store/finance-store.tsx` | Client (Context) |
| `app/api/ai/chat/route.ts` | Server (Route Handler) |

### Data Fetching Strategy
1. Server Components fetch via Supabase server client for initial page data
2. Client Components use `FinanceStore` (which internally uses Supabase browser client)
3. AI routes are Route Handlers (streaming responses)
4. All mutations go through Server Actions (`app/actions/`)

---

## State Management

### FinanceStore (`lib/store/finance-store.tsx`)
Single global Context Provider that manages all financial data.

**Architecture:**
- Detects authenticated user vs guest on mount (`supabase.auth.getUser()`)
- Guest mode: reads/writes to `localStorage` key `lumina_finance_v1`
- Authenticated mode: CRUD operations against Supabase tables with RLS
- Migration: on user sign-in, local guest data is auto-migrated to Supabase

**Exposed state:**
```ts
user: User | null
isGuest: boolean
income: Income[]
expenses: Expense[]
debts: Debt[]
subscriptions: Subscription[]
goals: SavingsGoal[]
insights: AIInsight[]
isLoading: boolean
```

**Exposed methods:**
```ts
addIncome(data: AddIncomeData): Promise<void>
addExpense(data: AddExpenseData): Promise<void>
addDebt(data: AddDebtData): Promise<void>
addSubscription(data: AddSubscriptionData): Promise<void>
addGoal(data: AddGoalData): Promise<void>
updateGoal(id: string, data: UpdateGoalData): Promise<void>
deleteIncome(id: string): Promise<void>
deleteExpense(id: string): Promise<void>
deleteDebt(id: string): Promise<void>
deleteSubscription(id: string): Promise<void>
deleteGoal(id: string): Promise<void>
refreshInsights(): Promise<void>
```

**Usage:**
```tsx
const { income, addIncome, isGuest } = useFinances();
```

---

## Supabase Integration

### Client Types
- **Browser client** (`lib/supabase/client.ts`): Used in Client Components. Singleton via module-level variable. Uses `createBrowserClient`.
- **Server client** (`lib/supabase/server.ts`): Used in Server Components, Server Actions, Route Handlers. Uses `createServerClient` with Next.js cookie adapter.

### Auth Flow
1. Email/password: Server Action → `supabase.auth.signUp` / `signInWithPassword`
2. Google OAuth: Client → `supabase.auth.signInWithOAuth` → redirect to Google → Supabase callback → `/api/auth/callback` → `supabase.auth.exchangeCodeForSession` → redirect to `/dashboard`
3. Middleware (`middleware.ts`) protects all `(main)` routes — redirects to `/login` if no session
4. `signOut`: Supabase client signOut → `router.push("/login")` + `router.refresh()`

### Database Schema
Tables (all with RLS enabled, `user_id` FK to `auth.users`):
- `profiles` — user preferences (currency, theme, full_name)
- `income` — income sources
- `expenses` — expense records
- `debts` — debt balances
- `subscriptions` — recurring subscriptions
- `savings_goals` — savings targets with progress
- `ai_insights` — cached AI-generated insights
- `chat_messages` — conversation history

### Row Level Security (RLS)
Every table has `user_id = auth.uid()` RLS policies. Never bypass RLS. Never pass `user_id` as a parameter from the client — always derive from `auth.uid()` on the server.

---

## API Structure

### Route Handlers (`app/api/`)

#### `POST /api/ai/chat`
- Accepts `{ messages: ChatMessage[], financialContext: FinancialContext }`
- Streams Claude response using Anthropic SDK
- Returns `text/event-stream`

#### `POST /api/ai/insights`
- Accepts `{ financialContext: FinancialContext }`
- Returns 4 structured JSON insights
- Model: `claude-sonnet-4-6`

#### `GET /api/auth/callback`
- Accepts `?code=` from OAuth redirect
- Exchanges code for session via `supabase.auth.exchangeCodeForSession`
- Redirects to `/dashboard` (success) or `/login?error=auth_callback_failed` (failure)

---

## Server Actions (`app/actions/`)

| File | Actions |
|---|---|
| `auth.ts` | `signIn`, `signUp`, `signOut` |
| `expenses.ts` | `addExpense`, `deleteExpense` |
| `income.ts` | `addIncome`, `deleteIncome` |
| `debts.ts` | `addDebt`, `deleteDebt` |
| `subscriptions.ts` | `addSubscription`, `deleteSubscription` |
| `goals.ts` | `addGoal`, `updateGoal`, `deleteGoal` |

All Server Actions:
- Use the server Supabase client
- Validate input before database calls
- Return typed result objects (not `void`) so clients can handle errors
- Never call `redirect()` inside try blocks (Next.js limitation)

---

## AI Integration

### Anthropic Client (`lib/anthropic.ts`)
- Model: `claude-sonnet-4-6`
- System prompt: `buildSystemPrompt(context)` — financial coach persona with full user data context
- Insights prompt: `buildInsightsPrompt(context)` — requests 4 structured JSON insights

### Financial Context Shape
```ts
type FinancialContext = {
  totalMonthlyIncome: number
  totalMonthlyExpenses: number
  totalDebt: number
  monthlyCashflow: number
  debtToIncomeRatio: number
  savingsRate: number
  debts: Debt[]
  goals: SavingsGoal[]
  subscriptions: Subscription[]
  topExpenseCategories: { category: string; amount: number }[]
}
```

---

## Naming Conventions

### Files
- **Components**: `PascalCase.tsx` (e.g., `SmartAlerts.tsx`)
- **Pages**: `page.tsx` (Next.js convention)
- **Layouts**: `layout.tsx`
- **Server Actions**: `camelCase.ts` (e.g., `auth.ts`)
- **Hooks**: `use-kebab-case.ts` (e.g., `use-toast.ts`)
- **Utilities**: `camelCase.ts`

### Variables
- **Boolean state**: `isLoading`, `hasData`, `isGuest`
- **Event handlers**: `handleSubmit`, `handleDelete`, `handleSignOut`
- **Async actions**: `addIncome`, `deleteExpense` (verb + noun)

### CSS Classes
- Utility classes: kebab-case (`.glass-card`, `.btn-primary`, `.input-field`)
- Component-scoped: Tailwind classes inline, no CSS modules

---

## Scalability Rules

1. **Never put business logic in components** — finance calculations belong in `lib/` utilities or the store
2. **Never put UI in Server Actions** — they return data, never JSX
3. **Keep pages thin** — pages should orchestrate components, not contain logic
4. **One concern per file** — don't put auth logic in finance components
5. **Types in `lib/types.ts`** — all shared types live here, not inline in components
6. **No barrel files** — import directly from source files to maintain tree-shakability
7. **Guest mode parity** — every feature that works for authenticated users must work for guests

---

## Environment Variables

| Variable | Where used |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server |
| `ANTHROPIC_API_KEY` | Server only (AI routes) |
| `NEXT_PUBLIC_SITE_URL` | OAuth redirect construction |

**Never** access `ANTHROPIC_API_KEY` from Client Components. It's server-only.
