# Let 'Em Ride Autos — Collections Desk

A collections workbench for a Buy Here Pay Here lot in Dallas. It sits **next to** the DMS, not on top of it:
the DMS stays the book of record, and this is where the two collectors actually work the phones.

Built around how this store runs: bi-weekly contracts, two collectors, every unit on GPS,
30 days past due is a skip, certified notice goes out early, and roughly half the book defaults.

---

## What it does

| Screen | What it's for |
|---|---|
| **Call board** | Who to call right now — broken promises first, then promises landing today, then days past due. Filter by aging bucket or by collector. |
| **Account** | One customer's file: balances, take a promise, post a payment, log a call, record the certified notice, and a 30+ skip checklist. |
| **Money** | Accrued vs. earned interest. Per diem, payoff, and a bar showing exactly where a payment lands: fees / interest / principal. |
| **Scripts** | 10 text templates and 4 call scripts, English and Spanish, auto-filled with the customer's name, amount, days late, payoff, and cure date. |
| **Setup** | Import the morning aging CSV from the DMS, export the board at end of day, and set the house numbers (cure days, waterfall, late fee). |

### The part that matters most

On a simple-interest retail installment contract, interest accrues **every day** whether or not anyone pays:

```
per diem        = principal × APR ÷ 365
accrued         = per diem × days since the account's paid-to date
EARNED          = interest a payment actually paid    → revenue you booked
ACCRUED UNPAID  = interest charged but not collected  → on paper, not in the drawer
payoff          = principal + accrued unpaid + fees
```

A payment does **not** touch principal until it has covered the interest that accrued since the last one.
The app flags every payment where that happens — money came in, balance didn't move — and shows
"days of interest bought," which is the single most persuasive thing a collector can say on the phone.

---

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # 16 tests on the interest engine
npm run build    # static site in dist/
```

Node 20 or newer.

## Put it on GitHub

```bash
git init
git add .
git commit -m "Collections desk v1"
git branch -M main
git remote add origin https://github.com/<your-account>/letemride-collections-desk.git
git push -u origin main
```

Two workflows are included:

- `.github/workflows/ci.yml` — runs tests and a build on every push and PR.
- `.github/workflows/pages.yml` — publishes to GitHub Pages. Turn it on under **Settings → Pages → Source: GitHub Actions**.

**Make the repository private.** No customer data lives in this repo, but the scripts and the house
process are yours and there's no reason to publish them.

## Hosting choices

The whole thing is a static site — no server, no database, no accounts.

| Option | Good when |
|---|---|
| GitHub Pages | You want a link Marcela can open on her phone. Public URL; the app itself is public, the data still isn't. |
| Office machine (`npm run preview`) | You'd rather nothing be reachable from outside the lot. |
| Any static host (Netlify, Vercel, S3) | Drop the `dist/` folder in. |

---

## Where the data lives

Everything is stored in the browser on **that device** under one key (`ler_desk_v1`).
That has a consequence worth being clear about: **Marcela's promises are not visible on the other
collector's phone.** Two people, two devices, two boards.

That's fine if each collector works her own accounts (this build filters by collector on the call
board). If you want one shared board, that needs a real backend — see the roadmap below.

Back up weekly from **Setup → Download JSON backup**, and export the CSV at end of day so the
numbers land back in the DMS.

---

## Repository layout

```
src/
  lib/
    interest.js       per diem, accrual, payment waterfall, aging buckets, book totals
    interest.test.js  16 tests — this is the file to trust
    dates.js          plain YYYY-MM-DD dates, no time zones
    format.js         money, rounding, ids
    csv.js            DMS aging import + end-of-day export
    storage.js        localStorage (or Claude artifact storage) + JSON backup
    seed.js           sample book and default house settings
  content/
    messages.js       10 text templates, EN + ES
    scripts.js        4 call scripts + house rules
  components/         Queue, Account, panels, Money, Scripts, Setup, shared UI
  App.jsx             tabs, state, autosave
  styles.css          one stylesheet, CSS variables at the top
docs/
  DMS-IMPORT.md       CSV column reference
  INTEREST.md         worked examples of the math
  COMPLIANCE.md       what to hand your attorney before this goes live
```

---

## Before it goes live

Two things need a lawyer's eyes, and neither is a code change:

1. **Notice wording and the cure period.** The app tracks the certified mailing, the tracking number,
   and computes a cure date from a day count you set in Setup. That day count and the notice itself
   come from your contract and Texas law. Have counsel set them, then match the number in Setup.
2. **The payment waterfall.** Interest-then-fees-then-principal is the default. Your retail
   installment contract controls; set it in Setup so the Money screen tells the truth.

See `docs/COMPLIANCE.md` for the full handoff list. Nothing in this repo is legal advice.

## Roadmap

- Shared board across devices (needs a small backend — Supabase or a cheap Postgres)
- Direct DMS integration instead of CSV in / CSV out
- Payment-link generation and delivery receipts for texts
- Promise-kept rate and roll-rate reporting by collector
- Print-ready notice generation with the mail-merge fields already on the file

---

© 2026 Let 'Em Ride Autos Inc. See `LICENSE`.
