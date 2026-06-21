---
title: "Personal Goal Tracker - Vue 3 + Supabase PWA"
description: "Daily habit tracking web app with Vue 3, Supabase Postgres, hosted on GitHub Pages"
status: in-progress
priority: P2
effort: 18h
branch: feature/goal-tracker
tags: [feature, frontend, database, auth, pwa]
created: 2026-06-21
impacted-areas:
  - tracking_plan/src
  - tracking_plan/supabase-schema.sql
---

# Personal Goal Tracker - Implementation Plan

## Overview

Single-user PWA to track 4 daily personal goals: English, Code, Gym, Soft Skills.
Stack: Vue 3 + Vite + TypeScript → GitHub Pages. Backend: Supabase Free (Auth + Postgres).
A day is successful when ≥ 3/4 goals are completed.

## Phases

| # | Phase | Status | Effort | Link |
|---|-------|--------|--------|------|
| 1 | Project Setup | Completed | 2h | [phase-01](./phase-01-project-setup.md) |
| 2 | Supabase Setup | Completed | 1h | [phase-02-supabase-setup.md](./phase-02-supabase-setup.md) |
| 3 | Auth | Completed (code) | 2h | [phase-03-auth.md](./phase-03-auth.md) |
| 4 | Today Screen | Completed (code) | 5h | [phase-04-today-screen.md](./phase-04-today-screen.md) |
| 5 | History & Stats | Completed (code) | 4h | [phase-05-history-stats.md](./phase-05-history-stats.md) |
| 6 | Settings | Completed (code) | 2h | [phase-06-settings.md](./phase-06-settings.md) |
| 7 | PWA + Deploy | Completed (local) | 2h | [phase-07-pwa-deploy.md](./phase-07-pwa-deploy.md) |

## Dependencies

- Supabase project created before Phase 3
- `supabase-schema.sql` deployed before Phase 3
- Phase 4 (Today) blocks Phase 5 (History) — need entries to exist
- Phase 7 (Deploy) last — requires all screens functional

## App Directory Structure (target)

```
tracking_plan/
  src/
    assets/
    components/
      GoalCard.vue
      DayBadge.vue
      StreakBadge.vue
    composables/
      useGoals.ts
      useEntries.ts
      useStreak.ts
      useAuth.ts
    lib/
      supabase.ts
    pages/
      LoginPage.vue
      TodayPage.vue
      HistoryPage.vue
      StatsPage.vue
      SettingsPage.vue
    router/
      index.ts
    types/
      index.ts
    App.vue
    main.ts
  public/
    icons/
  index.html
  vite.config.ts
  tsconfig.json
  package.json
  .env.local         (gitignored)
  .env.example
```

## Risks

| Risk | Mitigation |
|---|---|
| GitHub Pages 404 on refresh | Use HashRouter |
| RLS misconfigured = data leak | Test RLS before any UI work |
| Supabase trigger fails silently | Verify seed data after first signup |
| Timezone edge case on entry_date | Always resolve date client-side with user timezone |
| Overbuilding before usage proven | Strictly follow MVP boundary per phase |
