"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/log", label: "Log Workout" },
  { href: "/monstars", label: "MonSTARs" },
  { href: "/programs", label: "Program" },
  { href: "/battle", label: "Battle" },
  { href: "/history", label: "History" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile dropdown whenever navigation actually happens.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const items = [
    ...LINKS,
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ] as const;

  function linkColorClass(active: boolean, admin: boolean) {
    if (admin) {
      return active ? "bg-amber-400/20 text-amber-200" : "text-amber-300 hover:bg-amber-400/10 hover:text-amber-200";
    }
    return active ? "bg-amber-400/15 text-amber-300" : "text-slate-300 hover:bg-white/10 hover:text-white";
  }

  return (
    <>
      <nav className="hidden flex-wrap items-center gap-0.5 text-sm sm:flex">
        {items.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-md px-2.5 py-1.5 font-medium transition ${linkColorClass(active, link.href === "/admin")}`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle navigation menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-md text-xl text-slate-300 transition hover:bg-white/10 hover:text-white sm:hidden"
      >
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-20 border-b border-white/10 bg-slate-950/95 backdrop-blur sm:hidden">
          <nav className="flex flex-col gap-1 px-4 py-3 text-base">
            {items.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-md px-3 py-2.5 font-medium transition ${linkColorClass(active, link.href === "/admin")}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
