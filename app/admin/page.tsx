import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let plans: { id: string; name: string; slug: string; amountCents: number; interval: string }[] = [];
  let members: { id: string; email: string; firstName: string | null; lastName: string | null; company: string | null }[] = [];
  let dbError = false;

  if (process.env.DATABASE_URL) {
    try {
      [plans, members] = await Promise.all([
        prisma.subscriptionPlan.findMany({ orderBy: { sortOrder: "asc" } }),
        prisma.member.findMany({
          orderBy: { createdAt: "desc" },
          take: 50,
          select: { id: true, email: true, firstName: true, lastName: true, company: true },
        }),
      ]);
    } catch {
      dbError = true;
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-8">
          <h1 className="text-2xl font-semibold">Sovereign Life Plan — Admin</h1>
          <Link href="/" className="text-neutral-400 hover:text-white text-sm">← Home</Link>
        </header>

        {!process.env.DATABASE_URL && (
          <p className="text-amber-500 mb-6">Database not configured. Set DATABASE_URL in Vercel.</p>
        )}
        {dbError && (
          <p className="text-amber-500 mb-6">Database error. Run &quot;npx prisma db push&quot; to create tables.</p>
        )}

        <section className="mb-10">
          <h2 className="text-lg font-medium text-neutral-300 mb-3">Subscription plans</h2>
          {plans.length === 0 ? (
            <p className="text-neutral-500 text-sm">No plans yet. Add rows to the subscription_plans table (e.g. via Prisma Studio or a seed).</p>
          ) : (
            <ul className="space-y-2">
              {plans.map((p) => (
                <li key={p.id} className="flex items-center gap-4 py-2 px-3 rounded bg-neutral-900">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-neutral-400 text-sm">{p.slug}</span>
                  <span className="text-emerald-400">${(p.amountCents / 100).toFixed(2)}</span>
                  <span className="text-neutral-500 text-sm">/ {p.interval}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-lg font-medium text-neutral-300 mb-3">Members (latest 50)</h2>
          {members.length === 0 && process.env.DATABASE_URL && !dbError ? (
            <p className="text-neutral-500 text-sm">No members yet.</p>
          ) : (
            <ul className="space-y-2">
              {members.map((m) => (
                <li key={m.id} className="flex items-center gap-4 py-2 px-3 rounded bg-neutral-900 text-sm">
                  <span>{m.firstName ?? ""} {m.lastName ?? ""}</span>
                  <span className="text-neutral-400">{m.email}</span>
                  {m.company && <span className="text-neutral-500">{m.company}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
