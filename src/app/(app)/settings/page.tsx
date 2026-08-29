import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/session-helpers";
import { DeleteMyAccountForm } from "./DeleteMyAccountForm";

export default async function SettingsPage() {
  const userId = await getUserId();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-black text-white">Settings</h1>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-lg font-bold text-white">{user.name}</p>
        <p className="text-sm text-slate-400">{user.email}</p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-bold text-red-300">Danger zone</h2>
        <DeleteMyAccountForm email={user.email} />
      </section>
    </div>
  );
}
