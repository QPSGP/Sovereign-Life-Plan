# Run DB push and seed (without using your PC)

Your `DATABASE_URL` is set in **Vercel**, not on your machine. To create the tables and seed plans **once**, use GitHub Actions.

## 1. Add `DATABASE_URL` to GitHub secrets

1. Open your repo: **https://github.com/QPSGP/Sovereign-Life-Plan**
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. **Name:** `DATABASE_URL`
5. **Value:** Paste the **raw** connection string only. It must start with `postgresql://` or `postgres://` (example: `postgresql://user:pass@host.vercel-storage.com/db?sslmode=require`). Do **not** wrap it in quotes or add spaces. Get it from Vercel (Storage → your Postgres DB → connection string) or Neon/Supabase.
6. Click **Add secret**

## 2. Run the workflow

1. In the repo, open the **Actions** tab
2. Click **DB push and seed** in the left sidebar
3. Click **Run workflow** (use default branch, e.g. `main`) → **Run workflow**
4. Wait for the job to finish (green check). It runs `prisma db push` then `prisma db seed`.

## 3. Open the app

- Open your **Vercel** deployment URL (e.g. `https://sovereign-life-plan-xxx.vercel.app`)
- **/** — home page
- **/admin** — dashboard; subscription plans and members will show (plans after seed, members when you add them)

You only need to run this workflow once per database (or when you change the schema and want to push again).
