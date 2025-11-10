# Fast2SMS Setup Guide

## Overview

Fast2SMS is India's leading bulk SMS provider with the best pricing (₹0.15/OTP) and DLT compliance.

## Features

-   ✅ ₹0.15 per OTP (cheapest in India)
-   ✅ 99.9% delivery rate
-   ✅ DLT compliant (mandatory for commercial SMS in India)
-   ✅ OTP, Transactional, and Promotional routes
-   ✅ Voice OTP support
-   ✅ Real-time delivery tracking
-   ✅ Balance checking API
-   ✅ No setup fee, pay-as-you-go

## Setup Steps

### 1. Create Fast2SMS Account

1. Visit [https://www.fast2sms.com/](https://www.fast2sms.com/)
2. Click "Sign Up" and create a free account
3. Verify your email and phone number
4. Add initial credits (minimum ₹10, recommended ₹100 for testing)

### 2. Get API Key

1. Log in to Fast2SMS dashboard
2. Navigate to **API** → **Dev API**
3. Copy your API Key (starts with your account ID)
4. Keep it secure - don't commit to Git!

### 3. Register Sender ID

1. Go to **Sender ID** section
2. Click "Request Sender ID"
3. Enter 6-character sender ID (e.g., `HIREAC` for HireAccel)
4. Upload business registration documents
5. Wait 1-2 business days for approval

### 4. Create DLT Template (Required for Transactional)

#### What is DLT?

DLT (Distributed Ledger Technology) is mandatory by TRAI for all commercial SMS in India since March 2021.

#### Create Template:

1. Go to **DLT** section in Fast2SMS dashboard
2. Click "Add Template"
3. Choose template type: **Transactional** (for OTP)
4. Enter template content:
    ```
    Your OTP for HireAccel registration is {#var#}. Valid for 5 minutes. Do not share.
    ```
5. Submit for approval
6. Wait 24-48 hours for TRAI approval
7. Copy the approved Template ID

**Note:** Variable placeholders must be `{#var#}`, not `{otp}` or `{{otp}}`

### 5. Configure Environment Variables

Add these to your `.env` file:

```env
# SMS Provider Selection
SMS_PROVIDER=fast2sms  # Options: 'fast2sms', 'twilio', 'aws-sns'

# Fast2SMS Configuration
FAST2SMS_API_KEY=your_api_key_here
FAST2SMS_SENDER_ID=HIREAC
FAST2SMS_ROUTE=otp  # Options: 'otp', 'transactional', 'promotional'
FAST2SMS_OTP_TEMPLATE_ID=  # Required only for 'transactional' route
```

### 6. Choose Your Route

Fast2SMS offers 3 routes:

#### OTP Route (Recommended for OTP)

-   **Pros:** Simplest, no DLT template needed, fastest delivery
-   **Cons:** Fixed message format
-   **Cost:** ₹0.15/SMS
-   **Use case:** OTP verification only
-   **Config:** `FAST2SMS_ROUTE=otp`

#### Transactional Route

-   **Pros:** Custom message format, high priority
-   **Cons:** Requires DLT template approval
-   **Cost:** ₹0.15/SMS
-   **Use case:** Custom OTP messages, order updates, alerts
-   **Config:** `FAST2SMS_ROUTE=transactional` + `FAST2SMS_OTP_TEMPLATE_ID=xxx`

#### Promotional Route

-   **Pros:** Cheapest for marketing
-   **Cons:** Lower priority, DND users won't receive
-   **Cost:** ₹0.10/SMS
-   **Use case:** Marketing campaigns (NOT for OTP!)
-   **Config:** `FAST2SMS_ROUTE=promotional`

### 7. Test Your Setup

```typescript
// Test SMS sending
import { sendOTPSMS } from './services/SMSProviderService';

const result = await sendOTPSMS('+919876543210', '123456');
console.log(result);
// Expected: { success: true, messageId: 'xxx' }
```

## Pricing

### SMS Pricing

| Route         | Cost/SMS | DLT Required | Priority |
| ------------- | -------- | ------------ | -------- |
| OTP           | ₹0.15    | No           | High     |
| Transactional | ₹0.15    | Yes          | High     |
| Promotional   | ₹0.10    | Yes          | Low      |

### Voice OTP

-   ₹0.50 per call (30 seconds)
-   Useful for users who can't receive SMS

### Other Features

-   API access: FREE
-   Delivery reports: FREE
-   Sender ID registration: ₹500 (one-time, per sender ID)

## Troubleshooting

### Error: "Invalid API Key"

-   Check that `FAST2SMS_API_KEY` is correctly copied from dashboard
-   Ensure no extra spaces or quotes

### Error: "Sender ID not approved"

-   Wait for sender ID approval (1-2 business days)
-   Use default sender ID temporarily: `TXTIND`

### Error: "DLT template not found"

-   Ensure template is approved by TRAI
-   Check template ID is correctly entered in `.env`
-   Use OTP route instead (no template needed)

### Error: "Insufficient balance"

-   Recharge your account at [Fast2SMS Dashboard](https://www.fast2sms.com/)
-   Minimum recharge: ₹10

### SMS not delivered

1. Check phone number format (+919876543210)
2. Verify delivery status: `checkSMSStatus(messageId)`
3. Ensure number is not DND (for promotional route)
4. Check Fast2SMS dashboard for detailed logs

### Rate limits exceeded

-   Free tier: 100 SMS/day
-   Paid tier: Unlimited (subject to balance)
-   Solution: Upgrade to paid plan

## Best Practices

### 1. Use OTP Route for OTP

OTP route is optimized for OTP delivery with the highest success rate.

### 2. Handle Failures Gracefully

```typescript
const result = await sendOTPSMS(phone, otp);
if (!result.success) {
    // Fall back to email OTP or voice OTP
    await sendVoiceOTP(phone, otp);
}
```

### 3. Track Delivery Status

```typescript
const { messageId } = await sendOTPSMS(phone, otp);
if (messageId) {
    // Check status after 5 seconds
    setTimeout(async () => {
        const status = await checkSMSStatus(messageId);
        console.log('Delivery status:', status);
    }, 5000);
}
```

### 4. Monitor Balance

```typescript
const balance = await getSMSBalance();
if (balance.balance < 100) {
    // Send alert to admin
    console.warn('Low SMS balance:', balance);
}
```

### 5. Use Test Mode During Development

```env
TEST_SMS=true  # No actual SMS sent, saves credits
```

## Security

### Protect Your API Key

-   Never commit `.env` to Git
-   Use environment variables in production
-   Rotate API key if exposed

### Validate Phone Numbers

Our code already validates:

-   Indian mobile format (10 digits)
-   Starts with 6-9
-   E.164 format support (+91)

### Rate Limiting

Already implemented in `advancedRateLimiter.ts`:

-   3 OTP requests per hour per IP
-   3 verification attempts per OTP

## Support

### Fast2SMS Support

-   Email: support@fast2sms.com
-   Phone: +91-8518888111
-   Dashboard: [https://www.fast2sms.com/](https://www.fast2sms.com/)

### HireAccel Support

If you encounter issues with this integration:

1. Check logs: `api/logs/combined.log`
2. Verify environment variables are set
3. Test with `TEST_SMS=true` first
4. Contact dev team if issue persists

## Migration from Twilio/AWS SNS

Already using Twilio or AWS SNS? Easy migration:

### 1. Update .env

```env
# OLD
SMS_PROVIDER=twilio

# NEW
SMS_PROVIDER=fast2sms
FAST2SMS_API_KEY=your_key
FAST2SMS_SENDER_ID=HIREAC
FAST2SMS_ROUTE=otp
```

### 2. No Code Changes Required!

Our `SMSProviderService` handles provider switching automatically.

### 3. Test First

```env
TEST_SMS=true
SMS_PROVIDER=fast2sms
```

### 4. Go Live

```env
TEST_SMS=false
SMS_PROVIDER=fast2sms
```

## Cost Comparison

| Provider     | OTP Cost          | Setup Fee | Indian Support |
| ------------ | ----------------- | --------- | -------------- |
| **Fast2SMS** | **₹0.15**         | **₹0**    | **✅ Yes**     |
| Twilio       | $0.04 (~₹3.3)     | $15       | No             |
| AWS SNS      | $0.00645 (~₹0.54) | $0        | Limited        |

**Fast2SMS is 22x cheaper than Twilio for Indian users!**

## Conclusion

Fast2SMS is the recommended SMS provider for HireAccel because:

-   🏆 Best pricing for Indian market
-   🇮🇳 DLT compliant (mandatory in India)
-   ⚡ Fastest OTP delivery
-   💯 99.9% reliability
-   🔧 Easy setup and integration
-   📊 Comprehensive dashboard and analytics

Switch to Fast2SMS today and save up to 90% on SMS costs!
