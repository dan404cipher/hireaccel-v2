#!/bin/bash

# SMS Service Setup Script for Hire Accel API
# This script helps set up SMS providers (Twilio or AWS SNS)

echo "🚀 Hire Accel SMS Service Setup"
echo "================================="
echo ""

# Function to install Twilio
install_twilio() {
    echo "📱 Installing Twilio SDK..."
    npm install twilio
    echo "✅ Twilio SDK installed successfully!"
    echo ""
    echo "📋 Required Environment Variables for Twilio:"
    echo "SMS_PROVIDER=twilio"
    echo "TWILIO_ACCOUNT_SID=your_account_sid"
    echo "TWILIO_AUTH_TOKEN=your_auth_token"  
    echo "TWILIO_PHONE_NUMBER=your_twilio_phone_number"
    echo ""
    echo "🔗 Get your Twilio credentials at: https://console.twilio.com/"
}

# Function to install AWS SNS
install_aws_sns() {
    echo "☁️ Installing AWS SNS SDK..."
    npm install @aws-sdk/client-sns
    echo "✅ AWS SNS SDK installed successfully!"
    echo ""
    echo "📋 Required Environment Variables for AWS SNS:"
    echo "SMS_PROVIDER=aws-sns"
    echo "AWS_REGION=ap-south-1"
    echo "AWS_ACCESS_KEY_ID=your_access_key"
    echo "AWS_SECRET_ACCESS_KEY=your_secret_key"
    echo "AWS_SNS_SENDER_ID=HireAccel  # Optional, max 6 chars for India"
    echo ""
    echo "🔗 Set up AWS SNS at: https://console.aws.amazon.com/sns/"
}

# Function to install both
install_both() {
    echo "📦 Installing both Twilio and AWS SNS SDKs..."
    npm install twilio @aws-sdk/client-sns
    echo "✅ Both SDKs installed successfully!"
    echo ""
    echo "📋 You can switch between providers using SMS_PROVIDER environment variable"
    echo "Set SMS_PROVIDER=twilio or SMS_PROVIDER=aws-sns"
}

# Main menu
echo "Which SMS provider would you like to set up?"
echo "1) Twilio (Recommended for small scale)"
echo "2) AWS SNS (Recommended for large scale)"  
echo "3) Both (Install both options)"
echo "4) Skip installation"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        install_twilio
        ;;
    2)
        install_aws_sns
        ;;
    3)
        install_both
        ;;
    4)
        echo "⏭️ Skipping SMS provider installation"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "📄 Don't forget to:"
echo "1. Copy .env.sms.example to your .env file"
echo "2. Fill in your SMS provider credentials"
echo "3. Set NODE_ENV=production for production use"
echo ""
echo "🎉 SMS service setup complete!"