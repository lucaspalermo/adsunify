"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useSidebarStore } from "@/stores/sidebar-store";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);

  return (
    <div className="relative min-h-screen bg-[#f8f9fc]">
      <Sidebar />
      <Topbar />

      <main
        className={cn(
          "relative z-10 min-h-screen pt-16 pb-20 md:pb-0 transition-[padding-left] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          isCollapsed ? "md:pl-[80px]" : "md:pl-[280px]"
        )}
      >
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>

      <MobileNav />
    </div>
  );
}
