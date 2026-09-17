import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifyToken } from "./lib/session";

// Optimistic gate for the admin area. Pages and Server Actions re-check the session.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = Boolean(verifyToken(request.cookies.get(SESSION_COOKIE)?.value));

  if (pathname === "/admin/login") {
    return authed ? NextResponse.redirect(new URL("/admin", request.url)) : NextResponse.next();
  }
  if (!authed) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
