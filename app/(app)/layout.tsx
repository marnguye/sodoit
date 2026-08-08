import { Header } from "@/components/layout/Header";
import { AchievementUnlockProvider } from "./achievements/components/AchievementUnlockProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <main className="pt-16 px-4 pb-8 sm:px-6 lg:px-8 min-h-screen bg-background">
        <AchievementUnlockProvider>{children}</AchievementUnlockProvider>
      </main>
    </div>
  );
}
