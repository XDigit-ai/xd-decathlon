import { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MobileNav } from '@/components/layout/mobile-nav';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col lg:pl-64">
        <Header />

        <main className="flex-1 pb-20 md:pb-0">
          <div className="py-8">
            <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
              {children}
            </div>
          </div>
        </main>

        <MobileNav />
      </div>
    </div>
  );
}
