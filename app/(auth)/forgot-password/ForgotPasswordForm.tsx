"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { INPUT_CLASS } from "../PasswordField";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setPending(true);

    try {
      const supabase = createClient();
      await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
    } finally {
      setSubmitted(true);
      setPending(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-ink">Check your email</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          If an account exists for that address, we sent a password reset link.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex text-sm font-semibold text-accent hover:text-accent-dark"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">Reset your password</h1>
      <p className="mt-1.5 text-sm text-muted">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form
        method="post"
        onSubmit={handleSubmit}
        className="mt-7 flex flex-col gap-4"
      >
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-[13px] font-semibold text-ink"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={INPUT_CLASS}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-2 h-11 rounded-md bg-accent text-[15px] font-bold text-white transition-colors hover:bg-accent-dark disabled:opacity-70"
        >
          {pending ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-muted">
        Remembered your password?{" "}
        <Link href="/login" className="font-semibold text-accent">
          Log in
        </Link>
      </p>
    </div>
  );
}
