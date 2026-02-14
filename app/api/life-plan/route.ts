import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId") ?? undefined;

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      error: "Database not configured. Set DATABASE_URL in your environment (e.g. Vercel).",
    });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { email: "asc" },
      select: { id: true, email: true, firstName: true, lastName: true },
    });
    let subjectBusinesses: { id: string; name: string }[] = [];
    if (userId) {
      subjectBusinesses = await prisma.subjectBusiness.findMany({
        where: { userId },
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true, verb: true, noun: true, object: true, objective: true },
      });
    }
    return NextResponse.json({ users, subjectBusinesses });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("Life Plan API error:", e);
    return NextResponse.json(
      { error: message, users: [], subjectBusinesses: [] },
      { status: 200 }
    );
  }
}
