-- ─────────────────────────────────────────────
--  Lumina Finance — Initial Schema
-- ─────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Profiles (extends auth.users) ──────────────
CREATE TABLE profiles (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email         TEXT NOT NULL,
  full_name     TEXT,
  currency      TEXT NOT NULL DEFAULT 'GBP',
  theme         TEXT NOT NULL DEFAULT 'dark',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Income ──────────────────────────────────────
CREATE TABLE income (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  source        TEXT NOT NULL,
  amount        NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  frequency     TEXT NOT NULL DEFAULT 'monthly'
                CHECK (frequency IN ('weekly','biweekly','monthly','annually')),
  pay_date      TEXT,
  notes         TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE income ENABLE ROW LEVEL SECURITY;
CREATE POLICY "income_owner" ON income USING (auth.uid() = user_id);

-- ── Expenses ────────────────────────────────────
CREATE TYPE expense_category AS ENUM (
  'housing', 'council_tax', 'utilities', 'food_groceries',
  'transport', 'broadband_mobile', 'insurance', 'childcare',
  'health', 'eating_out', 'entertainment', 'clothing',
  'personal_care', 'gym', 'subscriptions', 'other'
);

CREATE TABLE expenses (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name          TEXT NOT NULL,
  category      expense_category NOT NULL DEFAULT 'other',
  amount        NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  frequency     TEXT NOT NULL DEFAULT 'monthly'
                CHECK (frequency IN ('weekly','biweekly','monthly','annually','one_off')),
  due_day       INTEGER CHECK (due_day BETWEEN 1 AND 31),
  is_essential  BOOLEAN NOT NULL DEFAULT true,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "expenses_owner" ON expenses USING (auth.uid() = user_id);

-- ── Debts ────────────────────────────────────────
CREATE TYPE debt_type AS ENUM (
  'credit_card','personal_loan','student_loan',
  'mortgage','car_finance','overdraft','buy_now_pay_later','other'
);

CREATE TABLE debts (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id           UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name              TEXT NOT NULL,
  type              debt_type NOT NULL DEFAULT 'personal_loan',
  balance           NUMERIC(12,2) NOT NULL CHECK (balance >= 0),
  interest_rate     NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (interest_rate >= 0),
  minimum_payment   NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (minimum_payment >= 0),
  due_day           INTEGER CHECK (due_day BETWEEN 1 AND 31),
  is_active         BOOLEAN NOT NULL DEFAULT true,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "debts_owner" ON debts USING (auth.uid() = user_id);

-- ── Subscriptions ────────────────────────────────
CREATE TABLE subscriptions (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id           UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name              TEXT NOT NULL,
  amount            NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  frequency         TEXT NOT NULL DEFAULT 'monthly'
                    CHECK (frequency IN ('weekly','monthly','annually')),
  category          TEXT,
  next_billing_date DATE,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subs_owner" ON subscriptions USING (auth.uid() = user_id);

-- ── Savings Goals ────────────────────────────────
CREATE TABLE savings_goals (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name            TEXT NOT NULL,
  target_amount   NUMERIC(12,2) NOT NULL CHECK (target_amount > 0),
  current_amount  NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  target_date     DATE,
  category        TEXT,
  priority        INTEGER DEFAULT 1,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "goals_owner" ON savings_goals USING (auth.uid() = user_id);

-- ── AI Insights ──────────────────────────────────
CREATE TABLE ai_insights (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('spending','debt','savings','cashflow','general')),
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  impact        TEXT CHECK (impact IN ('high','medium','low')),
  icon          TEXT DEFAULT 'lightbulb',
  is_read       BOOLEAN NOT NULL DEFAULT false,
  generated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insights_owner" ON ai_insights USING (auth.uid() = user_id);

-- ── Chat Messages ────────────────────────────────
CREATE TABLE chat_messages (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chat_owner" ON chat_messages USING (auth.uid() = user_id);

-- ── Indexes ──────────────────────────────────────
CREATE INDEX idx_income_user       ON income(user_id, is_active);
CREATE INDEX idx_expenses_user     ON expenses(user_id, is_active);
CREATE INDEX idx_debts_user        ON debts(user_id, is_active);
CREATE INDEX idx_subs_user         ON subscriptions(user_id, is_active);
CREATE INDEX idx_goals_user        ON savings_goals(user_id, is_active);
CREATE INDEX idx_insights_user     ON ai_insights(user_id, generated_at DESC);
CREATE INDEX idx_chat_user         ON chat_messages(user_id, created_at);

-- ── Helper: updated_at trigger ───────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER income_updated_at       BEFORE UPDATE ON income       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER expenses_updated_at     BEFORE UPDATE ON expenses     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER debts_updated_at        BEFORE UPDATE ON debts        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER savings_goals_updated_at BEFORE UPDATE ON savings_goals FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER profiles_updated_at     BEFORE UPDATE ON profiles     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
