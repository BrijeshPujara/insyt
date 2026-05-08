# INSYT. — UX Principles

> Effortless clarity. Emotional intelligence. Friction where it matters, never where it doesn't.

---

## Core UX Philosophy

INSYT. is built on one belief: **financial clarity should feel empowering, not overwhelming**. The UX is designed to reduce cognitive load, build trust progressively, and make financial progress feel tangible and achievable.

Every UX decision passes this filter:
> "Does this make the user feel more capable with their money?"

---

## Onboarding Philosophy

### Principle: Value Before Commitment
Users should experience value before being asked to commit. INSYT. achieves this through **Guest Mode** — full app access with local storage, no account required.

### Guest-First Experience
1. Landing page → "Get started free" → immediately enters the app as a guest
2. No sign-up gate, no paywall, no email required to explore
3. Guest data stored in `localStorage` key `lumina_finance_v1`
4. When the user creates an account, their guest data is migrated to Supabase automatically
5. Sign-up prompt appears contextually ("Your data is stored locally — create a free account to save it securely") — never as a blocker

### Onboarding Flow (first session)
The ideal first session has the user completing:
1. Add one income source
2. Add 2–3 expenses
3. View their Financial Health Score for the first time

Each of these is a dopamine moment. The UX should make them feel fast and rewarding.

### Empty State Philosophy
Empty states are **invitations**, not absences.

| Page | Empty state message |
|---|---|
| Dashboard (no data) | "Add your first income source to get started — it takes 30 seconds." + CTA |
| Budgets | "Add some expenses to see how your budget breaks down." |
| Debt | "No debts? Great! Or add one to start a payoff plan." |
| Goals | "Set your first savings goal — we'll help you track it." |
| Advisory | "Add some financial data first and I'll give you personalised insights." |

Empty states should:
- Have an icon (Material Symbols, `text-4xl`, `text-muted-foreground/30`)
- Have a one-sentence explanation
- Have a single CTA button to the relevant add flow
- Never feel like a failure state

---

## Friction Reduction

### Forms
- Minimum required fields — no optional fields unless clearly beneficial
- Smart defaults (e.g., frequency defaults to "monthly" which covers most cases)
- Inline validation — not just on submit
- Tab order is correct and logical
- Mobile keyboards are appropriate (number inputs for amounts)
- Auto-focus first field on modal/form open

### Navigation
- Current page is always visually obvious in sidebar
- Sidebar navigation requires one tap/click, never nested menus
- Destructive actions (delete) require confirmation — but non-destructive actions don't
- Mobile: bottom nav consideration for future (currently sidebar drawer)

### Data Entry
- The "Add Finances" page is the single entry point for all data types
- Tabbed interface so users can switch categories without losing context
- After adding an item, the form resets (not closes) so batch entry is easy
- Success feedback is immediate (toast notification, item appears in list)

---

## Emotional UX

### Managing Financial Anxiety
Many users feel anxious about seeing their numbers. The UX should:
1. **Frame scores as starting points**: "Your financial health score is 42 — here's how to improve it" not "Your score is low."
2. **Show momentum**: Visualise progress over time, not just current state
3. **Contextualise debt**: Show monthly cost and payoff timeline, not just the balance
4. **Celebrate improvements**: When the health score improves, acknowledge it

### Colour Psychology
- **Green/Emerald**: Savings, surplus, progress, positive moments — use generously for positive states
- **Teal/Primary**: Neutral positive, interactive, brand — main UI colour
- **Amber**: Warnings, attention needed — use sparingly, not alarmingly
- **Red**: Deficits, high-risk situations — use purposefully; never make the whole dashboard feel red
- **Grey**: Inactive states, placeholders, metadata

