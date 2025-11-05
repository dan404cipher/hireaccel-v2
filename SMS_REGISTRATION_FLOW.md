# SMS Registration Flow - Implementation Complete

## Overview

Implemented a clean 3-step progressive disclosure registration flow using a temporary Leads table.

## Architecture

### Flow Steps

1. **Phone + Name Collection** (`/register/candidate` or `/register/hr`)

    - User enters: Phone Number, Name, selects Role
    - Backend: Creates Lead record, sends SMS OTP
    - Frontend: Stores name & phone, navigates to OTP page

2. **OTP Verification** (`/auth/verify-sms`)

    - User enters: 6-digit OTP code
    - Backend: Verifies OTP, marks Lead as verified, returns temporary JWT
    - Frontend: Stores leadId + tempToken, navigates to complete registration

3. **Email + Password Setup** (`/auth/complete-registration`)
    - User enters: Email, Password (with validation)
    - Backend: Creates User, updates Lead with email (kept permanently for analytics)
    - Frontend: Stores auth tokens, navigates to dashboard

### Database Schema

#### Lead Model (Permanent - For Logging/Analytics)

```typescript
{
  name: string (required)
  phoneNumber: string (required, unique, auto-formatted)
  role: 'candidate' | 'employer' | 'admin' (required)
  isPhoneVerified: boolean (default: false)
  email: string (optional, added after registration completion)
  source: string (optional, default: 'Not specified')
  createdAt: Date
  updatedAt: Date
}
```

**Purpose**: Leads track the complete registration funnel for analytics:

-   **Step 1**: Lead created with name + phone + source
-   **Step 2**: `isPhoneVerified` set to true after OTP
-   **Step 3**: `email` added after registration completion
-   **Persistence**: Kept permanently for analytics and manual management
-   **Management**: Delete manually or via planned dashboard feature
-   **Benefits**: Track conversion rates, drop-off points, popular sources, historical data

**Note**: Leads do NOT block registration - users can restart anytime (lead is upserted).

### Database Schema

#### Lead Model (Temporary - For Logging/Analytics)

```typescript
{
  name: string (required)
  phoneNumber: string (required, unique, auto-formatted)
  role: 'candidate' | 'employer' | 'admin' (required)
  isPhoneVerified: boolean (default: false)
  email: string (optional, added after registration completion)
  source: string (optional, default: 'Not specified')
  createdAt: Date (TTL index: 24 hours auto-expiry)
  updatedAt: Date
}
```

**Purpose**: Leads track the complete registration funnel for analytics:

-   **Step 1**: Lead created with name + phone + source
-   **Step 2**: `isPhoneVerified` set to true after OTP
-   **Step 3**: `email` added after registration completion
-   **Auto-cleanup**: TTL deletes after 24 hours
-   **Benefits**: Track conversion rates, drop-off points, popular sources

**Note**: Leads do NOT block registration - users can restart anytime (lead is upserted).

#### User Model (Permanent)

```typescript
{
    email: string(required, unique);
    phoneNumber: string(required, unique);
    password: string(required, hashed);
    role: 'candidate' | 'employer' | 'admin';
    // ... other fields
}
```

**Note**: Removed sparse indexes and temporary email logic entirely.

## API Endpoints

### 1. POST /auth/register-sms

**Request:**

```json
{
    "name": "John Doe",
    "phoneNumber": "+1234567890",
    "role": "candidate",
    "source": "website"
}
```

**Response:**

```json
{
    "success": true,
    "message": "OTP sent successfully to +1234567890"
}
```

### 2. POST /auth/verify-sms-otp

**Request:**

```json
{
    "phoneNumber": "+1234567890",
    "otp": "123456"
}
```

**Response:**

```json
{
    "success": true,
    "data": {
        "leadId": "507f1f77bcf86cd799439011",
        "tempToken": "eyJhbGciOiJIUzI1NiIs...",
        "phoneNumber": "+1234567890",
        "role": "candidate",
        "nextStep": "complete-registration"
    },
    "message": "Phone number verified. Please complete your registration."
}
```

### 3. POST /auth/complete-registration

**Headers:**

```
Authorization: Bearer <tempToken>
```

**Request:**

```json
{
    "email": "john@example.com",
    "password": "SecurePass123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "CAND-001",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "role": "candidate",
      ...
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Registration completed successfully"
}
```

## Security Features

### 1. Temporary JWT Tokens

-   Type: `lead_temp`
-   Expiry: 30 minutes
-   Payload: `{ leadId, phoneNumber, role }`
-   Used only for step 2 → step 3 transition

### 2. No MongoDB Transactions

