# Phase 03 - Auth

## Overview

- **Status:** Completed (code)
- **Effort:** 2h
- **Goal:** Login/logout flow using Supabase Auth. Simple email/password. Guard all private routes. Show user email in nav. Handle session persistence on refresh.

## Requirements

- Email + password login via Supabase Auth
- Route guard: unauthenticated users redirected to `/login`
- Authenticated users redirected away from `/login` to `/today`
- Session persists across browser refresh
- Logout clears session and redirects to `/login`
- Auth state reactive throughout app

## File Changes

| File | Action | Notes |
|---|---|---|
| `src/composables/useAuth.ts` | Create | Auth state, login, logout, session watch |
| `src/pages/LoginPage.vue` | Create | Email/password form |
| `src/App.vue` | Edit | Nav with user email + logout button |
| `src/router/index.ts` | Edit | Auth guard already added in Phase 1, verify works |

## src/composables/useAuth.ts

```ts
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const user = ref<User | null>(null)

export function useAuth() {
  onMounted(async () => {
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null
  })

  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null
  })

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signup(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  return { user, login, signup, logout }
}
```

## LoginPage.vue

- Email input
- Password input
- Login button
- Toggle to signup mode
- Error message display
- Loading state on submit

Simple layout, no social login in MVP.

## App.vue Nav

- Show user email when logged in
- Logout button
- Navigation links: Today / History / Stats / Settings
- Hide nav when on `/login`

## Acceptance Criteria

- [x] Email/password auth UI implemented (login + signup toggle)
- [x] Wrong credentials path handled with inline error message
- [x] Route guard redirects unauthenticated users to `/login`
- [x] Route guard redirects authenticated users away from `/login` to `/today`
- [x] Logged-in user sees nav and email in top bar
- [x] Logout clears session and redirects to `/login`
- [ ] Manual browser verification: signup, login, refresh persistence on protected routes
