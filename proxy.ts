import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_AUTH_COOKIE } from "@/lib/adminAuth";
import { AUTH_ROLE_COOKIE, normalizeAuthRole } from "@/lib/auth";

function readAuthState(request: NextRequest) {
  const adminCookie = request.cookies.get(ADMIN_AUTH_COOKIE)?.value === "1";
  const role = normalizeAuthRole(request.cookies.get(AUTH_ROLE_COOKIE)?.value ?? null);

  return {
    adminCookie,
    role,
    authenticated: adminCookie || role !== null,
  };
}

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const { authenticated, adminCookie, role } = readAuthState(request);

  if (pathname === "/login") {
    if (authenticated) {
      if (adminCookie || role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      return NextResponse.redirect(new URL("/profile", request.url));
    }

    return NextResponse.next();
  }

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (authenticated) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("role", "admin");
  loginUrl.searchParams.set("next", `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
