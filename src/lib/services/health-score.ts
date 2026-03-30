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
