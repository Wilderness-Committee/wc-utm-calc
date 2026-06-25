import { NextRequest, NextResponse } from "next/server";
import { SITE_COOKIE, ADMIN_COOKIE, verifyToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin area: requires admin session.
  if (pathname.startsWith("/admin")) {
    const ok = await verifyToken(req.cookies.get(ADMIN_COOKIE)?.value, "admin");
    if (!ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // API routes do their own auth; never gate them at the edge.
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Everything else (the main generator): requires site session.
  const ok = await verifyToken(req.cookies.get(SITE_COOKIE)?.value, "site");
  if (!ok) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Gate pages only; skip API (self-authed), login pages, and Next internals.
  matcher: [
    "/((?!api|login|admin/login|_next/static|_next/image|favicon.ico).*)",
  ],
};
