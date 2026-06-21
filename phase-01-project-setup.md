# Phase 01 - Project Setup

## Overview

- **Status:** Completed
- **Effort:** 2h
- **Goal:** Scaffold Vue 3 + Vite + TypeScript project inside `tracking_plan/`, configure router, Supabase client, path aliases, and base URL for GitHub Pages.

## Requirements

- Vue 3 with Composition API + `<script setup>`
- Vite build tool
- TypeScript strict mode
- Vue Router 4 with hash history
- `@supabase/supabase-js` client
- Tailwind CSS for styling
- ESLint + Prettier
- `.env.local` for Supabase credentials (gitignored)
- `vite.config.ts` with correct `base` for GitHub Pages

## File Changes

| File | Action | Notes |
|---|---|---|
| `tracking_plan/package.json` | Create | Via `npm create vite@latest` |
| `tracking_plan/vite.config.ts` | Create/Edit | Add base, path alias `@/` |
| `tracking_plan/tsconfig.json` | Create/Edit | Strict mode, path alias |
| `tracking_plan/src/lib/supabase.ts` | Create | Supabase client singleton |
| `tracking_plan/src/types/index.ts` | Create | Shared TS types |
| `tracking_plan/src/router/index.ts` | Create | HashRouter + routes |
| `tracking_plan/src/App.vue` | Create | Shell with `<RouterView>` |
| `tracking_plan/src/main.ts` | Create | App bootstrap |
| `tracking_plan/.env.example` | Create | Document required env vars |
| `tracking_plan/.gitignore` | Edit | Add `.env.local`, `dist/`, `node_modules/` |

## Key Decisions

**Why hash history?**
GitHub Pages cannot rewrite URLs — refresh on `/history` would 404. Hash router (`/#/history`) avoids this without a custom 404.html hack.

**Why Tailwind?**
Fast prototyping, no CSS file sprawl, responsive built-in, good for habit/card UI patterns.

## Scaffold Command

Run from workspace root:

```bash
cd tracking_plan
npm create vite@latest . -- --template vue-ts
npm install
npm install -D tailwindcss @tailwindcss/vite
npm install @supabase/supabase-js
npm install vue-router@4
npm install -D @types/node
```

## vite.config.ts

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/goal-tracker/',   // change to actual repo name
  plugins: [
    vue(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
```

## src/lib/supabase.ts

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## src/types/index.ts

```ts
export interface Goal {
  id: string
  user_id: string
  name: string
  unit: 'minutes' | 'times' | 'boolean'
  target_value: number
  color: string
  sort_order: number
  active: boolean
}

export interface DailyEntry {
  id: string
  user_id: string
  goal_id: string
  entry_date: string   // YYYY-MM-DD
  done: boolean
  value: number
  note: string | null
}

export interface UserSettings {
  user_id: string
  daily_success_threshold: number
  timezone: string
}

export interface DailySummary {
  user_id: string
  entry_date: string
  goals_completed: number
  goals_total: number
}
```

## src/router/index.ts

```ts
import { createRouter, createWebHashHistory } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/',         redirect: '/today' },
    { path: '/login',    component: () => import('@/pages/LoginPage.vue') },
    { path: '/today',    component: () => import('@/pages/TodayPage.vue'),   meta: { auth: true } },
    { path: '/history',  component: () => import('@/pages/HistoryPage.vue'), meta: { auth: true } },
    { path: '/stats',    component: () => import('@/pages/StatsPage.vue'),   meta: { auth: true } },
    { path: '/settings', component: () => import('@/pages/SettingsPage.vue'),meta: { auth: true } },
  ],
})

router.beforeEach(async (to) => {
  if (to.meta.auth) {
    const { data } = await supabase.auth.getSession()
    if (!data.session) return '/login'
  }
})

export default router
```

## .env.example

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Acceptance Criteria

- [x] `npm run dev` runs without errors
- [x] `npm run build` produces `dist/` with correct base path
- [x] Navigating to `/login` works in browser
- [x] Supabase client initializes without console errors
- [x] `.env.local` is gitignored
- [x] TypeScript compiles with zero errors
