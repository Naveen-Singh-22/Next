import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const base = process.env.E2E_BASE || 'http://localhost:3001';
  const email = `e2e.user.${Date.now()}@example.com`;
  const password = 'TestPass123!';

  console.log('Signing up', email);
  const signupRes = await fetch(`${base}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'E2E User', email, password, confirmPassword: password }),
  });
  const signup = await signupRes.json();
  console.log('signup:', signup);
  const setCookie = signupRes.headers.get('set-cookie') || signupRes.headers.get('set-Cookie') || '';

  // Wait briefly for DB write
  await new Promise((r) => setTimeout(r, 500));

  const otpRow = await prisma.otpRecord.findUnique({ where: { email } });
  if (!otpRow) {
    console.error('OTP record not found. SMTP may be configured; check email inbox or disable SMTP for dev.');
    process.exit(1);
  }

  const otp = otpRow.otp;
  console.log('Found OTP in DB:', otp);

  console.log('Verifying OTP...');
  const verifyRes = await fetch(`${base}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
    // pass signup cookie so server can complete account creation
    ...(setCookie ? { headers: { 'Content-Type': 'application/json', Cookie: setCookie } } : {}),
  });
  const verify = await verifyRes.json();
  console.log('verify:', verify);

  if (!verify.ok) {
    console.error('Verify failed');
    process.exit(1);
  }

  console.log('Logging in...');
  const loginRes = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role: 'donor', rememberMe: false }),
  });
  const login = await loginRes.json();
  console.log('login:', login);

  if (!login.ok) {
    console.error('Login failed');
    process.exit(1);
  }

  console.log('E2E auth flow succeeded for', email);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
