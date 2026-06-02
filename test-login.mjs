import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const base = 'http://localhost:3000';
const testEmail = 'logintest.' + Date.now() + '@test.com';
const testPassword = 'TestPass123';
const testName = 'Login Test';

console.log('Testing login flow with:', { testEmail, testPassword });

try {
  // Signup
  const signupRes = await fetch(base + '/api/auth/signup', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: testName, email: testEmail, password: testPassword, confirmPassword: testPassword, role: 'donor' }),
  });
  const signupBody = await signupRes.json();
  console.log('1. Signup response:', signupRes.status, signupBody);
  
  if (!signupRes.ok) {
    console.error('Signup failed');
    process.exit(1);
  }

  // Get OTP
  const otpRecord = await prisma.otpRecord.findUnique({ where: { email: testEmail } });
  console.log('2. OTP found:', otpRecord?.otp);

  if (!otpRecord) {
    console.error('OTP not found');
    process.exit(1);
  }

  // Get signup cookie
  const signupCookie = (signupRes.headers.get('set-cookie') || '').split(';')[0];
  console.log('3. Signup cookie:', signupCookie);

  // Verify OTP
  const verifyRes = await fetch(base + '/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: signupCookie },
    body: JSON.stringify({ email: testEmail, otp: otpRecord.otp }),
  });
  const verifyBody = await verifyRes.json();
  console.log('4. Verify response:', verifyRes.status, verifyBody);

  if (!verifyRes.ok) {
    console.error('Verify failed');
    process.exit(1);
  }

  // Login
  const loginRes = await fetch(base + '/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword, role: 'donor', rememberMe: false }),
  });
  const loginBody = await loginRes.json();
  console.log('5. Login response:', loginRes.status, loginBody);

  if (!loginRes.ok) {
    console.error('LOGIN FAILED - Error:', loginBody);
    process.exit(1);
  }

  console.log('\n✅ Full flow successful!');
} catch (error) {
  console.error('Error:', error.message);
  await prisma.$disconnect();
  process.exit(1);
}

await prisma.$disconnect();
