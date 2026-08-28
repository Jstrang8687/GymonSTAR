import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Deploys with a fresh/reset database (e.g. Render's free tier) have no way
// to flip isAdmin=true by hand -- there's no shell access to run a one-off
// script against them the way local dev allows. Instead, an ADMIN_EMAILS
// env var (comma-separated) auto-promotes matching accounts on login, so
// setting it and then registering/logging in with that email is enough.
const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  // Render (and most non-Vercel hosts) put the app behind a host NextAuth
  // doesn't recognize by default -- local `next dev` auto-trusts, which is
  // why this never came up until a real deploy hit it.
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        if (!user.isAdmin && ADMIN_EMAILS.has(user.email.toLowerCase())) {
          await prisma.user.update({ where: { id: user.id }, data: { isAdmin: true } });
        }

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) token.id = user.id;
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
});
