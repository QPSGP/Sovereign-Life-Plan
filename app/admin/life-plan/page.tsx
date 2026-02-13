import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminLifePlanPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; error?: string }>;
}) {
  const { userId: selectedUserId, error } = await searchParams;
  const users = await prisma.user.findMany({
    orderBy: { email: "asc" },
    select: { id: true, email: true, firstName: true, lastName: true },
  });
  const subjectBusinesses = selectedUserId
    ? await prisma.subjectBusiness.findMany({
        where: { userId: selectedUserId },
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true },
      })
    : [];

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
          <h1 className="text-2xl font-semibold">Life Plan</h1>
          <Link href="/admin" className="text-neutral-400 hover:text-white text-sm">← Admin</Link>
        </header>

        {error === "missing" && <p className="text-amber-500 text-sm mb-4">Name and user are required.</p>}
        {error === "create" && <p className="text-amber-500 text-sm mb-4">Failed to create.</p>}

        <section className="mb-8">
          <h2 className="text-lg font-medium text-neutral-300 mb-3">User (plan owner)</h2>
          {users.length === 0 ? (
            <div className="text-neutral-300 space-y-2">
              <p className="text-neutral-500 text-sm">No plan owners yet. Life Plan uses <strong>Users</strong> (not Members) as plan owners.</p>
              <form action="/api/life-plan/seed-user" method="POST">
                <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">
                  Create default plan owner (Admin User)
                </button>
              </form>
              <p className="text-neutral-500 text-xs">This creates the same user as the seed: admin@sovereign-life-plan.local. You can add more users in the database if needed.</p>
            </div>
          ) : (
            <>
              <form method="GET" className="flex gap-2 mb-4">
                <select
                  name="userId"
                  defaultValue={selectedUserId ?? ""}
                  onChange={(e) => e.target.form?.submit()}
                  className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700"
                >
                  <option value="">Select user…</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName ?? ""} {u.lastName ?? ""} ({u.email})
                    </option>
                  ))}
                </select>
              </form>

              {selectedUserId && (
                <>
                  <h3 className="text-md font-medium text-neutral-400 mb-2">Subject / Business</h3>
                  <form action="/api/life-plan/subject-business" method="POST" className="flex gap-2 mb-4">
                    <input type="hidden" name="userId" value={selectedUserId} />
                    <input type="text" name="name" placeholder="Subject/Business name" required className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 flex-1" />
                    <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Add</button>
                  </form>
                  <ul className="space-y-2">
                    {subjectBusinesses.map((s) => (
                      <li key={s.id} className="flex items-center justify-between py-2 px-3 rounded bg-neutral-900">
                        <span>{s.name}</span>
                        <Link href={"/admin/life-plan/subject/" + s.id} className="text-emerald-400 text-sm hover:underline">Areas of purpose →</Link>
                      </li>
                    ))}
                    {subjectBusinesses.length === 0 && <li className="text-neutral-500 text-sm">No Subject/Business yet. Add one above.</li>}
                  </ul>
                </>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
