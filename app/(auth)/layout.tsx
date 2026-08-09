import { Header } from "@/components/layout/Header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header signedIn={false} />
      <div className="pt-16">{children}</div>
    </div>
  );
}
