# Payday — Money Management

A payday-anchored expense tracker: set your salary, payday, and monthly
commitments, and the app automatically deducts your bills the moment your
salary lands, splits what's left into a weekly budget, and tells you at a
glance whether your spending went mostly to important things or not.

Bilingual (Arabic/English, full RTL/LTR), installable as a PWA, 100% local —
all data stays on-device (IndexedDB), no login, no server.

## Highlights

- **Payday-based budgeting** — your "month" runs from one payday to the
  next, not the calendar month.
- **Auto commitment deduction** — bills/rent/subscriptions are deducted the
  moment a new pay period starts.
- **Weekly budget split** — the leftover is divided proportionally across
  the weeks of the period (exact-sum, no rounding drift).
- **Spending items library** — pre-classify what you spend on as
  important/not important; new expenses inherit the tag automatically.
- **Green/red verdict** — at period-end (or any time), see whether most of
  your money went to important things.
- **Calendar, reports, and history** with search/filter.
- **JSON backup/export/import**, local multi-profile switcher, PWA install,
  local due-date reminders.

## Development

```bash
npm install
npm run dev       # start dev server
npm run test      # run domain-logic unit tests
npm run build     # typecheck + production build
```

## Stack

React + TypeScript + Vite, Tailwind CSS v4, Dexie (IndexedDB), Zustand,
react-i18next, Recharts, vite-plugin-pwa.
