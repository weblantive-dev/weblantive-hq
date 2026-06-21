-- ============================================================
-- WEBLANTIVE HQ — SUPABASE DATABASE SETUP SCRIPT
-- Paste this entire file into your Supabase SQL Editor and run it
-- Go to: Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================

-- PROSPECTS
create table if not exists prospects (
  id uuid default gen_random_uuid() primary key,
  business_name text not null,
  contact_name text,
  phone text,
  country text default 'US',
  niche text,
  stage text default 'Lead',
  notes text,
  last_action text,
  follow_up_date date,
  created_at timestamptz default now()
);

-- CLIENTS
create table if not exists clients (
  id uuid default gen_random_uuid() primary key,
  business_name text not null,
  contact_name text,
  email text,
  phone text,
  country text default 'US',
  project_type text,
  pages integer default 0,
  total_price_usd numeric default 0,
  total_price_zar numeric default 0,
  deposit_paid_usd numeric default 0,
  deposit_paid_zar numeric default 0,
  balance_usd numeric default 0,
  balance_zar numeric default 0,
  project_stage text default 'Not Started',
  start_date date,
  delivery_date date,
  onboarding_data text,
  notes text,
  created_at timestamptz default now()
);

-- TASKS
create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  due_date date,
  due_time time,
  priority text default 'Medium',
  category text default 'Admin',
  completed boolean default false,
  related_to uuid,
  created_at timestamptz default now()
);

-- CALENDAR EVENTS
create table if not exists calendar_events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  date date not null,
  time time,
  type text default 'manual',
  color text default '#38BDF8',
  related_task_id uuid,
  related_prospect_id uuid,
  related_client_id uuid,
  created_at timestamptz default now()
);

-- INCOME
create table if not exists income (
  id uuid default gen_random_uuid() primary key,
  client_id uuid,
  client_name text,
  amount_zar numeric default 0,
  amount_usd numeric default 0,
  date date not null,
  type text default 'Deposit',
  created_at timestamptz default now()
);

-- EXPENSES
create table if not exists expenses (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text default 'Other',
  amount_zar numeric default 0,
  amount_usd numeric default 0,
  date date not null,
  created_at timestamptz default now()
);

-- DOCUMENTS
create table if not exists documents (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  category text,
  type text default 'link',
  url text,
  content text,
  client_id uuid,
  created_at timestamptz default now()
);

-- SOPs
create table if not exists sops (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  category text default 'General',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- NOTIFICATIONS
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  message text,
  type text default 'info',
  read boolean default false,
  related_id uuid,
  created_at timestamptz default now()
);

-- SETTINGS
create table if not exists settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  display_name text default 'Mulanda',
  business_name text default 'Weblantive',
  theme text default 'Weblantive',
  dark_mode boolean default true,
  primary_color text default '#38BDF8',
  accent_color text default '#F472B6',
  revenue_goal_zar numeric default 0,
  revenue_goal_usd numeric default 0,
  pricing_starter_usd numeric default 350,
  pricing_standard_usd numeric default 500,
  pricing_premium_usd numeric default 700,
  payment_deposit integer default 40,
  payment_balance integer default 60,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY — Enable but allow all for single user app
-- ============================================================
alter table prospects enable row level security;
alter table clients enable row level security;
alter table tasks enable row level security;
alter table calendar_events enable row level security;
alter table income enable row level security;
alter table expenses enable row level security;
alter table documents enable row level security;
alter table sops enable row level security;
alter table notifications enable row level security;
alter table settings enable row level security;

-- Allow authenticated user full access to all tables
create policy "Allow all for authenticated" on prospects for all to authenticated using (true) with check (true);
create policy "Allow all for authenticated" on clients for all to authenticated using (true) with check (true);
create policy "Allow all for authenticated" on tasks for all to authenticated using (true) with check (true);
create policy "Allow all for authenticated" on calendar_events for all to authenticated using (true) with check (true);
create policy "Allow all for authenticated" on income for all to authenticated using (true) with check (true);
create policy "Allow all for authenticated" on expenses for all to authenticated using (true) with check (true);
create policy "Allow all for authenticated" on documents for all to authenticated using (true) with check (true);
create policy "Allow all for authenticated" on sops for all to authenticated using (true) with check (true);
create policy "Allow all for authenticated" on notifications for all to authenticated using (true) with check (true);
create policy "Allow all for authenticated" on settings for all to authenticated using (true) with check (true);

-- ============================================================
-- DONE! All tables created. Your database is ready.
-- ============================================================
