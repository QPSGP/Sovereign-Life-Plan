import { NextRequest, NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  await clearAdminCookie();
  const url = new URL(req.url);
  const origin = url.origin;
  return NextResponse.redirect(new URL("/admin/login", origin));
}
