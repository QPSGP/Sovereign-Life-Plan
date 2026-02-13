# Subscription Tiers — Sovereign Life Plan

Define your plan levels, USD prices, billing interval, and feature flags here. These drive the `subscription_plans` table and feature gating in the app.

---

## Example tiers

| Tier | Name       | Price (USD) | Interval | Features |
|------|------------|-------------|----------|----------|
| 1    | Basic      | 19         | monthly  | Profile, basic plan view, payment history |
| 2    | Standard   | 49         | monthly  | + Full life-plan tasks, objectives, results |
| 3    | Premium    | 99         | monthly  | + Communications log, reminders, exports |
| 4    | Sovereign  | 199        | monthly  | + Priority support, custom areas, API/reports |

Optional: add yearly prices (e.g. 2 months free) and store in the same table with `interval = 'yearly'`.

---

## Feature flags (by tier)

Use these to gate UI and API:

- **basic_plan_view** — View own life plan (read-only).
- **full_plan_edit** — Create/edit tasks, objectives, results.
- **communications** — Log and view calls/mailouts.
- **exports** — Download CSV/PDF reports.
- **priority_support** — Support channel or SLA.
- **api_access** — API key for programmatic access.

---

## Pricing in DB

- Store prices in **USD** (cents or decimal). Invoices are in USD.
- Crypto payments: member pays equivalent (provider converts or you fix rate at invoice time); record payment in USD for balance.

Update this file when you add or change tiers, then run a seed or migration to sync `subscription_plans`.
