# Phase 02 - Supabase Setup

## Overview

- **Status:** Completed
- **Effort:** 1h
- **Goal:** Create Supabase project, run schema migration, verify RLS policies, confirm default seed trigger works.

## Requirements

- Supabase project created in supabase.com
- Schema from `supabase-schema.sql` deployed successfully
- RLS enabled and working on all 3 tables
- Seed trigger inserts 4 goals + settings on new user creation
- Anon key and project URL available for `.env.local`

## Steps

### 1. Create Supabase Project

1. Go to https://supabase.com/dashboard
2. New project → set project name, password, region (Singapore is closest)
3. Wait for project to provision (~2 min)
4. Go to Project Settings → API → copy `Project URL` and `anon public` key

### 2. Deploy Schema

1. Go to SQL Editor in Supabase Dashboard
2. Paste entire content of `tracking_plan/supabase-schema.sql`
3. Click Run
4. Verify no errors

### 3. Verify Tables

In Table Editor, confirm these tables exist:
- `goals`
- `daily_entries`
- `user_settings`

And view:
- `daily_summaries`

### 4. Verify RLS

In each table → Policies tab, confirm policies exist:
- `select own`, `insert own`, `update own`, `delete own` for `goals` and `daily_entries`
- `select own`, `insert own`, `update own` for `user_settings`

### 5. Verify Seed Trigger

1. Create a test user via Supabase Auth Dashboard (Authentication → Users → Invite user or signup)
2. Check Table Editor → goals → filter by that user_id
3. Should see 4 rows: Learn English, Study Code, Gym, Soft Skills
4. Check user_settings → should see 1 row for that user

### 6. Configure .env.local

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## RLS Verification Queries

Run these in SQL Editor to confirm RLS works (should return 0 rows when called as anon/unauthenticated):

```sql
-- Should return 0 rows without auth context
select * from goals;
select * from daily_entries;
select * from user_settings;
```

## Auth Configuration

In Supabase Dashboard → Authentication → Providers:
- Enable **Email** provider (default)
- Optionally disable email confirmation for dev convenience (turn back on for prod)

In Authentication → URL Configuration:
- Site URL: `https://your-github-username.github.io/goal-tracker`
- Redirect URLs: add same URL + `http://localhost:5173` for dev

## Acceptance Criteria

- [x] Supabase project is live
- [x] All 3 tables exist with correct columns
- [x] RLS enabled on all 3 tables with correct policies
- [x] `daily_summaries` view exists
- [x] Seed trigger exists on `auth.users` (`on_auth_user_created`)
- [ ] Seed row insertion validated by creating a test user (do this in Phase 3 auth testing)
- [x] `.env.local` populated with real URL and anon key
- [x] `npm run dev` starts cleanly with Supabase env configured
