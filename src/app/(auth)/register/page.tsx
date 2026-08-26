"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type AuthFormState } from "../actions";

const initialState: AuthFormState = {};

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerAction, initialState);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
      <h2 className="mb-4 text-lg font-bold text-white">Create your trainer account</h2>
      <form action={action} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-300" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
          />
        </div>
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
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-300" htmlFor="password">
            Password
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
          {pending ? "Creating account..." : "Sign Up"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-400">
        Already training?{" "}
        <Link href="/login" className="font-semibold text-amber-400 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
