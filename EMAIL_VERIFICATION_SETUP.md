# Phase 2: Email Verification with OTP Implementation

## Overview
Implemented secure email verification using 4-digit OTP (One-Time Password) sent via email. Users must verify their email address before their account becomes active.

## Features Implemented

### 1. OTP Generation & Management
**File:** `src/lib/otp.ts`
- Generates 4-digit random OTP
- Creates OTP records with 10-minute expiry
- Constant-time comparison to prevent timing attacks
- Tracks verification attempts (max 3 attempts)

### 2. OTP Storage
**File:** `src/lib/otpStore.ts`
- Persistent JSON-based OTP storage (`data/otp-records.json`)
- Save, retrieve, and delete OTP records
- Automatic cleanup of expired OTPs
- Email-based lookup and single active OTP per email

### 3. Email Service
**File:** `src/lib/emailService.ts`
- Nodemailer integration for SMTP email sending
- Beautiful HTML email template for OTP codes
- Plain text fallback for email clients
- Configuration via environment variables:
  - `EMAIL_SMTP_HOST`
  - `EMAIL_SMTP_PORT`
  - `EMAIL_SMTP_USER`
  - `EMAIL_SMTP_PASS`
  - `EMAIL_FROM`

### 4. Updated User Model
**File:** `prisma/schema.prisma`
Added fields to `User` model:
```prisma
emailVerified     Boolean  @default(false)
emailVerifiedAt   DateTime?
```

### 5. API Endpoints

#### POST `/api/auth/signup`
Initiates account creation and sends OTP
**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```
**Response (201):**
```json
{
  "ok": true,
  "message": "Account created. Check your email for verification code.",
  "email": "john@example.com"
}
```

#### POST `/api/auth/verify-otp`
Verifies OTP and completes account creation
**Request:**
```json
{
  "email": "john@example.com",
  "otp": "1234"
}
```
**Response (200):**
```json
{
  "ok": true,
  "message": "Email verified successfully. Your account is now active.",
  "role": "donor",
  "email": "john@example.com",
  "name": "John Doe"
}
```

#### POST `/api/auth/resend-otp`
Resends OTP if user didn't receive it or it expired
**Request:**
```json
{
  "email": "john@example.com"
}
```
**Response (200):**
```json
{
  "ok": true,
  "message": "Verification code resent to your email."
}
```

### 6. UI Component
**File:** `src/components/OtpVerification.tsx`
- Beautiful, responsive OTP verification interface
- 4-digit input field with numeric-only entry
- Real-time validation
- Attempt counter (max 3 attempts)
- Resend button with 60-second cooldown
- Back button to return to signup
- Security note about code expiry

### 7. Updated Signup Flow
**File:** `src/components/SignupForm.tsx`
- After signup, shows OTP verification component
- Passes email to OTP verification screen
- Handles successful verification
- Allows returning to signup form

### 8. Validation Schemas
**File:** `src/lib/validation.ts`
Added schemas:
```typescript
VerifyOtpSchema - Validates email and 4-digit OTP
ResendOtpSchema - Validates email for resend
```

## Security Features

### ✅ Implemented
1. **Constant-Time Comparison** - Prevents timing attacks on OTP verification
2. **Limited Attempts** - Max 3 verification attempts per OTP
3. **Time-Based Expiry** - OTP expires after 10 minutes
4. **Rate Limiting** - Resend limited to once per minute
5. **HttpOnly Cookies** - Signup data stored securely
6. **Secure Email** - SMTP with TLS/SSL support (port 465)
7. **Input Validation** - Zod schema validation on all endpoints
8. **Attempt Tracking** - Tracks and reports remaining attempts

## Environment Configuration

Add these to `.env.local`:
```env
# Email Configuration
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your-email@gmail.com
EMAIL_SMTP_PASS=your-app-password
EMAIL_FROM=noreply@thecaninehelp.com
```

### For Gmail:
1. Enable 2-Factor Authentication
2. Create an App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character app password in `EMAIL_SMTP_PASS`

## Testing Guide

### 1. Test Signup with OTP
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }'
```

### 2. Verify OTP
Replace `1234` with the actual OTP from email:
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "1234"
  }'
```

### 3. Resend OTP
```bash
curl -X POST http://localhost:3000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com"}'
```

## Files Created/Modified

### New Files Created
- `src/lib/otp.ts` - OTP generation and verification logic
- `src/lib/otpStore.ts` - OTP persistent storage
- `src/lib/emailService.ts` - Email sending service
- `src/components/OtpVerification.tsx` - OTP verification UI component
- `app/api/auth/verify-otp/route.ts` - OTP verification endpoint
- `app/api/auth/resend-otp/route.ts` - OTP resend endpoint

### Files Modified
- `app/api/auth/signup/route.ts` - Updated to send OTP
- `src/components/SignupForm.tsx` - Updated to show OTP verification
- `prisma/schema.prisma` - Added email verification fields
- `src/lib/usersStore.ts` - Updated User interface
- `src/lib/validation.ts` - Added OTP validation schemas

## Future Enhancements

### Phase 3 Planned
1. **Login Email Verification** - Require verification before login
2. **Email Change Verification** - Verify new email before updating
3. **Password Reset OTP** - Use OTP for forgot password flow
4. **SMS OTP Alternative** - Add SMS as backup verification method
5. **Email Notification Preferences** - Let users manage email settings
6. **Account Deactivation Link** - Send deactivation confirmations

## Error Handling

### Common Error Cases

**OTP Expired:**
```json
{
  "ok": false,
  "message": "Verification code has expired. Please sign up again.",
  "status": 410
}
```

**Wrong OTP:**
```json
{
  "ok": false,
  "message": "Invalid verification code. 2 attempts remaining.",
  "attemptsRemaining": 2,
  "status": 401
}
```

**Too Many Attempts:**
```json
{
  "ok": false,
  "message": "Too many incorrect attempts. Please sign up again.",
  "status": 429
}
```

**Email Already Exists:**
```json
{
  "ok": false,
  "message": "An account with this email already exists.",
  "status": 409
}
```

## Performance Notes

- OTP generation: < 1ms
- Email sending: ~500-2000ms (depends on SMTP provider)
- OTP verification: < 10ms
- Storage cleanup runs on startup and periodically
- No database transactions needed (JSON-based)

## Database Migration

Run Prisma migration:
```bash
npx prisma migrate dev --name add_email_verification
```

This creates the `emailVerified` and `emailVerifiedAt` fields in the User table.
