"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { motion, AnimatePresence } from "framer-motion"
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
  Zap,
  Plus,
  Globe,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CommandItem {
  id: string
  label: string
  description: string
  icon: LucideIcon
  href?: string
  action?: () => void
  group: string
  keywords?: string[]
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  // Cmd+K / Ctrl+K listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const navigate = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router]
  )

  const items: CommandItem[] = [
    // Navigation
    { id: "dashboard", label: "Dashboard", description: "Visao geral do marketing", icon: LayoutDashboard, href: "/painel", group: "Navegar", keywords: ["painel", "home"] },
    { id: "copilot", label: "Co-Piloto IA", description: "Assistente inteligente", icon: Bot, href: "/copilot", group: "Navegar", keywords: ["ia", "chat", "ai"] },
    { id: "missions", label: "Missoes", description: "Tarefas semanais", icon: Target, href: "/missoes", group: "Navegar", keywords: ["tarefas", "gamificacao"] },
    { id: "journey", label: "Jornada", description: "Progresso e evolucao", icon: Map, href: "/jornada", group: "Navegar", keywords: ["progresso", "nivel"] },
    { id: "seo", label: "SEO", description: "Posicao no Google", icon: Search, href: "/seo", group: "Navegar", keywords: ["google", "keywords", "palavras"] },
    { id: "ads", label: "Anuncios", description: "Google e Meta Ads", icon: Megaphone, href: "/anuncios", group: "Navegar", keywords: ["google ads", "meta", "facebook"] },
    { id: "content", label: "Conteudo", description: "Artigos e posts com IA", icon: FileText, href: "/conteudo", group: "Navegar", keywords: ["blog", "artigo", "post"] },
    { id: "competitors", label: "Concorrentes", description: "Espionar concorrencia", icon: Eye, href: "/concorrentes", group: "Navegar", keywords: ["espiao", "concorrencia"] },
    { id: "forecast", label: "Previsao", description: "Simular resultados", icon: TrendingUp, href: "/previsao", group: "Navegar", keywords: ["simular", "investimento"] },
    { id: "reports", label: "Relatorios", description: "Evolucao e metricas", icon: BarChart3, href: "/relatorios", group: "Navegar", keywords: ["metricas", "dados"] },
    { id: "community", label: "Comunidade", description: "Conecte-se com outros", icon: Users, href: "/comunidade", group: "Navegar" },
    { id: "marketplace", label: "Marketplace", description: "Contrate profissionais", icon: ShoppingBag, href: "/marketplace", group: "Navegar" },
    { id: "glossary", label: "Glossario", description: "Termos de marketing", icon: BookOpen, href: "/glossario", group: "Navegar" },
    { id: "settings", label: "Configuracoes", description: "Ajustes da conta", icon: Settings, href: "/configuracoes", group: "Navegar" },

    // Quick Actions
    { id: "new-article", label: "Criar Artigo", description: "Gerar artigo com IA", icon: Plus, href: "/conteudo?tipo=ARTICLE", group: "Acoes Rapidas", keywords: ["novo", "blog", "escrever"] },
    { id: "new-post", label: "Criar Post Social", description: "Post para redes sociais", icon: Plus, href: "/conteudo?tipo=SOCIAL_POST", group: "Acoes Rapidas", keywords: ["instagram", "social", "rede"] },
    { id: "new-ad", label: "Criar Anuncio", description: "Copy de anuncio com IA", icon: Plus, href: "/conteudo?tipo=AD_COPY", group: "Acoes Rapidas", keywords: ["ad", "copy", "campanha"] },
    { id: "audit-site", label: "Auditar Site", description: "Rodar diagnostico SEO", icon: Globe, href: "/seo", group: "Acoes Rapidas", keywords: ["diagnostico", "score", "audit"] },
    { id: "ask-copilot", label: "Perguntar ao Co-Piloto", description: "Consultar a IA", icon: Zap, href: "/copilot", group: "Acoes Rapidas", keywords: ["perguntar", "ajuda"] },
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-xl -translate-x-1/2"
          >
            <Command
              className={cn(
                "overflow-hidden rounded-2xl border shadow-2xl",
                "bg-white border-slate-200",
                "dark:bg-zinc-900 dark:border-zinc-700"
              )}
              loop
            >
              {/* Search input */}
              <div className="flex items-center gap-3 border-b border-slate-200 px-4 dark:border-zinc-700">
                <Search className="h-4 w-4 shrink-0 text-slate-400 dark:text-zinc-500" />
                <Command.Input
                  placeholder="Buscar paginas, acoes, ferramentas..."
                  className={cn(
                    "w-full bg-transparent py-4 text-sm outline-none",
                    "text-slate-900 placeholder:text-slate-400",
                    "dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  )}
                />
                <kbd className="hidden shrink-0 rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 sm:inline dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <Command.List className="max-h-80 overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center text-sm text-slate-400 dark:text-zinc-500">
                  Nenhum resultado encontrado.
                </Command.Empty>

                {["Acoes Rapidas", "Navegar"].map((group) => {
                  const groupItems = items.filter((i) => i.group === group)
                  if (groupItems.length === 0) return null

                  return (
                    <Command.Group
                      key={group}
                      heading={group}
                      className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-slate-400 dark:[&_[cmdk-group-heading]]:text-zinc-500"
                    >
                      {groupItems.map((item) => {
                        const Icon = item.icon
                        return (
                          <Command.Item
                            key={item.id}
                            value={`${item.label} ${item.description} ${item.keywords?.join(" ") || ""}`}
                            onSelect={() => {
                              if (item.action) item.action()
                              else if (item.href) navigate(item.href)
                            }}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                              "text-slate-700 aria-selected:bg-slate-100",
                              "dark:text-zinc-300 dark:aria-selected:bg-zinc-800"
                            )}
                          >
                            <div className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                              "bg-slate-100 text-slate-500",
                              "dark:bg-zinc-800 dark:text-zinc-400",
                              "group-aria-selected:bg-violet-100 group-aria-selected:text-violet-600"
                            )}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 truncate">
                              <span className="font-medium">{item.label}</span>
                              <span className="ml-2 text-xs text-slate-400 dark:text-zinc-500">
                                {item.description}
                              </span>
                            </div>
                          </Command.Item>
                        )
                      })}
                    </Command.Group>
                  )
                })}
              </Command.List>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2.5 text-[10px] text-slate-400 dark:border-zinc-700 dark:text-zinc-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-slate-200 bg-slate-100 px-1 py-0.5 font-mono dark:border-zinc-700 dark:bg-zinc-800">↑↓</kbd>
                    navegar
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-slate-200 bg-slate-100 px-1 py-0.5 font-mono dark:border-zinc-700 dark:bg-zinc-800">↵</kbd>
                    selecionar
                  </span>
                </div>
                <span className="gradient-text font-semibold">AdsUnify</span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
