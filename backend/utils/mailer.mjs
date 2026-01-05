import { Resend } from 'resend';
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env explicitly if not loaded by server.mjs (for standalone testing)
dotenv.config({ path: join(__dirname, "..", "..", ".env") });

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send Verification Email
 * @param {string} to - Recipient email address
 * @param {string} name - Recipient name
 * @param {string} token - Unique verification token
 */
export async function sendVerificationEmail(to, name, token) {
  // Use protocol and host from ENV or default to localhost for dev
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const verifyLink = `${baseUrl}/api/auth/verify-email?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'DocterBee <admin@docterbee.com>', // Sesuaikan dengan domain yang Anda verifikasi di Resend
      reply_to: 'docterbeeofficial@gmail.com', // Balasan user akan masuk ke sini
      to: to,
      subject: 'Verifikasi Akun DocterBee 🐝',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="https://docterbee.com/assets/images/logo-docterbee.png" alt="DocterBee" style="height: 50px;">
          </div>
          <h2 style="color: #1e293b; text-align: center;">Halo ${name},</h2>
          <p style="color: #475569; line-height: 1.6; text-align: center;">
            Terima kasih telah menggunakan DocterBee. Untuk mengamankan akun Anda dan mengaktifkan fitur ganti password mandiri, silakan verifikasi email Anda dengan mengklik tombol di bawah ini:
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verifyLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Verifikasi Email Saya
            </a>
          </div>
          <p style="color: #64748b; font-size: 14px; text-align: center;">
            Jika tombol tidak berfungsi, salin dan tempel link berikut ke browser Anda:<br>
            <a href="${verifyLink}" style="color: #6366f1;">${verifyLink}</a>
          </p>
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 32px 0;">
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            Abaikan email ini jika Anda tidak pernah merasa melakukan pendaftaran atau update email di DocterBee.
          </p>
        </div>
      `,
      headers: {
        'X-Entity-Ref-ID': Date.now().toString()
      }
    });

    if (error) {
      console.error("❌ Resend Error:", error);
      throw new Error(error.message);
    }

    return data;
  } catch (err) {
    console.error("❌ Failed to send verification email:", err);
    throw err;
  }
}
