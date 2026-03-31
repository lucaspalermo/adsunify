import { db } from "@/lib/db"

interface HealthScoreInput {
  hasMetaDescription: boolean
  hasSitemap: boolean
  hasRobotsTxt: boolean
  hasSSL: boolean
  mobileResponsive: boolean
  pageSpeedScore: number
  totalArticles: number
  articlesLast30Days: number
  missionsCompletedLast7Days: number
  daysActive: number
  keywordsTracked: number
  keywordsInTop10: number
}

interface HealthScoreBreakdownItem {
  score: number
  maxScore: number
  label: string
  tip: string
}

interface HealthScoreResult {
  overallScore: number
  seoScore: number
  contentScore: number
  speedScore: number
  activityScore: number
  socialScore: number
  breakdown: Record<string, HealthScoreBreakdownItem>
}

export function calculateHealthScore(input: HealthScoreInput): HealthScoreResult {
  // SEO Score (0-100)
  let seoScore = 0
  if (input.hasMetaDescription) seoScore += 20
  if (input.hasSitemap) seoScore += 15
  if (input.hasRobotsTxt) seoScore += 15
  if (input.hasSSL) seoScore += 25
  if (input.mobileResponsive) seoScore += 25

  // Content Score (0-100)
  let contentScore = 0
  if (input.totalArticles >= 10) contentScore = 100
  else if (input.totalArticles >= 4) contentScore = 60
  else if (input.totalArticles >= 1) contentScore = 30
  if (input.articlesLast30Days >= 2) contentScore = Math.min(100, contentScore + 20)

  // Speed Score
  const speedScore = Math.min(100, Math.max(0, input.pageSpeedScore))

  // Activity Score
  let activityScore = 0
  if (input.missionsCompletedLast7Days >= 4) activityScore = 100
  else if (input.missionsCompletedLast7Days >= 3) activityScore = 75
  else if (input.missionsCompletedLast7Days >= 2) activityScore = 50
  else if (input.missionsCompletedLast7Days >= 1) activityScore = 25
  if (input.daysActive >= 7) activityScore = Math.min(100, activityScore + 20)

  // Social Score (placeholder)
  const socialScore = 50

  // Weighted overall
  const overallScore = Math.round(
    seoScore * 0.3 + contentScore * 0.25 + speedScore * 0.2 + activityScore * 0.15 + socialScore * 0.1
  )

  return {
    overallScore,
    seoScore,
    contentScore,
    speedScore,
    activityScore,
    socialScore,
    breakdown: {
      metaDescription: { score: input.hasMetaDescription ? 20 : 0, maxScore: 20, label: "Meta Description", tip: "Adicione meta descriptions em todas as paginas para melhorar o SEO" },
      sitemap: { score: input.hasSitemap ? 15 : 0, maxScore: 15, label: "Sitemap", tip: "Crie um sitemap.xml para ajudar o Google a encontrar suas paginas" },
      robotsTxt: { score: input.hasRobotsTxt ? 15 : 0, maxScore: 15, label: "Robots.txt", tip: "Configure o robots.txt para guiar os robos de busca" },
      ssl: { score: input.hasSSL ? 25 : 0, maxScore: 25, label: "SSL/HTTPS", tip: "Instale um certificado SSL para seguranca e SEO" },
      mobile: { score: input.mobileResponsive ? 25 : 0, maxScore: 25, label: "Mobile", tip: "Garanta que seu site funciona bem em celulares" },
      content: { score: contentScore, maxScore: 100, label: "Conteudo", tip: "Publique artigos regularmente para atrair trafego organico" },
      speed: { score: speedScore, maxScore: 100, label: "Velocidade", tip: "Otimize imagens e reduza scripts para carregar mais rapido" },
      activity: { score: activityScore, maxScore: 100, label: "Atividade", tip: "Complete missoes semanais para manter seu marketing ativo" },
    },
  }
}

export async function saveHealthScore(userId: string, result: HealthScoreResult) {
  return db.healthScore.create({
    data: {
      userId,
      overallScore: result.overallScore,
      seoScore: result.seoScore,
      contentScore: result.contentScore,
      speedScore: result.speedScore,
      adsScore: 0,
      socialScore: result.socialScore,
      breakdown: JSON.parse(JSON.stringify(result.breakdown)),
    },
  })
}

export async function getLatestHealthScore(userId: string) {
  return db.healthScore.findFirst({
    where: { userId },
    orderBy: { calculatedAt: "desc" },
  })
}

/* ═══════════════════════════════════════════════
   Impact × Ease Action Matrix
   ═══════════════════════════════════════════════ */

export type Priority = "quick-win" | "high-impact" | "low-priority" | "big-project"

export interface ActionItem {
  id: string
  title: string
  description: string
  howToFix: string
  impact: number // 1-10
  ease: number   // 1-10 (10 = easiest)
  priority: Priority
  estimatedTime: string
  category: "seo" | "content" | "speed" | "activity" | "social"
  weekSuggestion: number // 1-4
}

function getPriority(impact: number, ease: number): Priority {
  if (impact >= 7 && ease >= 7) return "quick-win"
  if (impact >= 7 && ease < 7) return "big-project"
  if (impact < 7 && ease >= 7) return "low-priority"
  return "low-priority"
}

