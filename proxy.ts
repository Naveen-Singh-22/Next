import { NextResponse, type NextRequest } from "next/server";
import { AUTH_TOKEN_COOKIE } from "@/lib/auth";

type ApiAccessRule = {
  prefix: string;
  publicMethods: string[];
  roles: string[];
};

const API_ACCESS_RULES: ApiAccessRule[] = [
  { prefix: "/api/animals", publicMethods: ["GET"], roles: ["admin", "staff"] },
  { prefix: "/api/rescues", publicMethods: [], roles: ["admin", "staff"] },
  { prefix: "/api/adoptions", publicMethods: ["POST"], roles: ["admin", "staff"] },
  { prefix: "/api/vaccinations", publicMethods: [], roles: ["admin", "staff"] },
  { prefix: "/api/dashboard", publicMethods: [], roles: ["admin", "staff"] },
  { prefix: "/api/donations", publicMethods: ["POST"], roles: ["admin", "staff"] },
  { prefix: "/api/create-order", publicMethods: ["POST"], roles: ["admin", "staff", "donor", "volunteer", "adopter"] },
  { prefix: "/api/verify-payment", publicMethods: ["POST"], roles: ["admin", "staff", "donor", "volunteer", "adopter"] },
  { prefix: "/api/users", publicMethods: [], roles: ["admin"] },
  { prefix: "/api/inquiries", publicMethods: [], roles: ["admin", "staff"] },
  { prefix: "/api/rescue/requests", publicMethods: ["POST"], roles: ["admin", "staff"] },
];

type ProxyUser = {
  id: number;
  email: string;
  name: string;
  role: string;
};

async function readUserFromRequest(request: NextRequest): Promise<ProxyUser | null> {
  const authHeader = request.headers.get("authorization") ?? request.headers.get("Authorization") ?? "";
  const hasBearerToken = authHeader.startsWith("Bearer ");
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;

  if (!hasBearerToken && !token) {
    return null;
  }

  try {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const sessionUrl = new URL("/api/auth/session", request.url);
    const response = await fetch(sessionUrl, {
      headers: {
        cookie: cookieHeader,
        ...(hasBearerToken ? { authorization: authHeader } : {}),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json().catch(() => null)) as {
      authenticated?: boolean;
      user?: { id?: number; email?: string; name?: string; role?: string };
    } | null;

    if (!payload?.authenticated || !payload.user) {
      return null;
    }

    const id = payload.user.id;
    const email = payload.user.email;
    const name = payload.user.name;
    const role = payload.user.role;

    if (typeof id !== "number" || typeof email !== "string" || typeof name !== "string" || typeof role !== "string") {
      return null;
    }

    return { id, email, name, role };
  } catch {
    return null;
  }
}

function isPublicAuthPath(pathname: string) {
  return pathname === "/login" || pathname === "/api/auth/login" || pathname === "/api/auth/logout" || pathname === "/api/auth/session";
}

function findApiRule(pathname: string) {
  return API_ACCESS_RULES.find((rule) => pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`));
}

function unauthorizedApiResponse() {
  return NextResponse.json(
    {
      ok: false,
      message: "Unauthorized access. Please login with an admin account.",
    },
    { status: 401 },
  );
}

export async function proxy(request: NextRequest) {
  const enforceHttps = process.env.ENFORCE_HTTPS === "true" || process.env.NODE_ENV === "production";

  function maybeSetHsts(response: NextResponse) {
    if (enforceHttps) {
      response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    }

    return response;
  }

  if (enforceHttps) {
    const protoHeader = request.headers.get("x-forwarded-proto") || request.headers.get("x-forwarded-protocol") || "";
    const proto = protoHeader || (request.nextUrl?.protocol ? request.nextUrl.protocol.replace(":", "") : "");

    if (proto && proto !== "https") {
      const url = request.nextUrl.clone();
      url.protocol = "https";
      return NextResponse.redirect(url);
    }
  }
  const { pathname, searchParams } = request.nextUrl;

  if (isPublicAuthPath(pathname)) {
    return maybeSetHsts(NextResponse.next());
  }

  // Middleware protection: verify JWT before reaching admin pages or protected APIs.
  const user = await readUserFromRequest(request);

  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("role", "admin");
      loginUrl.searchParams.set("next", `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`);
      return NextResponse.redirect(loginUrl);
    }

    if (user.role !== "admin" && user.role !== "staff") {
      return NextResponse.redirect(new URL("/login?role=admin", request.url));
    }

    return NextResponse.next();
  }

  const rule = findApiRule(pathname);

  if (!rule) {
    return NextResponse.next();
  }

  if (rule.publicMethods.includes(request.method.toUpperCase())) {
    return maybeSetHsts(NextResponse.next());
  }

  if (!user) {
    return maybeSetHsts(unauthorizedApiResponse());
  }

  if (!rule.roles.includes(user.role)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Forbidden: insufficient role permissions.",
      },
      { status: 403 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*", "/login"],
};
