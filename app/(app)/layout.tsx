import { Logo } from "@/components/ui";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <aside className="fixed left-0 top-0 h-screen w-[240px] border-r border-border bg-card">
        <div className="p-6">
          <Logo />
        </div>
        <nav />
      </aside>
      <main className="ml-[240px] p-8 min-h-screen bg-background">
        {children}
      </main>
    </div>
  );
}
