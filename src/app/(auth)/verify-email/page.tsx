import Link from "next/link";
import { verifyEmailToken } from "../actions";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token
    ? await verifyEmailToken(token)
    : { ok: false, message: "This verification link is missing its token." };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-xl backdrop-blur">
      <h2 className="mb-2 text-lg font-bold text-white">{result.ok ? "Email verified 🎉" : "Verification failed"}</h2>
      <p className={`text-sm ${result.ok ? "text-emerald-400" : "text-red-400"}`}>{result.message}</p>
      <Link
        href="/"
        className="mt-4 inline-block rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-amber-300"
      >
        Go to dashboard
      </Link>
    </div>
  );
}
