import "server-only";
import { Resend } from "resend";

// Best-effort by design: nothing in the app should ever fail because an
// email couldn't be sent (missing/invalid API key during setup, Resend
// having a bad day, etc.) -- these functions log and swallow errors rather
// than throwing, so callers never need to wrap them in try/catch.
let client: Resend | null = null;
function getClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

const FROM = process.env.EMAIL_FROM ?? "GymonSTARs <noreply@example.com>";
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const resend = getClient();
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set -- skipping "${subject}" to ${to}`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (error) {
    console.error(`[email] Failed to send "${subject}" to ${to}:`, error);
  }
}

// Shared branded wrapper -- plain, email-client-safe HTML (no external CSS,
// inline styles only) matching the app's dark amber theme loosely enough to
// read fine in light-mode email clients too.
function emailShell(title: string, bodyHtml: string): string {
  return `
    <div style="background:#0f172a;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
      <div style="max-width:480px;margin:0 auto;background:#1e293b;border-radius:16px;padding:32px;border:1px solid rgba(255,255,255,0.1);">
        <p style="margin:0 0 24px;font-size:20px;font-weight:900;color:#ffffff;">
          Gymon<span style="color:#fbbf24;">STARs</span>
        </p>
        <h1 style="margin:0 0 16px;font-size:18px;color:#ffffff;">${title}</h1>
        <div style="font-size:14px;line-height:1.6;color:#cbd5e1;">${bodyHtml}</div>
      </div>
    </div>
  `;
}

function button(url: string, label: string): string {
  return `
    <a href="${url}" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#fbbf24;color:#0f172a;font-weight:700;font-size:14px;text-decoration:none;border-radius:8px;">
      ${label}
    </a>
  `;
}

export async function sendVerificationEmail(to: string, name: string, verifyUrl: string): Promise<void> {
  const html = emailShell(
    "Verify your email",
    `<p>Hey ${name},</p>
     <p>Confirm this is your email address to finish setting up your GymonSTARs account.</p>
     ${button(verifyUrl, "Verify email")}
     <p style="margin-top:24px;font-size:12px;color:#64748b;">This link expires in 24 hours. If you didn't create a GymonSTARs account, you can ignore this email.</p>`
  );
  await sendEmail(to, "Verify your email", html);
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const html = emailShell(
    "You're all set!",
    `<p>Welcome aboard, ${name} — your email's verified and your trainer account is ready to go.</p>
     <p>Time to log your first workout and catch your first monSTAR. Gotta stack them all.</p>`
  );
  await sendEmail(to, "Welcome to GymonSTARs", html);
}

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string): Promise<void> {
  const html = emailShell(
    "Reset your password",
    `<p>Hey ${name},</p>
     <p>Someone requested a password reset for this account. If that was you, pick a new password here:</p>
     ${button(resetUrl, "Reset password")}
     <p style="margin-top:24px;font-size:12px;color:#64748b;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email — your password won't change.</p>`
  );
  await sendEmail(to, "Reset your password", html);
}

export async function sendChallengedEmail(
  to: string,
  name: string,
  challengerName: string,
  muscleTypeLabel: string,
  gymName: string | null
): Promise<void> {
  const where = gymName ? ` for ${gymName}` : "";
  const html = emailShell(
    "You've been challenged!",
    `<p>Hey ${name},</p>
     <p><strong>${challengerName}</strong> just challenged you to a ${muscleTypeLabel} duel${where}. You have 48 hours to out-train them.</p>
     ${button(`${APP_URL}/battle`, "See the duel")}`
  );
  await sendEmail(to, `${challengerName} challenged you to a duel`, html);
}

export async function sendAccountDeletedEmail(to: string, name: string): Promise<void> {
  const html = emailShell(
    "Your account has been deleted",
    `<p>Hey ${name},</p>
     <p>This confirms your GymonSTARs account and all its data (monSTARs, workout history, templates) have been permanently deleted.</p>
     <p style="margin-top:24px;font-size:12px;color:#64748b;">If you didn't do this, contact us right away.</p>`
  );
  await sendEmail(to, "Your GymonSTARs account was deleted", html);
}
