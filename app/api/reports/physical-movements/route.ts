import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/reports/physical-movements — Report of all (or completed) physical movements (query-style). format=json|csv, done=all|yes|no */
export async function GET(req: NextRequest) {
  const format = req.nextUrl.searchParams.get("format") || "csv";
  const doneFilter = req.nextUrl.searchParams.get("done") || "all"; // all | yes | no
  const where = doneFilter === "yes" ? { done: true } : doneFilter === "no" ? { done: false } : {};
  const movements = await prisma.physicalMovement.findMany({
    where,
    orderBy: [{ areaOfResponsibilityId: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      areaOfResponsibility: {
        include: {
          areaOfPurpose: {
            include: {
              subjectBusiness: {
                include: { user: { select: { firstName: true, lastName: true, email: true } } },
              },
            },
          },
        },
      },
    },
  });

  const rows = movements.map((m) => {
    const sub = m.areaOfResponsibility.areaOfPurpose.subjectBusiness;
    const purpose = m.areaOfResponsibility.areaOfPurpose;
    const resp = m.areaOfResponsibility;
    return {
      subjectName: sub.name,
      subjectOwner: [sub.user.firstName, sub.user.lastName].filter(Boolean).join(" ") || sub.user.email,
      areaOfPurpose: purpose.name,
      areaOfResponsibility: resp.name,
      verb: m.verb ?? "",
      noun: m.noun ?? "",
      object: m.object ?? "",
      objective: m.objective ?? "",
      results: m.results ?? "",
      done: m.done,
      doneAt: m.doneAt?.toISOString().slice(0, 10) ?? "",
      sortOrder: m.sortOrder,
    };
  });

  if (format === "json") {
    return NextResponse.json({ report: "Report of all physical movements", rows });
  }

  const headers = [
    "Subject",
    "Owner",
    "Area of purpose",
    "Area of responsibility",
    "Verb",
    "Noun",
    "Object",
    "Objective",
    "Results",
    "Done",
    "Done date",
    "Sort",
  ];
  const escape = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
  const csvRows = rows.map((r) =>
    [
      r.subjectName,
      r.subjectOwner,
      r.areaOfPurpose,
      r.areaOfResponsibility,
      r.verb,
      r.noun,
      r.object,
      r.objective,
      r.results,
      r.done ? "Yes" : "No",
      r.doneAt,
      r.sortOrder,
    ].map(escape).join(",")
  );
  const csv = [headers.join(","), ...csvRows].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="report-physical-movements${doneFilter === "yes" ? "-completed" : doneFilter === "no" ? "-pending" : "-all"}.csv"`,
    },
  });
}
