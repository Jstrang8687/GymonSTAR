import Link from "next/link";
import { getProfile, isCurrentUserAdmin, getUserId } from "@/lib/session-helpers";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [profile, isAdmin, userId] = await Promise.all([getProfile(), isCurrentUserAdmin(), getUserId()]);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { emailVerified: true } });

  return (
    <div className="min-h-screen">
      <Navbar trainerLevel={profile.trainerLevel} loginStreak={profile.loginStreak} isAdmin={isAdmin} />
      {!user.emailVerified && (
        <div className="border-b border-amber-400/20 bg-amber-400/10 px-4 py-2 text-center text-sm text-amber-300">
          Please verify your email.{" "}
          <Link href="/settings" className="font-semibold hover:underline">
            Resend the link
          </Link>
        </div>
      )}
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
