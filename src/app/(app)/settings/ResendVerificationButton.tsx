"use client";

import { useState, useTransition } from "react";
import { resendVerificationEmail } from "./actions";

export function ResendVerificationButton() {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  return (
    <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2">
      <p className="flex-1 text-xs text-amber-300">
        {sent ? "Verification email sent -- check your inbox." : "Your email isn't verified yet."}
      </p>
      {!sent && (
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(async () => {
            await resendVerificationEmail();
            setSent(true);
          })}
          className="shrink-0 text-xs font-bold text-amber-300 hover:underline disabled:opacity-50"
        >
          {pending ? "Sending..." : "Resend"}
        </button>
      )}
    </div>
  );
}
