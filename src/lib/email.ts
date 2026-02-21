import nodemailer from "nodemailer";

// Create SMTP transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("SMTP configuration incomplete");
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  return transporter;
}

// Check if we're in development mode
const isDev = process.env.NODE_ENV === "development";

// HTML escape function for preventing XSS in emails
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// URL escape for href attributes (additional security)
function escapeUrl(url: string): string {
  // Only allow http, https protocols
  if (!/^https?:\/\//i.test(url)) {
    return "#";
  }
  return escapeHtml(url);
}

// Get FROM address
function getFromAddress(): string {
  return process.env.EMAIL_FROM || "ODTÜ Pusula <odtupusula@gmail.com>";
}

interface SendPasswordResetEmailParams {
  email: string;
  resetLink: string;
}

export async function sendPasswordResetEmail({
  email,
  resetLink,
}: SendPasswordResetEmailParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Always log in development
  if (isDev) {
    console.log("\n========================================");
    console.log("📧 PASSWORD RESET EMAIL");
    console.log("========================================");
    console.log(`To: ${email}`);
    console.log(`Reset Link: ${resetLink}`);
    console.log("========================================\n");
  }

  const transport = getTransporter();

  if (!transport) {
    if (isDev) {
      console.log("⚠️  SMTP not configured - simulating email in development");
      return { success: true, data: { id: "dev-mode-simulated" } };
    }
    console.error("❌ SMTP not configured - cannot send email");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const info = await transport.sendMail({
      from: getFromAddress(),
      to: email,
      subject: "Şifre Sıfırlama - ODTÜ Pusula",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Şifre Sıfırlama</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e4e4e7;">
              <h1 style="margin: 0; font-size: 24px; color: #a41034; font-weight: bold;">
                🧭 ODTÜ Pusula
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; color: #18181b;">
                Şifre Sıfırlama Talebi
              </h2>
              <p style="margin: 0 0 24px; font-size: 16px; color: #52525b; line-height: 1.6;">
                Merhaba,<br><br>
                ODTÜ Pusula hesabınız için şifre sıfırlama talebinde bulundunuz.
                Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:
              </p>

              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${escapeUrl(resetLink)}"
                       style="display: inline-block; padding: 14px 32px; background-color: #a41034; color: white; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 12px;">
                      Şifremi Sıfırla
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; font-size: 14px; color: #71717a; line-height: 1.6;">
                Bu link <strong>1 saat</strong> geçerlidir.
              </p>

              <p style="margin: 16px 0 0; font-size: 14px; color: #71717a; line-height: 1.6;">
                Buton çalışmazsa bu linki tarayıcınıza yapıştırın:
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #a1a1aa; word-break: break-all;">
                ${escapeHtml(resetLink)}
              </p>

              <hr style="margin: 32px 0; border: none; border-top: 1px solid #e4e4e7;">

              <p style="margin: 0; font-size: 13px; color: #a1a1aa; line-height: 1.6;">
                Bu talebi siz yapmadıysanız bu emaili görmezden gelebilirsiniz.
                Şifreniz değiştirilmeyecektir.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e4e4e7; border-radius: 0 0 16px 16px;">
              <p style="margin: 0; font-size: 13px; color: #71717a; text-align: center;">
                ODTÜ Pusula - Ders ve Hoca Değerlendirme Platformu<br>
                <a href="${appUrl}" style="color: #a41034; text-decoration: none;">odtupusula.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    console.log("✅ Password reset email sent:", info.messageId);
    return { success: true, data: { id: info.messageId } };
  } catch (error) {
    console.error("❌ Email send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not send email",
    };
  }
}

// ============== Email Verification ==============

interface SendVerificationEmailParams {
  email: string;
  verificationLink: string;
}

export async function sendVerificationEmail({
  email,
  verificationLink,
}: SendVerificationEmailParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Always log in development
  if (isDev) {
    console.log("\n========================================");
    console.log("📧 EMAIL VERIFICATION");
    console.log("========================================");
    console.log(`To: ${email}`);
    console.log(`Verification Link: ${verificationLink}`);
    console.log("========================================\n");
  }

  const transport = getTransporter();

  if (!transport) {
    if (isDev) {
      console.log("⚠️  SMTP not configured - simulating email in development");
      return { success: true, data: { id: "dev-mode-simulated" } };
    }
    console.error("❌ SMTP not configured - cannot send email");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const info = await transport.sendMail({
      from: getFromAddress(),
      to: email,
      subject: "Email Doğrulama - ODTÜ Pusula'ya Hoş Geldin!",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Doğrulama</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e4e4e7;">
              <h1 style="margin: 0; font-size: 24px; color: #a41034; font-weight: bold;">
                🧭 ODTÜ Pusula
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; color: #18181b;">
                ODTÜ Pusula'ya Hoş Geldin! 🎉
              </h2>
              <p style="margin: 0 0 24px; font-size: 16px; color: #52525b; line-height: 1.6;">
                Merhaba,<br><br>
                ODTÜ Pusula ailesine katıldığın için çok mutluyuz!
                Email adresini doğrulamak için aşağıdaki butona tıkla:
              </p>

              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${escapeUrl(verificationLink)}"
                       style="display: inline-block; padding: 14px 32px; background-color: #a41034; color: white; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 12px;">
                      Email Adresimi Doğrula
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; font-size: 14px; color: #71717a; line-height: 1.6;">
                Bu link <strong>24 saat</strong> geçerlidir.
              </p>

              <p style="margin: 16px 0 0; font-size: 14px; color: #71717a; line-height: 1.6;">
                Buton çalışmazsa bu linki tarayıcınıza yapıştırın:
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #a1a1aa; word-break: break-all;">
                ${escapeHtml(verificationLink)}
              </p>

              <hr style="margin: 32px 0; border: none; border-top: 1px solid #e4e4e7;">

              <p style="margin: 0; font-size: 14px; color: #52525b; line-height: 1.6;">
                Kampüste görüşürüz! 🎓<br>
                <strong>ODTÜ Pusula Ekibi</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e4e4e7; border-radius: 0 0 16px 16px;">
              <p style="margin: 0; font-size: 13px; color: #71717a; text-align: center;">
                ODTÜ Pusula - Ders ve Hoca Değerlendirme Platformu<br>
                <a href="${appUrl}" style="color: #a41034; text-decoration: none;">odtupusula.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    console.log("✅ Verification email sent:", info.messageId);
    return { success: true, data: { id: info.messageId } };
  } catch (error) {
    console.error("❌ Email send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not send email",
    };
  }
}

// ============== Admin Notification Emails ==============

interface SendAdminNotificationParams {
  adminEmails: string[];
  subject: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}

export async function sendAdminNotification({
  adminEmails,
  subject,
  title,
  message,
  actionUrl,
  actionText,
}: SendAdminNotificationParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Always log in development
  if (isDev) {
    console.log("\n========================================");
    console.log("📧 ADMIN NOTIFICATION");
    console.log("========================================");
    console.log(`To: ${adminEmails.join(", ")}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    console.log("========================================\n");
  }

  const transport = getTransporter();

  if (!transport) {
    if (isDev) {
      console.log("⚠️  SMTP not configured - simulating admin notification");
      return { success: true, data: { id: "dev-mode-simulated" } };
    }
    console.error("❌ SMTP not configured - cannot send notification");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const info = await transport.sendMail({
      from: getFromAddress(),
      to: adminEmails.join(", "),
      subject: `[Admin] ${subject}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background-color: #a41034; border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; font-size: 24px; color: white; font-weight: bold;">
                🛡️ Admin Bildirimi
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; color: #18181b;">
                ${escapeHtml(title)}
              </h2>
              <p style="margin: 0 0 24px; font-size: 16px; color: #52525b; line-height: 1.6;">
                ${escapeHtml(message)}
              </p>

              ${actionUrl ? `
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${escapeUrl(actionUrl)}"
                       style="display: inline-block; padding: 14px 32px; background-color: #a41034; color: white; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 12px;">
                      ${escapeHtml(actionText || "Detayları Gör")}
                    </a>
                  </td>
                </tr>
              </table>
              ` : ""}

              <hr style="margin: 32px 0; border: none; border-top: 1px solid #e4e4e7;">

              <p style="margin: 0; font-size: 13px; color: #a1a1aa; line-height: 1.6;">
                Bu bildirim ODTÜ Pusula admin paneli tarafından otomatik olarak gönderilmiştir.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e4e4e7; border-radius: 0 0 16px 16px;">
              <p style="margin: 0; font-size: 13px; color: #71717a; text-align: center;">
                ODTÜ Pusula - Admin Panel<br>
                <a href="${appUrl}/admin" style="color: #a41034; text-decoration: none;">Admin Paneline Git</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    console.log("✅ Admin notification sent:", info.messageId);
    return { success: true, data: { id: info.messageId } };
  } catch (error) {
    console.error("❌ Admin notification error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not send notification",
    };
  }
}

// Helper to get admin emails from database
export async function getAdminEmails(): Promise<string[]> {
  // Import prisma dynamically to avoid circular dependencies
  const { default: prisma } = await import("./prisma");

  const admins = await prisma.user.findMany({
    where: {
      role: { in: ["ADMIN", "MODERATOR"] },
      emailVerified: { not: null },
    },
    select: { email: true },
  });

  return admins.map((admin) => admin.email);
}