export function generateActionPlan(result: HealthScoreResult): ActionItem[] {
  const actions: ActionItem[] = []
  const bd = result.breakdown || {} as any

  // SEO actions based on breakdown
  if (bd.ssl?.score === 0) {
    actions.push({
      id: "fix-ssl",
      title: "Instalar certificado SSL (HTTPS)",
      description: "Seu site nao tem SSL. O Google penaliza sites sem HTTPS no ranking.",
      howToFix: "No seu provedor de hospedagem, ative o certificado SSL gratuito (Let's Encrypt). A maioria dos hosts oferece isso com 1 clique.",
      impact: 10, ease: 8, priority: "quick-win", estimatedTime: "10 min",
      category: "seo", weekSuggestion: 1,
    })
  }

  if (bd.metaDescription?.score === 0) {
    actions.push({
      id: "fix-meta",
      title: "Adicionar Meta Description",
      description: "Falta meta description — o Google mostra um trecho aleatorio do seu site nos resultados.",
      howToFix: "Adicione uma tag <meta name=\"description\" content=\"Sua descricao aqui (150-160 caracteres)\"> no <head> de cada pagina. Use palavras-chave naturais.",
      impact: 8, ease: 9, priority: "quick-win", estimatedTime: "5 min",
      category: "seo", weekSuggestion: 1,
    })
  }

  if (bd.sitemap?.score === 0) {
    actions.push({
      id: "fix-sitemap",
      title: "Criar Sitemap.xml",
      description: "Sem sitemap, o Google pode nao encontrar todas as suas paginas.",
      howToFix: "Use um gerador de sitemap online (como xml-sitemaps.com), faca upload do arquivo sitemap.xml na raiz do seu site, e envie pelo Google Search Console.",
      impact: 7, ease: 8, priority: "quick-win", estimatedTime: "15 min",
      category: "seo", weekSuggestion: 1,
    })
  }

  if (bd.robotsTxt?.score === 0) {
    actions.push({
      id: "fix-robots",
      title: "Configurar Robots.txt",
      description: "Sem robots.txt, os buscadores nao sabem quais paginas rastrear.",
      howToFix: "Crie um arquivo robots.txt na raiz do site com: User-agent: * | Allow: / | Sitemap: https://seusite.com/sitemap.xml",
      impact: 5, ease: 9, priority: "low-priority", estimatedTime: "5 min",
      category: "seo", weekSuggestion: 1,
    })
  }

  if (bd.mobile?.score === 0) {
    actions.push({
      id: "fix-mobile",
      title: "Tornar site responsivo (mobile-friendly)",
      description: "Seu site nao funciona bem em celulares. 60%+ do trafego vem de mobile.",
      howToFix: "Adicione a tag viewport no <head>: <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">. Revise o CSS para usar media queries ou um framework responsivo.",
      impact: 10, ease: 4, priority: "big-project", estimatedTime: "2-4h",
      category: "seo", weekSuggestion: 2,
    })
  }

  // Content actions
  if (result.contentScore < 50) {
    actions.push({
      id: "create-content",
      title: "Publicar 4 artigos otimizados para SEO",
      description: "Seu site tem pouco conteudo. Artigos atraem trafego organico do Google.",
      howToFix: "Use o Gerador de Conteudo do AdsUnify para criar artigos. Foque em palavras-chave de cauda longa com baixa concorrencia. Publique 1 artigo por semana.",
      impact: 9, ease: 6, priority: "big-project", estimatedTime: "1h por artigo",
      category: "content", weekSuggestion: 2,
    })
  }

  // Speed actions
  if (result.speedScore < 60) {
    actions.push({
      id: "fix-speed",
      title: "Otimizar velocidade do site",
      description: "Site lento = visitantes saem. O Google tambem considera velocidade no ranking.",
      howToFix: "1) Comprima imagens (use tinypng.com). 2) Ative cache no servidor. 3) Minimize CSS/JS. 4) Use CDN (Cloudflare gratis). 5) Remova plugins/scripts desnecessarios.",
      impact: 8, ease: 5, priority: "big-project", estimatedTime: "1-2h",
      category: "speed", weekSuggestion: 3,
    })
  }

  // Activity actions
  if (result.activityScore < 50) {
    actions.push({
      id: "complete-missions",
      title: "Completar 3 missoes semanais",
      description: "Voce nao esta completando missoes suficientes. Consistencia e a chave.",
      howToFix: "Acesse a aba Missoes e complete pelo menos 3 missoes por semana. Cada missao te ensina uma habilidade nova de marketing.",
      impact: 6, ease: 9, priority: "quick-win", estimatedTime: "30 min/semana",
      category: "activity", weekSuggestion: 1,
    })
  }

  // Social actions
  if (result.socialScore < 60) {
    actions.push({
      id: "add-og-tags",
      title: "Adicionar Open Graph tags",
      description: "Quando alguem compartilha seu link, nao aparece imagem nem descricao bonita.",
      howToFix: "Adicione tags Open Graph no <head>: og:title, og:description, og:image (1200x630px). Use o Sharing Debugger do Facebook para testar.",
      impact: 5, ease: 8, priority: "low-priority", estimatedTime: "15 min",
      category: "social", weekSuggestion: 4,
    })
  }

  // Sort: quick-wins first, then by impact desc
  const priorityOrder: Record<Priority, number> = { "quick-win": 0, "big-project": 1, "low-priority": 2, "high-impact": 1 }
  actions.sort((a, b) => {
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (pDiff !== 0) return pDiff
    return b.impact - a.impact
  })

  return actions
}
