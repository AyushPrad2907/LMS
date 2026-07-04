const nodemailer = require('nodemailer');

// Hostinger SMTP transporter, configured from env vars.
// Hostinger mail settings: smtp.hostinger.com, port 465 (SSL) or 587 (STARTTLS).
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: (Number(process.env.EMAIL_PORT) || 465) === 465, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function buildResetEmailHtml(userName, resetLink) {
  return `
  <!doctype html>
  <html>
    <body style="margin:0;padding:0;background:#07070f;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070f;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background:#0f0f1e;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
              <tr>
                <td style="background:linear-gradient(135deg,#6c63ff,#8b80ff);padding:28px 32px;">
                  <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:0.5px;">IMPLEXEDU</span>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;color:#eeeef8;">
                  <p style="margin:0 0 16px;font-size:15px;">Hello <strong>${userName}</strong>,</p>
                  <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#b8b8cc;">
                    We received a password reset request for your IMPLEXEDU account.
                    Click the button below to reset your password.
                  </p>
                  <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                    <tr>
                      <td style="background:linear-gradient(135deg,#6c63ff,#8b80ff);border-radius:10px;">
                        <a href="${resetLink}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">Reset Password</a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:0 0 8px;font-size:12px;color:#6b6b8a;">Or copy and paste this link into your browser:</p>
                  <p style="margin:0 0 24px;font-size:12px;color:#a89fff;word-break:break-all;">${resetLink}</p>
                  <p style="margin:0;font-size:13px;font-weight:700;color:#f5a623;">⏳ This link expires in 15 minutes.</p>
                  <p style="margin:24px 0 0;font-size:12px;color:#6b6b8a;">
                    If you didn't request this, you can safely ignore this email — your password will remain unchanged.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.07);">
                  <p style="margin:0;font-size:11px;color:#6b6b8a;">© IMPLEXEDU · student@implexedu.in</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

async function sendResetEmail(toEmail, userName, resetLink) {
  await transporter.sendMail({
    from: `"IMPLEXEDU" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Reset Your IMPLEXEDU Password',
    html: buildResetEmailHtml(userName, resetLink),
  });
}

module.exports = sendResetEmail;