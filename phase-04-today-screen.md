# Phase 04 - Today Screen

## Overview

- **Status:** Completed (code)
- **Effort:** 5h
- **Goal:** Core screen of the app. Show today's 4 goals, allow user to check done, enter value (minutes/times), add note. Calculate and display daily success score. Auto-save on change.

## Requirements

- Show today's date prominently
- Load user's active goals
- For each goal show:
  - Color indicator
  - Goal name
  - Target (e.g., "30 min", "1 time")
  - Done checkbox
  - Value input (number, unit-aware)
  - Note input (optional, short)
- Daily success indicator: `X / threshold goals completed`
- Day status badge: Success / In Progress / Failed
- Streak display: current consecutive successful days
- Auto-save or save-on-blur (not manual save button)
- Handle case where no entries exist yet for today (upsert)

## File Changes

| File | Action | Notes |
|---|---|---|
| `src/pages/TodayPage.vue` | Create | Main today view |
| `src/components/GoalCard.vue` | Create | Single goal card component |
| `src/components/StreakBadge.vue` | Create | Streak display |
| `src/composables/useGoals.ts` | Create | Load goals from Supabase |
| `src/composables/useEntries.ts` | Create | Load/upsert daily entries |
| `src/composables/useStreak.ts` | Create | Calculate streak from daily_summaries |

## useGoals.ts

```ts
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Goal } from '@/types'

export function useGoals() {
  const goals = ref<Goal[]>([])
  const loading = ref(false)

  async function fetchGoals() {
    loading.value = true
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('active', true)
      .order('sort_order')
    if (!error) goals.value = data ?? []
    loading.value = false
  }

  return { goals, loading, fetchGoals }
}
```

## useEntries.ts

```ts
// Key functions:
// fetchTodayEntries(date: string): load entries for today
// upsertEntry(goalId, done, value, note): insert or update
// getTodayDate(): return YYYY-MM-DD in user's timezone
```

**Upsert pattern** (prevent duplicate on double-click or re-entry):
```ts
await supabase
  .from('daily_entries')
  .upsert(
    { user_id, goal_id, entry_date, done, value, note },
    { onConflict: 'user_id,goal_id,entry_date' }
  )
```

## useStreak.ts

Query `daily_summaries` view descending by date. Walk back from yesterday, count consecutive days where `goals_completed >= threshold`. Stop at first failure.

Today is excluded from streak (day in progress).

```ts
// Algorithm:
// 1. Fetch daily_summaries ordered by entry_date desc, limit 60
// 2. Start from yesterday, count consecutive successful days
// 3. Return streak count
```

## GoalCard.vue Design

```
┌──────────────────────────────────────────┐
│ ● Learn English          Target: 30 min  │
│                                           │
│  [✓] Done    [ 45 ] min                  │
│  Note: listened podcast                   │
└──────────────────────────────────────────┘
```

- Color dot = `goal.color`
- Done checkbox toggles `done` and triggers upsert
- Value input: number, triggers upsert on blur
- Note: text input, triggers upsert on blur
- Visual: checked state changes card background slightly

## TodayPage.vue Layout

```
Saturday, 21 June 2026

🔥 Streak: 5 days

[GoalCard] English   ✓
[GoalCard] Code      ✓
[GoalCard] Gym       ✗
[GoalCard] Soft Skill ✓

3/4 goals completed
✅ Successful Day
```

## Daily Score Logic

```ts
const threshold = userSettings.daily_success_threshold  // default 3
const completed = entries.filter(e => e.done).length
const isSuccess = completed >= threshold
```

## Acceptance Criteria

- [x] Today page implemented with timezone-aware date rendering
- [x] Active goals + entries + settings loading flow implemented
- [x] Done toggle, value blur, note blur all use upsert by `(user_id, goal_id, entry_date)`
- [x] Daily score and status badge logic implemented (`completed >= threshold`)
- [x] Current streak logic implemented (excluding today)
- [x] Loading skeleton state implemented
- [x] Local technical test passed: `npm run typecheck`, `npm run build`
- [ ] Manual runtime verification in browser with real account data
