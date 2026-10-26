import Link from "next/link";

// Public, readable-without-logging-in shell for the Privacy Policy and
// Terms. App stores and prospective users both need to reach these before
// ever creating an account.
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-black tracking-tight text-white">
          {/* eslint-disable-next-line @next/next/no-img-element -- small static mark, no need for next/image optimization */}
          <img src="/icon-192.png" alt="" className="h-8 w-8 rounded-lg" />
          <span>
            Gymon<span className="text-amber-400">STARs</span>
          </span>
        </Link>
        <article className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm leading-relaxed text-slate-300 shadow-xl sm:p-8">
          {children}
        </article>
        <nav className="mt-4 flex justify-center gap-4 text-xs text-slate-500">
          <Link href="/privacy" className="hover:text-slate-300">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-slate-300">
            Terms of Service
          </Link>
        </nav>
      </div>
    </div>
  );
}
