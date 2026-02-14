import type { Chore } from "@prisma/client";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminChoresPage(props: {
  searchParams: Promise<{ error?: string }> | { error?: string };
}) {
  const params = typeof (props.searchParams as Promise<unknown>)?.then === "function"
    ? await (props.searchParams as Promise<{ error?: string }>)
    : (props.searchParams as { error?: string });
  const { error } = params;

  let chores: Chore[] = [];
  let dbError: string | null = null;
  try {
    chores = await prisma.chore.findMany({
      orderBy: [{ done: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    });
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e);
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
          <h1 className="text-2xl font-semibold">Chores</h1>
          <Link href="/admin" className="text-neutral-400 hover:text-white text-sm">← Admin</Link>
        </header>

        {dbError && (
          <div className="mb-4 p-4 rounded bg-red-950/50 border border-red-800 text-red-200 text-sm">
            <p>Database error: {dbError}. Run &quot;DB push and seed&quot;.</p>
          </div>
        )}
        {error && <p className="text-amber-500 text-sm mb-4">Title is required.</p>}

        <form action="/api/chores" method="POST" className="flex gap-2 mb-6">
          <input type="text" name="title" placeholder="Chore title" required className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 flex-1" />
          <input type="text" name="description" placeholder="Description" className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 flex-1" />
          <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Add</button>
        </form>

        <ul className="space-y-2">
          {chores.length === 0 ? (
            <li className="text-neutral-500 text-sm">No chores yet.</li>
          ) : (
            chores.map((c) => (
              <li key={c.id} className={`rounded bg-neutral-900 p-3 flex items-center justify-between ${c.done ? "opacity-70" : ""}`}>
                <span className={c.done ? "line-through text-neutral-500" : ""}>{c.title}</span>
                {c.description && <span className="text-neutral-500 text-sm truncate max-w-[200px]">{c.description}</span>}
                <form action={`/api/chores/${c.id}/done`} method="POST">
                  <input type="hidden" name="done" value={c.done ? "false" : "true"} />
                  <button type="submit" className="rounded px-2 py-1 text-xs border border-neutral-600 hover:bg-neutral-800">
                    {c.done ? "Undo" : "Done"}
                  </button>
                </form>
              </li>
            ))
          )}
        </ul>
      </div>
    </main>
  );
}
