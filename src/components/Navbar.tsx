import Link from "next/link";
import { signOut } from "@/lib/auth";
import { NavLinks } from "@/components/NavLinks";

export function Navbar({
  trainerLevel,
  loginStreak,
  isAdmin = false,
}: {
  trainerLevel: number;
  loginStreak: number;
  isAdmin?: boolean;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-black text-white">
          <span className="text-xl">🏋️‍♂️⭐</span>
          <span>
            Gymon<span className="text-amber-400">STAR</span>
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-end gap-2 sm:justify-between">
          <NavLinks isAdmin={isAdmin} />

          <div className="flex items-center gap-2 text-xs text-slate-300 sm:gap-3">
            <span className="rounded-full bg-indigo-500/20 px-2.5 py-1 font-semibold text-indigo-300 sm:px-3">
              Lv. {trainerLevel}
            </span>
            <span className="rounded-full bg-orange-500/20 px-2.5 py-1 font-semibold text-orange-300 sm:px-3">
              🔥 {loginStreak}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button className="rounded-md px-2 py-1.5 font-medium text-slate-400 hover:text-white">
                Log out
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