### Micro-copy Tone
Micro-copy (labels, helper text, placeholders) must be warm:
- ✅ "How much do you earn each month?" (conversational)
- ❌ "Monthly income (required)" (clinical)
- ✅ "e.g., 2,500" (helpful)
- ❌ "Enter a number" (obvious/cold)
- ✅ "We'll use this to calculate your budget" (reassuring)
- ❌ "Required for calculation" (corporate)

---

## Gamification Principles

INSYT. uses **subtle progress signals** rather than aggressive gamification. The goal is motivation, not distraction.

### What INSYT. uses:
- **Financial Health Score**: Single number that improves with good decisions
- **Goal progress bars**: Visual completion percentage for savings targets
- **Streak awareness** (future): Days/weeks of consecutive check-ins
- **Milestone acknowledgements**: "You've paid off £500 of your credit card this year"

### What INSYT. avoids:
- Badge systems
- Leaderboards
- Level-up mechanics
- Points currencies
- Push notification spam
- Artificial urgency ("Only 3 days to complete your profile!")

The guiding question: **"Does this gamification element make the user smarter about their money, or just more engaged?"** Engagement without insight is noise.

---

## AI Interaction Philosophy

### The AI Coach Character
The AI speaks as INSYT. — not as a named assistant. It has read the user's full financial context before every conversation and treats that context as the basis for every response.

### Chat UX Principles
1. **Pre-loaded context**: The AI never asks "how much do you earn?" — it knows
2. **Conversational, not transactional**: Responses feel like a thoughtful reply, not a query result
3. **Proactive when helpful**: AI Insights (generated automatically) surface patterns the user didn't ask about
4. **Honest uncertainty**: "Based on what you've shared..." acknowledges data limitations
5. **Length calibration**: Short questions get short answers. Complex financial questions get structured, longer responses.

### Chat Widget Design
- Floating widget on dashboard (not a full-page experience by default)
- Conversation history persists (`chat_messages` table)
- User sees AI "thinking" via streaming response
- Code, lists, and numbers are formatted appropriately in responses

### Insight Cards
Proactively generated insights appear as cards on the dashboard. Each insight:
- Has a category icon (Material Symbols)
- Has a title (5–8 words)
- Has a body (2–3 sentences max)
- Has an action (link or button)
- Can be refreshed by the user

---

## Accessibility UX

### WCAG 2.1 AA as minimum
- Contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- All interactive elements keyboard navigable
- Focus rings visible and styled (not browser default)
- `aria-label` on all icon-only buttons
- `aria-live` regions for toast notifications and dynamic updates

### Motion Accessibility
- All animations respect `prefers-reduced-motion` (see ANIMATION_GUIDELINES.md)
- No information conveyed by animation alone — always have a non-animated equivalent

### Mobile Accessibility
- Touch targets minimum 44×44px
- No hover-only states on mobile
- Pinch-to-zoom not disabled (no `user-scalable=no`)

---

## Loading & Performance UX

### Skeleton Loading
- Used for all data-dependent components on initial load
- Skeleton shapes match the real content shape
- `animate-pulse` Tailwind class
- Maximum skeleton display time: 3 seconds (show error if exceeded)

### Optimistic Updates
- When a user adds an item (income, expense, debt, etc.), it should appear in the UI immediately
- Rollback if the server action fails, with an error toast

### Error States
- All error states have a retry mechanism
- Error messages reference what went wrong, not just "something went wrong"
- Auth errors are specific: "Incorrect password" not "Login failed"

---

## Key UX Anti-Patterns — Never Do These

- ❌ Dark patterns: hidden required fields, confusing CTAs, subscription traps
- ❌ Wall of text: no paragraph > 4 lines in any product context
- ❌ Confirmation for non-destructive actions (adding data, navigating)
- ❌ Unexplained loading states (always explain what's loading)
- ❌ Modals for simple actions that could be inline
- ❌ Multiple error messages for the same field
- ❌ Breaking the browser back button
- ❌ Auto-playing any audio or video
- ❌ Blocking the viewport on mobile with modals that don't scroll
