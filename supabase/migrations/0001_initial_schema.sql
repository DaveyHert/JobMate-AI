-- ============================================================================
-- JobMate — Initial Schema
-- Migration: 0001_initial_schema.sql
-- ============================================================================
-- Covers: profiles, subscriptions, usage, applications, tasks, calendar_events
-- Includes: enums, RLS, auto-provisioning trigger, updated_at triggers, indexes
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. ENUMS
-- ----------------------------------------------------------------------------

create type public.subscription_status as enum (
  'free', 'active', 'cancelled', 'past_due', 'trialing'
);

create type public.subscription_plan as enum (
  'free', 'pro'
);

create type public.application_status as enum (
  'saved', 'applied', 'interviewing', 'offer', 'rejected', 'ghosted', 'withdrawn'
);

create type public.event_type as enum (
  'interview', 'follow_up', 'deadline', 'other'
);


-- ----------------------------------------------------------------------------
-- 2. SHARED HELPER: updated_at trigger function
-- ----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ----------------------------------------------------------------------------
-- 3. PROFILES — thin wrapper over auth.users
-- ----------------------------------------------------------------------------

create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();


-- ----------------------------------------------------------------------------
-- 4. SUBSCRIPTIONS — Stripe state (user-read, service-role-write)
-- ----------------------------------------------------------------------------

create table public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null unique references auth.users(id) on delete cascade,
  status                 public.subscription_status not null default 'free',
  plan                   public.subscription_plan   not null default 'free',
  stripe_customer_id     text,
  stripe_subscription_id text,
  current_period_end     timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index subscriptions_stripe_customer_id_idx
  on public.subscriptions(stripe_customer_id);

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.set_updated_at();


-- ----------------------------------------------------------------------------
-- 5. USAGE — per-user monthly counters (user-read, service-role-write)
-- ----------------------------------------------------------------------------

create table public.usage (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  month       date not null, -- first day of the month, e.g. 2026-04-01
  llm_calls   integer not null default 0,
  tokens_used bigint  not null default 0,
  updated_at  timestamptz not null default now(),
  unique(user_id, month)
);

create index usage_user_month_idx
  on public.usage(user_id, month desc);

create trigger usage_updated_at
  before update on public.usage
  for each row execute procedure public.set_updated_at();


-- ----------------------------------------------------------------------------
-- 6. APPLICATIONS — core job tracker
-- ----------------------------------------------------------------------------

create table public.applications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  job_title       text not null,
  company         text not null,
  job_url         text,
  job_description text,
  location        text,
  salary_range    text,
  source          text, -- e.g. 'linkedin', 'indeed', 'manual'
  status          public.application_status not null default 'saved',
  applied_at      timestamptz,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index applications_user_status_idx
  on public.applications(user_id, status);

create index applications_user_created_idx
  on public.applications(user_id, created_at desc);

create trigger applications_updated_at
  before update on public.applications
  for each row execute procedure public.set_updated_at();


-- ----------------------------------------------------------------------------
-- 7. TASKS — todos, optionally tied to an application
-- ----------------------------------------------------------------------------

create table public.tasks (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete cascade,
  title          text not null,
  description    text,
  due_at         timestamptz,
  completed_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index tasks_user_due_idx
  on public.tasks(user_id, due_at);

create index tasks_application_idx
  on public.tasks(application_id);

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute procedure public.set_updated_at();


-- ----------------------------------------------------------------------------
-- 8. CALENDAR EVENTS — interviews, follow-ups, deadlines
-- ----------------------------------------------------------------------------

create table public.calendar_events (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  title          text not null,
  event_type     public.event_type not null default 'other',
  starts_at      timestamptz not null,
  ends_at        timestamptz,
  location       text,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index calendar_events_user_starts_idx
  on public.calendar_events(user_id, starts_at);

create index calendar_events_application_idx
  on public.calendar_events(application_id);

create trigger calendar_events_updated_at
  before update on public.calendar_events
  for each row execute procedure public.set_updated_at();


-- ----------------------------------------------------------------------------
-- 9. AUTO-PROVISION trigger: create profile + subscription on signup
-- ----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );

  insert into public.subscriptions (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ----------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------

alter table public.profiles        enable row level security;
alter table public.subscriptions   enable row level security;
alter table public.usage           enable row level security;
alter table public.applications    enable row level security;
alter table public.tasks           enable row level security;
alter table public.calendar_events enable row level security;

-- PROFILES: users can read + update their own row (no insert/delete — trigger handles that)
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- SUBSCRIPTIONS: read-only for users; writes come from service_role (Stripe webhook)
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- USAGE: read-only for users; writes come from service_role (Edge Functions)
create policy "usage_select_own"
  on public.usage for select
  using (auth.uid() = user_id);

-- APPLICATIONS: full CRUD on own rows
create policy "applications_select_own"
  on public.applications for select
  using (auth.uid() = user_id);

create policy "applications_insert_own"
  on public.applications for insert
  with check (auth.uid() = user_id);

create policy "applications_update_own"
  on public.applications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "applications_delete_own"
  on public.applications for delete
  using (auth.uid() = user_id);

-- TASKS: full CRUD on own rows
create policy "tasks_select_own"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "tasks_insert_own"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "tasks_update_own"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "tasks_delete_own"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- CALENDAR EVENTS: full CRUD on own rows
create policy "calendar_events_select_own"
  on public.calendar_events for select
  using (auth.uid() = user_id);

create policy "calendar_events_insert_own"
  on public.calendar_events for insert
  with check (auth.uid() = user_id);

create policy "calendar_events_update_own"
  on public.calendar_events for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "calendar_events_delete_own"
  on public.calendar_events for delete
  using (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- END OF MIGRATION
-- ----------------------------------------------------------------------------
