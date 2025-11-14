import { Resend } from 'resend';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const sendTestEmail = async () => {
  try {
    // Get Resend API key from environment
    const resendApiKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM || 'noreply@updates.hireaccel.in';

    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY is not set in environment variables');
      process.exit(1);
    }

    const resend = new Resend(resendApiKey);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Test Email from HireAccel</h1>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p>This is a test email sent from the HireAccel application.</p>
            <p>If you received this email, it means the email service is working correctly! ✅</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <div class="footer">
            <p>This is an automated test message from Hiring Accelerator.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Test Email from HireAccel

Hello!

This is a test email sent from the HireAccel application.

If you received this email, it means the email service is working correctly!

Timestamp: ${new Date().toLocaleString()}

This is an automated test message from Hiring Accelerator.
    `;

    console.log('📧 Sending test email to danushtom7@gmail.com...');

    const result = await resend.emails.send({
      from: `Hiring Accelerator <${emailFrom}>`,
      to: 'danushtom7@gmail.com',
      subject: 'Test Email from HireAccel',
      html: htmlContent,
      text: textContent,
    });

    console.log('✅ Email sent successfully!');
    console.log('📬 Email ID:', result.data?.id);
    console.log('📧 To: danushtom7@gmail.com');
    console.log('📅 Sent at:', new Date().toLocaleString());
  } catch (error: any) {
    console.error('❌ Failed to send email:', error);
    if (error.message) {
      console.error('Error message:', error.message);
    }
    process.exit(1);
  }
};

// Run the script
sendTestEmail();

