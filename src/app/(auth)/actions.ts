"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { isRateLimited, recordFailure, clearFailures } from "@/lib/rateLimit";
import { createAuthToken, consumeAuthToken } from "@/lib/authTokens";
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from "@/lib/email";

// Keyed by email (not IP) so an attacker can't dodge the limit by rotating
// source addresses -- what matters is protecting each account, not each IP.
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const RESET_MAX_ATTEMPTS = 3;
const RESET_WINDOW_MS = 15 * 60 * 1000;

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

export interface AuthFormState {
  error?: string;
  success?: string;
}

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || name.length < 2) {
    return { error: "Name must be at least 2 characters." };
  }
  if (!email || !email.includes("@")) {
    return { error: "Enter a valid email." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });

  // Best-effort and non-blocking -- soft verification, so a slow/failed
  // email should never keep someone out of the app they just signed up for.
  const verifyToken = await createAuthToken(user.id, "EMAIL_VERIFY");
  await sendVerificationEmail(email, name, `${APP_URL}/verify-email?token=${verifyToken}`);

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created, but sign-in failed. Try logging in." };
    }
    throw error;
  }

  redirect("/onboarding");
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const rateLimitKey = `login:${email}`;
  if (email && isRateLimited(rateLimitKey, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS)) {
    return { error: "Too many failed attempts on this account. Try again in 15 minutes." };
  }

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      if (email) recordFailure(rateLimitKey, LOGIN_WINDOW_MS);
      return { error: "Invalid email or password." };
    }
    throw error;
  }

  if (email) clearFailures(rateLimitKey);
  redirect("/");
}

export async function requestPasswordReset(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  // Same response whether or not the account exists -- confirming/denying
  // an email is registered is exactly what an attacker would use this for.
  const genericSuccess: AuthFormState = {
    success: "If an account exists for that email, a reset link is on its way.",
  };
  if (!email) return { error: "Enter your email." };

  const rateLimitKey = `reset:${email}`;
  if (isRateLimited(rateLimitKey, RESET_MAX_ATTEMPTS, RESET_WINDOW_MS)) {
    // Still generic -- a rate-limit-specific message would itself leak
    // whether the account exists (attempts only count on real accounts below).
    return genericSuccess;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return genericSuccess;

  recordFailure(rateLimitKey, RESET_WINDOW_MS);
  const token = await createAuthToken(user.id, "PASSWORD_RESET");
  await sendPasswordResetEmail(email, user.name, `${APP_URL}/reset-password?token=${token}`);

  return genericSuccess;
}

export async function resetPassword(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!token) return { error: "Missing or invalid reset link." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const userId = await consumeAuthToken(token, "PASSWORD_RESET");
  if (!userId) {
    return { error: "That reset link is invalid or has expired. Request a new one." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  redirect("/login?reset=success");
}

export interface VerifyEmailResult {
  ok: boolean;
  message: string;
}

export async function verifyEmailToken(token: string): Promise<VerifyEmailResult> {
  const userId = await consumeAuthToken(token, "EMAIL_VERIFY");
  if (!userId) {
    return { ok: false, message: "That verification link is invalid or has expired." };
  }

  const user = await prisma.user.update({ where: { id: userId }, data: { emailVerified: new Date() } });
  await sendWelcomeEmail(user.email, user.name);

  return { ok: true, message: "Your email is verified. Welcome to GymonSTARs!" };
}
