# Phase 05 - History & Stats

## Overview

- **Status:** Completed (code)
- **Effort:** 4h
- **Goal:** Two sub-screens — History (calendar/list of past days) and Stats (streak, weekly completion rate, per-goal breakdown). Both read from existing data, no new writes.

## Requirements

### History Screen
- Calendar view of past 30 days
- Each day: colored badge (green = success, red = fail, grey = no data)
- Click a day → expand to show that day's goal entries
- Lazy load: default show current month

### Stats Screen
- Current streak
- Longest streak ever
- Last 7 days success rate (e.g., 5/7 days)
- Last 30 days success rate
- Per-goal completion rate (last 30 days): which goal do I skip most?
- Total successful days

## File Changes

| File | Action | Notes |
|---|---|---|
| `src/pages/HistoryPage.vue` | Create | Calendar + day detail |
| `src/pages/StatsPage.vue` | Create | Summary cards + goal breakdown |
| `src/components/DayBadge.vue` | Create | Calendar cell component |
| `src/composables/useHistory.ts` | Create | Fetch summaries + entries for date range |

## useHistory.ts

```ts
// fetchMonthlySummaries(year, month): get daily_summaries for that month
// fetchDayEntries(date): get full entries with goal names for a specific day
// fetchLongestStreak(): compute from all daily_summaries

// Query daily_summaries view:
// supabase.from('daily_summaries').select('*').gte('entry_date', start).lte('entry_date', end)
```

## DayBadge.vue

Small calendar cell:

```
┌───┐   ┌───┐   ┌───┐
│21 │   │22 │   │23 │
│ ✅│   │ ❌│   │   │
└───┘   └───┘   └───┘
success  fail   no data
```

Color logic:
- `goals_completed >= threshold` → green
- `goals_total > 0 && goals_completed < threshold` → red
- `goals_total === 0` → grey (no data)

## History Page Layout

```
← June 2026  →

Mo Tu We Th Fr Sa Su
       1  2  3  4  5
 6  7  8  9 10 11 12
13 14 15 16 17 18 19
20 [21]22 23 24 25 26
27 28 29 30

[Clicked day expands below]
21 June — 3/4 ✅
  • English  ✓ 45 min
  • Code     ✓ 90 min
  • Gym      ✗
  • Soft     ✓ 20 min
```

## Stats Page Layout

```
🔥 Current streak: 5 days
🏆 Longest streak: 12 days

Last 7 days:   5/7 (71%)
Last 30 days: 18/30 (60%)
Total success: 34 days

— Goal Completion (last 30 days) —
English    ████████░░  80%
Code       ██████░░░░  60%
Gym        ████░░░░░░  40%  ← most skipped
Soft Skills██████████  95%
```

Progress bar per goal = simple div width percentage, no chart lib needed.

## Stats Queries

```ts
// Last 7 days success rate
supabase
  .from('daily_summaries')
  .select('entry_date, goals_completed, goals_total')
  .gte('entry_date', sevenDaysAgo)
  .order('entry_date', { ascending: false })

// Per-goal completion last 30 days
supabase
  .from('daily_entries')
  .select('goal_id, done')
  .gte('entry_date', thirtyDaysAgo)
```

Then group by `goal_id` in JavaScript.

## Acceptance Criteria

- [x] History calendar for current month implemented
- [x] Day color logic implemented using threshold + summary status
- [x] Click day loads that day entries detail
- [x] Prev/next month navigation implemented
- [x] Stats screen implemented: current streak, longest streak, 7/30 rates, total successful days
- [x] Per-goal completion bars (last 30 days) implemented
- [x] Monthly/day cache added in `useHistory` composable
- [x] Local technical test passed: `npm run typecheck`, `npm run build`
- [ ] Manual browser verification with seeded historical data
