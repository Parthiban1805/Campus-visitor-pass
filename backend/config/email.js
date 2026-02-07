import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
};

// Email templates
export const emailTemplates = {
    requestSubmitted: (visitorName, purpose, date) => ({
        subject: '✅ Visit Request Submitted - Campus Visitor System',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2196F3; margin-bottom: 20px;">📋 Visit Request Submitted</h2>
          <p style="color: #333; font-size: 16px;">Dear <strong>${visitorName}</strong>,</p>
          <p style="color: #555; line-height: 1.6;">
            Your visit request has been successfully submitted and is now pending approval.
          </p>
          <div style="background-color: #E3F2FD; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Purpose:</strong> ${purpose}</p>
            <p style="margin: 5px 0;"><strong>Visit Date:</strong> ${new Date(date).toLocaleDateString()}</p>
          </div>
          <p style="color: #555; line-height: 1.6;">
            You will receive an email notification once your request has been reviewed by the admin.
          </p>
          <p style="color: #777; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            <strong>Campus Visitor Management System</strong>
          </p>
        </div>
      </div>
    `,
    }),

    requestApproved: (visitorName, purpose, date, qrCodeUrl) => ({
        subject: '✅ Visit Request Approved - Your QR Pass is Ready!',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #4CAF50; margin-bottom: 20px;">✅ Visit Request Approved!</h2>
          <p style="color: #333; font-size: 16px;">Dear <strong>${visitorName}</strong>,</p>
          <p style="color: #555; line-height: 1.6;">
            Great news! Your visit request has been approved.
          </p>
          <div style="background-color: #E8F5E9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Purpose:</strong> ${purpose}</p>
            <p style="margin: 5px 0;"><strong>Visit Date:</strong> ${new Date(date).toLocaleDateString()}</p>
          </div>
          <p style="color: #555; line-height: 1.6;">
            Your QR pass is now available in the mobile app. Please present this QR code to the security personnel at the gate for entry.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666; margin-bottom: 10px;">Open the app to view your QR pass</p>
            <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; display: inline-block;">
              <p style="margin: 0; color: #888; font-size: 14px;">📱 QR Code available in app</p>
            </div>
          </div>
          <p style="color: #777; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            <strong>Campus Visitor Management System</strong>
          </p>
        </div>
      </div>
    `,
    }),

    requestRejected: (visitorName, purpose, date, remarks) => ({
        subject: '❌ Visit Request Update - Campus Visitor System',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #F44336; margin-bottom: 20px;">ℹ️ Visit Request Update</h2>
          <p style="color: #333; font-size: 16px;">Dear <strong>${visitorName}</strong>,</p>
          <p style="color: #555; line-height: 1.6;">
            We regret to inform you that your visit request could not be approved at this time.
          </p>
          <div style="background-color: #FFEBEE; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Purpose:</strong> ${purpose}</p>
            <p style="margin: 5px 0;"><strong>Visit Date:</strong> ${new Date(date).toLocaleDateString()}</p>
            ${remarks ? `<p style="margin: 5px 0;"><strong>Remarks:</strong> ${remarks}</p>` : ''}
          </div>
          <p style="color: #555; line-height: 1.6;">
            If you have any questions or would like to submit a new request, please contact the administration office.
          </p>
          <p style="color: #777; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            <strong>Campus Visitor Management System</strong>
          </p>
        </div>
      </div>
    `,
    }),
};

// Send email function
export const sendEmail = async (to, template) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: to,
            subject: template.subject,
            html: template.html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Email sending failed to ${to}:`, error.message);
        return { success: false, error: error.message };
    }
};

export default { emailTemplates, sendEmail };
