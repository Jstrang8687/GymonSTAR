import Link from "next/link";
import { signOut } from "@/lib/auth";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/log", label: "Log Workout" },
  { href: "/monstars", label: "MonSTARs" },
  { href: "/programs", label: "Program" },
  { href: "/battle", label: "Battle" },
  { href: "/history", label: "History" },
  { href: "/profile", label: "Profile" },
] as const;

export function Navbar({ trainerLevel, loginStreak }: { trainerLevel: number; loginStreak: number }) {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-black text-white">
          <span className="text-xl">🏋️‍♂️⭐</span>
          <span>
            Gymmon<span className="text-amber-400">STARS</span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-xs text-slate-300">
          <span className="rounded-full bg-indigo-500/20 px-3 py-1 font-semibold text-indigo-300">
            Lv. {trainerLevel}
          </span>
          <span className="rounded-full bg-orange-500/20 px-3 py-1 font-semibold text-orange-300">
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
    </header>
  );
}
