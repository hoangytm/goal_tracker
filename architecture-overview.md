# Goal Tracking App - Architecture Overview

## 1. Current State

This folder is the planning workspace for a small personal goal tracking web app.

No application source code exists yet. The current agreed direction is:

- Frontend: Vue 3 + Vite
- Hosting: GitHub Pages
- Backend-as-a-service: Supabase Free
- Database: Supabase Postgres
- Authentication: Supabase Auth
- Primary data persistence: Supabase database, not browser localStorage
- Local browser storage: optional cache/UI state only

The app tracks daily execution of personal goals:

- Learn English
- Study code
- Go to gym
- Learn soft skills

A day is considered successful when at least 3 of 4 goals are completed.

## 2. High-Level Architecture

```text
User Browser
  |
  | loads static app
  v
GitHub Pages
  |
  | serves Vue/Vite build output
  v
Vue 3 PWA Frontend
  |
  | Supabase JS SDK over HTTPS
  v
Supabase API Layer
  |
  | Auth + RLS policies
  v
Supabase Postgres
```

GitHub Pages only hosts static frontend assets. It does not run backend code.

Supabase provides the backend capabilities:

- Login/logout
- User session handling
- Database access API
- Row Level Security
- Data persistence
- Optional future realtime features

## 3. Frontend Architecture

The frontend should stay simple and single-purpose.

Suggested stack:

- Vue 3
- Vite
- TypeScript
- Vue Router with hash history for GitHub Pages compatibility
- Supabase JavaScript client
- Optional: Pinia only if shared state becomes hard to manage with composables
- Optional: vite-plugin-pwa after the core app works

Recommended initial screens:

- Today: daily input for the 4 goals
- History: calendar/list of previous days
- Stats: weekly progress, streak, goal completion rate
- Settings: goal targets and daily success threshold

For the first version, avoid complex dashboards, AI coaching, social features, or heavy gamification.

## 4. Hosting Architecture

GitHub Pages hosts the built frontend from Vite.

Build output:

```text
dist/
  index.html
  assets/*.js
  assets/*.css
  manifest.webmanifest
```

If the app is hosted at:

```text
https://github-username.github.io/repository-name/
```

Vite should use:

```ts
base: "/repository-name/"
```

Vue Router should use hash mode to avoid 404 on refresh:

```ts
createWebHashHistory()
```

This produces URLs like:

```text
https://github-username.github.io/repository-name/#/history
```

## 5. Backend And Data Architecture

There is no custom backend service in the initial architecture.

The frontend talks directly to Supabase through the Supabase client SDK. This does not mean the browser connects directly to Postgres credentials. The browser calls Supabase APIs, and Supabase enforces authentication and Row Level Security.

Minimal database model:

```text
goals
  id
  user_id
  name
  unit
  target_value
  color
  sort_order
  active
  created_at
  updated_at

daily_entries
  id
  user_id
  goal_id
  entry_date
  done
  value
  note
  created_at
  updated_at

user_settings
  user_id
  daily_success_threshold
  timezone
  created_at
  updated_at
```

Derived values should not be stored unless needed for performance:

- Daily score
- Successful day flag
- Streak
- Weekly completion rate

These can be calculated from `daily_entries`.

## 6. Security Model

The Supabase anon key can be public in the frontend bundle.

Security depends on:

- Enabling Row Level Security on all user-owned tables
- Ensuring users can only read/write rows where `auth.uid() = user_id`
- Never exposing Supabase service role key in frontend code
- Never exposing database password in frontend code
- Validating insert/update policies with `with check`

Example RLS rule concept:

```sql
auth.uid() = user_id
```

Every user-owned table should follow this rule.

## 7. Data Persistence Strategy

Supabase Postgres is the source of truth.

Browser localStorage should not be used as the primary storage because data can be lost when:

- Browser data is cleared
- User changes device
- User changes browser
- Private/incognito mode is used
- Browser profile is reset

Acceptable local storage usage:

- Theme preference
- Last selected tab
- Temporary draft before save
- Cached read-only data for UX improvement

## 8. Cost Overview

Initial expected monthly cost: USD 0.

Free components:

- GitHub Pages for static frontend hosting
- Supabase Free for Auth, Postgres, API

Optional paid items later:

- Custom domain: about USD 10-15/year
- Supabase Pro if free limits are exceeded
- Email/push notification provider if server-side reminders are required

## 9. Future Extension Points

Add later only if real usage proves the need:

- PWA install support
- Browser notification reminders
- Server-side scheduled reminders
- Data export/import
- Monthly review reports
- Goal templates
- Custom goals beyond the initial 4
- Custom backend service for complex business logic or integrations

## 10. Main Risks

Key risks:

- Overbuilding before daily usage habit is proven
- Incorrect RLS policies exposing user data
- GitHub Pages routing 404 if hash routing is not used
- Turning a simple tracker into a complex productivity platform
- Notification support differing by browser/device

Mitigation:

- Build the Today screen first
- Keep schema small
- Enforce RLS from day one
- Use hash routing on GitHub Pages
- Add features only after actual usage shows a need

## 11. Recommended MVP Boundary

MVP should include:

- Supabase login
- 4 default goals
- Today tracking form
- Done/value/note per goal
- Daily success rule: at least 3 of 4 goals completed
- Basic history
- Basic weekly summary

MVP should exclude:

- Custom backend
- Complex analytics
- AI features
- Social sharing
- Advanced gamification
- Multi-user collaboration
