"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, type AuthFormState } from "../actions";

const initialState: AuthFormState = {};

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, initialState);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
      <h2 className="mb-1 text-lg font-bold text-white">Reset your password</h2>
      <p className="mb-4 text-sm text-slate-400">
        Enter your email and we&apos;ll send you a link to reset it.
      </p>
      {state?.success ? (
        <p className="text-sm text-emerald-400">{state.success}</p>
      ) : (
        <form action={action} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
            />
          </div>
          {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
          <button
            disabled={pending}
            type="submit"
            className="w-full rounded-lg bg-amber-400 py-2 text-sm font-bold text-slate-900 transition hover:bg-amber-300 disabled:opacity-60"
          >
            {pending ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}
      <p className="mt-4 text-center text-sm text-slate-400">
        <Link href="/login" className="font-semibold text-amber-400 hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
