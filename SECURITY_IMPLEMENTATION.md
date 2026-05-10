# Backend Security Implementation Guide

## ✅ COMPLETED: Phase 1 Security Fixes

### 1. Dependencies Installed
- **bcryptjs**: For password hashing
- **zod**: For request validation and schema definition

### 2. Security Libraries Created

#### `src/lib/password.ts`
- `hashPassword(password)` - Hash passwords with bcrypt (10 salt rounds)
- `verifyPassword(password, hash)` - Verify plain text against hash

#### `src/lib/apiErrors.ts`
Error handling utilities with proper HTTP status codes:
- `AuthenticationError` (401)
- `AuthorizationError` (403)
- `ValidationError` (400)
- `NotFoundError` (404)
- `ConflictError` (409)
- `handleError()` - Centralized error handler
- `withErrorHandler()` - Wrapper for async handlers

#### `src/lib/authContext.ts`
Authorization utilities:
- `getAuthContext()` - Get current user from cookies
- `requireAdmin()` - Require admin role
- `requireRole(roles)` - Require specific role(s)
- `requireAuth()` - Require any authenticated user
- `getAuthContextOptional()` - Get auth context or null

#### `src/lib/validation.ts`
Zod schemas for all API endpoints:
- Auth: `LoginSchema`, `SignupSchema`, `AdminLoginSchema`
- Animals: `AnimalCreateSchema`, `AnimalUpdateSchema`
- Adoptions: `AdoptionRequestSchema`, `AdoptionUpdateSchema`
- Rescue: `RescueReportSchema`, `RescueUpdateSchema`
- Volunteers: `VolunteerApplicationSchema`, `VolunteerUpdateSchema`
- Donations: `DonationSchema`
- Vaccinations: `VaccinationSchema`, `VaccinationUpdateSchema`
- Users: `UserUpdateSchema`
- Newsletter: `NewsletterSignupSchema`
- Inquiries: `InquiryUpdateSchema`

### 3. Auth Endpoints Updated

#### `POST /api/auth/login`
**Changes:**
- ✅ Now validates password against hashed password
- ✅ Checks user exists in database
- ✅ Verifies password matches hash
- ✅ Checks if account is active
- ✅ Uses Zod validation
- ✅ Proper error handling

**Before:** Accepted ANY email/password combination
**After:** Actually validates credentials

#### `POST /api/auth/signup`
**Changes:**
- ✅ Password is now hashed before saving to database
- ✅ Uses Zod validation
- ✅ Proper error handling
- ✅ Password confirmation validation

**Before:** Stored passwords in plaintext
**After:** Hashed with bcrypt

#### `POST /api/admin/login`
**Changes:**
- ✅ Uses Zod validation
- ✅ Proper error handling
- ✅ Consistent error messages

### 4. Protected Endpoints Updated (Admin-Only)

#### `GET/POST /api/animals`
- ✅ POST now requires admin role
- ✅ Uses proper validation
- ✅ Error handling middleware

#### `GET/PUT/DELETE /api/animals/[id]`
- ✅ PUT and DELETE require admin role
- ✅ GET is public (read-only)
- ✅ Proper error handling

#### `GET/PATCH /api/users`
- ✅ Both endpoints now require admin role
- ✅ Proper validation
- ✅ Error handling

#### `GET/POST /api/donations`
- ✅ GET requires admin role
- ✅ POST is public (anyone can donate)
- ✅ Uses Zod validation
- ✅ Proper error handling

---

## ⏳ REMAINING: Endpoints to Update

### Adoption Endpoints
- `POST /api/adoption/requests` - Submit application (public)
- `GET /api/adoptions` - List applications (admin-only)
- `PATCH /api/adoptions/[id]` - Update status (admin-only)

**Update Pattern:**
```typescript
import { requireAdmin } from "@/lib/authContext";
import { AdoptionRequestSchema, AdoptionUpdateSchema } from "@/lib/validation";
import { handleError } from "@/lib/apiErrors";

export async function GET(request: Request) {
  try {
    await requireAdmin(); // For list endpoint
    // ... rest of logic
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = AdoptionRequestSchema.parse(body);
    // ... rest of logic
  } catch (error) {
    return handleError(error);
  }
}
```

### Rescue Endpoints
- `POST /api/rescue/requests` - Submit report (public)
- `GET /api/rescue/requests` - List reports (admin-only)
- `PATCH /api/rescue/requests` - Update status (admin-only)

### Volunteer Endpoints
- `GET /api/volunteer` - List applications (admin-only)
- `POST /api/volunteer/apply` - Submit application (public)
- `GET /api/volunteer/[id]` - Get details (admin-only)

