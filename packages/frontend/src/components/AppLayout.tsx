"use client";

import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
}

export function AppLayout({ children, rightSidebar }: AppLayoutProps) {
  return (
    <div className="max-w-[1280px] mx-auto flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex">
        <div className="w-[600px] shrink-0 border-r border-outline min-h-screen bg-background">
          {children}
        </div>
        {rightSidebar && (
          <aside className="w-[350px] sticky top-0 h-screen p-6 overflow-y-auto no-scrollbar space-y-6 bg-background border-l border-outline">
            {rightSidebar}
          </aside>
        )}
      </main>
    </div>
  );
}
