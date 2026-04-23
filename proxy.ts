import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_AUTH_COOKIE } from "@/lib/adminAuth";

function isAuthenticated(request: NextRequest) {
  return request.cookies.get(ADMIN_AUTH_COOKIE)?.value === "1";
}

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const authenticated = isAuthenticated(request);

  if (pathname === "/admin/login") {
    if (!authenticated) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (authenticated) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
