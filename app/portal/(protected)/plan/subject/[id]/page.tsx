import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PortalSubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) redirect("/login");

  const { id: subjectBusinessId } = await params;
  const subject = await prisma.subjectBusiness.findFirst({
    where: { id: subjectBusinessId, memberId },
    include: { areasOfPurpose: { orderBy: { sortOrder: "asc" } } },
  });
  if (!subject) notFound();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href="/portal/plan" className="text-neutral-400 hover:text-white text-sm">← My plan</Link>
          <h1 className="text-2xl font-semibold mt-2">{subject.name}</h1>
        </header>

        <h2 className="text-lg font-medium text-neutral-300 mb-3">Areas of purpose</h2>
        <ul className="space-y-2">
          {subject.areasOfPurpose.map((a) => (
            <li key={a.id} className="flex items-center justify-between py-2 px-3 rounded bg-neutral-900">
              <span>{a.name}</span>
              <Link href={"/portal/plan/purpose/" + a.id} className="text-emerald-400 text-sm hover:underline">Areas of responsibility →</Link>
            </li>
          ))}
          {subject.areasOfPurpose.length === 0 && <li className="text-neutral-500 text-sm">No areas of purpose yet.</li>}
        </ul>
      </div>
    </main>
  );
}
