"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { isRateLimited, recordFailure, clearFailures } from "@/lib/rateLimit";

// Keyed by email (not IP) so an attacker can't dodge the limit by rotating
// source addresses -- what matters is protecting each account, not each IP.
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export interface AuthFormState {
  error?: string;
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
  await prisma.user.create({ data: { name, email, passwordHash } });

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
