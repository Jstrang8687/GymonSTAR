"use client";

import { useState, useTransition } from "react";
import { adminDeleteUser } from "../../actions";

export function DeleteUserForm({ userId, email }: { userId: string; email: string }) {
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const matches = typed.trim().toLowerCase() === email.toLowerCase();

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        await adminDeleteUser(userId);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-400 hover:border-red-500/60 hover:bg-red-500/10"
      >
        Delete this account
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-red-500/40 bg-red-500/5 p-4">
      <p className="text-sm font-bold text-red-300">This permanently deletes {email} and all their data.</p>
      <p className="mt-1 text-xs text-slate-400">
        Every monSTAR, workout log, and proof file for this account is gone for good. This cannot be undone.
      </p>
      <label className="mt-3 block">
        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Type the email to confirm: {email}
        </span>
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={email}
          className="w-full rounded-md border border-white/10 bg-slate-900/60 px-2 py-1.5 text-sm text-white outline-none focus:border-red-400"
        />
      </label>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={!matches || pending}
          onClick={submit}
          className="rounded-md bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "Deleting..." : "Permanently delete"}
        </button>
        <button
          type="button"
          onClick={() => {
            setConfirming(false);
            setTyped("");
            setError(null);
          }}
          className="rounded-md border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 hover:border-white/30"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
