"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getSafeNextPath } from "@/lib/auth-redirect";
import { INPUT_CLASS, PasswordField } from "../PasswordField";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const safeNext = getSafeNextPath(next);
  const signupHref = `/signup?next=${encodeURIComponent(safeNext)}`;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Incorrect email or password.");
      setLoading(false);
      return;
    }

    router.push(safeNext);
    router.refresh();
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">Welcome back</h1>
      <p className="mt-1.5 text-sm text-muted">
        Log in to continue where you left off.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
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
            onChange={(e) => setEmail(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>

        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-2 h-11 rounded-md bg-accent text-[15px] font-bold text-white transition-colors hover:bg-accent-dark disabled:opacity-70"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        {error && (
          <p
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600"
          >
            {error}
          </p>
        )}
      </form>

      <p className="mt-6 text-center text-[13px] text-muted">
        Don&apos;t have an account?{" "}
        <Link href={signupHref} className="font-semibold text-accent">
          Create account
        </Link>
      </p>
    </div>
  );
}
