# UI Design System — Goal Tracker

## Style: Neubrutalism

Lý do chọn:
- WCAG AAA accessibility
- Performance xuất sắc
- Tailwind 10/10
- Bold, cá tính, không generic
- Card-based layout rất hợp habit tracking
- Trending mạnh trong Gen Z product design

Anti-pattern cần tránh: Gen Z Chaos/Maximalism — accessibility kém, performance nặng, không hợp daily-use app.

---

## Color Palette

| Role | Hex | Dùng cho |
|---|---|---|
| Background | `#FAFAFA` | Page background |
| Surface (Card) | `#FFFFFF` | Goal cards, modals |
| Border | `#000000` | Card borders, inputs — 2px solid |
| Hard Shadow | `4px 4px 0 #000` | Neubrutalism signature shadow |
| Primary / CTA | `#2563EB` | Buttons, active states, links |
| Success | `#22C55E` | Done goals, pass day badge |
| Danger | `#EF4444` | Failed day, error state |
| Streak Yellow | `#FFDE59` | Streak badge, highlight |
| Text Primary | `#09090B` | Body text |
| Text Muted | `#52525B` | Secondary labels, notes |

---

## Typography

Font pairing: **Caveat + Quicksand** — handwritten heading + friendly body, phù hợp personal habit tracker.

```css
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Quicksand:wght@400;500;600;700&display=swap');
```

| Element | Font | Weight | Size |
|---|---|---|---|
| App name / big heading | Caveat | 700 | 2rem+ |
| Today date | Caveat | 600 | 1.5rem |
| Streak number | Caveat | 700 | 3rem |
| Goal name | Quicksand | 600 | 1rem |
| Body / inputs / labels | Quicksand | 400–500 | 1rem |
| Muted note text | Quicksand | 400 | 0.875rem |

---

## Component Design

### Goal Card

```
┌─────────────────────────────────────────┐  border: 2px solid #000
│  ● Learn English        30 min target   │  box-shadow: 4px 4px 0 #000
│                                         │  background: #FFFFFF
│  [✓] Done   [  45  ] min               │
│  Note: ___________________________      │
└─────────────────────────────────────────┘
```

State — done = true:
```
background: #DCFCE7
border-color: #22C55E
box-shadow: 4px 4px 0 #22C55E
```

### Streak Badge

```
background: #FFDE59
border: 2px solid #000
box-shadow: 3px 3px 0 #000
font: Caveat 700
```

### Day Status Banner

| State | Background | Text | Shadow |
|---|---|---|---|
| Success | `#22C55E` | white | `4px 4px 0 #000` |
| In Progress | `#FBBF24` | `#000` | `4px 4px 0 #000` |
| Failed | `#EF4444` | white | `4px 4px 0 #000` |

### Primary Button

```css
background: #2563EB;
color: white;
border: 2px solid #000;
box-shadow: 4px 4px 0 #000;
border-radius: 0;        /* sharp corners */
cursor: pointer;
transition: all 100ms ease;

/* Hover / Active */
transform: translate(2px, 2px);
box-shadow: 2px 2px 0 #000;
```

---

## Micro-interactions

| Interaction | Behavior |
|---|---|
| Check goal done | Card bg transition 200ms + checkmark scale-in |
| Save value | Input blur → brief border flash green |
| Loading state | Skeleton pulse on goal cards |
| Button submit | Disable + spinner, prevent double tap |
| Day success reached | One-shot celebrate animation (không loop) |
| Streak milestone | `navigator.vibrate(50)` on mobile |

Rule: **continuous animation chỉ dùng cho loading spinner**, không animate-bounce/pulse cho decoration.

---

## Layout — Mobile First

App chủ yếu dùng trên điện thoại.

```
Max-width:       480px (centered trên desktop)
Card padding:    16px
Gap giữa cards: 12px
Touch target:    min 44x44px (checkbox, inputs)
Font size body:  16px minimum
```

Today Page trên mobile:

```
┌──────────────────────┐
│  Thứ 7, 21/6/2026    │  Caveat 600 1.5rem
│  [streak badge]      │
├──────────────────────┤
│  [GoalCard English]  │
│  [GoalCard Code]     │
│  [GoalCard Gym]      │
│  [GoalCard Soft]     │
├──────────────────────┤
│  3/4 — Ngày thành    │  success banner
│  công                │
└──────────────────────┘
```

---

## Tailwind Config

```ts
// tailwind.config.ts
theme: {
  extend: {
    fontFamily: {
      display: ['Caveat', 'cursive'],
      body: ['Quicksand', 'sans-serif'],
    },
    boxShadow: {
      'neo':         '4px 4px 0 #000000',
      'neo-sm':      '2px 2px 0 #000000',
      'neo-success': '4px 4px 0 #22C55E',
    },
    colors: {
      streak: '#FFDE59',
    },
  },
}
```

---

## Icons

Dùng **Lucide Vue** — không dùng emoji làm icon.

```bash
npm install lucide-vue-next
```

```vue
<script setup>
import { Flame, CheckCircle, Target, Settings } from 'lucide-vue-next'
</script>
```

---

## Vue Guidelines

- Dùng `<script setup>` cho tất cả components
- Shared state (user, goals, settings) → Pinia store
- Per-page data → composables (`useGoals`, `useEntries`, `useStreak`)
- Routing → `useRouter()` / `useRoute()` trong setup

---

## Pre-delivery Checklist

### Visual
- [ ] Không dùng emoji làm icon — dùng Lucide Vue SVG
- [ ] Card border `2px solid #000` visible ở mọi state
- [ ] Hard shadow `4px 4px 0 #000` nhất quán
- [ ] Caveat chỉ cho heading/numbers, Quicksand cho body

### Interaction
- [ ] `cursor-pointer` trên card, button, checkbox
- [ ] Hover/active transition 100–200ms
- [ ] Button disabled + spinner khi đang submit
- [ ] No layout shift khi hover

### Contrast & Accessibility
- [ ] Light mode text contrast ≥ 4.5:1
- [ ] Focus ring visible cho keyboard nav
- [ ] Color không phải indicator duy nhất (dùng cả icon + text)
- [ ] `prefers-reduced-motion`: tắt transition nếu user set

### Mobile
- [ ] Touch target ≥ 44px
- [ ] Test tại 375px (iPhone SE) và 390px (iPhone 14)
- [ ] Không có horizontal scroll
- [ ] Font ≥ 16px để tránh zoom trên iOS
