# Phase 06 - Settings

## Overview

- **Status:** Completed (code)
- **Effort:** 2h
- **Goal:** Let user configure goal names, targets, colors, daily success threshold, and timezone. No new tables — updates existing `goals` and `user_settings` rows.

## Requirements

- Edit goal name, target value, unit, color per goal
- Toggle goal active/inactive (soft disable, preserves history)
- Change daily success threshold (1–4)
- Change timezone (IANA string, dropdown of common timezones)
- Save on submit, show success/error feedback
- No goal creation/deletion in MVP — only edit existing 4

## File Changes

| File | Action | Notes |
|---|---|---|
| `src/pages/SettingsPage.vue` | Create | Settings form |

## SettingsPage.vue Sections

### Goals Settings

For each goal (sorted by sort_order):

```
[●] Learn English    [30] min    [color picker]   [Active ▼]
[●] Study Code       [60] min    [color picker]   [Active ▼]
[●] Gym              [1]  times  [color picker]   [Active ▼]
[●] Soft Skills      [20] min    [color picker]   [Active ▼]

[Save Goals]
```

Fields per goal:
- Name: text input
- Target value: number input
- Color: color input type="color"
- Active: toggle

### App Settings

```
Daily success goal: [3] out of 4

Timezone: [Asia/Ho_Chi_Minh ▼]

[Save Settings]
```

## Timezone Dropdown

Provide a curated list of ~10 common timezones instead of full IANA list:

```ts
const timezones = [
  'Asia/Ho_Chi_Minh',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Kolkata',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'UTC',
]
```

## Save Logic

Goals: iterate changed goals, update each with:

```ts
supabase.from('goals').update({ name, target_value, color, active }).eq('id', goal.id)
```

Settings:

```ts
supabase.from('user_settings').update({ daily_success_threshold, timezone }).eq('user_id', userId)
```

## Acceptance Criteria

- [x] Goal list + settings loading implemented
- [x] Goal update form implemented: name, target, unit, color, active
- [x] Settings form implemented: threshold, timezone
- [x] Save actions implemented for goals and user settings
- [x] Success/error feedback implemented
- [x] Local technical test passed: `npm run typecheck`, `npm run build`
- [ ] Manual runtime verification: persistence across refresh and Today page behavior with active toggle
