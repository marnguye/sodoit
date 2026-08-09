import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSafeNextPath } from "@/lib/auth-redirect";
import { AuthShell } from "../AuthShell";
import { SignupForm } from "./SignupForm";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext = getSafeNextPath(next);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(safeNext);
  }

  return (
    <AuthShell>
      <SignupForm next={safeNext} />
    </AuthShell>
  );
}
