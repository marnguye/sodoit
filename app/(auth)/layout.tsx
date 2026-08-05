import { Logo } from "@/components/ui";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-[420px] rounded-2xl border border-border bg-card p-10">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        {children}
      </div>
    </div>
  );
}
