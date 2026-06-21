# Phase 07 - PWA + Deploy to GitHub Pages

## Overview

- **Status:** Completed (local)
- **Effort:** 2h
- **Goal:** Add PWA support (installable on mobile, offline shell), configure GitHub Actions for auto-deploy to GitHub Pages on push to main, set production env vars.

## Requirements

- PWA manifest with icons
- Service worker caching static assets (app shell only, not data)
- Installable on iOS/Android home screen
- GitHub Actions workflow: `npm run build` → deploy `dist/` to `gh-pages` branch
- Production `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set as GitHub Secrets
- Supabase Auth redirect URL updated to production GitHub Pages URL

## File Changes

| File | Action | Notes |
|---|---|---|
| `vite.config.ts` | Edit | Add vite-plugin-pwa |
| `public/icons/` | Create | App icons (192x192, 512x512 PNG) |
| `.github/workflows/deploy.yml` | Create | GitHub Actions deploy workflow |

## Install PWA Plugin

```bash
npm install -D vite-plugin-pwa
```

## vite.config.ts additions

```ts
import { VitePWA } from 'vite-plugin-pwa'

// add to plugins array:
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
  },
  manifest: {
    name: 'Goal Tracker',
    short_name: 'Goals',
    description: 'Daily goal tracking',
    theme_color: '#6366f1',
    background_color: '#ffffff',
    display: 'standalone',
    start_url: '/goal-tracker/',
    scope: '/goal-tracker/',
    icons: [
      { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
})
```

## .github/workflows/deploy.yml

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: tracking_plan/package-lock.json

      - name: Install dependencies
        working-directory: tracking_plan
        run: npm ci

      - name: Build
        working-directory: tracking_plan
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: tracking_plan/dist
```

## GitHub Repository Setup

1. Go to GitHub → repo → Settings → Secrets and variables → Actions
2. Add secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Go to Settings → Pages → Source: Deploy from branch → `gh-pages` / `/ (root)`

## Supabase Auth URL Update

After GitHub Pages URL is known (e.g., `https://username.github.io/goal-tracker`):

1. Supabase Dashboard → Authentication → URL Configuration
2. Site URL: `https://username.github.io/goal-tracker`
3. Redirect URLs: add `https://username.github.io/goal-tracker`

## App Icons

Simple approach: generate icons from any online PWA icon generator or use a solid color + letter.
Minimum required: `icon-192.png` and `icon-512.png` in `public/icons/`.

## Acceptance Criteria

- [x] `vite-plugin-pwa` configured in `vite.config.ts`
- [x] Manifest + workbox generation working (`manifest.webmanifest`, `sw.js` built)
- [x] PNG icons created (`public/icons/icon-192.png`, `public/icons/icon-512.png`)
- [x] GitHub Actions workflow created (`.github/workflows/deploy.yml`)
- [x] Local build validation passed with PWA output
- [ ] Push to `main` triggers workflow and deploy verification
- [ ] Production URL, login redirect URL, mobile install validation
