# Database Design

## Tables

### goals

Stores the user's personal goals. Each user starts with 4 default goals seeded on first login.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | |
| user_id | uuid | NOT NULL, FK auth.users ON DELETE CASCADE | |
| name | text | NOT NULL | Goal display name |
| unit | text | NOT NULL, CHECK in ('minutes','times','boolean') | How value is measured |
| target_value | integer | NOT NULL, default 1 | Daily target |
| color | text | NOT NULL, default '#6366f1' | Hex color for UI |
| sort_order | integer | NOT NULL, default 0 | Display order |
| active | boolean | NOT NULL, default true | Soft delete/disable |
| created_at | timestamptz | NOT NULL, default now() | |
| updated_at | timestamptz | NOT NULL, default now() | Auto-updated by trigger |

### daily_entries

One record per user per goal per day. UNIQUE constraint prevents duplicate entries.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | |
| user_id | uuid | NOT NULL, FK auth.users ON DELETE CASCADE | Denormalized for RLS simplicity |
| goal_id | uuid | NOT NULL, FK goals ON DELETE CASCADE | |
| entry_date | date | NOT NULL | Local date in user's timezone |
| done | boolean | NOT NULL, default false | Whether goal was completed |
| value | integer | NOT NULL, default 0 | Minutes/times/0-1 |
| note | text | | Optional short note |
| created_at | timestamptz | NOT NULL, default now() | |
| updated_at | timestamptz | NOT NULL, default now() | Auto-updated by trigger |
| UNIQUE | (user_id, goal_id, entry_date) | | Prevents duplicate daily entry |

### user_settings

One row per user. user_id is also the PK.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| user_id | uuid | PK, FK auth.users ON DELETE CASCADE | |
| daily_success_threshold | integer | NOT NULL, default 3 | Min goals to count day as success |
| timezone | text | NOT NULL, default 'Asia/Ho_Chi_Minh' | IANA timezone string |
| created_at | timestamptz | NOT NULL, default now() | |
| updated_at | timestamptz | NOT NULL, default now() | Auto-updated by trigger |

## Views

### daily_summaries

Read-only view. No need to store derived data. Calculates per-day completion from entries.

```sql
user_id, entry_date, goals_completed, goals_total
```

Used for:
- Streak calculation
- Calendar coloring (pass/fail)
- Weekly/monthly reports

## ERD

```text
auth.users (Supabase managed)
    |
    |-- 1:1 --> user_settings
    |-- 1:N --> goals
    |-- 1:N --> daily_entries
                    |
                    N:1 --> goals
```

## Design Decisions

**Why `user_id` on `daily_entries` instead of just `goal_id`?**

RLS is simpler and more secure. `auth.uid() = user_id` can be applied directly without a join to `goals`. A JOIN-based policy is valid but adds complexity and a potential policy bug surface.

**Why `entry_date` as `date` not `timestamptz`?**

Goals are daily habits tracked per calendar day in the user's timezone. Storing as `date` means the frontend resolves timezone before storing, not the database. Keeps queries simple: `entry_date = '2026-06-21'`.

**Why `unit` as text enum not a separate lookup table?**

Three possible values (`minutes`, `times`, `boolean`) will not change. A lookup table is YAGNI.

**Why no `daily_summaries` stored table?**

The data volume for a personal app is tiny. A view calculated from `daily_entries` is fast enough and avoids sync bugs between raw data and aggregates.

**Why `active` on goals instead of hard delete?**

Deleting a goal would cascade-delete historical entries. Soft-disable with `active = false` preserves history for the stats screen.

**Why seed 4 default goals via trigger on user creation?**

Ensures every new user has goals to track from first login without a frontend round-trip. Users can rename, recolor, or deactivate defaults. They do not need to create goals from scratch.

## Indexes

| Table | Columns | Reason |
|---|---|---|
| daily_entries | (user_id, entry_date) | Most frequent query: load today's entries |
| daily_entries | (user_id, goal_id) | Goal-specific history |
| goals | (user_id, active) | Load active goals per user |

## RLS Summary

All three user-owned tables use the same rule:

```sql
auth.uid() = user_id
```

Enforced for SELECT, INSERT, UPDATE, DELETE on each table.

`user_id` in INSERT is always bound to `auth.uid()` via `with check`.

The Supabase `anon` key used in the frontend is safe to expose because RLS prevents any cross-user data access.

## Default Goals Seed Data

Seeded per new user via a Postgres trigger on `auth.users` insert:

| name | unit | target_value | color | sort_order |
|---|---|---|---|---|
| Learn English | minutes | 30 | #3b82f6 | 1 |
| Study Code | minutes | 60 | #8b5cf6 | 2 |
| Gym | times | 1 | #22c55e | 3 |
| Soft Skills | minutes | 20 | #f59e0b | 4 |

And a `user_settings` row with timezone `Asia/Ho_Chi_Minh` and threshold `3`.
