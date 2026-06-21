# 🎯 Goal Tracker

A beautiful, modern goal tracking PWA built with Vue 3, TypeScript, Tailwind CSS, and Supabase.

## ✨ Features

- **Fresh UI** - Sky/rose/mint color palette with smooth animations
- **Daily Tracking** - Check-in on goals with progress visualization
- **Goal Management** - Create, edit, delete, and reorder goals
- **Quick Actions** - Unit-aware quick-add buttons (+10/+20/+30 for minutes, +1/+2/+3 for times)
- **Statistics** - Track streaks, completion rates, and goal insights
- **PWA Support** - Install as app on mobile/desktop with offline support
- **Responsive** - Works on all devices

## 🚀 Live Demo

[Goal Tracker on GitHub Pages](https://hoangytm.github.io/goal_tracker)

## 🛠️ Tech Stack

- **Frontend**: Vue 3 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **PWA**: Workbox Service Worker
- **Deployment**: GitHub Pages + GitHub Actions

## 📦 Installation

```bash
npm install
```

## 🔧 Development

Create `.env.local` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Run dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## 📊 Database Schema

Tables:
- `goals` - User goals with sort order
- `daily_entries` - Daily goal values and notes
- `user_settings` - User preferences
- `daily_summaries` - Aggregated daily stats

Setup:
```bash
# Apply schema from supabase-schema.sql in Supabase SQL Editor
```

## 🚀 Deployment to GitHub Pages

1. Go to repo Settings → Pages
2. Under "Build and deployment", select:
   - **Source**: GitHub Actions
   - Keep default settings
3. Add GitHub Secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Push to `main` branch - deployment starts automatically

## 📝 Project Structure

```
├── src/
│   ├── components/    # Reusable components
│   ├── pages/        # Page components
│   ├── composables/  # Reusable logic
│   ├── lib/          # Libraries (Supabase)
│   ├── types/        # TypeScript types
│   └── style.css     # Global styles
├── .github/
│   └── workflows/    # GitHub Actions
└── public/           # Static assets
```

## 📄 License

MIT

---

**Made with ❤️**
