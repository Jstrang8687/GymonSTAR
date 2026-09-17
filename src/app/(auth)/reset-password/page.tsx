"use client";

import Link from "next/link";
import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { resetPassword, type AuthFormState } from "../actions";

const initialState: AuthFormState = {};

function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const [state, action, pending] = useActionState(resetPassword, initialState);

  if (!token) {
    return (
      <p className="text-sm text-red-400">
        This reset link is missing its token. Request a new one from the{" "}
        <Link href="/forgot-password" className="font-semibold text-amber-400 hover:underline">
          forgot password
        </Link>{" "}
        page.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-300" htmlFor="password">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
        />
        <p className="mt-1 text-xs text-slate-500">At least 8 characters.</p>
      </div>
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      <button
        disabled={pending}
        type="submit"
        className="w-full rounded-lg bg-amber-400 py-2 text-sm font-bold text-slate-900 transition hover:bg-amber-300 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Set new password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
      <h2 className="mb-4 text-lg font-bold text-white">Set a new password</h2>
      <Suspense fallback={<div className="h-24 animate-pulse rounded-lg bg-white/5" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
