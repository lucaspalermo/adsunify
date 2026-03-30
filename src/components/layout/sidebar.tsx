"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Bot,
  Target,
  Map,
  Search,
  Megaphone,
  FileText,
  Eye,
  TrendingUp,
  BarChart3,
  Users,
  ShoppingBag,
  BookOpen,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  LogIn,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar-store";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "PRINCIPAL",
    items: [
      { label: "Dashboard", href: "/painel", icon: LayoutDashboard, description: "Visao geral do seu marketing" },
      { label: "Co-Piloto IA", href: "/copilot", icon: Bot, description: "Seu assistente inteligente" },
      { label: "Missões", href: "/missoes", icon: Target, description: "Tarefas semanais para crescer" },
      { label: "Jornada", href: "/jornada", icon: Map, description: "Seu progresso e evolucao" },
    ],
  },
  {
    title: "FERRAMENTAS",
    items: [
      { label: "SEO", href: "/seo", icon: Search, description: "Melhore sua posicao no Google" },
      { label: "Anúncios", href: "/anuncios", icon: Megaphone, description: "Gerencie Google e Meta Ads" },
      { label: "Conteúdo", href: "/conteudo", icon: FileText, description: "Crie artigos e posts com IA" },
      { label: "Concorrentes", href: "/concorrentes", icon: Eye, description: "Espie o que outros fazem" },
    ],
  },
  {
    title: "CRESCIMENTO",
    items: [
      { label: "Previsão", href: "/previsao", icon: TrendingUp, description: "Simule resultados antes de investir" },
      { label: "Relatórios", href: "/relatorios", icon: BarChart3, description: "Acompanhe sua evolucao" },
      { label: "Comunidade", href: "/comunidade", icon: Users, description: "Conecte-se com outros" },
      { label: "Marketplace", href: "/marketplace", icon: ShoppingBag, description: "Contrate profissionais" },
    ],
  },
  {
    title: "OUTROS",
    items: [
      { label: "Glossário", href: "/glossario", icon: BookOpen, description: "Aprenda termos de marketing" },
      { label: "Configurações", href: "/configuracoes", icon: Settings, description: "Ajuste sua conta" },
    ],
  },
];

function NavItemLink({
  item,
  isActive,
  isCollapsed,
}: {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isCollapsed && "justify-center px-2",
        isActive
          ? "bg-violet-50 text-violet-700 font-semibold"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      {/* Active / hover left border */}
      <div
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full transition-all duration-200",
          isActive
            ? "bg-violet-600 opacity-100"
            : "bg-violet-600 opacity-0 group-hover:opacity-60"
        )}
      />

      <Icon className="h-[18px] w-[18px] shrink-0" />

      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="truncate whitespace-nowrap flex flex-col"
          >
            <span className="truncate">{item.label}</span>
            <span className="text-[10px] font-normal text-slate-400 truncate leading-tight">
              {item.description}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip on hover (always visible, shows description) */}
      <div className="pointer-events-none absolute left-full ml-2 z-50 hidden rounded-lg bg-white shadow-lg border border-slate-200 px-3 py-2 group-hover:block">
        <span className="text-xs font-medium text-slate-900 whitespace-nowrap">{item.label}</span>
        <span className="block text-[10px] text-slate-500 whitespace-nowrap">{item.description}</span>
      </div>
    </Link>
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

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggle } = useSidebarStore();
  const { data: session } = useSession();

  const userName = session?.user?.name || "Usuario";
  const userPlan = session?.user?.plan || "STARTER";
  const userInitials = getInitials(userName);

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "fixed left-0 top-0 z-40 hidden h-screen flex-col md:flex",
        "bg-white border-r border-slate-200"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5">
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500">
          <span className="text-sm font-bold text-white">R</span>
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
        </div>
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="gradient-text text-lg font-bold tracking-tight"
            >
              AdsUnify
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.title}>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400"
                >
                  {section.title}
                </motion.h3>
              )}
            </AnimatePresence>
            {isCollapsed && (
              <div className="mx-auto mb-2 h-px w-6 bg-slate-200" />
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <NavItemLink
                    key={item.href + item.label}
                    item={item}
                    isActive={isActive}
                    isCollapsed={isCollapsed}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-200 p-3">
        {session ? (
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl p-2",
              isCollapsed && "justify-center"
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
              {userInitials}
            </div>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 overflow-hidden"
                >
                  <p className="truncate text-sm font-medium text-slate-900">
                    {userName}
                  </p>
                  <span className="inline-flex items-center rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700 uppercase">
                    {userPlan}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link
            href="/login"
            className={cn(
              "flex items-center gap-3 rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900",
              isCollapsed && "justify-center"
            )}
          >
            <LogIn className="h-5 w-5 shrink-0" />
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm font-medium whitespace-nowrap"
                >
                  Fazer Login
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        )}

        {/* Collapse toggle */}
        <button
          onClick={toggle}
          className={cn(
            "mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600",
            isCollapsed && "px-0"
          )}
        >
          {isCollapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronsLeft className="h-4 w-4" />
              <span>Recolher</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}

export default Sidebar;
