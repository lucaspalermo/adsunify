"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Target,
  Bot,
  FileText,
  Search,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  isCenter?: boolean;
}

const mobileNavItems: MobileNavItem[] = [
  { label: "Dashboard", href: "/painel", icon: LayoutDashboard },
  { label: "Missões", href: "/missoes", icon: Target },
  { label: "Co-Piloto", href: "/copilot", icon: Bot, isCenter: true },
  { label: "Conteúdo", href: "/conteudo", icon: FileText },
  { label: "SEO", href: "/seo", icon: Search },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden",
        "bg-white border-t border-slate-200",
        "pb-[env(safe-area-inset-bottom)]"
      )}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -mt-5 flex flex-col items-center"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 shadow-lg shadow-purple-500/25"
                >
                  <Icon className="h-5 w-5 text-white" />
                </motion.div>
                <span className="mt-1 text-[10px] font-medium text-slate-500">
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="mobile-active"
                    className="mt-0.5 h-1 w-1 rounded-full bg-violet-600"
                  />
                )}
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 py-1"
            >
              <motion.div whileTap={{ scale: 0.9 }}>
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-violet-600" : "text-slate-400"
                  )}
                />
              </motion.div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-violet-600" : "text-slate-500"
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobile-active"
                  className="h-1 w-1 rounded-full bg-violet-600"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileNav;
