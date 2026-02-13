import { prisma } from "@/lib/db";
import Link from "next/link";
import { AddMemberForm } from "./AddMemberForm";
import { SubscriptionList } from "./SubscriptionList";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let plans: { id: string; name: string; slug: string; amountCents: number; interval: string }[] = [];
  let members: { id: string; email: string; firstName: string | null; lastName: string | null; company: string | null }[] = [];
  let subscriptions: { id: string; status: string; memberId: string; subscriptionPlanId: string; member: { email: string; firstName: string | null; lastName: string | null }; plan: { name: string } }[] = [];
  let dbError = false;
  let dbErrorDetail: string | null = null;

  if (process.env.DATABASE_URL) {
    try {
      [plans, members, subscriptions] = await Promise.all([
        prisma.subscriptionPlan.findMany({ orderBy: { sortOrder: "asc" } }),
        prisma.member.findMany({
          orderBy: { createdAt: "desc" },
          take: 100,
          select: { id: true, email: true, firstName: true, lastName: true, company: true },
        }),
        prisma.subscription.findMany({
          where: { status: { in: ["active", "trial"] } },
          include: { member: { select: { email: true, firstName: true, lastName: true } }, plan: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
      ]);
    } catch (e) {
      dbError = true;
      dbErrorDetail = e instanceof Error ? e.message : String(e);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-8">
          <h1 className="text-2xl font-semibold">Sovereign Life Plan — Admin</h1>
          <div className="flex items-center gap-4">
            <Link href="/admin/invoices" className="text-neutral-400 hover:text-white text-sm">Invoices</Link>
            <Link href="/admin/communications" className="text-neutral-400 hover:text-white text-sm">Communications</Link>
            <Link href="/admin/life-plan" className="text-neutral-400 hover:text-white text-sm">Life Plan</Link>
            <Link href="/" className="text-neutral-400 hover:text-white text-sm">← Home</Link>
            <form action="/api/auth/admin/logout" method="POST">
              <button type="submit" className="text-neutral-500 hover:text-white text-sm">Log out</button>
            </form>
          </div>
        </header>

        {!process.env.DATABASE_URL && (
          <p className="text-amber-500 mb-6">Database not configured. Set DATABASE_URL in Vercel.</p>
        )}
        {dbError && (
          <div className="text-amber-500 mb-6 space-y-2">
            <p className="font-medium">Database error — tables may not exist yet.</p>
            <p className="text-sm">Run the GitHub Action &quot;DB push and seed&quot; (see docs).</p>
            <p className="text-xs text-neutral-500 mt-2">Details: {dbErrorDetail ?? "unknown"}</p>
          </div>
        )}

        <section className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-neutral-900 p-4">
            <p className="text-neutral-400 text-sm">Plans</p>
            <p className="text-2xl font-semibold">{plans.length}</p>
          </div>
          <div className="rounded-lg bg-neutral-900 p-4">
            <p className="text-neutral-400 text-sm">Members</p>
            <p className="text-2xl font-semibold">{members.length}</p>
          </div>
          <div className="rounded-lg bg-neutral-900 p-4">
            <p className="text-neutral-400 text-sm">Active subscriptions</p>
            <p className="text-2xl font-semibold">{subscriptions.length}</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-medium text-neutral-300 mb-3">Subscription plans</h2>
          {plans.length === 0 ? (
            <p className="text-neutral-500 text-sm">No plans yet. Run <code className="bg-neutral-800 px-1">npm run db:seed</code>.</p>
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

        <section className="mb-10">
          <h2 className="text-lg font-medium text-neutral-300 mb-3">Add member</h2>
          <AddMemberForm />
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-medium text-neutral-300 mb-3">Members</h2>
          {members.length === 0 && process.env.DATABASE_URL && !dbError ? (
            <p className="text-neutral-500 text-sm">No members yet. Add one above.</p>
          ) : (
            <ul className="space-y-2">
              {members.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center gap-2 py-2 px-3 rounded bg-neutral-900 text-sm">
                  <span>{m.firstName ?? ""} {m.lastName ?? ""}</span>
                  <span className="text-neutral-400">{m.email}</span>
                  {m.company && <span className="text-neutral-500">{m.company}</span>}
                  <AddSubscriptionForm memberId={m.id} plans={plans} />
                  <SetPasswordForm memberId={m.id} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-lg font-medium text-neutral-300 mb-3">Active subscriptions</h2>
          <SubscriptionList subscriptions={subscriptions} />
        </section>
      </div>
    </main>
  );
}

function AddSubscriptionForm({ memberId, plans }: { memberId: string; plans: { id: string; name: string }[] }) {
  if (plans.length === 0) return null;
  return (
    <form action="/api/members/subscriptions" method="POST" className="ml-auto flex items-center gap-2">
      <input type="hidden" name="memberId" value={memberId} />
      <select name="subscriptionPlanId" required className="rounded bg-neutral-800 px-2 py-1 text-sm text-white border border-neutral-700">
        {plans.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <button type="submit" className="rounded bg-emerald-700 px-2 py-1 text-xs text-white hover:bg-emerald-600">Add plan</button>
    </form>
  );
}

function SetPasswordForm({ memberId }: { memberId: string }) {
  return (
    <form action={`/api/members/${memberId}/password`} method="POST" className="flex items-center gap-2">
      <input type="password" name="password" placeholder="Portal password" minLength={6} className="rounded bg-neutral-800 px-2 py-1 text-sm text-white border border-neutral-700 w-32" title="Min 6 characters" />
      <button type="submit" className="rounded bg-neutral-700 px-2 py-1 text-xs text-white hover:bg-neutral-600">Set password</button>
    </form>
  );
}