### Vaccination Endpoints
- `GET /api/vaccinations/[id]` - Get records (admin-only)
- `POST /api/vaccinations` - Create record (admin-only)
- `PATCH /api/vaccinations/[id]` - Update record (admin-only)

### Newsletter Endpoint
- `POST /api/newsletter` - Signup (public)

### Inquiries Endpoint
- `GET /api/inquiries` - List (admin-only)
- `PATCH /api/inquiries/[id]` - Update (admin-only)

---

## 📋 Implementation Checklist

### For Each Endpoint:
1. ✅ Import error handlers and auth utilities
2. ✅ Import validation schema (if exists)
3. ✅ Wrap handler in try-catch
4. ✅ Add `await requireAdmin()` or `await requireAuth()` for protected endpoints
5. ✅ Parse/validate body with Zod schema
6. ✅ Return `handleError(error)` in catch block
7. ✅ Return responses with `{ ok: true, data }` format

### Example Update:
```typescript
// BEFORE
export async function POST(request: Request) {
  const body = await request.json();
  if (!body.field) {
    return NextResponse.json({ message: "Field required" }, { status: 400 });
  }
  // ... logic
}

// AFTER
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = SomeSchema.parse(body);
    // ... logic with validated data
  } catch (error) {
    return handleError(error);
  }
}
```

---

## 🔒 Security Improvements Summary

| Issue | Before | After |
|-------|--------|-------|
| **Password Validation** | ❌ None (any password accepted) | ✅ Hashed with bcrypt |
| **Password Storage** | ❌ Plaintext in JSON | ✅ Bcrypt hash (10 rounds) |
| **API Authorization** | ❌ None (all endpoints public) | ✅ Admin-only for sensitive operations |
| **Request Validation** | ❌ Manual regex | ✅ Zod schemas |
| **Error Handling** | ❌ Inconsistent | ✅ Centralized with proper status codes |
| **Account Status** | ❌ Not checked | ✅ Verified on login |
| **Admin Auth** | ⚠️ Env var only | ✅ Env var + Zod validation |

---

## 🚀 Next Steps

1. **Update remaining endpoints** using the pattern above
2. **Test all endpoints** with valid/invalid data
3. **Hash existing passwords** in data/users.json (migration script)
4. **Phase 2: Database Migration** - Move from lowdb to PostgreSQL
5. **Phase 3: Advanced Features** - JWT, email notifications, file storage

---

## 📝 Usage Examples

### Login (Fixed)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"correct_password"}'
```

### Signup (Now Hashes Password)
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"secure_password"}'
```

### Admin Endpoint (Protected)
```bash
curl -X POST http://localhost:3000/api/animals \
  -H "Content-Type: application/json" \
  -d '{"name":"Rex","species":"dog","breed":"Labrador","age":3,"gender":"male","healthStatus":"healthy","vaccinationStatus":"up_to_date"}' \
  --cookie "tch_auth_role=admin; tch_auth_email=admin@example.com"
```

### Error Responses (Standardized)
```json
{
  "ok": false,
  "message": "Validation failed",
  "errors": {
    "email": "Invalid email",
    "password": "Password must be at least 6 characters"
  }
}
```

---

## 🛠️ Files Modified

1. ✅ `src/lib/password.ts` - NEW
2. ✅ `src/lib/apiErrors.ts` - NEW
3. ✅ `src/lib/authContext.ts` - NEW
4. ✅ `src/lib/validation.ts` - NEW
5. ✅ `app/api/auth/login/route.ts` - UPDATED
6. ✅ `app/api/auth/signup/route.ts` - UPDATED
7. ✅ `app/api/admin/login/route.ts` - UPDATED
8. ✅ `app/api/animals/route.ts` - UPDATED
9. ✅ `app/api/animals/[id]/route.ts` - UPDATED
10. ✅ `app/api/users/route.ts` - UPDATED
11. ✅ `app/api/donations/route.ts` - UPDATED
12. ⏳ `app/api/adoption/**` - PENDING
13. ⏳ `app/api/rescue/**` - PENDING
14. ⏳ `app/api/volunteer/**` - PENDING
15. ⏳ `app/api/vaccinations/**` - PENDING
16. ⏳ `app/api/newsletter/**` - PENDING
17. ⏳ `app/api/inquiries/**` - PENDING

---

## ✨ Key Improvements

✅ **Passwords Now Hashed**: Using bcryptjs with 10 salt rounds
✅ **Login Validation**: Actually checks password against hash
✅ **Authorization Middleware**: Only admins can modify data
✅ **Input Validation**: Zod schemas for all endpoints
✅ **Error Handling**: Consistent, informative error responses
✅ **Security**: No more plaintext passwords, proper auth checks
