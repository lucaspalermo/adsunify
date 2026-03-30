"use client"

import { useState, useEffect, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Shield, PenTool, Search, Megaphone, BarChart3, Rocket, Bot,
  CheckCircle2, Circle, ArrowRight, FileText, Target, Zap,
  Loader2, XCircle, AlertTriangle, ExternalLink, Globe,
  Copy, ChevronDown, ChevronUp, Eye, Users, DollarSign,
  TrendingUp, MousePointerClick, Layout,
} from "lucide-react"
import { useUserId } from "@/hooks/use-user-id"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"
import { AnimatedCounter } from "@/components/shared/animated-counter"
import { cn } from "@/lib/utils"

// Types
interface AuditIssue {
  type: string
  severity: string
  title: string
  description: string
}

interface AuditData {
  score: number
  issues: AuditIssue[]
}

interface GoogleAdsCampaign {
  name: string
  objective: string
  targetAudience: string
  locations?: string
  schedule?: string
  estimatedCPC?: string
  headlines?: string[]
  descriptions?: string[]
  sitelinks?: Array<{ title: string; description1: string; description2: string; url: string }>
  callouts?: string[]
  snippets?: { header: string; values: string[] }
  keywords?: string[]
}

interface MetaAdsCampaign {
  name: string
  objective: string
  targetAudience: string
  placements?: string
  primaryText: string
  headline: string
  description?: string
  callToAction: string
  imageIdea?: string
}

interface AIPlan {
  seoScore?: number
  seoIssues?: Array<{ item: string; status: string; detail: string; howToFix: string }>
  suggestedKeywords?: Array<{ keyword: string; reason: string; estimatedVolume: string; difficulty: string; matchType?: string; intent?: string }>
  negativeKeywords?: string[]
  googleAds?: { recommendedDailyBudget?: string; recommendedMonthlyBudget?: string; campaignType?: string; campaigns: GoogleAdsCampaign[] }
  metaAds?: { recommendedDailyBudget?: string; recommendedMonthlyBudget?: string; pixelTip?: string; campaigns: MetaAdsCampaign[]; retargeting?: { name: string; description: string; audience: string; primaryText: string; headline: string; tip: string } }
  // Legacy field
  adStrategy?: { recommendedBudget: string; platforms: string[]; campaigns: Array<{ name: string; objective: string; targetAudience: string; estimatedCPC?: string; adCopyIdea?: string }> }
  contentPlan?: Array<{ type: string; title: string; description: string; targetKeyword: string; priority: string }>
  quickWins?: Array<{ action: string; impact: string; timeToComplete: string; howTo: string }>
  monthlyPlan?: { week1: string; week2: string; week3: string; week4: string }
  competitorKeywords?: string[]
  niche?: string
  mainProduct?: string
}

interface UserData {
  businessUrl?: string
  businessNiche?: string
  businessName?: string
  marketingGoals?: string
  avatarConfig?: AIPlan | null
  xp: number
  level: number
  levelTitle: string
}

// Action status
type ActionStatus = "pending" | "loading" | "ok" | "warning" | "error"

// Animation helpers
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

