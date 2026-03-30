"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Menu, Search, Bell, Globe, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useSiteStore } from "@/stores/site-store";
import { useUserId } from "@/hooks/use-user-id";
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

function SiteSelector() {
  const userId = useUserId();
  const { sites, activeSiteId, setSites, setActiveSite } = useSiteStore();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/sites?userId=${userId}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setSites(data); })
      .catch(() => {});
  }, [userId, setSites]);

  const active = sites.find((s) => s.id === activeSiteId) || sites[0];

  async function addSite() {
    if (!newUrl.trim() || !userId) return;
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, url: newUrl.trim(), name: newName.trim() || newUrl.trim() }),
      });
      const site = await res.json();
      if (site.id) {
        setSites([...sites, site]);
        setNewUrl("");
        setNewName("");
        setAdding(false);
      }
    } catch {}
  }

  if (sites.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors",
          "border-slate-200 bg-white hover:bg-slate-50",
          "dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        )}
      >
        <Globe className="h-3.5 w-3.5 text-indigo-500" />
        <span className="max-w-[120px] truncate text-slate-700 dark:text-zinc-300 font-medium">
          {active?.name || "Selecionar site"}
        </span>
        {active?.lastScore !== undefined && active.lastScore !== null && (
          <span className={cn(
            "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
            (active.lastScore ?? 0) >= 70 ? "bg-green-500/10 text-green-500" :
            (active.lastScore ?? 0) >= 40 ? "bg-amber-500/10 text-amber-500" :
            "bg-red-500/10 text-red-500"
          )}>
            {active.lastScore}
          </span>
        )}
        <ChevronDown className="h-3 w-3 text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setAdding(false); }} />
          <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Seus Sites
            </p>
            {sites.map((site) => (
              <button
                key={site.id}
                onClick={() => { setActiveSite(site.id); setOpen(false);
                  fetch("/api/sites", { method: "PATCH", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ siteId: site.id, userId, action: "set-primary" }) });
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                  site.id === activeSiteId
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                    : "text-slate-700 hover:bg-slate-50 dark:text-zinc-300 dark:hover:bg-zinc-700"
                )}
              >
                <Globe className="h-3.5 w-3.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{site.name}</p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate">{site.url}</p>
                </div>
                {site.lastScore !== undefined && site.lastScore !== null && (
                  <span className="text-[11px] font-bold text-slate-400">{site.lastScore}</span>
                )}
              </button>
            ))}

            {/* Add new site */}
            {!adding ? (
              <button
                onClick={() => setAdding(true)}
                className="mt-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar outro site
              </button>
            ) : (
              <div className="mt-2 space-y-2 border-t border-slate-100 dark:border-zinc-700 pt-2">
                <input
                  type="text" placeholder="URL do site" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} autoFocus
                  className="h-9 w-full rounded-lg border border-slate-200 dark:border-zinc-600 bg-slate-50 dark:bg-zinc-700 px-3 text-xs text-slate-900 dark:text-zinc-100 outline-none focus:border-indigo-500/50"
                />
                <input
                  type="text" placeholder="Nome (opcional)" value={newName} onChange={(e) => setNewName(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-200 dark:border-zinc-600 bg-slate-50 dark:bg-zinc-700 px-3 text-xs text-slate-900 dark:text-zinc-100 outline-none focus:border-indigo-500/50"
                />
                <button
                  onClick={addSite}
                  disabled={!newUrl.trim()}
                  className="w-full rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-600 disabled:opacity-50 transition-colors"
                >
                  Adicionar
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
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
        <SiteSelector />
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
