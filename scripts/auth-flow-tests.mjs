import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function request(path, init = {}, cookie, bearerToken) {
  const headers = { "content-type": "application/json", ...(init.headers || {}) };
  if (cookie) headers.cookie = cookie;
  if (bearerToken) headers.authorization = `Bearer ${bearerToken}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  const text = await res.text();

  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }

  return { res, body, headers: res.headers };
}

function toCookieHeader(setCookieHeader) {
  if (!setCookieHeader) {
    return "";
  }

  return setCookieHeader
    .split(/,(?=\s*[^=]+=)/)
    .map((segment) => segment.split(";")[0].trim())
    .filter(Boolean)
    .join("; ");
}

async function waitForServer(maxAttempts = 45) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const { res } = await request("/api/auth/session");
      if (res.status === 200) {
        return;
      }
    } catch {
      // retry
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Server did not become ready at ${BASE_URL}`);
}

async function run() {
  await waitForServer();

  const email = `auth.test.${Date.now()}@example.com`;
  const password = "TestPass123!";

  console.log(`Testing auth flow at ${BASE_URL}`);

  const signup = await request("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name: "Auth Test", email, password, confirmPassword: password }),
  });
  assert(signup.res.ok, `Signup failed: ${signup.res.status}`);

  await new Promise((resolve) => setTimeout(resolve, 500));
  const otpRow = await prisma.otpRecord.findUnique({ where: { email } });
  assert(otpRow?.otp, "OTP record not created for auth test user");

  const verify = await request("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp: otpRow.otp }),
  }, toCookieHeader(signup.headers.get("set-cookie") ?? undefined));
  assert(verify.res.ok, `OTP verification failed: ${verify.res.status}`);
  assert(typeof verify.body?.token === "string", "OTP verification did not return a token");
  assert(typeof verify.body?.expiresAt === "string", "OTP verification did not return expiresAt");

  const login = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, rememberMe: false }),
  });
  assert(login.res.ok, `Login failed: ${login.res.status}`);
  assert(typeof login.body?.token === "string", "Login did not return a token");
  assert(typeof login.body?.expiresAt === "string", "Login did not return expiresAt");

  const cookie = toCookieHeader(login.headers.get("set-cookie") ?? verify.headers.get("set-cookie") ?? "");
  const session = await request("/api/auth/session", {}, cookie);
  assert(session.res.ok, `Session check failed: ${session.res.status}`);
  assert(session.body?.authenticated === true, "Session endpoint did not authenticate the user");
  assert(typeof session.body?.session?.expiresAt === "string", "Session metadata missing expiresAt");

  const bearerSession = await request("/api/auth/session", {}, undefined, login.body.token);
  assert(bearerSession.res.ok, `Bearer session check failed: ${bearerSession.res.status}`);
  assert(bearerSession.body?.authenticated === true, "Bearer auth failed for session endpoint");

  const logout = await request("/api/auth/logout", { method: "POST" }, cookie);
  assert(logout.res.ok, `Logout failed: ${logout.res.status}`);

  const postLogoutSession = await request("/api/auth/session", {}, toCookieHeader(logout.headers.get("set-cookie") ?? cookie));
  assert(postLogoutSession.body?.authenticated === false, "Logout did not clear the session");

  console.log("Auth flow tests passed.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});