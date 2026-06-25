import { NextRequest, NextResponse } from "next/server";
import { SITE_COOKIE, makeToken, checkSitePassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (!checkSitePassword(password || "")) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SITE_COOKIE, await makeToken("site"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
