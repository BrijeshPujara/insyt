# INSYT. — Finance Logic Reference

> Realistic. Actionable. Non-judgemental. Human-centred.

---

## Philosophy

Financial logic in INSYT. is not purely mathematical — it is **behaviourally informed**. The same numbers mean different things to different people. A 30% debt-to-income ratio is a crisis for someone earning £20,000/year and manageable for someone with strong job security earning £80,000/year.

**Guiding principles:**

1. **Context before conclusions** — always interpret numbers relative to the user's full picture
2. **Progress over perfection** — celebrate improvement, not just achievement of ideals
3. **Actionable always** — every insight ends with something the user _can do today_
4. **Non-judgemental language** — describe situations, not moral failures

---

## Financial Health Score

### Overview

A single number from 0–100 summarising the user's overall financial position. Updated whenever underlying data changes.

### Component Weights

| Component            | Weight | Description                                  |
| -------------------- | ------ | -------------------------------------------- |
| Cashflow Ratio       | 25%    | Monthly surplus / monthly income             |
| Debt-to-Income Ratio | 25%    | Total monthly debt payments / monthly income |
| Savings Rate         | 20%    | Monthly savings / monthly income             |
| Emergency Fund       | 15%    | Months of expenses covered by savings        |
| Debt Interest Burden | 15%    | Proportion of debt at >15% APR               |

### Scoring Logic

```ts
function calcHealthScore(data: FinancialContext): number {
  // Cashflow (25 pts): surplus ≥ 20% income = full marks
  const cashflowScore = clamp(data.savingsRate / 0.2, 0, 1) * 25;

  // DTI (25 pts): <15% DTI = full, >50% DTI = 0
  const dtiScore = clamp(1 - (data.debtToIncomeRatio - 0.15) / 0.35, 0, 1) * 25;

  // Savings rate (20 pts): ≥20% = full marks
  const savingsScore = clamp(data.savingsRate / 0.2, 0, 1) * 20;

  // Emergency fund (15 pts): ≥6 months = full
  const efScore = clamp(data.emergencyFundMonths / 6, 0, 1) * 15;

  // High-interest debt (15 pts): 0% high APR debt = full marks
  const highRateProportion =
    data.highInterestDebtBalance / Math.max(data.totalDebt, 1);
  const hirScore = clamp(1 - highRateProportion, 0, 1) * 15;

  return Math.round(
    cashflowScore + dtiScore + savingsScore + efScore + hirScore,
  );
}
```

### Score Bands

| Score  | Label           | Colour         |
| ------ | --------------- | -------------- |
| 80–100 | Excellent       | Emerald        |
| 60–79  | Good            | Primary (teal) |
| 40–59  | Fair            | Amber          |
| 20–39  | Needs attention | Orange         |
| 0–19   | Critical        | Red            |

---

## Monthly Cashflow

```
Monthly Cashflow = Total Monthly Income − Total Monthly Expenses − Total Monthly Debt Payments
```

### Frequency Normalisation

All amounts normalised to monthly:

- Weekly → × 4.333
- Biweekly → × 2.167
- Monthly → × 1
- Annually → ÷ 12

### Cashflow Interpretation

| Cashflow         | Interpretation                                        |
| ---------------- | ----------------------------------------------------- |
| > 20% of income  | Strong surplus — prime for savings/debt acceleration  |
| 10–20% of income | Healthy buffer — some room for goals                  |
| 5–10% of income  | Thin margin — monitor closely                         |
| 0–5% of income   | At risk — one unexpected expense could cause problems |
| Negative         | Deficit — unsustainable, requires immediate attention |

---

## Debt Prioritisation Logic

### Supported Strategies

#### Avalanche Method (mathematically optimal)

Order debts by interest rate descending. Pay minimums on all, direct extra payments to highest-rate debt first. Minimises total interest paid.

**Best for:** Users who are motivated by numbers and want to save the most money.

#### Snowball Method (behaviourally optimal)

Order debts by balance ascending. Pay minimums on all, direct extra to smallest balance first. Builds momentum through quick wins.

**Best for:** Users who need motivation and psychological wins to stay on track.

### INSYT. Default Recommendation Logic

The AI coach recommends based on user profile:

- If highest-rate debt is also a small balance → always recommend avalanche (same result)
- If user has 1–2 debts → debt order doesn't matter much; explain both
- If user has many debts with similar rates → recommend snowball for motivation
- Always show the _interest cost difference_ between strategies in £

### Debt Type Context

| Type              | Typical APR        | Priority Note                                  |
| ----------------- | ------------------ | ---------------------------------------------- |
| Credit card       | 20–35%             | Highest priority — toxic compounding           |
| Overdraft         | 15–40%             | Often overlooked, high effective rate          |
| Buy now pay later | 0% (promo) or 30%+ | Watch for end of promo period                  |
| Personal loan     | 6–20%              | Fixed schedule — calculate overpayment benefit |
| Car finance       | 4–12%              | Consider vs. investment returns                |
| Student loan      | 3–7.9% (UK)        | Lowest priority; income-contingent repayment   |
| Mortgage          | 2–6%               | Never over-accelerate at expense of liquidity  |

