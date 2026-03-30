"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Menu, Search, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar-store";
import { NotificationHub } from "./notification-hub";
import { ThemeToggleCompact } from "@/components/ui/theme-toggle";

function HealthScoreBadge({ score }: { score: number | null }) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const hasScore = score !== null;
  const displayScore = hasScore ? score : 0;
  const progress = (displayScore / 100) * circumference;

  const color = !hasScore
    ? "rgba(0,0,0,0.1)"
    : displayScore >= 80
      ? "#22c55e"
      : displayScore >= 60
        ? "#eab308"
        : displayScore >= 40
          ? "#f97316"
          : "#ef4444";

  return (
    <div className="relative flex h-10 w-10 items-center justify-center">
      <svg className="h-10 w-10 -rotate-90" viewBox="0 0 40 40">
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth="3"
        />
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute text-[11px] font-bold text-slate-900 dark:text-zinc-100">
        {hasScore ? displayScore : "?"}
      </span>
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getFirstName(name: string): string {
  return name.split(" ")[0];
}

export function Topbar() {
  const { isCollapsed, toggle } = useSidebarStore();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { data: session } = useSession();

  const userName = session?.user?.name || "Usuario";
  const userInitials = getInitials(userName);
  const firstName = getFirstName(userName);

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "fixed top-0 right-0 z-30 flex h-16 items-center justify-between gap-4 px-4 sm:px-6",
        "bg-white/80 backdrop-blur-md border-b border-slate-200 dark:bg-[#09090B]/80 dark:border-zinc-800",
        "transition-[left] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        isCollapsed ? "left-0 md:left-[80px]" : "left-0 md:left-[280px]"
      )}
    >
      {/* Left: mobile menu + welcome message */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 md:hidden dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          <Menu className="h-5 w-5" />
        </button>
        {session && (
          <span className="hidden sm:block text-sm text-slate-600 dark:text-zinc-400">
            Ola, <span className="text-slate-900 font-medium dark:text-zinc-100">{firstName}</span>!
          </span>
        )}
      </div>

      {/* Center: search bar */}
      <div className="hidden sm:flex flex-1 max-w-xl mx-auto">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar ferramentas, keywords, conteúdos..."
            readOnly
            onFocus={(e) => {
              e.target.blur()
              document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))
            }}
            className={cn(
              "w-full cursor-pointer rounded-xl bg-slate-50 border border-slate-200 py-2.5 pl-10 pr-16",
              "text-sm text-slate-900 placeholder:text-slate-400",
              "transition-all duration-200",
              "hover:bg-slate-100 hover:border-slate-300",
              "dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:border-zinc-600"
            )}
          />
          <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggleCompact />

        {/* Health Score */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="hidden sm:block"
        >
          <HealthScoreBadge score={null} />
        </motion.div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <NotificationHub
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
          />
        </div>

        {/* User avatar */}
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700 transition-transform hover:scale-105 dark:bg-violet-500/20 dark:text-violet-400"
        >
          {userInitials}
        </motion.button>
      </div>
    </motion.header>
  );
}

export default Topbar;
