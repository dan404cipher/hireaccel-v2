import nodemailer from 'nodemailer';
import { logger } from '@/config/logger';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env['EMAIL_HOST'] || 'smtp.gmail.com',
    port: parseInt(process.env['EMAIL_PORT'] || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env['EMAIL_USER'],
      pass: process.env['EMAIL_PASS'],
    },
  });

  static async sendOTP(email: string, otp: string, firstName: string = 'User'): Promise<void> {
    try {
      const mailOptions = {
        from: `"Hiring Accelerator" <${process.env['EMAIL_USER']}>`,
        to: email,
        subject: 'Verify Your Email - Hiring Accelerator',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .otp-code { background: #667eea; color: white; font-size: 32px; font-weight: bold; padding: 15px 30px; border-radius: 8px; text-align: center; margin: 20px 0; letter-spacing: 5px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
              .logo { font-size: 28px; font-weight: bold; }
              .highlight { color: #667eea; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">🚀 Hiring Accelerator</div>
                <h1>Welcome aboard, ${firstName}!</h1>
              </div>
              <div class="content">
                <h2>Verify Your Email Address</h2>
                <p>Thank you for signing up with Hiring Accelerator! To complete your registration and secure your account, please verify your email address using the OTP below:</p>
                
                <div class="otp-code">${otp}</div>
                
                <p><strong>This OTP is valid for 10 minutes.</strong></p>
                
                <p>If you didn't create an account with us, please ignore this email.</p>
                
                <h3>What's next?</h3>
                <ul>
                  <li>✅ Enter the OTP to verify your email</li>
                  <li>🎯 Complete your profile setup</li>
                  <li>🚀 Start using Hiring Accelerator</li>
                </ul>
              </div>
              <div class="footer">
                <p>This is an automated message from Hiring Accelerator.</p>
                <p>© 2024 Hiring Accelerator. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Welcome to Hiring Accelerator, ${firstName}!

Your email verification code is: ${otp}

This OTP is valid for 10 minutes. Please enter this code to complete your registration.

If you didn't create an account with us, please ignore this email.

Best regards,
Hiring Accelerator Team
        `
      };

      await this.transporter.sendMail(mailOptions);
      
      logger.info('OTP email sent successfully', {
        email: email,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to send OTP email', {
        email: email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error('Failed to send verification email');
    }
  }

  static async sendWelcomeEmail(email: string, firstName: string, customId: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"Hiring Accelerator" <${process.env['EMAIL_USER']}>`,
        to: email,
        subject: 'Welcome to Hiring Accelerator!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Hiring Accelerator</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .user-id { background: #667eea; color: white; font-family: monospace; font-size: 18px; font-weight: bold; padding: 10px 20px; border-radius: 6px; text-align: center; margin: 15px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
              .logo { font-size: 28px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">🎉 Hiring Accelerator</div>
                <h1>Account Created Successfully!</h1>
              </div>
              <div class="content">
                <h2>Welcome to the team, ${firstName}!</h2>
                <p>Your account has been successfully created and verified. You're now ready to start using Hiring Accelerator!</p>
                
                <p><strong>Your User ID:</strong></p>
                <div class="user-id">${customId}</div>
                
                <h3>Getting Started:</h3>
                <ul>
                  <li>🏠 Access your dashboard</li>
                  <li>👤 Complete your profile</li>
                  <li>🚀 Start exploring opportunities</li>
                </ul>
                
                <p>If you have any questions, feel free to reach out to our support team.</p>
              </div>
              <div class="footer">
                <p>© 2024 Hiring Accelerator. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      
      logger.info('Welcome email sent successfully', {
        email: email,
        customId: customId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to send welcome email', {
        email: email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Don't throw error for welcome email as it's not critical
    }
  }
}