### Debt-to-Income Ratio (DTI)

```
DTI = Total monthly debt payments ÷ Total monthly gross income
```

| DTI    | Assessment                                           |
| ------ | ---------------------------------------------------- |
| < 15%  | Healthy — room to take on strategic debt             |
| 15–28% | Manageable                                           |
| 28–40% | Elevated — worth addressing                          |
| 40–50% | High — AI should flag as a smart alert               |
| > 50%  | Critical — restrict new spending, aggressive paydown |

---

## Budgeting Logic

### 50/30/20 Framework (baseline)

A heuristic for how income should be allocated:

- **50%** — Needs (housing, utilities, food, transport, insurance)
- **30%** — Wants (entertainment, eating out, subscriptions, gym)
- **20%** — Financial goals (savings, debt extra payments, investments)

INSYT. uses this as an **educational baseline**, not a rigid rule. The AI should contextualise it — e.g., London housing costs make 50% for needs unrealistic for many users.

### Essential vs Non-Essential Classification

Expenses have `is_essential: boolean`. Essential = housing, utilities, food, transport, insurance, childcare, health. Non-essential = eating out, entertainment, clothing, gym, subscriptions, personal care.

**AI coaching angle**: Don't guilt-trip about non-essentials. Help users see tradeoffs clearly. A £30 gym membership that keeps someone healthy may be more valuable than cutting it to make a marginal debt payment.

### Subscription Fatigue Alert

Trigger when subscriptions total > 15% of monthly income. Show individual breakdown. Suggest lowest-value ones to review.

### Budget Category Thresholds (UK context)

| Category                   | Suggested % of income |
| -------------------------- | --------------------- |
| Housing (rent/mortgage)    | 25–35%                |
| Food & groceries           | 8–12%                 |
| Transport                  | 5–10%                 |
| Utilities                  | 3–5%                  |
| Entertainment + eating out | 5–10% combined        |
| Subscriptions              | < 5%                  |
| Savings / investments      | 15–20% minimum        |

---

## Savings Logic

### Savings Rate

```
Savings Rate = Monthly Cashflow ÷ Monthly Income
```

| Rate     | Assessment                       |
| -------- | -------------------------------- |
| ≥ 20%    | Strong — on track for most goals |
| 10–20%   | Good — room to improve           |
| 5–10%    | Modest — can be improved         |
| < 5%     | Low — AI should investigate why  |
| Negative | No savings occurring             |

### Emergency Fund

Recommended: 3–6 months of essential expenses in liquid savings.

- 3 months: stable employment, no dependants
- 6 months: self-employed, irregular income, dependants

### Savings Goal Prioritisation

When multiple goals exist, recommend order:

1. Emergency fund (3 months) — always first
2. High-interest debt elimination
3. Emergency fund (6 months)
4. Short-term named goals (holiday, car, etc.)
5. Long-term goals (house deposit, etc.)

### Goal Progress Calculation

```
Percentage Complete = current_amount ÷ target_amount × 100
Months to Target = (target_amount − current_amount) ÷ monthly_contribution
```

---

## Forecasting Logic

### Simple Linear Forecast

For debt payoff and savings goals:

```
Months to complete = Outstanding balance ÷ Monthly payment
Completion date = Today + months_to_complete
```

### Debt Payoff with Interest (iterative)

For accurate credit card forecasting:

```
balance_next_month = balance × (1 + APR/12) − monthly_payment
```

Iterate until `balance ≤ 0`.

### Projection Scenarios

AI should present 3 scenarios when relevant:

- **Minimum payments only** — worst case, highest total interest
- **Current plan** — based on actual data
- **Accelerated** — what happens with +£X/month extra

---

## Behavioural Finance Insights

### Principles informing AI coaching

1. **Loss aversion**: Frame debt reduction as "keeping more of your money" rather than "losing less" — people respond better to gains
2. **Present bias**: Recommend small near-term wins (snowball method) for users who are losing motivation
3. **Mental accounting**: Acknowledge that people treat money in different "buckets" — don't tell them all money is fungible; work with this tendency
4. **Social proof** (carefully): "People in similar situations often..." — only used for normalisation, never to shame
5. **Anchoring**: When recommending a savings amount, start with a concrete suggested number rather than asking "how much do you want to save?"
6. **Implementation intentions**: "Automate this payment on payday" is more actionable than "try to save more"

### Insight Quality Standards

AI insights must always:

- Reference the user's actual data (not generic advice)
- Suggest one specific, concrete action
- Be non-judgemental in tone
- Be 2–4 sentences maximum
- Be immediately actionable (not "consider your options")

---

## Smart Alert Triggers

| Alert                 | Trigger condition                 | Severity |
| --------------------- | --------------------------------- | -------- |
| Negative cashflow     | Monthly cashflow < 0              | danger   |
| High DTI              | DTI > 40%                         | danger   |
| High-interest debt    | Any debt APR > 18%                | warning  |
| Subscription overload | Subscriptions > 15% of income     | warning  |
| Low savings rate      | Savings rate < 5% and income > 0  | warning  |
| No savings goals      | 0 goals defined                   | info     |
| No emergency fund     | emergency fund < 1 month expenses | warning  |
