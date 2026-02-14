import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PurposePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id: areaOfPurposeId } = await params;
  const { error } = await searchParams;
  const purpose = await prisma.areaOfPurpose.findUnique({
    where: { id: areaOfPurposeId },
    include: {
      areasOfResponsibility: { orderBy: { sortOrder: "asc" } },
      subjectBusiness: { select: { id: true, name: true } },
    },
  });
  if (!purpose) notFound();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href={"/admin/life-plan/subject/" + purpose.subjectBusiness.id} className="text-neutral-400 hover:text-white text-sm">← {purpose.subjectBusiness.name}</Link>
          <h1 className="text-2xl font-semibold mt-2">{purpose.name}</h1>
          <p className="text-neutral-500 text-sm">Area of purpose</p>
        </header>

        {error === "create" && <p className="text-amber-500 text-sm mb-4">Failed to create.</p>}

        <h2 className="text-lg font-medium text-neutral-300 mb-3">Areas of responsibility</h2>
        <form action="/api/life-plan/area-of-responsibility" method="POST" className="rounded bg-neutral-900 p-4 mb-4 space-y-2">
          <input type="hidden" name="areaOfPurposeId" value={areaOfPurposeId} />
          <input type="text" name="name" placeholder="Name (required)" required className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          <div className="grid grid-cols-2 gap-2">
            <input type="text" name="verb" placeholder="Verb" className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            <input type="text" name="noun" placeholder="Noun" className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            <input type="text" name="object" placeholder="Object" className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            <input type="text" name="objective" placeholder="Objective" className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Add</button>
        </form>
        <ul className="space-y-2">
          {purpose.areasOfResponsibility.map((a) => (
            <li key={a.id} className="flex items-center justify-between py-2 px-3 rounded bg-neutral-900">
              <div>
                <span>{a.name}</span>
                {(a.verb || a.noun || a.object) && (
                  <span className="block text-neutral-500 text-sm mt-0.5">
                    {[a.verb, a.noun, a.object].filter(Boolean).join(" ")}
                    {a.objective && ` — ${a.objective}`}
                  </span>
                )}
              </div>
              <Link href={"/admin/life-plan/responsibility/" + a.id} className="text-emerald-400 text-sm hover:underline">Physical movements →</Link>
            </li>
          ))}
          {purpose.areasOfResponsibility.length === 0 && <li className="text-neutral-500 text-sm">No areas of responsibility yet.</li>}
        </ul>
      </div>
    </main>
  );
}
