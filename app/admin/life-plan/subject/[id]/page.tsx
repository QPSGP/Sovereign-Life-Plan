import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SubjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id: subjectBusinessId } = await params;
  const { error } = await searchParams;
  const subject = await prisma.subjectBusiness.findUnique({
    where: { id: subjectBusinessId },
    include: {
      areasOfPurpose: { orderBy: { sortOrder: "asc" } },
      user: { select: { email: true, firstName: true, lastName: true } },
    },
  });
  if (!subject) notFound();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href="/admin/life-plan" className="text-neutral-400 hover:text-white text-sm">← Life Plan</Link>
          <h1 className="text-2xl font-semibold mt-2">{subject.name}</h1>
          <p className="text-neutral-500 text-sm">Subject/Business · User: {subject.user.firstName} {subject.user.lastName}</p>
        </header>

        {error === "create" && <p className="text-amber-500 text-sm mb-4">Failed to create.</p>}

        <h2 className="text-lg font-medium text-neutral-300 mb-3">Areas of purpose</h2>
        <form action="/api/life-plan/area-of-purpose" method="POST" className="flex gap-2 mb-4">
          <input type="hidden" name="subjectBusinessId" value={subjectBusinessId} />
          <input type="text" name="name" placeholder="Area of purpose" required className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 flex-1" />
          <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Add</button>
        </form>
        <ul className="space-y-2">
          {subject.areasOfPurpose.map((a) => (
            <li key={a.id} className="flex items-center justify-between py-2 px-3 rounded bg-neutral-900">
              <span>{a.name}</span>
              <Link href={"/admin/life-plan/purpose/" + a.id} className="text-emerald-400 text-sm hover:underline">Areas of responsibility →</Link>
            </li>
          ))}
          {subject.areasOfPurpose.length === 0 && <li className="text-neutral-500 text-sm">No areas of purpose yet.</li>}
        </ul>
      </div>
    </main>
  );
}
