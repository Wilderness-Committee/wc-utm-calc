import { NextRequest, NextResponse } from "next/server";
import { SITE_COOKIE, ADMIN_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const scope = req.nextUrl.searchParams.get("scope");
  const res = NextResponse.json({ ok: true });
  if (scope === "admin") {
    res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  } else {
    res.cookies.set(SITE_COOKIE, "", { path: "/", maxAge: 0 });
    res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  }
  return res;
}
