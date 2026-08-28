import { getProfile, isCurrentUserAdmin } from "@/lib/session-helpers";
import { Navbar } from "@/components/Navbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [profile, isAdmin] = await Promise.all([getProfile(), isCurrentUserAdmin()]);

  return (
    <div className="min-h-screen">
      <Navbar trainerLevel={profile.trainerLevel} loginStreak={profile.loginStreak} isAdmin={isAdmin} />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
