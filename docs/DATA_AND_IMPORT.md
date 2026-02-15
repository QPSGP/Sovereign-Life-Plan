# Data and populating the app

## What the seed does today

- **Main seed** (`npm run db:seed`, or “DB push and seed” in GitHub Actions):
  - Creates one **User** (Life Plan owner): `admin@sovereign-life-plan.local` / `changeme`
  - Ensures only two **subscription plans**: SOVEREIGN: Personal $25/mo, SOVEREIGN: Business $250/mo  
  - No members, no life plans, no communications, etc.

So after a fresh setup the app has plans and a default user, but admin and portal are otherwise empty.

---

## Optional demo data (no legacy export needed)

You can fill the app with **sample data** so you can click around and see lists, life plan, and portal without entering real data first.

1. Run the main seed (or the “DB push and seed” workflow) so the DB and plans exist.
2. Run the **demo seed** once:
   - Locally (with `DATABASE_URL` in `.env`):
     ```bash
     npm run db:seed:demo
     ```
   - Or in GitHub Actions: add a second step that runs `node prisma/seed-demo.js` (e.g. only when `SEED_DEMO_DATA=true`).

**What the demo seed creates (idempotent — safe to run once):**

- One **demo member**: `demo@sovereign-life-plan.local` / `demo1234`, with category “Personal”
- An **active subscription** (SOVEREIGN: Personal) for that member
- A **Life Plan** owned by the default user and **linked to the demo member** (so “My plan” in the portal has content): one Subject/Business → one Area of Purpose → one Area of Responsibility → one Physical Movement (with verb/noun/object/objective)
- Two **communications** (call, email) for the demo member
- Two **chores** (titles + descriptions)
- One **expenditure** (description, amount, date, notes)
- One **invoice** for the demo member with one **partial payment**

After running it, you can:

- Use **admin** to see members, plans, communications, chores, expenditures, invoices, and the life plan.
- Log in to the **portal** as `demo@sovereign-life-plan.local` / `demo1234` to see profile, subscription, invoices, and “My plan” with the demo subject/purpose/responsibility/movement.

---

## Populating from real Paradox data

There is **no Paradox export or import in the repo**. If you have data from the old Paradox app, you can still use it to populate the new app in one of these ways:

1. **Export from Paradox (if possible)**  
   Export contacts (members), plans/tasks, communications, expenditures, etc. to **CSV** (or another format you can read in Node). Then we can add a one-off **import script** (e.g. `prisma/import-from-csv.js`) that:
   - Reads your CSV(s)
   - Maps columns to Members, Life Plan nodes, Communications, Expenditures, etc.
   - Uses Prisma to create records (optionally skipping or updating existing ones by email or ID).

2. **Describe the format**  
   If you already have files (CSV, Excel, or backup), tell me:
   - Which entities they represent (e.g. contacts, plans, calls, expenditures).
   - Column names or a sample row.  
   I can then outline or implement the exact import steps and script.

3. **Manual entry**  
   Use the admin UI (and portal) to add members, life plans, communications, chores, expenditures, and invoices. The **Reports** page can export members and transactions to CSV for backup or use elsewhere.

---

## Summary

| Goal | Action |
|------|--------|
| Empty app with just plans + default user | Run main seed only (`npm run db:seed` or “DB push and seed”). |
| Sample data to explore the app | Run main seed, then `npm run db:seed:demo` once. |
| Real data from Paradox | Export to CSV (or share format); we can add an import script. |
