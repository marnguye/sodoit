"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getSafeNextPath } from "@/lib/auth-redirect";
import { INPUT_CLASS, PasswordField } from "../PasswordField";
import { passwordStrength } from "@/lib/password";

const USERNAME_RE = /^[a-z0-9_-]{3,24}$/;

const STRENGTH_COLORS = ["#DC2626", "#F97316", "#EAB308", "#16A34A"];

export function SignupForm({ next }: { next: string }) {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const strength = passwordStrength(password);
  const safeNext = getSafeNextPath(next);
  const loginHref = `/login?next=${encodeURIComponent(safeNext)}`;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setUsernameError(null);

    if (!USERNAME_RE.test(username)) {
      setUsernameError(
        "Username must be 3-24 lowercase letters, numbers, underscores, or dashes.",
      );
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data: existing, error: lookupError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (!lookupError && existing) {
      setUsernameError("This username is already taken");
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name: displayName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSubmittedEmail(email);
    setLoading(false);
  }

  if (submittedEmail) {
    return (
      <div className="text-center">
        <p className="text-4xl font-black text-accent">✓</p>
        <h1 className="mt-3 text-2xl font-extrabold text-ink">
          Check your email
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          We sent a confirmation link to {submittedEmail}. Click it to activate
          your account.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">Create your account</h1>
      <p className="mt-1.5 text-sm text-muted">Start building your list.</p>

      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-3">
        <div>
          <label
            htmlFor="displayName"
            className="mb-1.5 block text-[13px] font-semibold text-ink"
          >
            Your name
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            required
            placeholder="Jan Novák"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label
            htmlFor="username"
            className="mb-1.5 block text-[13px] font-semibold text-ink"
          >
            Username
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">
              @
            </span>
            <input
              id="username"
              name="username"
              type="text"
              required
              placeholder="jannovak"
              autoComplete="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value.toLowerCase());
                setUsernameError(null);
              }}
              className={INPUT_CLASS}
              style={{ paddingLeft: 26 }}
            />
          </div>
          {usernameError && (
            <p className="mt-1.5 text-xs text-red-600">{usernameError}</p>
          )}
        </div>

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

        <div>
          <PasswordField
            id="password"
            label="Password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
          />
          <div className="mt-2 flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[3px] flex-1 rounded-full"
                style={{
                  background:
                    i < strength ? STRENGTH_COLORS[strength - 1] : "#E7E5E4",
                }}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 h-11 rounded-md bg-accent text-[15px] font-bold text-white transition-colors hover:bg-accent-dark disabled:opacity-70"
        >
          {loading ? "Creating account..." : "Create account"}
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
        Already have an account?{" "}
        <Link href={loginHref} className="font-semibold text-accent">
          Log in
        </Link>
      </p>
    </div>
  );
}
