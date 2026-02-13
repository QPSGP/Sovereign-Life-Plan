import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminCommunicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  const { error, created } = await searchParams;
  const [members, communications] = await Promise.all([
    prisma.member.findMany({
      orderBy: { lastName: "asc" },
      select: { id: true, email: true, firstName: true, lastName: true },
    }),
    prisma.communication.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { member: { select: { id: true, email: true, firstName: true, lastName: true } } },
    }),
  ]);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
          <h1 className="text-2xl font-semibold">Communications</h1>
          <Link href="/admin" className="text-neutral-400 hover:text-white text-sm">← Admin</Link>
        </header>

        {error === "missing" && <p className="text-amber-500 text-sm mb-4">Member is required.</p>}
        {error === "create" && <p className="text-amber-500 text-sm mb-4">Failed to log communication.</p>}
        {created && <p className="text-emerald-500 text-sm mb-4">Communication logged.</p>}

        <section className="mb-8">
          <h2 className="text-lg font-medium text-neutral-300 mb-3">Log communication</h2>
          <form action="/api/communications" method="POST" className="rounded bg-neutral-900 p-4 space-y-3">
            <div className="flex flex-wrap gap-3">
              <select name="memberId" required className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 min-w-[200px]">
                <option value="">Select member…</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.firstName ?? ""} {m.lastName ?? ""} — {m.email}</option>
                ))}
              </select>
              <select name="type" className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700">
                <option value="call">Call</option>
                <option value="mailout">Mailout</option>
                <option value="email">Email</option>
              </select>
            </div>
            <input type="text" name="subject" placeholder="Subject" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            <textarea name="notes" placeholder="Notes" rows={2} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Log</button>
          </form>
        </section>

        <section>
          <h2 className="text-lg font-medium text-neutral-300 mb-3">Recent communications</h2>
          {communications.length === 0 ? (
            <p className="text-neutral-500 text-sm">None yet.</p>
          ) : (
            <ul className="space-y-2">
              {communications.map((c) => (
                <li key={c.id} className="rounded bg-neutral-900 p-4 text-sm">
                  <span className="text-neutral-400">{c.type}</span>
                  <span className="mx-2">·</span>
                  <span>{c.member.firstName} {c.member.lastName}</span>
                  {c.subject && <span className="text-neutral-300 block mt-1">{c.subject}</span>}
                  {c.notes && <span className="text-neutral-500 block mt-1">{c.notes}</span>}
                  <span className="text-neutral-600 text-xs block mt-1">{c.createdAt.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
