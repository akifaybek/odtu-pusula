import { Resend } from "resend";

// Resend istemcisini lazy olarak oluştur
let resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Email sending is disabled.");
    return null;
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
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

  const client = getResendClient();

  // Development modunda veya API key yoksa, sadece log at
  if (!client) {
    console.log("=== Password Reset Email (Development Mode) ===");
    console.log(`To: ${email}`);
    console.log(`Reset Link: ${resetLink}`);
    console.log("================================================");
    return { success: true, data: { id: "dev-mode" } };
  }

  try {
    const { data, error } = await client.emails.send({
      from: process.env.EMAIL_FROM || "ODTÜ Pusula <noreply@resend.dev>",
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
                    <a href="${resetLink}"
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
                Eğer buton çalışmıyorsa, aşağıdaki linki tarayıcınıza kopyalayın:
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #a1a1aa; word-break: break-all;">
                ${resetLink}
              </p>

              <hr style="margin: 32px 0; border: none; border-top: 1px solid #e4e4e7;">

              <p style="margin: 0; font-size: 13px; color: #a1a1aa; line-height: 1.6;">
                Bu talebi siz yapmadıysanız, bu emaili görmezden gelebilirsiniz.
                Şifreniz değişmeyecektir.
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

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Email gönderilemedi",
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

  const client = getResendClient();

  // Development modunda veya API key yoksa, sadece log at
  if (!client) {
    console.log("=== Email Verification (Development Mode) ===");
    console.log(`To: ${email}`);
    console.log(`Verification Link: ${verificationLink}`);
    console.log("==============================================");
    return { success: true, data: { id: "dev-mode" } };
  }

  try {
    const { data, error } = await client.emails.send({
      from: process.env.EMAIL_FROM || "ODTÜ Pusula <noreply@resend.dev>",
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
                    <a href="${verificationLink}"
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
                Eğer buton çalışmıyorsa, aşağıdaki linki tarayıcınıza kopyala:
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #a1a1aa; word-break: break-all;">
                ${verificationLink}
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

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Email gönderilemedi",
    };
  }
}