-   **Transactions removed** (require MongoDB replica sets)
-   Using regular operations: User creation → Candidate profile → Lead update (with email)
-   Still safe: Duplicate checks + MongoDB unique constraints prevent race conditions
-   **Lead is kept permanently** for analytics (manual deletion or dashboard feature planned)

### 3. Duplicate Prevention

-   Lead: phoneNumber unique constraint
-   User: email + phoneNumber unique constraints
-   Database-level atomicity (no race conditions)

### 4. Password Validation

-   Minimum 8 characters
-   At least 1 uppercase letter
-   At least 1 lowercase letter
-   At least 1 number
-   Bcrypt hashing with salt rounds: 12

### 5. Phone Number Formatting

-   Auto-formats on save: `+1 (234) 567-8900`
-   Pre-save hook ensures consistency

### 6. Auto-Cleanup

-   TTL Index: Leads expire after 24 hours
-   Prevents database bloat from incomplete registrations

## Frontend Implementation

### Pages Created/Updated

1. **ForJobSeekersSignup.tsx** - Updated to use `name` field
2. **ForEmployerSignup.tsx** - Updated to use `name` field
3. **SMSOTPVerificationPage.tsx** - Updated to handle tempToken
4. **CompleteRegistrationPage.tsx** - NEW: Email + Password form

### API Client Methods

```typescript
// api.ts
signupSMS(data: { name: string; phoneNumber: string; role: string; source?: string })
verifySMSOTP(data: { phoneNumber: string; otp: string })
completeRegistration(data: { email: string; password: string }, tempToken: string)
```

### Session Storage Keys

-   `name` - User's name from step 1
-   `phoneNumber` - Phone number from step 1
-   `lead_verification_data` - Contains:
    ```json
    {
        "leadId": "...",
        "tempToken": "...",
        "phoneNumber": "...",
        "role": "...",
        "timestamp": 1234567890
    }
    ```

## Testing Checklist

### Happy Path

-   [ ] Enter phone + name → OTP sent
-   [ ] Verify OTP → Temporary token received
-   [ ] Enter email + password → User created
-   [ ] Lead deleted automatically
-   [ ] Redirected to dashboard
-   [ ] Can login with email + password
-   [ ] Can login with phone + password

### Error Cases

-   [ ] Duplicate phone number → Error on step 1
-   [ ] Invalid OTP → Error on step 2
-   [ ] Expired tempToken (>30 min) → Error on step 3
-   [ ] Duplicate email → Error on step 3
-   [ ] Weak password → Error on step 3
-   [ ] Session expired → Redirect to step 1

### Auto-Cleanup

-   [ ] Unverified Lead deleted after 24 hours
-   [ ] Verified but incomplete Lead deleted after 24 hours

## Database Migration Notes

### Cleanup Old Data (Optional)

If you have existing users with temporary emails (`@local.temp`):

```javascript
// MongoDB Shell
db.users.find({ email: /@local\.temp$/i }).count();
// Decide whether to keep or delete these records
```

### Index Changes

-   Removed sparse indexes on User.email and User.phoneNumber
-   Both fields now required and unique (standard indexes)
-   Added TTL index on Lead.createdAt (24 hours)

## Benefits of This Approach

1. **No Temporary Emails** - Clean database, no fake emails
2. **Progressive Disclosure** - Better UX, less overwhelming
3. **Atomic Operations** - No race conditions
4. **Auto-Cleanup** - TTL indexes prevent bloat
5. **Type-Safe** - TypeScript throughout
6. **Secure** - Temporary tokens, bcrypt, transactions
7. **Standard** - Follows MongoDB best practices

## Files Modified

### Backend

-   `api/src/models/Lead.ts` - NEW
-   `api/src/models/User.ts` - Removed sparse indexes
-   `api/src/utils/jwt.ts` - Added lead token utilities
-   `api/src/services/AuthService.ts` - Complete rewrite
-   `api/src/controllers/AuthController.ts` - Updated endpoints
-   `api/src/routes/auth.ts` - Added new route

### Frontend

-   `client/src/services/api.ts` - Updated types & methods
-   `client/src/pages/ForJobSeekersSignup.tsx` - firstName → name
-   `client/src/pages/ForEmployerSignup.tsx` - firstName → name
-   `client/src/pages/auth/SMSOTPVerificationPage.tsx` - Updated flow
-   `client/src/pages/auth/CompleteRegistrationPage.tsx` - NEW
-   `client/src/App.tsx` - Added route

## Next Steps

1. Test the complete flow end-to-end
2. Monitor Lead auto-deletion (check after 24 hours)
3. Optionally clean up old @local.temp users
4. Consider adding analytics events for each step
5. Add rate limiting for OTP requests (already implemented in OTPService)
