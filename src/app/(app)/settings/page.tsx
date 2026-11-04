import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/session-helpers";
import { DeleteMyAccountForm } from "./DeleteMyAccountForm";
import { ResendVerificationButton } from "./ResendVerificationButton";
import { NotificationsToggle } from "./NotificationsToggle";
import { BlockedList } from "./BlockedList";
import { listBlockedTrainers } from "@/lib/moderation";

export default async function SettingsPage() {
  const userId = await getUserId();
  const [user, blocked] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    listBlockedTrainers(userId),
  ]);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-black text-white">Settings</h1>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-lg font-bold text-white">{user.name}</p>
        <p className="text-sm text-slate-400">{user.email}</p>
        {!user.emailVerified && <ResendVerificationButton />}
      </div>

      <section>
        <NotificationsToggle />
      </section>

      <section>
        <BlockedList blocked={blocked} />
      </section>

      <section>
        <Link
          href="/settings/templates"
          className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-amber-400/40"
        >
          <span>
            <span className="block font-bold text-white">Workout Templates</span>
            <span className="block text-sm text-slate-400">Manage the exercise lists you&apos;ve saved.</span>
          </span>
          <span className="text-slate-500">→</span>
        </Link>
      </section>

      <section className="flex gap-4 text-sm">
        <Link href="/privacy" className="text-slate-400 hover:text-white">
          Privacy Policy
        </Link>
        <Link href="/terms" className="text-slate-400 hover:text-white">
          Terms of Service
        </Link>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold text-red-300">Danger zone</h2>
        <DeleteMyAccountForm email={user.email} />
      </section>
    </div>
  );
}
