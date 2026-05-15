const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  fail('ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment to run this test.');
}

async function request(path, init = {}, cookie) {
  const headers = { 'content-type': 'application/json', ...(init.headers || {}) };
  if (cookie) headers.cookie = cookie;
  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  const text = await res.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text }; }
  return { res, body, raw: text, headers: res.headers };
}

async function login() {
  const { res, body, headers } = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, rememberMe: true }),
  });

  if (!res.ok) {
    console.error('Login failed:', res.status, body);
    return null;
  }

  const setCookie = headers.get('set-cookie');
  if (!setCookie) return null;
  // use the raw cookie header
  return setCookie.split(',').map((s) => s.trim()).join('; ');
}

async function run() {
  console.log('Running protected-route matrix against', BASE_URL);

  // unauth check: /api/adoptions should be 401
  const unauth = await request('/api/adoptions');
  console.log('/api/adoptions without cookie ->', unauth.res.status);

  const cookie = await login();
  if (!cookie) fail('Unable to login with provided admin creds');
  console.log('Logged in, cookie length:', cookie.length);

  const authAdoptions = await request('/api/adoptions', { method: 'GET' }, cookie);
  console.log('/api/adoptions with cookie ->', authAdoptions.res.status);

  const authDashboard = await request('/api/dashboard/stats', { method: 'GET' }, cookie);
  console.log('/api/dashboard/stats with cookie ->', authDashboard.res.status);

  const createAnimal = await request('/api/animals', {
    method: 'POST',
    body: JSON.stringify({ name: 'smoke-test', species: 'dog' }),
  }, cookie);
  console.log('POST /api/animals with cookie ->', createAnimal.res.status);

  if (unauth.res.status === 401 && authAdoptions.res.status === 200) {
    console.log('Protected-route matrix: basic auth checks passed.');
    process.exit(0);
  }

  console.error('Protected-route matrix: some checks failed.');
  process.exit(2);
}

run().catch((e) => {
  console.error('Test run failed:', e);
  process.exit(1);
});
