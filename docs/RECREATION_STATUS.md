# Paradox → Sovereign Life Plan — Recreation Status

How close the new app is to your original Paradox program, and what’s left.

---

## Legacy Paradox (what you had)

| Legacy | Tables / Queries | Purpose |
|--------|-------------------|---------|
| **Contacts** | CONTACT1, CONCAT | Members with contact info and categories (Personal, MMPE4, etc.) |
| **Staff** | USER_ID | Staff/agents using the system |
| **Plans & tasks** | PMS, PMS1 | Areas of purpose, responsibility, tasks (verb/noun/object), objectives, results, done/done date. Queries: AGENCY, PUBLIC, ALLPMS, GETX, DELETEX, XINPMS1 |
| **Orders / billing** | LPTRANS, TRANSACT, PAYMENT | Orders, invoices, amounts, payments. Queries: ORDER, TRANSCOL, TRANSPAY, TRANSACT |
| **Communications** | CALLS, CCALLS, MAILOUT, LPCOM, LPCNTCOM | Calls and mailouts per member |
| **Other** | EXPEND, CHORELST, AREAPURP | Expenditures, chores, lookups |

---

## What’s recreated and working

| Legacy equivalent | In new app | Status |
|-------------------|------------|--------|
| **CONTACT1 / CONCAT** | Members + MemberCategory (schema) | ✅ Members: add, list, set password. Categories: in DB only, no UI to add/edit yet. |
| **Subscription tiers** | SubscriptionPlan (Basic, Standard, Premium, Sovereign) | ✅ Seeded, listed in admin. |
| **Assign plan to member** | Subscription (member + plan, status, period) | ✅ Admin: “Add plan” per member; list active subscriptions. |
| **Staff access** | Admin login (ADMIN_PASSWORD) | ✅ Works; staff not stored as User records in DB. |
| **Member sees their data** | Member portal (/login → /portal) | ✅ Profile, subscription(s), invoices (read-only). |
| **PERSONAL / MARKEVNT-style list** | Admin members list | ✅ List members (categories not filterable in UI yet). |

---

## What’s in the schema but not yet in the UI

| Legacy equivalent | New schema | Missing in app |
|-------------------|------------|-----------------|
| **PMS / PMS1 — Life plans & tasks** | MemberPlan, MemberPlanTask (verb, noun, object, objective, results, done, doneAt) | No admin or portal UI to create/edit plans and tasks. No “areas of purpose,” “areas of responsibility,” or done tracking. |
| **TRANSACT / PAYMENT — Invoices & payments** | Invoice, Payment | No UI to **create** invoices or **record** payments. Portal only **displays** invoices if they exist. Stripe/NowPayments webhooks are stubs (not creating Payment records). |
| **LPTRANS / ORDER** | Order, OrderLine | No UI to create orders or order lines. |
| **CALLS / MAILOUT** | Communication (type: call, mailout, email) | No UI to log or list communications per member. |
| **USER_ID (staff as records)** | User (email, passwordHash, role) | Admin uses a single password; no staff list or roles in DB. |
| **Member categories** | MemberCategory | No UI to add/remove categories (e.g. Personal, MMPE4) on a member. |
| **EXPEND** | Not in current schema | Expenditures not recreated. |

---

## What’s not recreated at all

- **Reports/labels** (e.g. PERSONAL, MARKEVNT, TRANSCOL as printable/export reports).  
- **Chores** (CHORELST), **expenditures** (EXPEND), **area-of-purpose lookups** (AREAPURP).  
- **Paradox-specific flows** (e.g. GETX/DELETEX/XINPMS1 as exact workflows — we have the data model to support them but no screens).

---

## How close is the recreation?

Roughly **45–50%** of the original Paradox behavior is recreated and working:

- **Done:** Members, tiers, assign subscription to member, admin auth, member portal (profile + subscription + invoices read-only).
- **Not done:** Life plans & tasks (PMS), create invoices & record payments, orders, communications log, member categories UI, staff as User records, reports/exports.

To get **much closer** to “like it was, with improvements,” the next building blocks are:

1. **Life plans & tasks (PMS)** — Admin (and optionally portal) UI to create/edit member plans: areas of purpose, areas of responsibility, tasks (verb/noun/object), objectives, results, done/done date.  
2. **Invoices & payments** — Admin UI to create invoices per member and record payments; wire Stripe/NowPayments so online payments create Payment records and update invoice status.  
3. **Communications** — Admin UI to log calls/mailouts per member and list them.  
4. **Member categories** — Admin UI to add/remove categories (e.g. Personal, MMPE4) on a member.  
5. **Orders** (optional) — If you need order headers/lines like LPTRANS, add UI to create and list orders.

If you say which of these you want first (e.g. “life plans” or “invoices and payments”), we can do that next and move the recreation percentage up.
