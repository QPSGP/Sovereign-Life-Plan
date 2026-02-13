import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const areaOfPurposeId = formData.get("areaOfPurposeId") as string;
  const name = (formData.get("name") as string)?.trim();
  const origin = new URL(req.url).origin;
  if (!areaOfPurposeId || !name) {
    return NextResponse.redirect(new URL("/admin/life-plan?error=missing", origin));
  }
  try {
    await prisma.areaOfResponsibility.create({
      data: { areaOfPurposeId, name },
    });
    return NextResponse.redirect(new URL("/admin/life-plan/purpose/" + areaOfPurposeId, origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/admin/life-plan/purpose/" + areaOfPurposeId + "?error=create", origin));
  }
}
