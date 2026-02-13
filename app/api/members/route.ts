import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }
  try {
    const members = await prisma.member.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        categories: { select: { category: true } },
      },
    });
    return NextResponse.json(members);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}
