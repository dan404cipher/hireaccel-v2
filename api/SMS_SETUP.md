# 📱 SMS OTP Service Setup Guide

This guide helps you set up SMS OTP authentication for the Hire Accel platform using either **Twilio** or **AWS SNS**.

## 🚀 Quick Setup

### Method 1: Automated Setup (Recommended)

```bash
# Run the setup script
chmod +x setup-sms.sh
./setup-sms.sh
```

### Method 2: Manual Setup

#### Option A: Twilio Setup

```bash
# Install Twilio SDK
npm install twilio

# Add to your .env file
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

#### Option B: AWS SNS Setup

```bash
# Install AWS SDK
npm install @aws-sdk/client-sns

# Add to your .env file
SMS_PROVIDER=aws-sns
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_SNS_SENDER_ID=HireAccel  # Optional
```

## 📋 Provider Comparison

| Feature              | Twilio            | AWS SNS        |
| -------------------- | ----------------- | -------------- |
| **Setup Difficulty** | Easy              | Medium         |
| **Cost (India)**     | ~₹0.60/SMS        | ~₹0.70/SMS     |
| **Reliability**      | Excellent         | Excellent      |
| **Scale**            | Small-Medium      | Large          |
| **Features**         | Rich SMS features | Basic SMS      |
| **Global Reach**     | 180+ countries    | 200+ countries |

## 🔧 Configuration Details

### Environment Variables

Create or update your `.env` file:

```bash
# Copy the example file
cp .env.sms.example .env

# Edit with your credentials
nano .env
```

### Required Variables by Provider

#### Twilio

-   `SMS_PROVIDER=twilio`
-   `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
-   `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token
-   `TWILIO_PHONE_NUMBER` - Your Twilio phone number (format: +1234567890)

#### AWS SNS

-   `SMS_PROVIDER=aws-sns`
-   `AWS_REGION` - AWS region (recommended: `ap-south-1` for India)
-   `AWS_ACCESS_KEY_ID` - Your AWS Access Key
-   `AWS_SECRET_ACCESS_KEY` - Your AWS Secret Key
-   `AWS_SNS_SENDER_ID` - (Optional) Sender ID, max 6 chars for India

## 🌍 Provider Setup Instructions

### Twilio Setup

1. **Create Account**: Go to [Twilio Console](https://console.twilio.com/)
2. **Get Credentials**:
    - Account SID and Auth Token from Dashboard
    - Buy a phone number from Phone Numbers → Manage → Buy a number
3. **Verify Setup**: Send a test SMS from Console
4. **Pricing**: Check current rates at [Twilio Pricing](https://www.twilio.com/sms/pricing)

### AWS SNS Setup

1. **AWS Account**: Ensure you have an AWS account
2. **IAM Permissions**: Create IAM user with SNS permissions:
    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": ["sns:Publish", "sns:GetSMSAttributes", "sns:SetSMSAttributes"],
                "Resource": "*"
            }
        ]
    }
    ```
3. **SMS Sandbox**: Move out of SMS sandbox mode for production
4. **Sender ID**: Register sender ID for better delivery (India)

## 🧪 Testing

### Development Mode

Set `NODE_ENV=development` to enable mock SMS (logs only):

```bash
NODE_ENV=development npm run dev
```

### Production Testing

1. Set `NODE_ENV=production`
2. Configure your SMS provider
3. Test with your own phone number first

### Test API Endpoints

```bash
# SMS Signup
curl -X POST http://localhost:3002/auth/register-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210",
    "firstName": "Test User",
    "role": "candidate",
    "source": "API Test"
  }'

# Verify SMS OTP
curl -X POST http://localhost:3002/auth/verify-sms-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210",
    "otp": "123456"
  }'
```

## 🚨 Production Considerations

### Security

-   ✅ Never log OTP codes in production
-   ✅ Use environment variables for credentials
-   ✅ Implement rate limiting (already done)
-   ✅ Validate phone numbers before sending
-   ✅ Set proper CORS policies

### Performance

-   ✅ Implement retry logic for failed SMS
-   ✅ Use async SMS sending (already done)
-   ✅ Monitor SMS delivery rates
-   ✅ Set up error alerting

### Compliance (India)

-   ✅ Register with DLT (Distributed Ledger Technology)
-   ✅ Use approved SMS templates
-   ✅ Include opt-out instructions
-   ✅ Comply with TRAI regulations

## 🐛 Troubleshooting

### Common Issues

**1. "SMS SDK not available" Error**

```bash
# Install the required SDK
npm install twilio  # or @aws-sdk/client-sns
```

**2. "Missing environment variables" Error**

-   Check your `.env` file exists
-   Verify all required variables are set
-   Restart your server after changes

**3. SMS Not Received**

-   Check phone number format (+91xxxxxxxxxx)
-   Verify SMS provider dashboard for delivery status
-   Ensure account is not in sandbox mode

**4. AWS SNS Permission Denied**

-   Check IAM user has SNS permissions
-   Verify AWS credentials are correct
-   Ensure region is set properly

### Debug Mode

Enable debug logging:

```bash
DEBUG=sms:* npm run dev
```

## 💰 Cost Optimization

### Twilio

-   Use short codes for high volume
-   Implement SMS deduplication
-   Monitor usage via dashboard

### AWS SNS

-   Use appropriate message types
-   Monitor costs via CloudWatch
-   Set up billing alerts

## 📞 Support

-   **Twilio Support**: [Twilio Help Center](https://support.twilio.com/)
-   **AWS Support**: [AWS SNS Documentation](https://docs.aws.amazon.com/sns/)
-   **Project Issues**: Create an issue in this repository

## 🔄 Switching Providers

You can switch between providers anytime by changing the `SMS_PROVIDER` environment variable:

```bash
# Switch to Twilio
SMS_PROVIDER=twilio

# Switch to AWS SNS
SMS_PROVIDER=aws-sns
```

No code changes required! 🎉
