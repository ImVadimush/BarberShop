// lib/email.ts
import crypto from "crypto"

// ✅ Resend email service
const RESEND_API_KEY = process.env.RESEND_API_KEY
const BASE_URL = "https://barber-shop-two-ebon.vercel.app"

interface EmailOptions {
  to: string
  subject: string
  html: string
}

async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  try {
    // ✅ DEVELOPMENT & PREVIEW MODE - loguj zamiast wysyłać
    const isDevelopment = process.env.NODE_ENV === 'development'
    const isPreview = process.env.VERCEL_ENV === 'preview'
    
    if (isDevelopment || isPreview || !RESEND_API_KEY) {
      console.log("🟢 [EMAIL] Development/Preview mode - logging email details:")
      console.log("📧 To:", to)
      console.log("📋 Subject:", subject)
      
      // Extract verification code from HTML
      const tokenMatch = html.match(/token-code[^>]*>(\d{6})</) || html.match(/<h2[^>]*>(\d{6})<\/h2>/);
      if (tokenMatch) {
        console.log("🔐 VERIFICATION TOKEN:", tokenMatch[1])
        
        // W preview/development zawsze loguj token dla łatwego testowania
        if (isPreview) {
          console.log(`🌐 [PREVIEW] Test verification for ${email}: ${tokenMatch[1]}`)
        }
      }
      
      return true // Return true to continue the process
    }

    // ✅ PRODUCTION - use Resend
    console.log("🟢 [EMAIL] Production mode - sending via Resend")
    
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        // Używamy Resend domain ponieważ twoja domena Vercel nie jest zweryfikowana w Resend
        from: "Elite Barber <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("🔴 [EMAIL] Resend error:", error)
      
      // Fallback to dev mode if domain not verified
      console.log("🟡 [EMAIL] Email sending failed, falling back to dev mode")
      const tokenMatch = html.match(/token-code[^>]*>(\d{6})</);
      if (tokenMatch) {
        console.log("🔐 FALLBACK TOKEN:", tokenMatch[1])
      }
      return true
    }

    console.log("🟢 [EMAIL] Email sent successfully to:", to)
    return true
  } catch (error) {
    console.error("🔴 [EMAIL] Error sending email:", error)
    
    // Fallback to development mode on any error
    console.log("🟡 [EMAIL] Fallback to dev mode due to error")
    const tokenMatch = html.match(/token-code[^>]*>(\d{6})</);
    if (tokenMatch) {
      console.log("🔐 FALLBACK TOKEN:", tokenMatch[1])
    }
    
    return true
  }
}

// ✅ Verification token (6-digit code)
export function generateVerificationToken(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// ✅ Reset token (secure random)
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

// ✅ Send verification email
export async function sendVerificationEmail(
  email: string,
  verificationToken: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; background: #f9f9f9; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #007bff; padding-bottom: 15px; }
        .token { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; margin: 25px 0; border-radius: 10px; color: white; }
        .token-code { font-size: 48px; font-weight: bold; letter-spacing: 10px; margin: 0; font-family: 'Courier New', monospace; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; text-align: center; }
        .warning { background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0; }
        .info { background: #d1ecf1; padding: 15px; border-radius: 5px; border-left: 4px solid #17a2b8; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="color: #007bff; margin: 0;">✂️ Elite Barber</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Potwierdzenie adresu email</p>
        </div>
        
        <p><strong>Cześć!</strong></p>
        <p>Dziękujemy za rejestrację w <strong>Elite Barber</strong>. Aby aktywować swoje konto, użyj poniższego kodu weryfikacyjnego:</p>
        
        <div class="token">
          <p class="token-code">${verificationToken}</p>
        </div>
        
        <p>Wprowadź ten kod w formularzu weryfikacji na stronie Elite Barber.</p>
        
        <div class="warning">
          <p style="margin: 0; color: #856404;">
            <strong>⏰ Ważne:</strong> Kod ważny przez 2 godziny. Konto zostanie usunięte jeśli nie zostanie zweryfikowane w tym czasie.
          </p>
        </div>

        <div class="info">
          <p style="margin: 0; color: #0c5460;">
            <strong>ℹ️ Informacja:</strong> Jeśli nie rejestrowałeś się w naszym serwisie, zignoruj tę wiadomość.
          </p>
        </div>
        
        <div class="footer">
          <p>Elite Barber &copy; ${new Date().getFullYear()}</p>
          <p>barber-shop-two-ebon.vercel.app</p>
        </div>
      </div>
    </body>
    </html>
  `

  const result = await sendEmail({
    to: email,
    subject: `Kod weryfikacyjny: ${verificationToken} - Elite Barber`,
    html,
  })

  // Zawsze loguj token w development/preview
  if (process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV === 'preview') {
    console.log(`🔐 [EMAIL] Verification token for ${email}: ${verificationToken}`)
  }

  return result
}

// ✅ Send password reset email
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<boolean> {
  const resetUrl = `${BASE_URL}/reset-password?token=${resetToken}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; background: #f9f9f9; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .button { display: inline-block; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; text-align: center; }
        .code { background: #f8f9fa; padding: 15px; border-radius: 5px; font-family: monospace; word-break: break-all; margin: 15px 0; border: 1px solid #dee2e6; }
        .warning { background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #28a745; padding-bottom: 15px;">
          <h1 style="color: #28a745; margin: 0;">✂️ Elite Barber</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Reset hasła</p>
        </div>
        
        <p><strong>Cześć!</strong></p>
        <p>Otrzymaliśmy prośbę o resetowanie hasła do Twojego konta w Elite Barber.</p>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="${resetUrl}" class="button">🔐 Resetuj hasło</a>
        </div>
        
        <p>Lub skopiuj i wklej poniższy link do przeglądarki:</p>
        <div class="code">${resetUrl}</div>
        
        <div class="warning">
          <p style="margin: 0; color: #856404;">
            <strong>⏰ Ważne:</strong> Link ważny przez 1 godzinę. Jeśli nie prosiłeś o reset hasła, zignoruj tę wiadomość.
          </p>
        </div>
        
        <div class="footer">
          <p>Elite Barber &copy; ${new Date().getFullYear()}</p>
          <p>barber-shop-two-ebon.vercel.app</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: "Reset hasła - Elite Barber",
    html,
  })
}