import { AppNav } from "@/components/layout/AppNav";
import { NetworkGuard } from "@/components/NetworkGuard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <NetworkGuard>
      <div className="flex min-h-screen bg-slate-50">
        <AppNav />
        <main className="flex-1 min-w-0 lg:pt-0 pt-14">
          {children}
        </main>
      </div>
    </NetworkGuard>
  );
}