function DashboardInner() {
  const { data: session } = useSession()
  const router = useRouter()
  const resolvedUserId = useUserId()

  const [userData, setUserData] = useState<UserData | null>(null)
  const [auditData, setAuditData] = useState<AuditData | null>(null)
  const [auditLoading, setAuditLoading] = useState(false)
  const [actionStatuses, setActionStatuses] = useState<Record<string, ActionStatus>>({})
  const [loading, setLoading] = useState(true)
  const [contentCount, setContentCount] = useState(0)
  const [keywordCount, setKeywordCount] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({})
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [copiedText, setCopiedText] = useState<string | null>(null)

  // Load user data and check setup
  useEffect(() => {
    async function loadData() {
      try {
        const userId = resolvedUserId || "demo"
        const res = await fetch(`/api/user?userId=${userId}`)
        const data = await res.json()

        if (!data.businessUrl && !data.businessNiche) {
          router.push("/setup")
          return
        }

        setUserData(data)

        // Fetch real counts
        const uid = data.id || userId
        fetch(`/api/content?userId=${uid}`)
          .then(r => r.json())
          .then(d => setContentCount(d.monthlyCount || d.contents?.length || 0))
          .catch(() => {})

        fetch(`/api/seo/keywords?userId=${uid}`)
          .then(r => r.json())
          .then(d => setKeywordCount(Array.isArray(d) ? d.length : 0))
          .catch(() => {})

        // Auto-run audit if user has a site URL
        if (data.businessUrl && data.businessUrl.includes(".")) {
          runAudit(data.id || userId, data.businessUrl)
        }

        // Load saved checkboxes from localStorage
        try {
          const saved = localStorage.getItem(`adsunify_steps_${uid}`)
          if (saved) setCompletedSteps(JSON.parse(saved))
        } catch {}
      } catch {
        // try demo fallback
      }
      setLoading(false)
    }
    loadData()
  }, [resolvedUserId, router])

  // Run site audit
  async function runAudit(userId: string, url: string) {
    setAuditLoading(true)
    try {
      const fullUrl = url.startsWith("http") ? url : `https://${url}`
      const res = await fetch("/api/seo/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, url: fullUrl }),
      })
      const data = await res.json()
      if (data.score !== undefined) {
        setAuditData(data)
        const statuses: Record<string, ActionStatus> = {}
        for (const issue of (data.issues || [])) {
          if (issue.title.includes("HTTPS") && issue.severity === "ok") statuses["https"] = "ok"
          if (issue.title.includes("HTTPS") && issue.severity !== "ok") statuses["https"] = "error"
          if (issue.title.includes("Title tag") && issue.severity === "ok") statuses["title"] = "ok"
          if (issue.title.includes("Title tag") && issue.severity !== "ok") statuses["warning"] = "warning"
          if (issue.title.includes("Meta description") && issue.severity === "ok") statuses["meta"] = "ok"
          if (issue.title.includes("Meta description") && issue.severity !== "ok") statuses["meta"] = "warning"
          if (issue.title.includes("H1") && issue.severity === "ok") statuses["h1"] = "ok"
          if (issue.title.includes("H1") && issue.severity !== "ok") statuses["h1"] = "warning"
          if (issue.title.includes("responsivo") && issue.severity === "ok") statuses["mobile"] = "ok"
          if (issue.title.includes("responsivo") && issue.severity !== "ok") statuses["mobile"] = "error"
          if (issue.title.includes("Open Graph") && issue.severity === "ok") statuses["og"] = "ok"
          if (issue.title.includes("Open Graph") && issue.severity !== "ok") statuses["og"] = "warning"
        }
        setActionStatuses(statuses)
      }
    } catch {
      // audit failed silently
    }
    setAuditLoading(false)
  }

  // Status icon component
  function StatusIcon({ status }: { status: ActionStatus }) {
    switch (status) {
      case "loading": return <Loader2 className="h-5 w-5 text-violet-500 animate-spin" />
      case "ok": return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "warning": return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "error": return <XCircle className="h-5 w-5 text-red-500" />
      default: return <Circle className="h-5 w-5 text-slate-300" />
    }
  }

  function toggleStep(key: string) {
    setCompletedSteps(prev => {
      const next = { ...prev, [key]: !prev[key] }
      try {
        const uid = resolvedUserId || "demo"
        localStorage.setItem(`adsunify_steps_${uid}`, JSON.stringify(next))
      } catch {}
      return next
    })
  }

  function toggleSection(key: string) {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(id)
      setTimeout(() => setCopiedText(null), 2000)
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
      </div>
    )
  }

  const siteUrl = userData?.businessUrl || ""
  const siteName = userData?.businessName || siteUrl
  const objective = userData?.marketingGoals ? (() => { try { return JSON.parse(userData.marketingGoals as string)[0] } catch { return "Crescer" } })() : "Crescer"
  const aiPlan = userData?.avatarConfig as AIPlan | null

  // Ad-readiness checks based on audit
  const adReadinessChecks = [
    ...(auditData?.issues || []).map(issue => ({
      label: issue.title,
      description: issue.description,
      status: issue.severity === "ok" ? "ok" as const : issue.severity === "critical" || issue.severity === "high" ? "error" as const : "warning" as const,
      isAudit: true,
      issue,
    })),
    {
      label: "Sitemap.xml existe?",
      description: "O sitemap ajuda o Google a encontrar todas as paginas do seu site",
      status: (auditData?.issues?.some(i => i.title.toLowerCase().includes("sitemap") && i.severity === "ok") ? "ok" : "warning") as ActionStatus,
      isAudit: false,
      issue: null,
    },
    {
      label: "Pagina carrega rapido?",
      description: "Sites lentos perdem visitantes e pagam mais caro por clique",
      status: (auditData?.score && auditData.score >= 70 ? "ok" : "warning") as ActionStatus,
      isAudit: false,
      issue: null,
    },
  ]

  // Separate keywords by intent
  const buyKeywords = aiPlan?.suggestedKeywords?.filter(kw =>
    kw.reason?.toLowerCase().includes("compra") || kw.reason?.toLowerCase().includes("converter") ||
    kw.difficulty === "facil" || kw.keyword?.toLowerCase().includes("comprar") ||
    kw.keyword?.toLowerCase().includes("preco") || kw.keyword?.toLowerCase().includes("melhor")
  ) || []
  const infoKeywords = aiPlan?.suggestedKeywords?.filter(kw => !buyKeywords.includes(kw)) || []

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16">
      {/* Header with site info */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard hover={false} className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-blue-500">
                <Megaphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-zinc-100 dark:text-zinc-100">Central de Anuncios - {siteName}</h1>
                <p className="text-sm text-slate-500 dark:text-zinc-400 dark:text-zinc-400">Siga os passos abaixo para criar seus anuncios como uma agencia faria</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {auditLoading ? (
                <span className="flex items-center gap-2 text-sm text-violet-600">
                  <Loader2 className="h-4 w-4 animate-spin" /> Analisando seu site...
                </span>
              ) : auditData ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 dark:text-zinc-400">Score:</span>
                  <span className={cn(
                    "rounded-full px-3 py-1 text-sm font-bold",
                    auditData.score >= 80 ? "bg-green-100 text-green-700" :
                    auditData.score >= 50 ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  )}>
                    {auditData.score}/100
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* ===================== STEP 1: Ad Readiness Audit ===================== */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <GlassCard hover={false} className="border-l-4 border-l-blue-500 p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-bold text-white">1</div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">Seu site esta pronto para receber anuncios?</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400">Antes de gastar dinheiro, seu site precisa estar preparado para converter visitantes em clientes</p>
              </div>
            </div>
            {auditLoading && <span className="flex items-center gap-1.5 text-xs text-violet-600"><Loader2 className="h-3.5 w-3.5 animate-spin" />Verificando...</span>}
          </div>

          <div className="ml-[52px] space-y-3">
            {adReadinessChecks.map((check, i) => (
              check.isAudit && check.issue ? (
                <AuditItem key={`audit-${i}`} issue={check.issue} siteUrl={siteUrl} />
              ) : (
                <AdReadinessItem key={`adcheck-${i}`} check={check} siteUrl={siteUrl} />
              )
            ))}

            {!auditData && !auditLoading && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                Nao foi possivel auditar seu site automaticamente. Verifique se a URL esta correta.
              </div>
            )}

            {auditData && (
              <div className="flex items-center justify-between pt-2">
                <Link href="/seo?acao=audit" className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700">
                  Ver auditoria completa <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <span className="text-xs text-slate-400 dark:text-zinc-500">
                  {auditData.issues.filter(i => i.severity === "ok").length}/{auditData.issues.length} itens OK
                </span>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* ===================== STEP 1B: Required Tools ===================== */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.12 }}>
        <GlassCard hover={false} className="border-l-4 border-l-indigo-500 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-sm font-bold text-white">1B</div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">Instalar ferramentas de rastreamento</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400">Obrigatorio para medir os resultados dos seus anuncios — sem isso voce gasta dinheiro no escuro</p>
            </div>
          </div>
          <div className="ml-[52px] space-y-3">
            {[
              {
                id: "ga",
                title: "Google Analytics",
                why: "Mostra quantas pessoas visitam seu site, de onde vem e o que fazem. Sem isso, voce nao sabe se os anuncios estao funcionando.",
                steps: [
                  "Acesse analytics.google.com e faca login com sua conta Google",
                  "Clique em 'Comecar a medir' (ou 'Admin' > 'Criar propriedade')",
                  "Coloque o nome do seu site e escolha 'Brasil' e 'Real'",
                  "Escolha 'Web' como plataforma e cole a URL do seu site",
                  "O Google vai gerar um codigo (tag) parecido com 'G-XXXXXXXXXX'",
                  "Copie esse codigo e cole no seu site: Nuvemshop (Preferencias > Scripts externos), Shopify (Online Store > Preferences), WordPress (plugin 'Site Kit by Google')",
                  "Volte ao Analytics e espere 24h — vai comecar a mostrar dados!",
                ],
              },
              {
                id: "pixel",
                title: "Meta Pixel (Facebook/Instagram)",
                why: "O Pixel rastreia quem visita seu site vindo do Instagram/Facebook. Sem ele, o Meta nao consegue otimizar seus anuncios.",
                steps: [
                  "Acesse business.facebook.com/events_manager",
                  "Clique em 'Conectar fontes de dados' > 'Web' > 'Meta Pixel'",
                  "De um nome ao Pixel (ex: 'Pixel do Meu Site') e clique 'Criar'",
                  "Escolha 'Instalar codigo manualmente' e copie o codigo",
                  "Cole no seu site: Nuvemshop (Configuracoes > Codigos externos > Head), Shopify (Configuracoes > Pixels), WordPress (plugin 'PixelYourSite')",
                  "Volte ao Events Manager e clique em 'Testar eventos' para verificar se esta funcionando",
                  "Adicione os eventos: 'ViewContent', 'AddToCart', 'Purchase' — o plugin/plataforma geralmente faz isso automaticamente",
                ],
              },
              {
                id: "gtm",
                title: "Google Tag Manager (opcional, mas recomendado)",
                why: "Facilita instalar qualquer tag sem precisar mexer no codigo. Instala uma vez e gerencia tudo por la.",
                steps: [
                  "Acesse tagmanager.google.com e crie uma conta",
                  "Crie um 'Container' do tipo 'Web' com o nome do seu site",
                  "O GTM vai gerar 2 codigos: um pro <head> e outro pro <body>",
                  "Cole os codigos no seu site (mesmos lugares do Analytics/Pixel)",
                  "Depois voce pode instalar Analytics, Pixel e qualquer tag pelo GTM sem mexer no codigo novamente",
                ],
              },
              {
                id: "cta",
                title: "Botoes de acao (CTA) claros no site",
                why: "Se o visitante chega no seu site e nao sabe o que fazer, voce perde a venda. Precisa ter botoes visiveis.",
                steps: [
                  "Na pagina principal, coloque um botao grande e colorido com texto claro: 'Comprar Agora', 'Pedir Orcamento', 'Fale Conosco'",
                  "O botao deve estar ACIMA da dobra (visivel sem rolar a pagina)",
                  "Use cores que contrastem com o fundo (ex: botao verde ou azul em fundo branco)",
                  "Adicione tambem no menu/header um botao de WhatsApp ou contato",
                  "Em paginas de produto, o botao 'Comprar' deve ser grande e visivel",
                  "Teste abrindo seu site no celular — o botao de acao deve ser facil de clicar com o dedo",
                ],
              },
            ].map((tool) => {
              const isExpanded = !!expandedSections[`tool-${tool.id}`]
              const isDone = !!completedSteps[`tool-${tool.id}-done`]
              return (
                <div key={tool.id} className={cn("rounded-xl border px-4 py-3 transition-all", isDone ? "border-green-200 bg-green-50/50" : "border-slate-100 bg-slate-50 dark:bg-zinc-800/50/50")}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={isDone} onChange={() => toggleStep(`tool-${tool.id}-done`)} className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500" />
                        <div>
                          <span className={cn("text-sm font-medium", isDone ? "text-green-700 line-through" : "text-slate-700")}>{tool.title}</span>
                          <p className="text-xs text-slate-500 dark:text-zinc-400">{tool.why}</p>
                        </div>
                      </label>
                    </div>
                    {!isDone && (
                      <button onClick={() => toggleSection(`tool-${tool.id}`)} className="shrink-0 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100 transition-colors">
                        {isExpanded ? "Fechar" : "Como instalar"}
                      </button>
                    )}
                  </div>
                  {isExpanded && !isDone && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 border-t border-slate-200 dark:border-zinc-800 pt-3">
                      <ol className="space-y-1.5 text-xs text-slate-600 dark:text-zinc-300 list-decimal list-inside">
                        {tool.steps.map((step, si) => (
                          <li key={si} className="leading-relaxed">{step}</li>
                        ))}
                      </ol>
                      <Link href={`/copilot?msg=${encodeURIComponent(`Me ajude a instalar o ${tool.title} no meu site ${siteUrl} passo a passo`)}`} className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700">
                        <Bot className="h-3.5 w-3.5" /> Pedir ajuda ao Co-Piloto
                      </Link>
                    </motion.div>
                  )}
                </div>
              )
            })}
          </div>
        </GlassCard>
      </motion.div>

      {/* ===================== STEP 2: Setup Ad Accounts ===================== */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.15 }}>
        <GlassCard hover={false} className="border-l-4 border-l-green-500 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 text-sm font-bold text-white">2</div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">Configurar suas contas de anuncio</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400">Crie suas contas no Google Ads e Meta Ads (gratis) — voce so paga quando ativar anuncios</p>
            </div>
          </div>
          <div className="ml-[52px] space-y-4">
            {/* Google Ads account setup */}
            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
              <button onClick={() => toggleSection("google-ads-setup")} className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
                    <Search className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">Criar conta no Google Ads</span>
                </div>
                {expandedSections["google-ads-setup"] ? <ChevronUp className="h-4 w-4 text-slate-400 dark:text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-slate-400 dark:text-zinc-500" />}
              </button>
              {expandedSections["google-ads-setup"] && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 space-y-2">
                  {[
                    "Acesse ads.google.com no seu navegador",
                    "Clique em \"Comecar agora\" (use sua conta Google/Gmail)",
                    "IMPORTANTE: Clique em \"Criar conta sem campanha\" (no rodape da pagina)",
                    "Preencha seu pais (Brasil), fuso horario e moeda (BRL)",
                    "Clique em \"Enviar\" — sua conta esta criada!",
                    "Va em Ferramentas > Faturamento e adicione um cartao de credito",
                  ].map((step, i) => (
                    <label key={i} className="flex items-start gap-3 cursor-pointer rounded-lg px-3 py-2 hover:bg-slate-50 dark:bg-zinc-800/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={!!completedSteps[`gads-${i}`]}
                        onChange={() => toggleStep(`gads-${i}`)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                      />
                      <span className={cn("text-sm text-slate-700 leading-relaxed", completedSteps[`gads-${i}`] && "line-through text-slate-400 dark:text-zinc-500")}>
                        <strong className="text-slate-600 dark:text-zinc-300">{i + 1}.</strong> {step}
                      </span>
                    </label>
                  ))}
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <a href="https://ads.google.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700">
                      Abrir Google Ads <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Meta Ads account setup */}
            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
              <button onClick={() => toggleSection("meta-ads-setup")} className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100">
                    <Users className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">Criar conta no Meta Ads (Facebook/Instagram)</span>
                </div>
                {expandedSections["meta-ads-setup"] ? <ChevronUp className="h-4 w-4 text-slate-400 dark:text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-slate-400 dark:text-zinc-500" />}
              </button>
              {expandedSections["meta-ads-setup"] && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 space-y-2">
                  {[
                    "Acesse business.facebook.com no navegador",
                    "Clique em \"Criar conta\" (use seu Facebook pessoal para logar)",
                    "Preencha o nome do seu negocio e seu email",
                    "Va em Configuracoes > Contas de anuncio > Adicionar",
                    "Clique em \"Criar uma nova conta de anuncio\"",
                    "Escolha moeda BRL e fuso horario de Brasilia",
                    "Va em Faturamento e adicione um cartao de credito",
                    "Instale o Meta Pixel no seu site (em Fontes de dados > Pixels)",
                  ].map((step, i) => (
                    <label key={i} className="flex items-start gap-3 cursor-pointer rounded-lg px-3 py-2 hover:bg-slate-50 dark:bg-zinc-800/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={!!completedSteps[`meta-${i}`]}
                        onChange={() => toggleStep(`meta-${i}`)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                      />
                      <span className={cn("text-sm text-slate-700 leading-relaxed", completedSteps[`meta-${i}`] && "line-through text-slate-400 dark:text-zinc-500")}>
                        <strong className="text-slate-600 dark:text-zinc-300">{i + 1}.</strong> {step}
                      </span>
                    </label>
                  ))}
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                      Abrir Meta Business <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* ===================== STEP 3: Google Ads - UNIFIED TUTORIAL ===================== */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.3 }}>
        <GlassCard hover={false} className="border-l-4 border-l-amber-500 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-sm font-bold text-white">3</div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">Criar seu anuncio no Google Ads</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                {aiPlan?.googleAds?.recommendedMonthlyBudget
                  ? `Orcamento recomendado: ${aiPlan.googleAds.recommendedMonthlyBudget} | Diario: ${aiPlan.googleAds.recommendedDailyBudget || "R$30"}`
                  : aiPlan?.adStrategy?.recommendedBudget
                  ? `Orcamento recomendado: ${aiPlan.adStrategy.recommendedBudget}`
                  : "Todos os textos e configuracoes ja prontos para voce copiar e colar"}
              </p>
            </div>
          </div>
          <div className="ml-[52px] space-y-4">
            {(aiPlan?.googleAds?.campaigns || aiPlan?.adStrategy?.campaigns)?.map((camp, campIdx) => {
              const gCamp = camp as GoogleAdsCampaign
              const isExpanded = !!expandedSections[`camp-${campIdx}`]
              const tutorialSteps = [
                { title: "Abra o Google Ads", detail: `Acesse ads.google.com no navegador. Faca login com sua conta Google (a mesma do Gmail). Se nao tem conta, clique em "Comecar agora" e siga o cadastro.` },
                { title: 'Clique em "+ Nova Campanha"', detail: `No painel principal, procure o botao azul com "+" no canto esquerdo. Clique nele.` },
                { title: `Selecione o objetivo "${gCamp.objective}"`, detail: `Na tela "Qual objetivo?", clique em "${gCamp.objective}". Depois clique em "Continuar".` },
                { title: `Escolha "${aiPlan?.googleAds?.campaignType || "Rede de Pesquisa"}"`, detail: `Clique em "${aiPlan?.googleAds?.campaignType || "Rede de Pesquisa"}". Isso faz seu anuncio aparecer quando alguem pesquisa no Google. Clique em "Continuar".` },
                { title: `Nome da campanha: ${gCamp.name}`, detail: `No campo "Nome da campanha", apague o texto padrao e escreva o nome abaixo. Isso eh so pra voce se organizar.`, copyData: gCamp.name },
                { title: `Orcamento diario: ${aiPlan?.googleAds?.recommendedDailyBudget || "R$30"}`, detail: `Na secao "Orcamento", clique em "Definir orcamento personalizado". Digite o valor abaixo (so o numero, sem R$). Esse eh o MAXIMO que voce gasta por dia.`, copyData: (aiPlan?.googleAds?.recommendedDailyBudget || "R$30").replace("R$", "") },
                { title: `Localizacao: ${gCamp.locations || "Brasil"}`, detail: `Em "Localizacoes", clique em "Inserir outro local" e digite o local abaixo. DICA: se atende so uma regiao, selecione apenas ela.`, copyData: gCamp.locations || "Brasil" },
                { title: "Idioma: Portugues", detail: `Em "Idiomas", certifique-se que "Portugues" esta selecionado.` },
                { title: "Cole as PALAVRAS-CHAVE", detail: `Em "Palavras-chave", copie o bloco abaixo e COLE no campo grande de texto. O Google separa automaticamente.`, copyData: gCamp.keywords?.join("\n") || "" },
                { title: "Cole o TITULO 1, 2, 3... (ate 15)", detail: `Na tela "Crie seu anuncio", voce vai ver campos "Titulo 1", "Titulo 2", "Titulo 3"... Copie o bloco abaixo e cole um titulo em cada campo:`, copyData: gCamp.headlines?.join("\n") || "" },
                { title: "Cole a DESCRICAO 1, 2, 3, 4", detail: `Logo abaixo dos titulos, preencha "Descricao 1", "Descricao 2"... Copie e cole uma em cada campo:`, copyData: gCamp.descriptions?.join("\n") || "" },
                { title: `URL final: ${siteUrl}`, detail: `No campo "URL final" (primeiro campo da pagina), cole a URL abaixo. Eh a pagina que o cliente ve ao clicar.`, copyData: siteUrl.startsWith("http") ? siteUrl : "https://" + siteUrl },
                { title: "Adicione SITELINKS", detail: `Em "Extensoes" > "Sitelinks", clique em "+ Novo sitelink". Crie 4 sitelinks copiando os dados abaixo:`, copyData: gCamp.sitelinks?.map(sl => `Titulo: ${sl.title}\nDescricao 1: ${sl.description1}\nDescricao 2: ${sl.description2}\nURL: ${sl.url}`).join("\n---\n") || "" },
                { title: "Adicione CALLOUTS (destaques)", detail: `Em "Extensoes" > "Textos de destaque", adicione cada destaque abaixo:`, copyData: gCamp.callouts?.join("\n") || "" },
                { title: "Adicione SNIPPET ESTRUTURADO", detail: `Em "Extensoes" > "Snippets", escolha cabecalho "${gCamp.snippets?.header || "Tipos"}" e adicione os valores abaixo:`, copyData: gCamp.snippets?.values?.join("\n") || "" },
                { title: "REVISE e PUBLIQUE", detail: `Verifique o preview no lado direito. Titulos OK? Descricoes? URL? Se tudo certo, clique em "Publicar campanha". Aprovacao leva de 1 a 24 horas.` },
              ] as Array<{ title: string; detail: string; copyData?: string }>
              return (
                <div key={campIdx} className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                  {/* Campaign header */}
                  <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{gCamp.name}</h4>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">{gCamp.objective}</span>
                          {gCamp.locations && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">{gCamp.locations}</span>}
                          {gCamp.estimatedCPC && <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700">CPC: {gCamp.estimatedCPC}</span>}
                          {gCamp.schedule && <span className="rounded-full bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-zinc-300">{gCamp.schedule}</span>}
                        </div>
                      </div>
                      <button onClick={() => toggleSection(`camp-${campIdx}`)} className="shrink-0 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-semibold text-white shadow hover:brightness-110 transition-all">
                        {isExpanded ? "Fechar tutorial" : "Comecar tutorial"}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 py-3 bg-amber-50/50">
                      <div className="mb-3 rounded-lg border border-amber-200 bg-amber-100/50 p-2.5">
                        <p className="text-xs text-amber-800">Siga cada passo na ordem. A cada passo voce recebe os dados exatos para copiar e colar. Marque o checkbox quando completar.</p>
                      </div>

                      <div className="space-y-0.5">
                        {tutorialSteps.map((step, i) => (
                          <div key={i} className="rounded-lg border-l-2 border-transparent hover:border-amber-400 transition-colors">
                            <label className="flex items-start gap-2.5 cursor-pointer px-2.5 py-2.5 hover:bg-amber-100/50">
                              <input type="checkbox" checked={!!completedSteps[`camp-${campIdx}-step-${i}`]} onChange={() => toggleStep(`camp-${campIdx}-step-${i}`)} className="mt-1 h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500 shrink-0" />
                              <div className={cn("flex-1", completedSteps[`camp-${campIdx}-step-${i}`] && "opacity-40")}>
                                <span className={cn("text-sm font-bold text-slate-800", completedSteps[`camp-${campIdx}-step-${i}`] && "line-through")}>
                                  Passo {i + 1}: {step.title}
                                </span>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mt-0.5">{step.detail}</p>
                              </div>
                            </label>
                            {step.copyData && (
                              <div className="ml-9 mb-2 rounded-lg bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 p-3">
                                <pre className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-mono">{step.copyData}</pre>
                                <button onClick={() => copyText(step.copyData!, `step-${campIdx}-${i}`)} className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-violet-700 transition-colors">
                                  <Copy className="h-3 w-3" /> {copiedText === `step-${campIdx}-${i}` ? "Copiado! Cole no Google Ads" : "Copiar"}
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <a href="https://ads.google.com" target="_blank" rel="noopener noreferrer">
                          <GlowButton variant="primary" size="sm" className="text-xs gap-1"><ExternalLink className="h-3.5 w-3.5" /> Abrir Google Ads agora</GlowButton>
                        </a>
                        <Link href={`/copilot?msg=${encodeURIComponent(`Estou criando meu primeiro anuncio no Google Ads para ${siteUrl}. Me guie tela por tela. A campanha se chama "${gCamp.name}" com objetivo "${gCamp.objective}".`)}`}>
                          <GlowButton variant="secondary" size="sm" className="text-xs gap-1"><Bot className="h-3.5 w-3.5" /> Co-Piloto me guia ao vivo</GlowButton>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </div>
              )
            }) || (
              <div className="space-y-2">
                <ActionLink icon={Bot} label="Gerar campanhas completas com IA" buttonLabel="Gerar Campanhas" href={`/copilot?msg=${encodeURIComponent(`Crie campanhas profissionais de Google Ads para ${siteUrl} com todos os titulos, descricoes, sitelinks e keywords`)}`} />
              </div>
            )}

            {/* NEGATIVE KEYWORDS */}
            {aiPlan?.negativeKeywords?.length ? (
              <div className="rounded-xl border border-red-200 bg-red-50/50 px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-red-700 uppercase tracking-wide">Palavras-chave NEGATIVAS</p>
                  <button onClick={() => copyText(aiPlan.negativeKeywords!.join("\n"), "neg-kw")} className="text-xs text-red-600 hover:text-red-700 font-medium">
                    {copiedText === "neg-kw" ? "Copiado!" : "Copiar todas"}
                  </button>
                </div>
                <p className="text-[11px] text-red-600/70 mb-2">Adicione essas palavras na campanha para EVITAR cliques de quem nao vai comprar:</p>
                <div className="flex flex-wrap gap-1.5">
                  {aiPlan.negativeKeywords.map((k, i) => (
                    <span key={i} className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">{k}</span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </GlassCard>
      </motion.div>

      {/* ===================== STEP 3B: Meta Ads - UNIFIED TUTORIAL ===================== */}
      {(aiPlan?.metaAds?.campaigns?.length) ? (
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.35 }}>
          <GlassCard hover={false} className="border-l-4 border-l-pink-500 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-sm font-bold text-white">3B</div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">Criar anuncio no Instagram / Facebook</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400">Orcamento: {aiPlan.metaAds?.recommendedMonthlyBudget || aiPlan.metaAds?.recommendedDailyBudget || "R$20-50/dia"}</p>
              </div>
            </div>
            <div className="ml-[52px] space-y-4">
              {aiPlan.metaAds!.campaigns.map((camp, campIdx) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mCamp = camp as any
                const isExpanded = !!expandedSections[`meta-${campIdx}`]
                const audience = (typeof mCamp.targetAudience === "object" && mCamp.targetAudience !== null) ? mCamp.targetAudience : null
                const audienceStr = audience ? `Idade: ${audience.age || "Todas"}, Genero: ${audience.gender || "Todos"}, Local: ${audience.locations || "Brasil"}\nInteresses: ${(audience.interests || []).join(", ")}\nComportamentos: ${(audience.behaviors || []).join(", ")}` : (mCamp.targetAudience || "")
                const creative = mCamp.creatives?.[0] || mCamp
                const fullUrl = siteUrl.startsWith("http") ? siteUrl : "https://" + siteUrl

                const metaSteps: Array<{ title: string; detail: string; copyData?: string }> = [
                  { title: "Abra o Gerenciador de Anuncios do Meta", detail: "Acesse business.facebook.com/adsmanager no navegador. Faca login com sua conta do Facebook/Instagram." },
                  { title: 'Clique em "+ Criar"', detail: 'Botao verde no canto superior esquerdo do painel.' },
                  { title: `Selecione o objetivo "${mCamp.objective}"`, detail: `Clique em "${mCamp.objective}" e depois em "Continuar". ${mCamp.optimizationGoal ? `Otimizacao: ${mCamp.optimizationGoal}` : ""}` },
                  { title: `Nome da campanha: ${mCamp.name}`, detail: 'No campo "Nome da campanha", escreva o nome abaixo.', copyData: mCamp.name },
                  { title: `Orcamento diario: ${mCamp.budget?.daily || aiPlan.metaAds?.recommendedDailyBudget || "R$30"}`, detail: 'Escolha "Orcamento diario" e digite o valor abaixo (so o numero).', copyData: (mCamp.budget?.daily || aiPlan.metaAds?.recommendedDailyBudget || "30").replace("R$", "") },
                  { title: "Configure o PUBLICO-ALVO", detail: 'Em "Publico", configure exatamente assim. Copie os dados abaixo:', copyData: audienceStr },
                  { title: `Posicionamentos: ${mCamp.placements || "Advantage+ (automatico)"}`, detail: `Em "Posicionamentos", selecione: ${mCamp.placements || "Advantage+ (o Meta escolhe os melhores automaticamente)"}` },
                  { title: "Selecione sua pagina e perfil", detail: 'Em "Identidade", escolha sua Pagina do Facebook e conecte seu perfil do Instagram.' },
                  { title: "Cole o TEXTO PRINCIPAL do anuncio", detail: 'No campo grande "Texto principal", copie e cole o texto abaixo (com emojis):', copyData: creative.primaryText || mCamp.primaryText || "" },
                  { title: "Cole o TITULO", detail: 'No campo "Titulo" (menor, abaixo do texto principal), cole:', copyData: creative.headline || mCamp.headline || "" },
                  { title: `Selecione o botao "${creative.callToAction || mCamp.callToAction || "Saiba Mais"}"`, detail: 'No campo "Chamada para acao", escolha o botao indicado abaixo.', copyData: creative.callToAction || mCamp.callToAction || "Saiba Mais" },
                  { title: `Cole a URL: ${fullUrl}`, detail: 'No campo "URL do site", cole o endereco abaixo.', copyData: fullUrl },
                  { title: "Adicione a IMAGEM ou VIDEO", detail: `Clique em "Adicionar midia". ${creative.imageDirection || mCamp.imageIdea || "Use uma foto de alta qualidade do seu produto. DICA: Use o Canva (canva.com) para criar a imagem gratuitamente."}` },
                  { title: "REVISE e PUBLIQUE", detail: 'Verifique o preview do anuncio. Texto OK? Imagem OK? URL OK? Clique em "Publicar". Aprovacao leva de 15min a 24h.' },
                ]

                return (
                  <div key={campIdx} className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                    <div className="px-4 py-3 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-800">{mCamp.name} <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-medium text-pink-700 ml-2">{mCamp.objective}</span></h4>
                        <button onClick={() => toggleSection(`meta-${campIdx}`)} className="shrink-0 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 text-xs font-semibold text-white shadow hover:brightness-110 transition-all">
                          {isExpanded ? "Fechar tutorial" : "Comecar tutorial"}
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-1">
                        {metaSteps.map((step, i) => (
                          <div key={i} className="rounded-lg border-l-2 border-transparent hover:border-pink-400 transition-colors">
                            <label className="flex items-start gap-2.5 cursor-pointer px-2.5 py-2.5 hover:bg-pink-50/50">
                              <input type="checkbox" checked={!!completedSteps[`meta-${campIdx}-step-${i}`]} onChange={() => toggleStep(`meta-${campIdx}-step-${i}`)} className="mt-1 h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500 shrink-0" />
                              <div className={cn("flex-1", completedSteps[`meta-${campIdx}-step-${i}`] && "opacity-40")}>
                                <span className={cn("text-sm font-bold text-slate-800", completedSteps[`meta-${campIdx}-step-${i}`] && "line-through")}>Passo {i + 1}: {step.title}</span>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mt-0.5">{step.detail}</p>
                              </div>
                            </label>
                            {step.copyData && (
                              <div className="ml-9 mb-2 rounded-lg bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 p-3">
                                <pre className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-mono">{step.copyData}</pre>
                                <button onClick={() => copyText(step.copyData!, `meta-step-${campIdx}-${i}`)} className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-pink-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-pink-700 transition-colors">
                                  <Copy className="h-3 w-3" /> {copiedText === `meta-step-${campIdx}-${i}` ? "Copiado! Cole no Meta Ads" : "Copiar"}
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                        <div className="pt-3 flex gap-2">
                          <a href="https://business.facebook.com/adsmanager" target="_blank" rel="noopener noreferrer">
                            <GlowButton variant="primary" size="sm" className="text-xs gap-1"><ExternalLink className="h-3.5 w-3.5" /> Abrir Meta Ads agora</GlowButton>
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )
              })}
            </div>
          </GlassCard>
        </motion.div>
      ) : null}

      {/* ===================== STEP 3C: TikTok Ads - UNIFIED TUTORIAL ===================== */}
      {(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tiktokData = (aiPlan as any)?.tiktokAds
        if (!tiktokData?.campaigns?.length) return null
        return (
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.4 }}>
            <GlassCard hover={false} className="border-l-4 border-l-black p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-bold text-white">3C</div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">Criar anuncio no TikTok</h3>
                  <p className="text-sm text-slate-500 dark:text-zinc-400">{tiktokData.whyTikTok || "Alcance um publico engajado com videos curtos"}</p>
                </div>
              </div>
              <div className="ml-[52px] space-y-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(tiktokData.campaigns as any[]).map((camp: any, campIdx: number) => {
                  const isExpanded = !!expandedSections[`tiktok-${campIdx}`]
                  const creative = camp.creatives?.[0] || {}
                  const fullUrl = siteUrl.startsWith("http") ? siteUrl : "https://" + siteUrl
                  const audience = typeof camp.targetAudience === "object" ? camp.targetAudience : null
                  const audienceStr = audience ? `Idade: ${audience.age || "Todas"}, Genero: ${audience.gender || "Todos"}, Local: ${audience.locations || "Brasil"}\nInteresses: ${(audience.interests || []).join(", ")}` : (camp.targetAudience || "")

                  const tiktokSteps: Array<{ title: string; detail: string; copyData?: string }> = [
                    { title: "Crie sua conta no TikTok Ads", detail: 'Acesse ads.tiktok.com no navegador. Clique em "Criar conta" e cadastre-se com seu email.' },
                    { title: "Instale o Pixel do TikTok", detail: 'No painel, va em "Ativos" > "Eventos" > "Gerenciar" > "Pixel do site". Copie o codigo e cole no seu site antes do </head>.' },
                    { title: 'Clique em "Criar Anuncio"', detail: 'No painel principal, clique no botao "Criar" no canto superior.' },
                    { title: `Selecione objetivo: ${camp.objective}`, detail: `Clique em "${camp.objective}" e depois em "Continuar".` },
                    { title: `Nome da campanha: ${camp.name}`, detail: 'No campo "Nome", escreva o nome abaixo.', copyData: camp.name },
                    { title: `Orcamento diario: ${tiktokData.recommendedDailyBudget || "R$30"}`, detail: 'Em "Orcamento", escolha "Diario" e digite o valor.', copyData: (tiktokData.recommendedDailyBudget || "30").replace("R$", "") },
                    { title: "Configure o PUBLICO", detail: 'Em "Segmentacao", configure o publico copiando os dados abaixo:', copyData: audienceStr },
                    { title: "Grave o VIDEO seguindo o roteiro", detail: `Use o celular! Conteudo autentico funciona MELHOR no TikTok. Grave um video de 15-30 segundos seguindo o roteiro abaixo:`, copyData: creative.videoScript || "" },
                    ...(creative.hookIdeas?.length ? [{ title: "Escolha o GANCHO dos 3 primeiros segundos", detail: `Os 3 primeiros segundos decidem se a pessoa vai assistir ou pular. Escolha uma das opcoes:\n\n${creative.hookIdeas.map((h: string, i: number) => `Opcao ${i + 1}: ${h}`).join("\n")}` }] : []),
                    { title: "Faca upload do video no TikTok Ads", detail: 'Arraste o video gravado para a area de upload ou clique para selecionar o arquivo.' },
                    ...(creative.textOverlay ? [{ title: "Adicione TEXTO sobre o video", detail: 'No editor, clique em "Texto" e adicione:', copyData: creative.textOverlay }] : []),
                    { title: "Cole a LEGENDA e HASHTAGS", detail: 'No campo de legenda, cole o texto abaixo:', copyData: `${creative.caption || ""}\n\n${(creative.hashtags || []).map((h: string) => `#${h}`).join(" ")}` },
                    ...(creative.musicSuggestion ? [{ title: "Adicione MUSICA/SOM", detail: `Em "Audio", busque por: ${creative.musicSuggestion}. Sons trending aumentam o alcance!` }] : []),
                    { title: `Cole a URL: ${fullUrl}`, detail: 'No campo "URL de destino", cole:', copyData: fullUrl },
                    { title: "REVISE e PUBLIQUE", detail: 'Verifique o preview. Video OK? Legenda OK? URL OK? Clique em "Enviar". Aprovacao leva de 1 a 24h.' },
                  ]

                  return (
                    <div key={campIdx} className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                      <div className="px-4 py-3 bg-gradient-to-r from-slate-900 to-slate-800">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white">{camp.name} <span className="rounded-full bg-white dark:bg-zinc-900/20 px-2 py-0.5 text-[10px] font-medium text-white ml-2">{camp.objective}</span></h4>
                          <button onClick={() => toggleSection(`tiktok-${campIdx}`)} className="shrink-0 rounded-lg bg-white dark:bg-zinc-900 px-4 py-2 text-xs font-semibold text-slate-900 dark:text-zinc-100 shadow hover:bg-slate-50 dark:bg-zinc-800/50 transition-all">
                            {isExpanded ? "Fechar tutorial" : "Comecar tutorial"}
                          </button>
                        </div>
                      </div>
                      {isExpanded && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-1">
                          {tiktokSteps.map((step, i) => (
                            <div key={i} className="rounded-lg border-l-2 border-transparent hover:border-slate-400 transition-colors">
                              <label className="flex items-start gap-2.5 cursor-pointer px-2.5 py-2.5 hover:bg-slate-50 dark:bg-zinc-800/50">
                                <input type="checkbox" checked={!!completedSteps[`tiktok-${campIdx}-step-${i}`]} onChange={() => toggleStep(`tiktok-${campIdx}-step-${i}`)} className="mt-1 h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500 shrink-0" />
                                <div className={cn("flex-1", completedSteps[`tiktok-${campIdx}-step-${i}`] && "opacity-40")}>
                                  <span className={cn("text-sm font-bold text-slate-800", completedSteps[`tiktok-${campIdx}-step-${i}`] && "line-through")}>Passo {i + 1}: {step.title}</span>
                                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mt-0.5">{step.detail}</p>
                                </div>
                              </label>
                              {step.copyData && (
                                <div className="ml-9 mb-2 rounded-lg bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 p-3">
                                  <pre className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-mono">{step.copyData}</pre>
                                  <button onClick={() => copyText(step.copyData!, `tiktok-step-${campIdx}-${i}`)} className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-900 transition-colors">
                                    <Copy className="h-3 w-3" /> {copiedText === `tiktok-step-${campIdx}-${i}` ? "Copiado!" : "Copiar"}
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                          <div className="pt-3">
                            <a href="https://ads.tiktok.com" target="_blank" rel="noopener noreferrer">
                              <GlowButton variant="primary" size="sm" className="text-xs gap-1 bg-black hover:bg-slate-800"><ExternalLink className="h-3.5 w-3.5" /> Abrir TikTok Ads agora</GlowButton>
                            </a>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )
                })}
              </div>
            </GlassCard>
          </motion.div>
        )
      })()}

      {/* ===================== STEP 4: Keywords for Ads ===================== */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.45 }}>
        <GlassCard hover={false} className="border-l-4 border-l-orange-500 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-sm font-bold text-white">4</div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">Palavras-chave para seus anuncios</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400">Use essas palavras na sua campanha do Google Ads — elas sao o que seus clientes digitam no Google</p>
            </div>
          </div>
          <div className="ml-[52px] space-y-4">
            {aiPlan?.suggestedKeywords?.length ? (
              <>
                {/* High intent (buying) keywords */}
                {buyKeywords.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">Alta intencao de compra</span>
                      <span className="text-xs text-slate-400 dark:text-zinc-500">— Pessoas prontas para comprar</span>
                    </div>
                    <div className="space-y-1.5">
                      {buyKeywords.map((kw, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-red-100 bg-red-50/30 px-4 py-2.5">
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-slate-700">{kw.keyword}</span>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">{kw.reason}</p>
                          </div>
                          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0",
                            kw.difficulty === "facil" ? "bg-green-100 text-green-700" : kw.difficulty === "medio" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                          )}>{kw.estimatedVolume}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Informational keywords */}
                {infoKeywords.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">Informacionais</span>
                      <span className="text-xs text-slate-400 dark:text-zinc-500">— Pessoas pesquisando antes de comprar</span>
                    </div>
                    <div className="space-y-1.5">
                      {infoKeywords.map((kw, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-blue-100 bg-blue-50/30 px-4 py-2.5">
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-slate-700">{kw.keyword}</span>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">{kw.reason}</p>
                          </div>
                          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0",
                            kw.difficulty === "facil" ? "bg-green-100 text-green-700" : kw.difficulty === "medio" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                          )}>{kw.estimatedVolume}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Copy all button */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => copyText(
                      aiPlan.suggestedKeywords!.map(kw => kw.keyword).join("\n"),
                      "all-keywords"
                    )}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-orange-500/25 hover:brightness-110 transition-all"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copiedText === "all-keywords" ? "Copiado!" : "Copiar todas as palavras-chave"}
                  </button>
                  <Link href="/seo?acao=keywords" className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700 self-center">
                    Ver no painel de SEO <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </>
            ) : (
              <ActionLink icon={Search} label="Descobrir palavras-chave para seus anuncios" buttonLabel="Pesquisar Palavras" href="/seo?acao=keywords" />
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* ===================== STEP 5: Monitor and Improve ===================== */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.6 }}>
        <GlassCard hover={false} className="border-l-4 border-l-purple-500 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-sm font-bold text-white">5</div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">Monitorar e melhorar</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400">Depois de ativar seus anuncios, acompanhe os resultados e otimize</p>
            </div>
          </div>
          <div className="ml-[52px] space-y-3">
            {/* Daily checklist */}
            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
              <button onClick={() => toggleSection("monitor-daily")} className="flex w-full items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Eye className="h-4 w-4 text-purple-500" /> O que verificar todo dia
                </span>
                {expandedSections["monitor-daily"] ? <ChevronUp className="h-4 w-4 text-slate-400 dark:text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-slate-400 dark:text-zinc-500" />}
              </button>
              {expandedSections["monitor-daily"] && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 space-y-2 text-sm text-slate-600 dark:text-zinc-300">
                  <div className="rounded-lg bg-purple-50 px-3 py-2">
                    <strong>Diariamente (2 min):</strong> Verifique se os anuncios estao rodando e quanto gastou
                  </div>
                  <div className="rounded-lg bg-purple-50 px-3 py-2">
                    <strong>Semanalmente (10 min):</strong> Veja o CTR (taxa de cliques) — se for menor que 2%, mude o texto do anuncio
                  </div>
                  <div className="rounded-lg bg-purple-50 px-3 py-2">
                    <strong>Mensalmente (30 min):</strong> Compare custo por cliente (CPA) com o lucro — se nao esta lucrando, ajuste o publico
                  </div>
                </motion.div>
              )}
            </div>

            {/* When to pause */}
            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
              <button onClick={() => toggleSection("monitor-pause")} className="flex w-full items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Quando pausar uma campanha
                </span>
                {expandedSections["monitor-pause"] ? <ChevronUp className="h-4 w-4 text-slate-400 dark:text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-slate-400 dark:text-zinc-500" />}
              </button>
              {expandedSections["monitor-pause"] && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 space-y-2 text-sm text-slate-600 dark:text-zinc-300">
                  <div className="rounded-lg bg-amber-50 px-3 py-2">Custo por cliente (CPA) esta maior que o lucro por venda</div>
                  <div className="rounded-lg bg-amber-50 px-3 py-2">Taxa de cliques (CTR) abaixo de 1% apos 7 dias</div>
                  <div className="rounded-lg bg-amber-50 px-3 py-2">Muitos cliques mas zero conversoes apos 100+ cliques</div>
                  <div className="rounded-lg bg-amber-50 px-3 py-2">Orcamento acabando rapido demais sem resultado</div>
                </motion.div>
              )}
            </div>

            {/* When to scale */}
            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
              <button onClick={() => toggleSection("monitor-scale")} className="flex w-full items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <TrendingUp className="h-4 w-4 text-green-500" /> Quando aumentar o orcamento
                </span>
                {expandedSections["monitor-scale"] ? <ChevronUp className="h-4 w-4 text-slate-400 dark:text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-slate-400 dark:text-zinc-500" />}
              </button>
              {expandedSections["monitor-scale"] && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 space-y-2 text-sm text-slate-600 dark:text-zinc-300">
                  <div className="rounded-lg bg-green-50 px-3 py-2">ROAS (retorno) acima de 3x — para cada R$1 gasto, ganha R$3+</div>
                  <div className="rounded-lg bg-green-50 px-3 py-2">CPA estavel por mais de 2 semanas</div>
                  <div className="rounded-lg bg-green-50 px-3 py-2">Taxa de conversao acima de 3%</div>
                  <div className="rounded-lg bg-green-50 px-3 py-2 font-medium">Dica: aumente no maximo 20% por vez para nao desestabilizar</div>
                </motion.div>
              )}
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-2 pt-1">
              <Link href="/anuncios">
                <GlowButton variant="primary" size="sm" className="text-xs gap-1">
                  <BarChart3 className="h-3.5 w-3.5" /> Monitorar anuncios
                </GlowButton>
              </Link>
              <Link href="/copilot">
                <GlowButton variant="secondary" size="sm" className="text-xs gap-1">
                  <Bot className="h-3.5 w-3.5" /> Pedir ajuda ao Co-Piloto
                </GlowButton>
              </Link>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* ===================== BOTTOM: Auxiliary Tools ===================== */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.75 }}>
        <div className="mb-3">
          <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">Ferramentas auxiliares</h3>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Acesso rapido para complementar sua estrategia de anuncios</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/conteudo" className="block">
            <GlassCard className="p-4 h-full">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                  <PenTool className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Conteudo</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Criar artigos e posts para crescimento organico</p>
                </div>
              </div>
            </GlassCard>
          </Link>

          <Link href="/seo" className="block">
            <GlassCard className="p-4 h-full">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
                  <Search className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">SEO</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Monitorar keywords no organico</p>
                </div>
              </div>
            </GlassCard>
          </Link>

          <Link href="/concorrentes" className="block">
            <GlassCard className="p-4 h-full">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-pink-600">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Concorrentes</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Espionar o que seus concorrentes fazem</p>
                </div>
              </div>
            </GlassCard>
          </Link>

          <Link href="/copilot" className="block">
            <GlassCard className="p-4 h-full">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Co-Piloto IA</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Tirar duvidas sobre marketing e anuncios</p>
                </div>
              </div>
            </GlassCard>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

// Fix instructions for each audit issue type
const fixInstructions: Record<string, { steps: string[]; copilotPrompt: string }> = {
  "HTTPS": {
    steps: [
      "Acesse o painel da sua hospedagem (Hostgator, Locaweb, etc)",
      "Procure por 'Certificado SSL' ou 'Seguranca'",
      "Ative o certificado SSL gratuito (Let's Encrypt)",
      "Depois, acesse seu site com https:// e veja se funciona",
    ],
    copilotPrompt: "Meu site nao tem HTTPS. Me explique passo a passo como ativar o SSL",
  },
  "Title tag": {
    steps: [
      "O titulo do site eh o que aparece na aba do navegador e no Google",
      "Ele precisa ter entre 50-60 caracteres e incluir sua palavra-chave principal",
      "Exemplo: 'Closet da Pie | Roupas Femininas com Frete Gratis'",
      "Edite no painel do seu site, em Configuracoes > SEO ou no codigo HTML na tag <title>",
    ],
    copilotPrompt: "O titulo do meu site esta curto. Crie 5 opcoes de titulo otimizado para SEO",
  },
  "Meta description": {
    steps: [
      "A meta description eh o texto que aparece abaixo do titulo no Google",
      "Precisa ter entre 140-160 caracteres e convencer a pessoa a clicar",
      "Inclua sua palavra-chave e um beneficio claro",
      "Edite no painel do seu site em Configuracoes > SEO, ou na tag <meta name='description'>",
    ],
    copilotPrompt: "Me ajude a criar uma meta description otimizada para meu site",
  },
  "H1": {
    steps: [
      "O H1 eh o titulo principal que aparece na pagina (visivel para o visitante)",
      "Cada pagina deve ter exatamente 1 titulo H1",
      "Ele deve descrever o que a pagina oferece e conter sua palavra-chave",
      "No editor do seu site, selecione o titulo principal e marque como 'Heading 1' ou 'H1'",
    ],
    copilotPrompt: "Meu site nao tem H1. Me ajude a criar um titulo principal otimizado",
  },
  "imagens sem": {
    steps: [
      "Cada imagem precisa ter um texto alternativo (alt text) que descreva o que ela mostra",
      "Isso ajuda o Google a entender suas imagens e melhora acessibilidade",
      "No editor do seu site, clique na imagem e preencha o campo 'Texto alternativo' ou 'Alt'",
      "Descreva a imagem de forma simples: 'Vestido floral feminino tamanho M'",
    ],
    copilotPrompt: "Minhas imagens nao tem texto alternativo. Me explique como adicionar alt text",
  },
  "responsivo": {
    steps: [
      "Seu site precisa funcionar bem em celulares (mais de 60% das visitas vem do celular)",
      "Verifique se seu tema/template eh responsivo nas configuracoes do site",
      "Teste abrindo seu site pelo celular e veja se tudo aparece bem",
      "Se usar WordPress, troque para um tema responsivo. Se usar Nuvemshop/Shopify, ja eh automatico",
    ],
    copilotPrompt: "Meu site nao eh responsivo. Como faco para funcionar no celular",
  },
  "Open Graph": {
    steps: [
      "Open Graph eh o que mostra o preview quando voce compartilha seu site no WhatsApp ou Facebook",
      "Sem isso, aparece so um link sem imagem — menos cliques",
      "Adicione as tags og:title, og:description e og:image no <head> do seu HTML",
      "No Nuvemshop/Shopify/WordPress isso geralmente eh configurado automaticamente com plugins de SEO",
    ],
    copilotPrompt: "Meu site nao tem Open Graph. Me ajude a configurar",
  },
  "Canonical": {
    steps: [
      "A tag canonical diz ao Google qual eh a URL principal de cada pagina",
      "Evita que o Google pense que voce tem conteudo duplicado",
      "Adicione <link rel='canonical' href='URL-DA-PAGINA'> no <head> do HTML",
      "A maioria das plataformas (Nuvemshop, Shopify, WordPress) faz isso automaticamente",
    ],
    copilotPrompt: "Meu site nao tem canonical URL. Me explique como configurar",
  },
}

// Ad-readiness fix instructions
const adReadinessFixes: Record<string, { steps: string[]; copilotPrompt: string }> = {
  "Sitemap.xml": {
    steps: [
      "O sitemap.xml lista todas as paginas do seu site para o Google",
      "Acesse seusite.com/sitemap.xml — se der erro, precisa criar",
      "No WordPress: instale o plugin Yoast SEO (ele cria automaticamente)",
      "No Nuvemshop/Shopify: ja vem pronto automaticamente",
      "Depois, envie o sitemap no Google Search Console",
    ],
    copilotPrompt: "Meu site nao tem sitemap.xml. Me ajude a criar e enviar pro Google",
  },
  "Google Analytics": {
    steps: [
      "Acesse analytics.google.com e crie uma conta (gratis)",
      "Crie uma propriedade com o nome do seu site",
      "Copie o codigo de rastreamento (tag gtag.js)",
      "Cole no <head> do seu site, antes de </head>",
      "No WordPress: use o plugin 'Site Kit by Google' (mais facil)",
      "Aguarde 24h para ver os primeiros dados",
    ],
    copilotPrompt: "Me ajude a instalar o Google Analytics no meu site passo a passo",
  },
  "Meta Pixel": {
    steps: [
      "Acesse business.facebook.com > Fontes de dados > Pixels",
      "Clique em 'Criar um Pixel' e de um nome",
      "Copie o codigo do pixel",
      "Cole no <head> do seu site, antes de </head>",
      "No WordPress: use o plugin 'PixelYourSite' (mais facil)",
      "Teste no Facebook Pixel Helper (extensao do Chrome)",
    ],
    copilotPrompt: "Me ajude a instalar o Meta Pixel (Facebook) no meu site",
  },
  "Google Tag Manager": {
    steps: [
      "Acesse tagmanager.google.com e crie uma conta (gratis)",
      "Crie um container para seu site",
      "Copie os 2 trechos de codigo fornecidos",
      "Cole o primeiro no <head> e o segundo apos o <body>",
      "Com o GTM instalado, voce pode instalar Analytics, Pixel e outros sem mexer no codigo",
    ],
    copilotPrompt: "Me ajude a instalar o Google Tag Manager no meu site",
  },
  "carrega rapido": {
    steps: [
      "Teste a velocidade em pagespeed.web.dev",
      "Comprima suas imagens (use tinypng.com)",
      "Ative cache no servidor de hospedagem",
      "Remova plugins/scripts que nao usa",
      "Considere usar uma CDN como Cloudflare (gratis)",
    ],
    copilotPrompt: "Meu site esta lento. Me ajude a melhorar a velocidade de carregamento",
  },
  "call-to-action": {
    steps: [
      "Cada pagina deve ter um botao claro dizendo o que o visitante deve fazer",
      "Exemplos: 'Comprar agora', 'Pedir orcamento', 'Fale conosco'",
      "O botao deve ter cor contrastante e ficar visivel sem rolar a pagina",
      "Coloque o CTA principal no topo e repita no final da pagina",
    ],
    copilotPrompt: "Me ajude a criar CTAs eficientes para meu site",
  },
}

function getFixForIssue(issueTitle: string) {
  for (const [key, fix] of Object.entries(fixInstructions)) {
    if (issueTitle.toLowerCase().includes(key.toLowerCase())) return fix
  }
  return null
}

function getAdReadinessFix(label: string) {
  for (const [key, fix] of Object.entries(adReadinessFixes)) {
    if (label.toLowerCase().includes(key.toLowerCase())) return fix
  }
  return null
}

// Audit item with expandable fix instructions
function AuditItem({ issue, siteUrl }: { issue: AuditIssue; siteUrl: string }) {
  const [expanded, setExpanded] = useState(false)
  const fix = issue.severity !== "ok" ? getFixForIssue(issue.title) : null

  const borderColor = issue.severity === "ok" ? "border-green-200 bg-green-50/50"
    : issue.severity === "critical" || issue.severity === "high" ? "border-red-200 bg-red-50/50"
    : issue.severity === "medium" ? "border-amber-200 bg-amber-50/50"
    : "border-slate-100 bg-slate-50 dark:bg-zinc-800/50/50"

  return (
    <div className={cn("rounded-xl border px-4 py-3 transition-all", borderColor)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {issue.severity === "ok" ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
            : issue.severity === "critical" || issue.severity === "high" ? <XCircle className="h-5 w-5 text-red-500 shrink-0" />
            : <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />}
          <div className="min-w-0">
            <span className="text-sm text-slate-700 font-medium">{issue.title}</span>
            <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">{issue.description}</p>
          </div>
        </div>
        {fix && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100 transition-colors"
          >
            {expanded ? "Fechar" : "Como resolver"}
          </button>
        )}
      </div>

      {expanded && fix && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 border-t border-slate-200 dark:border-zinc-800 pt-3"
        >
          <p className="text-xs font-semibold text-slate-700 mb-2">Passo a passo para corrigir:</p>
          <ol className="space-y-1.5 text-xs text-slate-600 dark:text-zinc-300 list-decimal list-inside">
            {fix.steps.map((step, i) => (
              <li key={i} className="leading-relaxed">{step}</li>
            ))}
          </ol>
          <div className="mt-3 flex gap-2">
            <Link href={`/copilot?msg=${encodeURIComponent(fix.copilotPrompt + " para " + siteUrl)}`}>
              <GlowButton variant="primary" size="sm" className="text-xs gap-1">
                <Bot className="h-3.5 w-3.5" /> Pedir ajuda ao Co-Piloto
              </GlowButton>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Ad readiness check item
function AdReadinessItem({ check, siteUrl }: { check: { label: string; description: string; status: ActionStatus }; siteUrl: string }) {
  const [expanded, setExpanded] = useState(false)
  const fix = check.status !== "ok" ? getAdReadinessFix(check.label) : null

  const borderColor = check.status === "ok" ? "border-green-200 bg-green-50/50"
    : check.status === "error" ? "border-red-200 bg-red-50/50"
    : check.status === "warning" ? "border-amber-200 bg-amber-50/50"
    : "border-slate-100 bg-slate-50 dark:bg-zinc-800/50/50"

  return (
    <div className={cn("rounded-xl border px-4 py-3 transition-all", borderColor)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {check.status === "ok" ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
            : check.status === "error" ? <XCircle className="h-5 w-5 text-red-500 shrink-0" />
            : check.status === "warning" ? <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
            : <Circle className="h-5 w-5 text-slate-300 shrink-0" />}
          <div className="min-w-0">
            <span className="text-sm text-slate-700 font-medium">{check.label}</span>
            <p className="text-xs text-slate-500 dark:text-zinc-400">{check.description}</p>
          </div>
        </div>
        {fix && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100 transition-colors"
          >
            {expanded ? "Fechar" : "Como resolver"}
          </button>
        )}
      </div>

      {expanded && fix && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 border-t border-slate-200 dark:border-zinc-800 pt-3"
        >
          <p className="text-xs font-semibold text-slate-700 mb-2">Passo a passo:</p>
          <ol className="space-y-1.5 text-xs text-slate-600 dark:text-zinc-300 list-decimal list-inside">
            {fix.steps.map((step, i) => (
              <li key={i} className="leading-relaxed">{step}</li>
            ))}
          </ol>
          <div className="mt-3 flex gap-2">
            <Link href={`/copilot?msg=${encodeURIComponent(fix.copilotPrompt + " para " + siteUrl)}`}>
              <GlowButton variant="primary" size="sm" className="text-xs gap-1">
                <Bot className="h-3.5 w-3.5" /> Pedir ajuda ao Co-Piloto
              </GlowButton>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Quick win item with expandable instructions
function QuickWinItem({ quickWin, siteUrl }: { quickWin: { action: string; impact: string; timeToComplete: string; howTo: string }; siteUrl: string }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 dark:bg-zinc-800/50/50 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">{quickWin.action}</span>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", quickWin.impact === "alto" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")}>
              {quickWin.impact === "alto" ? "Impacto alto" : "Impacto medio"}
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">Tempo estimado: {quickWin.timeToComplete}</p>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="shrink-0 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100 transition-colors">
          {expanded ? "Fechar" : "Como fazer"}
        </button>
      </div>
      {expanded && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 border-t border-slate-200 dark:border-zinc-800 pt-3">
          <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">{quickWin.howTo}</p>
          <Link href={`/copilot?msg=${encodeURIComponent(quickWin.action + " - me ajude passo a passo para " + siteUrl)}`} className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700">
            <Bot className="h-3.5 w-3.5" /> Pedir ajuda ao Co-Piloto
          </Link>
        </motion.div>
      )}
    </div>
  )
}

// Reusable action link component
function ActionLink({ icon: Icon, label, buttonLabel, href }: { icon: typeof Shield; label: string; buttonLabel: string; href: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 dark:bg-zinc-800/50/50 px-4 py-3">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
        <span className="text-sm text-slate-700">{label}</span>
      </div>
      <Link href={href}>
        <GlowButton variant="secondary" size="sm" className="shrink-0 gap-1 text-xs">
          {buttonLabel} <ArrowRight className="h-3 w-3" />
        </GlowButton>
      </Link>
    </div>
  )
}

export default function DashboardPage() {
  return <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 text-violet-500 animate-spin" /></div>}><DashboardInner /></Suspense>
}
