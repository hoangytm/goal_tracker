-- =============================================================
-- Goal Tracker - Supabase Initial Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- =============================================================


-- =============================================================
-- HELPER: updated_at auto-update trigger function
-- =============================================================

create or replace function handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- =============================================================
-- TABLE: goals
-- =============================================================

create table if not exists goals (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users(id) on delete cascade,
  name          text        not null,
  unit          text        not null check (unit in ('minutes', 'times', 'boolean')),
  target_value  integer     not null default 1,
  color         text        not null default '#6366f1',
  sort_order    integer     not null default 0,
  active        boolean     not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists goals_user_active_idx
  on goals (user_id, active);

create trigger goals_updated_at
  before update on goals
  for each row execute function handle_updated_at();

-- RLS
alter table goals enable row level security;

create policy "goals: select own"
  on goals for select
  using (auth.uid() = user_id);

create policy "goals: insert own"
  on goals for insert
  with check (auth.uid() = user_id);

create policy "goals: update own"
  on goals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "goals: delete own"
  on goals for delete
  using (auth.uid() = user_id);


-- =============================================================
-- TABLE: daily_entries
-- =============================================================

create table if not exists daily_entries (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  goal_id     uuid        not null references goals(id) on delete cascade,
  entry_date  date        not null,
  done        boolean     not null default false,
  value       integer     not null default 0,
  note        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, goal_id, entry_date)
);

create index if not exists daily_entries_user_date_idx
  on daily_entries (user_id, entry_date);

create index if not exists daily_entries_user_goal_idx
  on daily_entries (user_id, goal_id);

create trigger daily_entries_updated_at
  before update on daily_entries
  for each row execute function handle_updated_at();

-- RLS
alter table daily_entries enable row level security;

create policy "daily_entries: select own"
  on daily_entries for select
  using (auth.uid() = user_id);

create policy "daily_entries: insert own"
  on daily_entries for insert
  with check (auth.uid() = user_id);

create policy "daily_entries: update own"
  on daily_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "daily_entries: delete own"
  on daily_entries for delete
  using (auth.uid() = user_id);


-- =============================================================
-- TABLE: user_settings
-- =============================================================

create table if not exists user_settings (
  user_id                   uuid        primary key references auth.users(id) on delete cascade,
  daily_success_threshold   integer     not null default 3,
  timezone                  text        not null default 'Asia/Ho_Chi_Minh',
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create trigger user_settings_updated_at
  before update on user_settings
  for each row execute function handle_updated_at();

-- RLS
alter table user_settings enable row level security;

create policy "user_settings: select own"
  on user_settings for select
  using (auth.uid() = user_id);

create policy "user_settings: insert own"
  on user_settings for insert
  with check (auth.uid() = user_id);

create policy "user_settings: update own"
  on user_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- =============================================================
-- VIEW: daily_summaries
-- Derived view, no stored data. Used for streak and calendar.
-- =============================================================

create or replace view daily_summaries as
select
  user_id,
  entry_date,
  count(*) filter (where done = true)  as goals_completed,
  count(*)                             as goals_total
from daily_entries
group by user_id, entry_date;


-- =============================================================
-- TRIGGER: seed default goals + settings for new user
-- Fires after a new row is inserted into auth.users
-- =============================================================

create or replace function seed_default_user_data()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Insert default settings
  insert into public.user_settings (user_id)
  values (new.id);

  -- Insert 4 default goals
  insert into public.goals (user_id, name, unit, target_value, color, sort_order)
  values
    (new.id, 'Learn English', 'minutes', 30, '#3b82f6', 1),
    (new.id, 'Study Code',    'minutes', 60, '#8b5cf6', 2),
    (new.id, 'Gym',           'times',   1,  '#22c55e', 3),
    (new.id, 'Soft Skills',   'minutes', 20, '#f59e0b', 4);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function seed_default_user_data();
