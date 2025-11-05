# Testing Guide

## SMS OTP Testing

For development and testing purposes, you can enable test SMS mode to avoid sending real SMS messages and use a predictable OTP.

### Setup

1. Add `TEST_SMS=true` to your `.env` file:

```bash
# Testing/Development Features
TEST_SMS=true  # Enable test SMS mode - uses 000000 as OTP. DISABLE IN PRODUCTION!
```

2. Restart your API server after adding the environment variable.

### Behavior

When `TEST_SMS=true` is set:

-   **All OTP generation** (both SMS and email) will return `000000` instead of a random 6-digit code
-   **SMS sending is bypassed** - no actual SMS will be sent (saves costs during development)
-   **Email OTP also affected** - for consistency, email OTPs will also be `000000`
-   **Warning logs** are generated each time the test OTP is used

### Testing Flow

1. **SMS Signup**:

    - POST `/api/auth/register-sms` with phone number
    - API will store `000000` as the OTP in database
    - No actual SMS is sent

2. **OTP Verification**:

    - POST `/api/auth/verify-sms-otp` with `otp: "000000"`
    - Verification will succeed just like with a real OTP

3. **Resend OTP**:
    - POST `/api/auth/resend-sms-otp`
    - Will generate and store `000000` again

### Security Notes

⚠️ **IMPORTANT**:

-   **NEVER enable `TEST_SMS=true` in production environments**
-   This makes OTP verification completely insecure
-   Remove or comment out `TEST_SMS=true` before deploying to staging/production
-   The system logs warnings when test mode is active

### Disabling Test Mode

To disable test mode and use real OTPs:

1. Remove `TEST_SMS=true` from your `.env` file, or set it to `false`
2. Restart the API server
3. OTPs will now be randomly generated and real SMS will be sent (requires SMS provider setup)

### Example Test Flow

```bash
# 1. Enable test mode in .env
echo "TEST_SMS=true" >> .env

# 2. Restart API server
npm run dev

# 3. Test SMS signup
curl -X POST http://localhost:3002/api/auth/register-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210",
    "firstName": "Test User",
    "role": "candidate"
  }'

# 4. Verify with test OTP (always 000000)
curl -X POST http://localhost:3002/api/auth/verify-sms-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210",
    "otp": "000000"
  }'
```

### Logs in Test Mode

When `TEST_SMS=true`, you'll see logs like:

```
[WARN] TEST_SMS enabled - using test OTP 000000. DISABLE IN PRODUCTION!
[INFO] 📱 TEST MODE: Skipping SMS send for Test User - No actual SMS sent
```

### Production Checklist

Before deploying to production:

-   [ ] `TEST_SMS` is not set or set to `false` in production `.env`
-   [ ] SMS provider (Twilio or AWS SNS) is properly configured
-   [ ] Real SMS sending is tested and working
-   [ ] No test OTP warning logs appear in production logs
