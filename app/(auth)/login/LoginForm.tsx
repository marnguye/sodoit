"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui";
import { createClient } from "@/utils/supabase/client";
import { INPUT_CLASS, PasswordField } from "../PasswordField";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/app");
  }

  return (
    <div
      className="w-full max-w-[400px] bg-white border border-border rounded-2xl p-10"
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
    >
      <div className="flex justify-center">
        <Logo size="md" />
      </div>
      <h1 className="text-[22px] font-extrabold text-ink text-center mt-5">
        Welcome back
      </h1>
      <p className="text-sm text-muted text-center mt-1">
        Log in to your Sodoit account
      </p>

      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
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

        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-2 h-12 rounded-xl bg-accent hover:bg-accent-dark text-white font-bold text-[15px] transition-colors disabled:opacity-70"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        {error && (
          <p className="bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 text-[13px] text-red-600">
            {error}
          </p>
        )}
      </form>

      <div className="flex items-center gap-3 mt-6">
        <div className="h-px bg-border flex-1" />
        <span className="text-xs text-muted">or</span>
        <div className="h-px bg-border flex-1" />
      </div>

      <button
        type="button"
        onClick={() => router.push("/signup")}
        className="mt-6 w-full h-11 border border-border rounded-xl bg-white text-sm font-semibold text-ink hover:bg-background transition-colors"
      >
        Create an account
      </button>

      <a
        href="#"
        className="block text-center text-[13px] text-muted mt-4 hover:text-ink transition-colors"
      >
        Forgot your password?
      </a>
    </div>
  );
}
