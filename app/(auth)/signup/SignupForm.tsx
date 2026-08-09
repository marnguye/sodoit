"use client";

import { useState } from "react";
import { Logo } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { INPUT_CLASS, PasswordField } from "../PasswordField";
import { passwordStrength } from "@/lib/password";

const USERNAME_RE = /^[a-z0-9_-]{3,20}$/;

const STRENGTH_COLORS = ["#DC2626", "#F97316", "#EAB308", "#16A34A"];

export function SignupForm() {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const strength = passwordStrength(password);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError(null);
    setUsernameError(null);

    if (!USERNAME_RE.test(username)) {
      setUsernameError(
        "Username must be 3-20 lowercase letters, numbers, underscores, or dashes.",
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
      options: { data: { username, display_name: displayName } },
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
      <div
        className="w-full max-w-[400px] bg-white border border-border rounded-xl p-10 text-center"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
      >
        <div className="flex justify-center">
          <Logo size="md" />
        </div>
        <p className="text-4xl text-accent font-black mt-6">✓</p>
        <h1 className="text-[22px] font-extrabold text-ink mt-3">
          Check your email
        </h1>
        <p className="text-sm text-muted mt-2 leading-relaxed">
          We sent a confirmation link to {submittedEmail}. Click it to activate
          your account.
        </p>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-[400px] bg-white border border-border rounded-xl p-10"
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
    >
      <div className="flex justify-center">
        <Logo size="md" />
      </div>
      <h1 className="text-[22px] font-extrabold text-ink text-center mt-5">
        Create your account
      </h1>
      <p className="text-sm text-muted text-center mt-1">
        Join Sodoit and start your list
      </p>

      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
        <div>
          <label
            htmlFor="displayName"
            className="block text-[13px] font-semibold text-ink mb-1.5"
          >
            Your name
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            required
            placeholder="Jan Novák"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label
            htmlFor="username"
            className="block text-[13px] font-semibold text-ink mb-1.5"
          >
            Username
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted pointer-events-none">
              @
            </span>
            <input
              id="username"
              name="username"
              type="text"
              required
              placeholder="jannovak"
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
            <p className="text-xs text-red-600 mt-1.5">{usernameError}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-[13px] font-semibold text-ink mb-1.5"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
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
          />
          <div className="flex gap-1.5 mt-2">
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
          className="mt-2 h-12 rounded-xl bg-accent hover:bg-accent-dark text-white font-bold text-[15px] transition-colors disabled:opacity-70"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        {error && (
          <p className="bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 text-[13px] text-red-600">
            {error}
          </p>
        )}
      </form>

      <p className="text-center text-[13px] text-muted mt-6">
        Already have an account?{" "}
        <a href="/login" className="text-accent font-semibold">
          Log in
        </a>
      </p>
    </div>
  );
}
